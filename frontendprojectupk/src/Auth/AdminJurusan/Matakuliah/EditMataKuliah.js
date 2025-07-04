import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const EditMatakuliah = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    kodematakuliah: "",
    namamatakuliah: "",
    tahunajaran_id: "",
    kurikulum_id: "",
    prodi_id: "",
    tipe: "",
    semester: "",
    sks_total: "",
  });

  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [kurikulumList, setKurikulumList] = useState([]);
  const [prodiList, setProdiList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        const [matakuliahRes, tahunAjaranRes, kurikulumRes, prodiRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/matakuliah/${id}`),
          axios.get("http://localhost:8000/api/tahunajaran"),
          axios.get("http://localhost:8000/api/kurikulum"),
          axios.get("http://localhost:8000/api/prodi"),
        ]);

        setFormData({
          kodematakuliah: matakuliahRes.data.kodematakuliah,
          namamatakuliah: matakuliahRes.data.namamatakuliah,
          tahunajaran_id: matakuliahRes.data.tahunajaran_id,
          kurikulum_id: matakuliahRes.data.kurikulum_id,
          prodi_id: matakuliahRes.data.prodi_id,
          tipe: matakuliahRes.data.tipe,
          semester: matakuliahRes.data.semester,
          sks_total: matakuliahRes.data.sks_total,
        });

        setTahunAjaranList(tahunAjaranRes.data.filter((t) => t.adminjurusan_id === user.id));
        setKurikulumList(kurikulumRes.data.filter((k) => k.adminjurusan_id === user.id));
        setProdiList(prodiRes.data.filter((p) => p.adminjurusan_id === user.id));
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.put(`http://localhost:8000/api/matakuliah/${id}`, {
        ...formData,
        adminjurusan_id: user.id,
      });
      alert("Data berhasil diperbarui.");
      navigate("/matakuliah");
    } catch (error) {
      console.error("Gagal memperbarui data:", error);
      alert("Terjadi kesalahan saat menyimpan.");
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <Box
        sx={{
          paddingTop: "180px",
          height: "calc(100vh - 158px)",
          overflowY: "auto",
          ml: "50px",
          width: "calc(100% - 240px)",
          px: 3,
        }}
      >
        <Card sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Edit Mata Kuliah
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField fullWidth label="Kode Mata Kuliah" name="kodematakuliah" value={formData.kodematakuliah} onChange={handleChange} margin="normal" required />
              <TextField fullWidth label="Nama Mata Kuliah" name="namamatakuliah" value={formData.namamatakuliah} onChange={handleChange} margin="normal" required />
              <TextField fullWidth select label="Tahun Ajaran" name="tahunajaran_id" value={formData.tahunajaran_id} onChange={handleChange} margin="normal" required>
                {tahunAjaranList.map((ta) => (
                  <MenuItem key={ta.id} value={ta.id}>
                    {ta.tahun} - {ta.semester}
                  </MenuItem>
                ))}
              </TextField>
              <TextField fullWidth select label="Kurikulum" name="kurikulum_id" value={formData.kurikulum_id} onChange={handleChange} margin="normal" required>
                {kurikulumList.map((k) => (
                  <MenuItem key={k.id} value={k.id}>
                    {k.nama}
                  </MenuItem>
                ))}
              </TextField>
              <TextField fullWidth select label="Program Studi" name="prodi_id" value={formData.prodi_id} onChange={handleChange} margin="normal" required>
                {prodiList.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.namaprodi}
                  </MenuItem>
                ))}
              </TextField>
              <TextField fullWidth select label="Tipe" name="tipe" value={formData.tipe} onChange={handleChange} margin="normal" required>
                <MenuItem value="teori">Teori</MenuItem>
                <MenuItem value="praktikum">Praktikum</MenuItem>
              </TextField>
              <TextField fullWidth label="Semester" name="semester" type="number" value={formData.semester} onChange={handleChange} margin="normal" required />
              <TextField fullWidth label="Total SKS" name="sks_total" type="number" value={formData.sks_total} onChange={handleChange} margin="normal" required />
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="primary" type="submit">
                  Simpan Perubahan
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default EditMatakuliah;
