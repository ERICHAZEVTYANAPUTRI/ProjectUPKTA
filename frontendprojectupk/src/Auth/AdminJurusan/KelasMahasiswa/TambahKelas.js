import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const TambahKelas = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const adminJurusanId = user?.id || null;

  const [namaKelas, setNamaKelas] = useState("");
  const [prodiOptions, setProdiOptions] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/prodi");
        const options = res.data.map((prodi) => ({
          value: prodi.id,
          label: prodi.namaprodi,
        }));
        setProdiOptions(options);
      } catch (error) {
        console.error("Error fetching prodi:", error);
      }
    };

    fetchProdi();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!namaKelas || !selectedProdi) {
      alert("Nama kelas dan Prodi harus diisi.");
      return;
    }

    try {
      const payload = {
        nama: namaKelas,
        prodi_id: selectedProdi.value,
        adminjurusan_id: adminJurusanId,
      };

      await axios.post("http://localhost:8000/api/kelasmahasiswa/tambah", payload);
      alert("Kelas berhasil ditambahkan.");
      navigate("/kelasmahasiswa"); // kembali ke halaman kelas
    } catch (error) {
      console.error("Gagal menambahkan kelas:", error);
      alert("Terjadi kesalahan saat menyimpan kelas.");
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
              Tambah Kelas
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField label="Nama Kelas" fullWidth required margin="normal" value={namaKelas} onChange={(e) => setNamaKelas(e.target.value)} />

              <Box sx={{ mt: 2 }}>
                <label style={{ fontSize: "0.9rem", fontWeight: 500 }}>Pilih Program Studi</label>
                <Select options={prodiOptions} value={selectedProdi} onChange={setSelectedProdi} placeholder="Pilih Prodi" isSearchable />
              </Box>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button type="submit" variant="contained" color="primary">
                  Simpan
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

export default TambahKelas;
