import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const JadwalDetailMahasiswa = () => {
  const { id } = useParams();
  const [data, setData] = useState({}); // Awal data berupa objek kosong
  const [loading, setLoading] = useState(true); // Tambahkan state loading opsional

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/penjadwalanruanganmahasiswa/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false); // Hilangkan loading meskipun gagal
      }
    };

    fetchDetail();
  }, [id]);

  const { mahasiswa, matakuliah, prodi, hari, jammulai, jamselesai, namaruangan, kebutuhankelas, statuspeminjaman } = data || {};

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div style={{ marginLeft: "300px", padding: "30px" }}>
        <h2>Detail Jadwal Ruangan</h2>
        {loading && <p>Sedang memuat data...</p>} {/* opsional */}
        <div className="d-flex gap-4 align-items-start">
          {/* Foto Mahasiswa */}
          <div>
            {mahasiswa?.foto ? (
              <img src={`http://localhost:8000/storage/${mahasiswa.foto}`} alt="Foto Mahasiswa" style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }} />
            ) : (
              <div style={{ width: "150px", height: "150px", background: "#ccc", borderRadius: "8px" }} />
            )}
          </div>

          {/* Data Tabel */}
          <table className="table table-striped w-75">
            <tbody>
              <tr>
                <th>NIM</th>
                <td>{mahasiswa?.nim || "-"}</td>
              </tr>
              <tr>
                <th>Nama Lengkap</th>
                <td>{mahasiswa?.nama_lengkap || "-"}</td>
              </tr>
              <tr>
                <th>Kelas</th>
                <td>{mahasiswa?.kelas || "-"}</td>
              </tr>
              <tr>
                <th>Semester Mahasiswa</th>
                <td>{mahasiswa?.smester || "-"}</td>
              </tr>
              <tr>
                <th>No. Telepon</th>
                <td>{mahasiswa?.notlp || "-"}</td>
              </tr>
              <tr>
                <th>Program Studi</th>
                <td>{prodi?.namaprodi || "-"}</td>
              </tr>
              <tr>
                <th>Nama Mata Kuliah</th>
                <td>{matakuliah?.namamatakuliah || "-"}</td>
              </tr>
              <tr>
                <th>Nama Dosen</th>
                <td>{matakuliah?.dosen?.nama || "-"}</td>
              </tr>
              <tr>
                <th>Nama Kurikulum</th>
                <td>{matakuliah?.kurikulum?.namakurikulum || "-"}</td>
              </tr>
              <tr>
                <th>Jurusan Mahasiswa</th>
                <td>{mahasiswa?.jurusan?.namajurusan || "-"}</td>
              </tr>
              <tr>
                <th>SKS</th>
                <td>{matakuliah?.sks || "-"}</td>
              </tr>
              <tr>
                <th>Tipe</th>
                <td>{matakuliah?.tipe || "-"}</td>
              </tr>
              <tr>
                <th>Hari</th>
                <td>{hari || "-"}</td>
              </tr>
              <tr>
                <th>Jam</th>
                <td>{jammulai && jamselesai ? `${jammulai} - ${jamselesai}` : "-"}</td>
              </tr>
              <tr>
                <th>Ruangan</th>
                <td>{namaruangan || "-"}</td>
              </tr>
              <tr>
                <th>Kebutuhan Kelas</th>
                <td>{kebutuhankelas || "-"}</td>
              </tr>
              <tr>
                <th>Status Jadwal</th>
                <td>{statuspeminjaman || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JadwalDetailMahasiswa;
