import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaUserEdit } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const EditDosen = () => {
  const navigate = useNavigate();
  const { dosenId } = useParams();

  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    jabatanfungsional: "",
  });
  const [prodiList, setProdiList] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [dosenData, setDosenData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await axios.get("http://localhost:8000/api/prodi");

        // Filter hanya prodi yang sesuai adminjurusan_id user
        const filtered = response.data.filter((prodi) => prodi.adminjurusan_id === user.id);

        const options = filtered.map((prodi) => ({
          value: prodi.id,
          label: prodi.namaprodi,
        }));

        setProdiList(options);
      } catch (error) {
        console.error("Gagal ambil data prodi:", error);
      }
    };

    fetchProdi();
  }, []);

  useEffect(() => {
    // Fetch Dosen
    const fetchDosen = async () => {
      const res = await axios.get(`http://localhost:8000/api/dosen/${dosenId}`);
      setDosenData(res.data);
    };
    fetchDosen();
  }, [dosenId]);

  useEffect(() => {
    if (prodiList.length > 0 && dosenData) {
      const matched = prodiList.find((p) => p.value === dosenData.prodi_id);
      if (matched) {
        setSelectedProdi(matched);
      } else {
        setSelectedProdi(null);
      }
      setFormData({
        nama: dosenData.nama || "",
        nip: dosenData.nip || "",
        jabatanfungsional: dosenData.jabatanfungsional || "",
      });
    }
  }, [prodiList, dosenData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // value dari input sudah string, jadi aman
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!selectedProdi) {
      setError("Prodi harus dipilih");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/dosen/${dosenId}`,
        {
          ...formData,
          nip: formData.nip.toString(), // Pastikan nip string saat dikirim
          prodi_id: selectedProdi.value,
          adminjurusan_id: dosenData.adminjurusan_id, // kirim adminjurusan_id dari state
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Dosen updated successfully!");
      setTimeout(() => {
        navigate("/datadosen");
      }, 2000);
    } catch (err) {
      console.error("Error updating dosen:", err);
      if (err.response?.data?.error) {
        setError(JSON.stringify(err.response.data.error));
      } else {
        setError("Error updating dosen. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tpgk-dashboard-container">
      <Navbar />
      <Sidebar />
      <h1 className="tpgk-dashboard-title">EDIT DOSEN</h1>

      <div className="tpgk-card">
        <Form onSubmit={handleSubmit} className="tpgk-form">
          <Form.Group controlId="formNama">
            <Form.Label>Nama Dosen</Form.Label>
            <Form.Control type="text" placeholder="Enter Nama" name="nama" value={formData.nama} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formNip">
            <Form.Label>NIP</Form.Label>
            <Form.Control type="text" placeholder="Enter NIP" name="nip" value={formData.nip} onChange={handleChange} required />
          </Form.Group>

          <Form.Group controlId="formProdi">
            <Form.Label>PRODI</Form.Label>
            <Select options={prodiList} value={selectedProdi} onChange={setSelectedProdi} placeholder="Pilih Prodi" isClearable required />
          </Form.Group>

          <Form.Group controlId="formJabatan">
            <Form.Label>Jabatan Fungsional</Form.Label>
            <Form.Control type="text" placeholder="Enter Jabatan Fungsional" name="jabatanfungsional" value={formData.jabatanfungsional} onChange={handleChange} required />
          </Form.Group>

          <div className="tpgk-button-container">
            <Button type="submit" variant="success" disabled={loading} className="tpgk-submit-button">
              {loading ? (
                "Updating..."
              ) : (
                <>
                  <FaUserEdit className="tpgk-icon" /> Edit Dosen
                </>
              )}
            </Button>
          </div>

          {error && <div className="tpgk-error-message">{error}</div>}
          {success && <div className="tpgk-success-message">{success}</div>}
        </Form>
      </div>
    </div>
  );
};

export default EditDosen;
