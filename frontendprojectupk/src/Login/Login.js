import axios from "axios";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LogoPoliwangi from "../assets/LogoPoliwangi.jpeg";
import NavbarBeranda from "../Beranda/NavbarBeranda";
import LoadingManual from "../Components/LazyLoading/LoadingManual";
import "./LoginForm.css";

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setLoading(true);
        try {
            const response = await axios.post(
                "http://localhost:8000/api/login",
                {
                    username,
                    password,
                }
            );
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.role);
            const userResponse = await axios.get(
                "http://localhost:8000/api/user",
                {
                    headers: {
                        Authorization: `Bearer ${response.data.token}`,
                    },
                }
            );
            console.log("User data:", userResponse.data);
            localStorage.removeItem("user");
            localStorage.setItem("user", JSON.stringify(userResponse.data));
            if (response.data.role === "mahasiswa") {
                navigate("/DashboardMahasiswa");
            } else if (response.data.role === "admin_pengelola_gkt") {
                navigate("/DashboardAdminPengelola");
            } else if (response.data.role === "pengelola_gkt") {
                navigate("/DashboardAdminPengelola");
            } else if (response.data.role === "admin_jurusan") {
                navigate("/DashboardAdminJurusan");
            } else if (response.data.role === "penanggung_jawab_matakuliah") {
                navigate("/Dashboard Penanggung Jawab Matakuliah");
            } else {
                alert("Role tidak dikenali");
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("Terjadi kesalahan pada server. Coba lagi.");
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <NavbarBeranda />
            <div className="login-card">
                <h3>
                    Sistem Manajemen Penjadwalan dan Peminjaman Ruangan Gedung
                    Kuliah Terpadu Politeknik Negeri Banyuwangi
                </h3>
                <img
                    src={LogoPoliwangi}
                    alt="Logo Politeknik Negeri Banyuwangi"
                    className="logo"
                />
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="input-group">
                        <div className="input-with-icon">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                placeholder="Masukkan username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="off"
                                id="username"
                                name="username"
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="input-with-icon">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                id="password"
                                name="password"
                            />
                            <div
                                className="eye-icon"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </div>
                        </div>
                    </div>
                    {errorMessage && (
                        <p className="error-message">{errorMessage}</p>
                    )}
                    <button type="submit">Login</button>
                </form>
            </div>
            {loading && <LoadingManual isVisible={loading} />}
        </div>
    );
};

export default LoginForm;
