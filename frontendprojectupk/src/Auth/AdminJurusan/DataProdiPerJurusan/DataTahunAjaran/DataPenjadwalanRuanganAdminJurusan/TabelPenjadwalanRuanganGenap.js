import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../Components/Sidebar/Sidebar";

const PenjadwalanRuangGenapAdminJurusan = () => {
  const { kodejurusangenap, prodigenapId, tahunAjarangenapId } = useParams();
  const [penjadwalangenap, setPenjadwalangenap] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const navigate = useNavigate();

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

  const handleDetailClick = (penjadwalangenapId) => {
    navigate(`/prodigenap/${kodejurusangenap}/detailgenap/${prodigenapId}/penjadwalangenap/lihatdetail/${penjadwalangenapId}`);
  };

  const handleAddSchedule = () => {
    navigate(`/prodigenap/${kodejurusangenap}/tambahjadwal/${prodigenapId}/${tahunAjarangenapId}`);
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "0 10px" }}>
        <h1 className="Dashboard-title">Penjadwalan Ruang Kuliah Semester Genap</h1>
        <Button variant="success" onClick={handleAddSchedule}>
          Tambahkan Jadwal
        </Button>
      </div>

      <table className="table mt-3">
        <thead>
          <tr>
            <th>No</th>
            <th>PJMK</th>
            <th>Hari</th>
            <th>Jam</th>
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
              <td>
                {item.jammulai} - {item.jamselesai}
              </td>
              <td>{getKelasMahasiswa(item.mahasiswapenanggungjawab)}</td>
              <td>{item.namaruangan}</td>
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
    </div>
  );
};

export default PenjadwalanRuangGenapAdminJurusan;
