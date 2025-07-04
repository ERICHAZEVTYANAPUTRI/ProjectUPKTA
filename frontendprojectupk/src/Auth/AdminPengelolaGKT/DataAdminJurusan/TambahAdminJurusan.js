import axios from "axios";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";
import "./DataAdminJurusan.css";

const TambahAdminJurusan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    jabatan: "",
    kodejurusan: "",
    jurusan: "",
    nama_lengkap: "",
    nip_nik_nipppk: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:8000/api/users", {
        ...formData,
        role: "admin_jurusan",
      });
      setSuccess("User added successfully!");
      setTimeout(() => {
        navigate("/TabelAdminJurusan");
      }, 2000);
    } catch (err) {
      setError("Error adding user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tamj-dashboard-container">
      <Navbar />
      <Sidebar />
      <h1 className="tamj-dashboard-title">TAMBAH Admin Jurusan</h1>

      <div className="tamj-card">
        <Form onSubmit={handleSubmit} className="tamj-form">
          <Form.Group controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="Enter username" name="username" value={formData.username} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formNamaLengkap">
            <Form.Label>Nama Lengkap</Form.Label>
            <Form.Control type="text" placeholder="Enter full name" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formNIP">
            <Form.Label>NIP / NIK / NIPPPK</Form.Label>
            <Form.Control type="text" placeholder="Enter NIP / NIK / NIPPPK" name="nip_nik_nipppk" value={formData.nip_nik_nipppk} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formJabatan">
            <Form.Label>Jabatan</Form.Label>
            <Form.Control type="text" placeholder="Enter jabatan" name="jabatan" value={formData.jabatan} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formJurusan">
            <Form.Label>Kode Jurusan</Form.Label>
            <Form.Control type="text" placeholder="Enter Kde Jurusan" name="kodejurusan" value={formData.kodejurusan} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formJurusan">
            <Form.Label>Jurusan</Form.Label>
            <Form.Control type="text" placeholder="Enter jurusan" name="jurusan" value={formData.jurusan} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Enter password" name="password" value={formData.password} onChange={handleChange} required />
          </Form.Group>

          <div className="tamj-button-container">
            <Button type="submit" variant="success" disabled={loading} className="tamj-submit-button">
              {loading ? (
                "Adding..."
              ) : (
                <>
                  <FaUserPlus className="tamj-icon" /> Tambahkan
                </>
              )}
            </Button>
          </div>

          {error && <div className="tamj-error-message">{error}</div>}
          {success && <div className="tamj-success-message">{success}</div>}
        </Form>
      </div>
    </div>
  );
};

export default TambahAdminJurusan;
