import React from "react";
import stringToColor from "./functions.js";

const Rooms = () => {
    const [rooms, setRooms] = React.useState();

    React.useEffect(e => {
        fetch("/api/rooms")
            .then(response => response.json())
            .then(data => setRooms(data));
    }, []);

    const timeFormat = time => {
        const h = String(Math.floor(time / 3600)).padStart(2, "0");
        const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0");
        const s = String(Math.floor(time % 60)).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="d-flex flex-wrap justify-content-evenly align-items-center">
            {rooms
                ? rooms.map(r => (
                      <div className="card col-10 col-md-5 col-lg-3 m-1 p-2">
                          <table className="table">
                              <tbody>
                                  <tr>
                                      <th>در حال پخش:</th>
                                      <td>{r.video.url.split("/").pop()}</td>
                                  </tr>
                                  <tr>
                                      <th>وضعیت:</th>
                                      <td>{r.video.playing ? "درحال پخش" : "متوقف"}</td>
                                  </tr>
                                  <tr>
                                      <th>زمان:</th>
                                      <td>
                                          {timeFormat(r.video.time)} / {timeFormat(r.video.duration)}
                                      </td>
                                  </tr>
                                  <tr>
                                      <th>اعضا اتاق:</th>
                                      <td>
                                          {r.viewers && r.viewers.length > 0
                                              ? r.viewers.map(v => (
                                                    <span className="rounded m-1 p-1" style={{ backgroundColor: stringToColor(v.nickname) }}>
                                                        {v.nickname}
                                                    </span>
                                                ))
                                              : "خالی"}
                                      </td>
                                  </tr>
                                  <tr></tr>
                              </tbody>
                          </table>
                          <a className="btn btn-primary" href={"room?code=" + r.code}>
                              لینک اتاق
                          </a>
                      </div>
                  ))
                : null}
        </div>
    );
};

export default Rooms;
