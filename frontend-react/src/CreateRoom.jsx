import React from "react";
import { TypeAnimation } from "react-type-animation";
import { useCookies } from "react-cookie";

const CreateRoom = () => {
    const [cookies, setCookies, removeCookies] = useCookies();
    const [loading, setLoading] = React.useState(false);
    const [step, setStep] = React.useState(0);

    const createRoom = is_private => {
        setLoading(true);
        fetch("/api/create-room", {
            method: "POST",
            body: JSON.stringify({ private: is_private }),
        }).then(async response => {
            if (response.status == 200) {
                const data = await response.json();
                window.location = "/room?code=" + data.code;
            }
        });
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "75vh" }}>
            <div className="text-center col-11 col-md-6 col-lg-4" style={{ top: "25%" }}>
                <div className="bg-light rounded shadow m-1 p-2">
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center">
                            <span className="spinner-border spinner-border-md m-2" /> <span className="h5 m-2">در حال ساخت اتاق ..</span>
                        </div>
                    ) : (
                        <div>
                            <h2>با هم تماشا کنید</h2>
                            <h5>
                                <TypeAnimation sequence={["سلام، خوش اومدی!!", 1000, "اینجا میتونی آنلاین با دوستات فیلم ببینی!!", 1000, "دیگه مگه از این بهتر هم داریم؟!", 1000, "با کلیک روی دکمه زیر اتاق شخصی خودت بساز 👇"]}></TypeAnimation>
                            </h5>
                            {step == 0 ? (
                                <button className="btn btn-primary m-1" onClick={() => setStep(1)}>
                                    ساخت اتاق
                                </button>
                            ) : (
                                <div>
                                    <button className="btn btn-success m-1" onClick={() => createRoom(false)}>
                                        عمومی
                                    </button>
                                    <button className="btn btn-danger m-1" onClick={() => createRoom(true)}>
                                        خصوصی
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-light rounded shadow m-2 p-2">
                    <label htmlFor="nickname">نام مستعار:</label>
                    <input className="form-control text-center" type="text" id="nickname" placeholder="نام مستعار" value={cookies.nickname} onChange={e => setCookies("nickname", e.target.value)} />
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
