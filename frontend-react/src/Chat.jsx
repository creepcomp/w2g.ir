import React from "react";
import stringToColor from "./functions.js";

const Chat = props => {
    const [chat, setChat] = React.useState([]);
    const [message, setMessage] = React.useState("");
    const socket = React.useRef();
    const chatRef = React.useRef();

    React.useEffect(e => {
        const url = "wss://w2g.ir/ws/chat?code=" + props.room;
        socket.current = new WebSocket(url);
        const handleMessage = e => {
            const data = JSON.parse(e.data);
            chat.push(data);
            setChat([...chat]);
        };
        const handleSocketClose = e => {
            setTimeout(() => {
                socket.current = new WebSocket(url);
                socket.current.onmessage = handleMessage;
                socket.current.onclose = handleSocketClose;
            }, 3000);
        };
        socket.current.onmessage = handleMessage;
        socket.current.onclose = handleSocketClose;
    }, []);

    React.useEffect(() => {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [chat]);

    return (
        <div className="bg-dark bg-opacity-75 rounded shadow m-2 p-2 d-flex flex-column">
            <h4 className="text-center border-bottom p-2">چت آنلاین</h4>
            <div className="overflow-auto d-flex flex-column" style={{ height: "400px" }} ref={chatRef}>
                {chat && chat.length > 0 ? (
                    chat.map(c => (
                        <div className="rounded m-1 p-2" style={{ backgroundColor: stringToColor(c.sender.nickname) }}>
                            <small className="float-end" dir="ltr">
                                {new Date(c.time).getHours()}:{new Date(c.time).getMinutes()}:{new Date(c.time).getSeconds()}
                            </small>
                            <h6 className="border-bottom p-1">{c.sender.nickname}</h6>
                            <p className="m-1 overflow-auto" dir="auto">
                                {c.message}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="bg-secondary rounded text-center">چت خالی است</div>
                )}
            </div>
            <div className="d-flex" dir="ltr">
                <input className="form-control m-1" type="text" dir="auto" placeholder="متن گفت و گو" value={message} onChange={e => setMessage(e.target.value)} />
                <button className="btn btn-primary m-1" onClick={() => socket.current.send(message)}>
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};

export default Chat;
