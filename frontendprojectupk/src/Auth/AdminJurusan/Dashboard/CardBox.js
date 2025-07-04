import ClassIcon from "@mui/icons-material/Class";
import GroupIcon from "@mui/icons-material/Group";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import { Box, Card, CardContent, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

const HorizontalCards = ({ open }) => {
  const [jumlahProdi, setJumlahProdi] = useState(null);
  const [jumlahMatakuliah, setJumlahMatakuliah] = useState(null);
  const [jumlahKelas, setJumlahKelas] = useState(null);
  const [jumlahDosen, setJumlahDosen] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    axios
      .get("http://localhost:8000/api/jumlahprodiadminjurusan", config)
      .then((res) => setJumlahProdi(res.data.jumlah_prodi))
      .catch((err) => console.error("Gagal ambil prodi:", err));

    axios
      .get("http://localhost:8000/api/jumlahmatakuliahadminjurusan", config)
      .then((res) => setJumlahMatakuliah(res.data.jumlah_matakuliah))
      .catch((err) => console.error("Gagal ambil matakuliah:", err));

    axios
      .get("http://localhost:8000/api/jumlahkelasadminjurusan", config)
      .then((res) => setJumlahKelas(res.data.jumlah_kelas))
      .catch((err) => console.error("Gagal ambil kelas:", err));

    axios
      .get("http://localhost:8000/api/jumlahdosenadminjurusan", config)
      .then((res) => setJumlahDosen(res.data.jumlah_dosen))
      .catch((err) => console.error("Gagal ambil dosen:", err));
  }, []);

  const cards = [
    {
      title: "Jumlah Prodi",
      content: jumlahProdi !== null ? `${jumlahProdi} Program Studi` : "Memuat...",
      icon: <SchoolIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      bg: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    },
    {
      title: "Jumlah Mata Kuliah",
      content: jumlahMatakuliah !== null ? `${jumlahMatakuliah} Mata Kuliah Aktif` : "Memuat...",
      icon: <MenuBookIcon sx={{ fontSize: 40, color: "#388e3c" }} />,
      bg: "linear-gradient(135deg, #e8f5e9, #c8e6c9)",
    },
    {
      title: "Jumlah Kelas",
      content: jumlahKelas !== null ? `${jumlahKelas} Kelas` : "Memuat...",
      icon: <ClassIcon sx={{ fontSize: 40, color: "#f57c00" }} />,
      bg: "linear-gradient(135deg, #fff3e0, #ffe0b2)",
    },
    {
      title: "Jumlah Dosen",
      content: jumlahDosen !== null ? `${jumlahDosen} Dosen` : "Memuat...",
      icon: <GroupIcon sx={{ fontSize: 40, color: "#d32f2f" }} />,
      bg: "linear-gradient(135deg, #ffebee, #ffcdd2)",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 3,
        justifyContent: "center",
        alignItems: "stretch",
        px: 2,
        mt: 3,
      }}
    >
      {cards.map((card, index) => (
        <Card
          key={index}
          sx={{
            width: {
              xs: "100%",
              sm: open ? "180px" : "100%",
              md: open ? "220px" : "300px",
            },
            background: card.bg,
            borderRadius: 4,
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {card.icon}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: "0.85rem", color: "#333" }}>
                {card.title}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.8rem", color: "#444" }}>
                {card.content}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default HorizontalCards;
