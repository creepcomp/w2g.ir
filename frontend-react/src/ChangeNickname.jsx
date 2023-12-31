const ChangeNickname = () => {
    return (
        <div>
            <label htmlFor="nickname">نام مستعار:</label>
            <input className="form-control text-center" type="text" id="nickname" placeholder="نام مستعار" value={cookies.nickname} onChange={e => setCookies("nickname", e.target.value)} />
        </div>
    );
};
