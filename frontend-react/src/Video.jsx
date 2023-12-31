import React from "react";
import Dropdown from "react-bootstrap/Dropdown";

const Video = props => {
    const [video, setVideo] = React.useState({});
    const [muted, setMuted] = React.useState(true);
    const [volumeMenu, setVolumeMenu] = React.useState(false);
    const player = React.useRef();
    const socket = React.useRef();

    React.useEffect(e => {
        const url = "wss://w2g.ir/ws/video?code=" + props.room;
        socket.current = new WebSocket(url);
        const handleMessage = e => {
            const data = JSON.parse(e.data);
            player.current.volume = data.volume / 100;
            player.current.currentTime = data.time;
            setVideo(data);
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

    const timeFormat = time => {
        const h = String(Math.floor(time / 3600)).padStart(2, "0");
        const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
        const s = String(Math.floor(time % 60)).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    const update = json => socket.current.send(JSON.stringify(json));

    return (
        <div>
            <div className="position-relative bg-dark bg-opacity-75 rounded">
                <video
                    className="w-100 d-block rounded"
                    ref={player}
                    src={video.url}
                    onLoadedData={e => setVideo({ ...video, duration: e.target.duration })}
                    onTimeUpdate={e => setVideo({ ...video, time: e.target.currentTime })}
                    onCanPlay={() => {
                        if (video.playing) player.current.play();
                        else player.current.pause();
                    }}
                    playsInline
                    muted={muted}
                />
                <div className="d-flex justify-content-center align-items-center bg-dark bg-opacity-75 w-100 position-absolute bottom-0 rounded-bottom" dir="ltr">
                    <div className="m-1">
                        {video.playing ? (
                            <button className="btn btn-link" onClick={() => update({ ...video, playing: false })}>
                                <i class="fa-solid fa-pause"></i>
                            </button>
                        ) : (
                            <button className="btn btn-link" onClick={() => update({ ...video, playing: true })}>
                                <i class="fa-solid fa-play"></i>
                            </button>
                        )}
                    </div>
                    <input className="w-100 m-1" type="range" value={video.time} max={video.duration} onChange={e => update({ ...video, time: parseInt(e.target.value) })} dir="ltr" />
                    <small className="text-light m-1">
                        {timeFormat(video.time)}
                        <br />
                        {timeFormat(video.duration)}
                    </small>
                    <div className="m-1">
                        {muted ? (
                            <button className="btn btn-link" onClick={() => setMuted(false)}>
                                <i class="fa-solid fa-volume-xmark"></i>
                            </button>
                        ) : (
                            <button
                                className="btn btn-link"
                                onClick={() => setMuted(true)}
                                onContextMenu={e => {
                                    e.preventDefault();
                                    setVolumeMenu(!volumeMenu);
                                }}>
                                <i class="fa-solid fa-volume-high"></i>
                            </button>
                        )}
                    </div>
                    {volumeMenu ? (
                        <div className="bg-dark bg-opacity-75 rounded position-absolute start-0 bottom-100 m-1 p-1">
                            <input className="m-1" type="range" value={video.volume} onChange={e => update({ ...video, volume: parseInt(e.target.value) })} />
                        </div>
                    ) : null}
                    <button className="btn btn-link m-1" onClick={() => player.current.requestFullscreen()}>
                        <i class="fa-solid fa-up-right-and-down-left-from-center"></i>
                    </button>
                </div>
            </div>
            <div className="bg-dark bg-opacity-75 rounded shadow text-light mt-2">
                {video.url ? (
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom h4">
                        <span>در حال پخش:</span>
                        <a href={video.url}>{video.url.split("/").pop()}</a>
                    </div>
                ) : null}
                <div className="d-flex p-1" dir="ltr">
                    <input className="form-control m-1" type="text" placeholder="لینک ویدیو (mp4, mov, wmv, avi)" onChange={e => (video.url = e.target.value)} />
                    <button className="btn btn-primary m-1" onClick={() => update(video)}>
                        <i className="fa-solid fa-play"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Video;
