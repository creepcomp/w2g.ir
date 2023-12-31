package main

import (
	"errors"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var users []*User
var rooms []*Room

type Room struct {
	Code    int     `json:"code"`
	Owner   *User   `json:"owner"`
	Viewers []*User `json:"viewers"`
	Private bool    `json:"private"`
	Video   Video   `json:"video"`
	Chat    []Chat  `json:"chat"`
}

type User struct {
	Token           string          `json:"-"`
	Nickname        string          `json:"nickname"`
	RoomConnection  *websocket.Conn `json:"-"`
	VideoConnection *websocket.Conn `json:"-"`
	ChatConnection  *websocket.Conn `json:"-"`
}

type Video struct {
	Url      string  `json:"url"`
	Playing  bool    `json:"playing"`
	Time     float32 `json:"time"`
	Duration float32 `json:"duration"`
	Volume   int     `json:"volume"`
}

type Chat struct {
	Sender  *User  `json:"sender"`
	Message string `json:"message"`
	Time    int64  `json:"time"`
}

func getRoomByCode(code int) (int, *Room, error) {
	for roomID, room := range rooms {
		if room.Code == code {
			return roomID, room, nil
		}
	}
	return 0, nil, errors.New("Room not found")
}

func getUserByToken(token string) (int, *User, error) {
	for userID, user := range users {
		if user.Token == token {
			return userID, user, nil
		}
	}
	return 0, nil, errors.New("User not found")
}

func handleError(ctx *gin.Context, err error) bool {
	if err != nil {
		ctx.JSON(500, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return true
	}
	return false
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func main() {
	go func() {
		for {
			for _, room := range rooms {
				if room.Video.Playing {
					room.Video.Time += 1
				}
			}
			time.Sleep(1 * time.Second)
		}
	}()

	r := gin.Default()

	r.POST("/api/init", func(ctx *gin.Context) {
		token, err := ctx.Cookie("token")
		if err != nil {
			token = uuid.New().String()
			ctx.SetCookie("token", token, 3600*24, "/", "", true, false)
		}

		nickname, err := ctx.Cookie("nickname")
		if err != nil {
			nickname = "user-" + string(rand.Int31n(90000)+10000)
		}

		_, user, err := getUserByToken(token)
		if err != nil {
			users = append(users, &User{
				Token:          token,
				Nickname:       nickname,
				RoomConnection: nil,
			})
		} else {
			user.Nickname = nickname
		}
		ctx.JSON(200, gin.H{"status": "success"})
	})

	r.POST("/api/create-room", func(ctx *gin.Context) {
		var data struct {
			Private bool `json:"private"`
		}
		if err := ctx.BindJSON(&data); handleError(ctx, err) {
			return
		}

		token, _ := ctx.Cookie("token")
		_, user, err := getUserByToken(token)
		if handleError(ctx, err) {
			return
		}

		for {
			code := rand.Intn(90000) + 10000
			if _, _, err := getRoomByCode(code); err != nil {
				rooms = append(rooms, &Room{
					Code:    code,
					Owner:   user,
					Private: data.Private,
					Video: Video{
						Url:     "test.mp4",
						Playing: false,
						Time:    0,
						Volume:  100,
					},
				})
				ctx.JSON(200, gin.H{"code": code})
				return
			}
		}
	})

	r.GET("/api/rooms", func(ctx *gin.Context) {
		_rooms := []Room{}
		for _, room := range rooms {
			if !room.Private {
				_rooms = append(_rooms, *room)
			}
		}
		ctx.JSON(200, _rooms)
	})

	r.GET("/ws/room", func(ctx *gin.Context) {
		token, _ := ctx.Cookie("token")
		_, user, err := getUserByToken(token)
		if handleError(ctx, err) {
			return
		}

		code, _ := strconv.Atoi(ctx.Query("code"))
		_, room, err := getRoomByCode(code)
		if handleError(ctx, err) {
			return
		}

		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if handleError(ctx, err) {
			return
		}

		user.RoomConnection = conn
		room.Viewers = append(room.Viewers, user)
		viewerID := len(room.Viewers) - 1

		update := func() {
			for _, v := range room.Viewers {
				v.RoomConnection.WriteJSON(room)
			}
		}
		update()

		if _, _, err := conn.ReadMessage(); err != nil {
			room.Viewers = append(room.Viewers[:viewerID], room.Viewers[viewerID+1:]...)
			conn.Close()
			update()
		}
	})

	r.GET("/ws/video", func(ctx *gin.Context) {
		token, _ := ctx.Cookie("token")
		_, user, err := getUserByToken(token)
		if handleError(ctx, err) {
			return
		}

		code, _ := strconv.Atoi(ctx.Query("code"))
		_, room, err := getRoomByCode(code)
		if handleError(ctx, err) {
			return
		}

		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if handleError(ctx, err) {
			return
		}

		user.VideoConnection = conn
		conn.WriteJSON(room.Video)

		if user == room.Owner {
			for {
				if err := conn.ReadJSON(&room.Video); err != nil {
					conn.Close()
					return
				}

				for _, v := range room.Viewers {
					v.VideoConnection.WriteJSON(room.Video)
				}
			}
		}
	})

	r.GET("/ws/chat", func(ctx *gin.Context) {
		token, _ := ctx.Cookie("token")
		_, user, err := getUserByToken(token)
		if handleError(ctx, err) {
			return
		}

		code, _ := strconv.Atoi(ctx.Query("code"))
		_, room, err := getRoomByCode(code)
		if handleError(ctx, err) {
			return
		}

		conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
		if handleError(ctx, err) {
			return
		}

		user.ChatConnection = conn

		for {
			_, msg, err := conn.ReadMessage()
			if handleError(ctx, err) {
				conn.Close()
				return
			}

			for _, v := range room.Viewers {
				v.ChatConnection.WriteJSON(Chat{
					Sender:  user,
					Message: string(msg),
					Time:    time.Now().Unix(),
				})
			}
		}
	})

	r.Run(":8081")
}
