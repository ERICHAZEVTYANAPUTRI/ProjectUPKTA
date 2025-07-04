import axios from "axios";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LogoPoliwangi from "../assets/LogoPoliwangi.jpeg";
import NavbarBeranda from "../Beranda/NavbarBeranda";
import "./LoginForm.css";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nama_lengkap, setNamaLengkap] = useState("");
  const [nim, setNim] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/register", {
        username,
        nama_lengkap,
        password,
        nim,
      });

      navigate("/Login");
      alert("Registration successful! Please login.");
    } catch (error) {
      setErrorMessage("Registration failed. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <NavbarBeranda />
      <div className="login-card">
        <h3>Sistem Manajemen Penjadwalan dan Peminjaman Ruangan Gedung Kuliah Terpadu Politeknik Negeri Banyuwangi</h3>
        <img src={LogoPoliwangi} alt="Logo Politeknik Negeri Banyuwangi" className="logo" />
        <form onSubmit={handleSubmit} autoComplete="off">
          {" "}
          <div className="input-group">
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input type="text" placeholder="Masukkan username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" id="username" name="username" />
            </div>
          </div>
          <div className="input-group">
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input type="text" placeholder="Masukkan nama lengkap" value={nama_lengkap} onChange={(e) => setNamaLengkap(e.target.value)} autoComplete="off" id="nama_lengkap" name="nama_lengkap" />
            </div>
          </div>
          <div className="input-group">
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input type="text" placeholder="Masukkan NIM" value={nim} onChange={(e) => setNim(e.target.value)} autoComplete="off" id="nim" name="nim" />
            </div>
          </div>
          <div className="input-group">
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input type={showPassword ? "text" : "password"} placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" id="password" name="password" />
              <div className="eye-icon" onClick={togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
