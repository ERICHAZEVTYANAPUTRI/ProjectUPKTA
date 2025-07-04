import React from "react";
import { Link, useLocation } from "react-router-dom";
import LogoPoliwangi from "../assets/LogoPoliwangi.jpeg";
import "./NavbarBeranda.css";

const NavbarBeranda = () => {
  const location = useLocation();

  const isLoginPage = location.pathname === "/Login";
  const isRegisterPage = location.pathname === "/Registrasi";

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar1">
      <div className="navbar-left1">
        <img src={LogoPoliwangi} alt="Logo" className="navbar-logo1" />
      </div>
      <div className="navbar-center1">
        <ul className="navbar-links1">
          <li>
            <Link to="/Beranda" className={isActive("/Beranda")}>
              Beranda
            </Link>
          </li>
          <li>
            <Link to="/SOPPeminjaman" className={isActive("/SOPPeminjaman")}>
              SOP Peminjaman
            </Link>
          </li>
          <li>
            <Link to="/SOPPengembalian" className={isActive("/SOPPengembalian")}>
              SOP Pengembalian
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-right1">
        {!isLoginPage && !isRegisterPage ? (
          <Link to={isLoginPage ? "/Registrasi" : "/Login"} className="login-button">
            {isLoginPage ? "Registrasi" : "Login"}
          </Link>
        ) : (
          <Link to={isLoginPage ? "/Registrasi" : "/Login"} className="login-button">
            {isLoginPage ? "Registrasi" : "Login"}
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavbarBeranda;
