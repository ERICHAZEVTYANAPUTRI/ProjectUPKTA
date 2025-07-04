import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { FaUserPlus } from "react-icons/fa";

import Select from "react-select";

const TambahDosen = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    jabatanfungsional: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [prodiList, setProdiList] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await axios.get("http://localhost:8000/api/prodi");
        const filtered = res.data.filter((p) => p.adminjurusan_id === user.id);
        const options = filtered.map((p) => ({ value: p.id, label: p.namaprodi }));
        setProdiList(options);
      } catch (err) {
        console.error("Gagal ambil prodi:", err);
      }
    };
    fetchProdi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.post("http://localhost:8000/api/dosen", {
        ...formData,
        prodi_id: selectedProdi?.value,
        adminjurusan_id: user?.id,
      });
      setSuccess("Dosen berhasil ditambahkan.");
      if (onSuccess) onSuccess(); // Trigger reload
      onHide(); // Close modal
    } catch (err) {
      setError("Gagal menambahkan dosen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg" centered>
      <Modal.Header closeButton style={{ backgroundColor: "#0c20b5", color: "#fff" }}>
        <Modal.Title>Form Tambah Dosen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nama Dosen</Form.Label>
            <Form.Control type="text" name="nama" value={formData.nama} onChange={handleChange} placeholder="Masukkan Nama Dosen" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>NIP</Form.Label>
            <Form.Control type="text" name="nip" value={formData.nip} onChange={handleChange} placeholder="Masukkan NIP" required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prodi</Form.Label>
            <Select options={prodiList} value={selectedProdi} onChange={setSelectedProdi} placeholder="Pilih Prodi" isClearable />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Jabatan Fungsional</Form.Label>
            <Form.Control type="text" name="jabatanfungsional" value={formData.jabatanfungsional} onChange={handleChange} placeholder="Masukkan Jabatan Fungsional" required />
          </Form.Group>

          {error && <p className="text-danger">{error}</p>}
          {success && <p className="text-success">{success}</p>}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onHide} style={{ width: "130px" }}>
              Batal
            </Button>
            <Button type="submit" variant="success" disabled={loading} style={{ backgroundColor: "#008000", width: "140px" }}>
              <FaUserPlus style={{ marginRight: "8px" }} />
              {loading ? "Menyimpan..." : "Tambahkan"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TambahDosen;
