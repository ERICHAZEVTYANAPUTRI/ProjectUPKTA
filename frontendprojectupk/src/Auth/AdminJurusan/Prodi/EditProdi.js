import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const EditProdi = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kodeprodi, setKodeProdi] = useState("");
  const [namaprodi, setNamaProdi] = useState("");

  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8000/api/prodi/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setKodeProdi(response.data.kodeprodi);
        setNamaProdi(response.data.namaprodi);
      } catch (error) {
        console.error("Gagal mengambil data prodi:", error);
      }
    };

    fetchProdi();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/api/prodi/${id}`,
        {
          kodeprodi,
          namaprodi,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Prodi berhasil diperbarui.");
      navigate("/Prodi");
    } catch (error) {
      console.error("Gagal mengupdate prodi:", error);
      alert("Terjadi kesalahan saat mengupdate prodi.");
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="form-container" style={{ padding: "30px", marginLeft: "300px", maxWidth: "800px" }}>
        <h2>Edit Mata Kuliah</h2>{" "}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Kode Prodi</label>
            <input type="text" className="form-control" value={kodeprodi} onChange={(e) => setKodeProdi(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label>Nama Prodi</label>
            <input type="text" className="form-control" value={namaprodi} onChange={(e) => setNamaProdi(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">
            Update
          </button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>
            Batal
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProdi;
