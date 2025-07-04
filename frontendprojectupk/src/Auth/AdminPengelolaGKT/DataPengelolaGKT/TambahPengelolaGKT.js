import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";
import "./DataPengelolaGKT.css";

const TambahPengelolaGKT = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    jabatan: "",
    nama_lengkap: "",
    nip_nik_nipppk: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State untuk mengontrol modal
  const [openModal, setOpenModal] = useState(false);

  // Mengubah data form ketika user mengetik
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Fungsi untuk menampilkan modal
  const handleOpen = () => setOpenModal(true);

  // Fungsi untuk menutup modal
  const handleClose = () => setOpenModal(false);

  // Fungsi untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:8000/api/userpengelola", {
        ...formData,
        role: "pengelola_gkt",
      });
      setSuccess("User added successfully!");
      setTimeout(() => {
        navigate("/TabelPengelelolaGKT");
      }, 2000);
      handleClose(); // Tutup modal setelah submit berhasil
    } catch (err) {
      setError("Error adding user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tpgk-dashboard-container">
      <Navbar />
      <Sidebar />
      <h1 className="tpgk-dashboard-title">TAMBAH PENGELOLA GKT</h1>

      {/* Tombol untuk membuka modal */}
      <Button variant="primary" onClick={handleOpen}>
        <FaUserPlus /> Tambah Pengelola
      </Button>

      {/* Modal untuk menambah pengelola */}
      <Dialog open={openModal} onClose={handleClose}>
        <DialogTitle>TAMBAH PENGELOLA GKT</DialogTitle>
        <DialogContent>
          <Form onSubmit={handleSubmit} className="tpgk-form">
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

            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter password" name="password" value={formData.password} onChange={handleChange} required />
            </Form.Group>
          </Form>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Batal
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading ? "Adding..." : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menampilkan error atau success message */}
      {error && <div className="tpgk-error-message">{error}</div>}
      {success && <div className="tpgk-success-message">{success}</div>}
    </div>
  );
};

export default TambahPengelolaGKT;
