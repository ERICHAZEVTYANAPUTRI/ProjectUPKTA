import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../../../Components/Sidebar/Sidebar";

const DetailPenjadwalanGanjil = () => {
  const { penjadwalanganjilId } = useParams();
  const [detail, setDetail] = useState(null);
  const [mahasiswa, setMahasiswa] = useState(null);
  const [matakuliah, setMatakuliah] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/penjadwalanganjil/detailganjil/${penjadwalanganjilId}`);
        console.log("RESPON DETAIL:", response.data);

        const data = Array.isArray(response.data) ? response.data[0] : response.data;
        setDetail(data);

        // Ambil data mahasiswa PJMK
        const mahasiswaId = data?.mahasiswapenanggungjawab;
        if (mahasiswaId) {
          const mahasiswaResponse = await axios.get(`http://localhost:8000/api/mahasiswa/${mahasiswaId}`);
          setMahasiswa(mahasiswaResponse.data);
        }

        // Ambil data matakuliah berdasarkan kodemk
        const kodeMk = data?.kodemk;
        if (kodeMk) {
          const matakuliahResponse = await axios.get(`http://localhost:8000/api/matakuliah/${kodeMk}`);
          console.log("RESPON MATAKULIAH:", matakuliahResponse.data);
          setMatakuliah(matakuliahResponse.data);
        }
      } catch (error) {
        console.error("Gagal mengambil detail penjadwalan:", error);
      }
    };
    fetchDetail();
  }, [penjadwalanganjilId]);

  const handleBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <div style={{ margin: "20px" }}>
        <h2>Detail Penjadwalan Semester Ganjil</h2>
        {detail ? (
          <Card>
            <Card.Body>
              <h5>Informasi Mahasiswa PJMK</h5>
              {mahasiswa ? (
                <>
                  {mahasiswa.foto && (
                    <div style={{ marginBottom: "15px" }}>
                      <img src={`http://localhost:8000/storage/${mahasiswa.foto}`} alt="Foto Mahasiswa" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }} />
                    </div>
                  )}
                  <p>
                    <strong>Nama Lengkap:</strong> {mahasiswa.nama_lengkap}
                  </p>
                  <p>
                    <strong>Prodi:</strong> {mahasiswa.prodi ?? "-"}
                  </p>
                  <p>
                    <strong>Kelas:</strong> {mahasiswa.kelas ?? "-"}
                  </p>
                  <p>
                    <strong>NIM:</strong> {mahasiswa.nim ?? "-"}
                  </p>
                  <p>
                    <strong>Jurusan:</strong> {mahasiswa.jurusanmahasiswa ?? "-"}
                  </p>
                  <p>
                    <strong>No. Telepon:</strong> {mahasiswa.notlp ?? "-"}
                  </p>
                </>
              ) : (
                <p>Memuat data mahasiswa...</p>
              )}

              <h5 style={{ marginTop: "25px" }}>Detail Penjadwalan</h5>
              <p>
                <strong>Hari:</strong> {detail.hari}
              </p>
              <p>
                <strong>Jam:</strong> {detail.jammulai} - {detail.jamselesai}
              </p>
              <p>
                <strong>Nama Ruangan:</strong> {detail.namaruangan}
              </p>
              <p>
                <strong>Dosen:</strong> {matakuliah?.dosen ?? detail.dosen}
              </p>
              <p>
                <strong>Mata Kuliah:</strong> {matakuliah?.namamk ?? detail.namamk}
              </p>
              <p>
                <strong>Kebutuhan Kelas:</strong> {detail.kebutuhankelas}
              </p>
            </Card.Body>
          </Card>
        ) : (
          <p>Memuat detail...</p>
        )}
        <Button onClick={handleBack} style={{ marginTop: "15px" }} variant="secondary">
          Kembali
        </Button>
      </div>
    </div>
  );
};

export default DetailPenjadwalanGanjil;
