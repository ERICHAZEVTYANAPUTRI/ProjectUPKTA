import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../../../Components/Sidebar/Sidebar";

const PenjadwalanRuangGenap = () => {
  const { kodejurusangenap, prodigenapId, tahunAjarangenapId, gedungId } = useParams();
  const [penjadwalangenap, setPenjadwalangenap] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [gedungList, setGedungList] = useState([]);
  const [selectedGedungId, setSelectedGedungId] = useState("");
  const [ruanganPilihan, setRuanganPilihan] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRuangan = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/ruangan/${gedungId}`);
        console.log("Data ruangan:", response.data); // Periksa apakah ruangan yang diambil sesuai
        setRuanganList(response.data);
      } catch (error) {
        console.error("Error fetching ruangan:", error);
      }
    };

    if (gedungId) {
      fetchRuangan();
    }
  }, [gedungId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jadwalResponse = await axios.get(`http://localhost:8000/api/penjadwalangenap/${tahunAjarangenapId}`);
        const mahasiswaResponse = await axios.get("http://localhost:8000/api/mahasiswa");
        const mataKuliahResponse = await axios.get("http://localhost:8000/api/matakuliah");

        setPenjadwalangenap(jadwalResponse.data);
        setMahasiswaList(mahasiswaResponse.data);
        setMataKuliahList(mataKuliahResponse.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };
    fetchData();
  }, [tahunAjarangenapId]);

  const getNamaMahasiswa = (id) => {
    const mahasiswa = mahasiswaList.find((m) => m.id === parseInt(id));
    return mahasiswa ? mahasiswa.nama_lengkap : id;
  };

  const getKelasMahasiswa = (id) => {
    const mahasiswa = mahasiswaList.find((m) => m.id === parseInt(id));
    return mahasiswa ? mahasiswa.kelas : id;
  };

  const getDosenByKodeMk = (kodemk) => {
    const mk = mataKuliahList.find((m) => m.kode_mk === kodemk);
    return mk ? mk.dosen : "-";
  };

  const getMataKuliahByKodeMk = (kodemk) => {
    const mk = mataKuliahList.find((m) => m.kode_mk === kodemk);
    return mk ? mk.namamk : "-";
  };

  const handleOpenModal = async (itemId) => {
    setSelectedItemId(itemId);
    setShowModal(true);
    try {
      const response = await axios.get("http://localhost:8000/api/gedungs");
      setGedungList(response.data);
    } catch (error) {
      console.error("Gagal mengambil daftar gedung:", error);
    }
  };

  const handleGedungChange = async (e) => {
    const id = e.target.value;
    setSelectedGedungId(id);
    try {
      const response = await axios.get(`http://localhost:8000/api/ruangan/${id}`);
      setRuanganPilihan(response.data);
    } catch (error) {
      console.error("Gagal mengambil ruangan:", error);
    }
  };

  const handleKirimJadwal = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/kirim-jadwalgenap/${tahunAjarangenapId}`);
      alert("Jadwal berhasil dikirim ke mahasiswa.");
      // Optional: Refresh data
      setPenjadwalangenap((prev) => prev.map((item) => (item.statusterkirim === "belumterkirim" ? { ...item, statusterkirim: "terkirim" } : item)));
    } catch (error) {
      console.error("Gagal mengirim jadwal:", error);
      alert("Gagal mengirim jadwal.");
    }
  };

  const handleSimpanRuangan = async (ruanganName) => {
    try {
      await axios.put(`http://localhost:8000/api/penjadwalangenap/${selectedItemId}`, {
        namaruangan: ruanganName,
      });

      setPenjadwalangenap((prev) => prev.map((item) => (item.id === selectedItemId ? { ...item, namaruangan: ruanganName } : item)));

      setShowModal(false);
      setSelectedGedungId("");
      setRuanganPilihan([]);
    } catch (error) {
      console.error("Gagal menyimpan ruangan:", error);
    }
  };

  const handleDetailClick = (penjadwalangenapId) => {
    navigate(`/prodigenap/${kodejurusangenap}/detailgenap/${prodigenapId}/penjadwalangenap/lihatdetail/${penjadwalangenapId}`);
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
        Penjadwalan Ruang Kuliah Semester Genap
      </h1>
      <Button variant="primary" style={{ marginLeft: "10px", marginBottom: "15px" }} onClick={handleKirimJadwal}>
        Kirim Jadwal ke Mahasiswa
      </Button>
      <table className="table">
        <thead>
          <tr>
            <th>No</th>
            <th>PJMK</th>
            <th>Hari</th>
            <th>Kelas</th>
            <th>Nama Ruangan</th>
            <th>Dosen</th>
            <th>Mata Kuliah</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {penjadwalangenap.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{getNamaMahasiswa(item.mahasiswapenanggungjawab)}</td>
              <td>{item.hari}</td>
              <td>{getKelasMahasiswa(item.mahasiswapenanggungjawab)}</td>
              <td style={{ cursor: "pointer", color: "blue" }} onClick={() => handleOpenModal(item.id)}>
                {item.namaruangan || "Pilih Ruangan"}
              </td>{" "}
              <td>{getDosenByKodeMk(item.namamk)}</td>
              <td>{getMataKuliahByKodeMk(item.dosen)}</td>
              <td>
                <Button variant="info" onClick={() => handleDetailClick(item.id)}>
                  Detail
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h4>Pilih Gedung</h4>
            <select onChange={handleGedungChange} value={selectedGedungId}>
              <option value="">-- Pilih Gedung --</option>
              {gedungList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {ruanganPilihan.length > 0 && (
              <>
                <h5>Pilih Ruangan</h5>
                <ul>
                  {ruanganPilihan.map((r) => (
                    <li key={r.id} onClick={() => handleSimpanRuangan(r.name)} style={{ cursor: "pointer", margin: "5px 0", color: "green" }}>
                      {r.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenjadwalanRuangGenap;
