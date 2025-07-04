import axios from "axios";
import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";
import "./DataMahasiswa.css";

const TambahMahasiswa = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    nama_lengkap: "",
    program_studi: "",
    kelas: "",
    nim: "",
    no_telepon: "",
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
        role: "mahasiswa",
      });
      setSuccess("User added successfully!");
      setTimeout(() => {
        navigate("/TabelMahasiswa");
      }, 2000);
    } catch (err) {
      setError("Error adding user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tmhs-dashboard-container">
      <Navbar />
      <Sidebar />
      <h1 className="tmhs-dashboard-title">TAMBAH MAHASISWA</h1>
      <div className="tmhs-card">
        <Form onSubmit={handleSubmit} className="tmhs-form">
          <Form.Group controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="Masukkan username" name="username" value={formData.username} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formNamaLengkap">
            <Form.Label>Nama Lengkap</Form.Label>
            <Form.Control type="text" placeholder="Masukkan full name" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formProgramStudi">
            <Form.Label>Program Studi</Form.Label>
            <Form.Control type="text" placeholder="Masukkan Program Studi" name="program_studi" value={formData.program_studi} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formKelas">
            <Form.Label>Kelas</Form.Label>
            <Form.Control type="text" placeholder="Masukkan kelas" name="kelas" value={formData.kelas} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formNIM">
            <Form.Label>NIM</Form.Label>
            <Form.Control type="text" placeholder="Masukkan nim" name="nim" value={formData.nim} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formNoTelepon">
            <Form.Label>No.Telepon</Form.Label>
            <Form.Control type="text" placeholder="Masukkan no_telepon" name="no_telepon" value={formData.no_telepon} onChange={handleChange} required />
          </Form.Group>

          <div className="tmhs-button-container">
            <Button type="submit" variant="success" disabled={loading} className="tmhs-submit-button">
              {loading ? (
                "Adding..."
              ) : (
                <>
                  <FaUserPlus className="tmhs-icon" /> Tambahkan
                </>
              )}
            </Button>
          </div>

          {error && <div className="tmhs-error-message">{error}</div>}
          {success && <div className="tmhs-success-message">{success}</div>}
        </Form>
      </div>
    </div>
  );
};

export default TambahMahasiswa;
