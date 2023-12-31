import React from "react";
import stringToColor from "./functions.js";
import Video from "./Video.jsx";
import Chat from "./Chat.jsx";

const Room = () => {
    const code = parseInt(new URLSearchParams(window.location.search).get("code"));
    const [connected, setConnected] = React.useState(false);
    const [room, setRoom] = React.useState({});

    React.useEffect(e => {
        const url = "wss://w2g.ir/ws/room?code=" + code;
        let socket = new WebSocket(url);
        const handleMessage = e => {
            const data = JSON.parse(e.data);
            setRoom(data);
            setConnected(true);
        };
        const handleSocketClose = e => {
            setConnected(false);
            setTimeout(() => {
                socket = new WebSocket(url);
                socket.onmessage = handleMessage;
                socket.onclose = handleSocketClose;
            }, 3000);
        };
        socket.onmessage = handleMessage;
        socket.onclose = handleSocketClose;
    }, []);

    return (
        <div className="container-fluid">
            <div className="row mx-auto" style={!connected ? { filter: "blur(5px)" } : null}>
                <div className="col m-2">
                    <Video room={code} />
                </div>
                <div className="col-xl-3 text-light">
                    <div className="bg-dark bg-opacity-75 rounded shadow m-2 p-2 text-center">
                        <h4 className="border-bottom p-2">اعضا اتاق</h4>
                        <div className="d-flex justify-content-center align-items-center flex-wrap overflow-auto" style={{ height: "200px" }}>
                            {room.viewers
                                ? room.viewers.map(v => (
                                      <span className="rounded m-1 p-2" style={{ backgroundColor: stringToColor(v.nickname) }}>
                                          {v.nickname}
                                      </span>
                                  ))
                                : null}
                        </div>
                    </div>
                    <Chat room={code} />
                </div>
            </div>
            {!connected ? (
                <div className="fixed-top h-100">
                    <div className="position-absolute start-50 translate-middle col-10 col-md-8 col-lg-6 col-xl-4 bg-light rounded shadow-lg p-2 text-center" style={{ top: "25%" }}>
                        <h1>در حال اتصال</h1>
                        <span className="spinner-border spinner-border-sm me-2" />
                        <span>تلاش برای اتصال...</span>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Room;
