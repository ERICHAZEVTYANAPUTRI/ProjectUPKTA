import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const EditKelas = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [namaKelas, setNamaKelas] = useState("");
  const [prodiOptions, setProdiOptions] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const adminJurusanId = user?.id || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kelasRes, prodiRes] = await Promise.all([axios.get(`http://localhost:8000/api/kelasmahasiswa/${id}`), axios.get("http://localhost:8000/api/prodi")]);

        const kelasData = kelasRes.data;
        setNamaKelas(kelasData.nama);
        setSelectedProdi({
          value: kelasData.prodi_id,
          label: kelasData.prodi?.namaprodi || "Prodi tidak ditemukan",
        });

        const prodiOpts = prodiRes.data.map((prodi) => ({
          value: prodi.id,
          label: prodi.namaprodi,
        }));
        setProdiOptions(prodiOpts);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Gagal mengambil data kelas.");
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!namaKelas || !selectedProdi) {
      alert("Nama kelas dan Prodi wajib diisi.");
      return;
    }

    try {
      await axios.put(`http://localhost:8000/api/kelasmahasiswa/edit/${id}`, {
        nama: namaKelas,
        prodi_id: selectedProdi.value,
        adminjurusan_id: adminJurusanId,
      });

      alert("Data kelas berhasil diperbarui.");
      navigate("/kelasmahasiswa");
    } catch (error) {
      console.error("Gagal update kelas:", error);
      alert("Terjadi kesalahan saat update data.");
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <Box
        sx={{
          paddingTop: "180px",
          ml: "50px",
          px: 3,
          width: "calc(100% - 240px)",
        }}
      >
        <Card sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Edit Kelas
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField label="Nama Kelas" fullWidth required margin="normal" value={namaKelas} onChange={(e) => setNamaKelas(e.target.value)} />

              <Box sx={{ mt: 2 }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>Pilih Program Studi</label>
                <Select options={prodiOptions} value={selectedProdi} onChange={setSelectedProdi} placeholder="Pilih Prodi" isSearchable />
              </Box>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button type="submit" variant="contained" color="primary">
                  Simpan Perubahan
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => navigate("/kelas")}>
                  Batal
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default EditKelas;
