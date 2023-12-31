import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCookies } from "react-cookie";
import Home from "./Home.jsx";
import Room from "./Room.jsx";
import "../public/style.css";

const App = () => {
    const [cookies, setCookies, removeCookies] = useCookies();

    React.useEffect(e => {
        if (!cookies.nickname) setCookies("nickname", `user-${Math.floor(Math.random() * 90000) + 10000}`);
        fetch("/api/init", { method: "POST" });
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/room" element={<Room />} />
            </Routes>
        </BrowserRouter>
    );
};

const root = createRoot(document.getElementById("app"));
root.render(<App />);
