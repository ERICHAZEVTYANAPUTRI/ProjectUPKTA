import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const TambahProdi = () => {
  const [kodeprodi, setKodeProdi] = useState("");
  const [namaprodi, setNamaProdi] = useState("");
  const [user, setUser] = useState(null);
  const [idJurusan, setIdJurusan] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Ambil data user (yang sedang login)
        const userResponse = await axios.get("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = userResponse.data;
        setUser(userData);

        // 2. Ambil semua jurusan
        const jurusanResponse = await axios.get("http://localhost:8000/api/jurusan", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 3. Cari jurusan berdasarkan kodejurusan user login
        const matchingJurusan = jurusanResponse.data.find((j) => j.kodejurusan === userData.kodejurusan);

        if (matchingJurusan) {
          setIdJurusan(matchingJurusan.id);
        } else {
          console.error("Jurusan dengan kode tersebut tidak ditemukan.");
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:8000/api/prodi",
        {
          kodeprodi,
          namaprodi,
          id_jurusan: idJurusan,
          adminjurusan_id: user?.id, // pastikan nilai ini tidak undefined/null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Prodi berhasil ditambahkan!");
      setTimeout(() => navigate("/Prodi"), 1500);
    } catch (error) {
      console.error("Gagal menambahkan prodi:", error);
      setError("Gagal menambahkan prodi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container-mahasiswa">
      <Navbar />
      <Sidebar />
      <div style={{ margin: "20px" }}>
        <h2>Tambah Prodi</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kode Prodi</label>
            <input type="text" className="form-control" value={kodeprodi} onChange={(e) => setKodeProdi(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Nama Prodi</label>
            <input type="text" className="form-control" value={namaprodi} onChange={(e) => setNamaProdi(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-success mt-3" disabled={!idJurusan || !user || loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          {error && <div className="text-danger mt-2">{error}</div>}
          {success && <div className="text-success mt-2">{success}</div>}
        </form>
      </div>
    </div>
  );
};

export default TambahProdi;
