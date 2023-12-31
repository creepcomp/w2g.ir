import asyncio
from fastapi import FastAPI, WebSocket, Request
from websockets.exceptions import ConnectionClosedOK
from random import randint
from datetime import datetime

app = FastAPI()

rooms = []

async def update():
    while True:
        for room in rooms:
            if room["playing"]:
                room["time"] += 1
        await asyncio.sleep(1)

@app.on_event("startup")
async def startup():
    asyncio.create_task(update())

@app.post("/api/create_room")
def create_room():
    code = randint(1000, 9999)
    while get_room(code):
        code = randint(1000, 9999)
    rooms.append({
        "code": code,
        "url": "video.mp4",
        "playing": False,
        "time": 0,
        "users": [],
        "chat": []
    })
    return {"code": code}

def get_room(code):
    return [room for room in rooms if room["code"] == code][0]

@app.post("/api/load")
async def load(data: Request):
    data = await data.json()
    room = get_room(data["code"])
    room["url"] = data["url"]
    room["playing"] = 0
    room["time"] = 0
    return {"status": "success"}

@app.post("/api/play")
async def play(data: Request):
    data = await data.json()
    room = get_room(data["code"])
    room["playing"] = True
    return {"status": "success"}

@app.post("/api/pause")
async def pause(data: Request):
    data = await data.json()
    room = get_room(data["code"])
    room["playing"] = False
    return {"status": "success"}

@app.post("/api/seek")
async def seek(data: Request):
    data = await data.json()
    room = get_room(data["code"])
    room["time"] = data["time"]
    return {"status": "success"}

@app.websocket("/ws/room")
async def websocket_endpoint(code: int, nick: str, websocket: WebSocket):
    room = get_room(code)
    if room:
        await websocket.accept()
        try:
            room["users"].append(nick)
            while True:
                room = get_room(code)
                await websocket.send_json(room)
                await asyncio.sleep(1)
        except ConnectionClosedOK:
            room["users"].remove(nick)
            print("client disconnect!!")

@app.post("/api/chat")
async def chat(data: Request):
    data = await data.json()
    room = get_room(data["code"])
    if len(room["chat"]) > 4:
        room["chat"].pop(1)
    room["chat"].append({
        "sender": data["sender"],
        "message": data["message"],
        "time": datetime.now().strftime("%Y/%m/%d %H:%M:%S")
    })
    return {"status": "success"}
