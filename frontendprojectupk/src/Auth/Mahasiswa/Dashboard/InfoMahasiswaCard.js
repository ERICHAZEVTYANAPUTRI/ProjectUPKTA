import { Avatar, Box, Card, CardContent, Divider, Grid, Skeleton, Typography } from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const MahasiswaInfoCard = ({ open }) => {
  const location = useLocation();

  // Panggil hooks dulu
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan.");

        const response = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      }
    };
    fetchUser();
  }, []);

  // Tentukan route yang diizinkan tampilkan card
  const showOnRoutes = ["/DashboardMahasiswa", "/MahasiswaGedung"];

  // Jika route tidak sesuai, return null (tapi hooks sudah dipanggil di atas)
  if (!showOnRoutes.includes(location.pathname)) return null;

  const tanggalHariIni = dayjs().locale("id").format("dddd, D MMMM YYYY");

  if (!user) {
    return (
      <Card sx={{ borderRadius: 3, px: 2 }}>
        <CardContent>
          {/* Skeleton untuk judul */}
          <Skeleton
            variant="text"
            sx={{
              width: {
                xs: "80%",
                sm: "88%",
                md: open ? "400px" : "595px",
              },
              height: 24, // tinggi teks judul sesuai font size kira-kira
              borderRadius: 1,
              mb: 2, // kasih margin bawah supaya ada jarak ke skeleton foto
            }}
          />
          {/* Skeleton untuk avatar (foto) */}
          <Skeleton
            variant="rectangular"
            width={120} // Sama dengan Avatar width
            height={160} // Sama dengan Avatar height
            sx={{ borderRadius: 2 }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        width: {
          xs: "80%", // handphone
          sm: "88%", // tablet
          md: open ? "480px" : "595px", // tergantung sidebar
        },
        transition: "width 0.3s ease",
        borderRadius: 2,
        px: 3,
        py: 1,
        background: "linear-gradient(to bottom, #ffffff, #f0f4f9)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent>
        {/* ... konten card ... */}
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ color: "#1976d2", fontWeight: 600, userSelect: "none", fontSize: "16px" }}>🎓 Informasi Mahasiswa</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            {tanggalHariIni}
          </Typography>
        </Grid>
        <Divider sx={{ mb: 2, mt: -1 }} />
        <Grid container spacing={3} sx={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
          {/* Foto */}
          <Grid
            item
            xs="auto"
            sx={{
              width: 140,
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Avatar
              alt={user.nama_lengkap}
              src={user.foto ? `http://localhost:8000/storage/${user.foto}` : undefined}
              variant="rounded"
              sx={{
                width: 120,
                height: 160,
                borderRadius: 2,
                boxShadow: 3,
                border: "2px solid #1976d2",
                objectFit: "cover",
              }}
            />
          </Grid>

          {/* Info */}
          <Grid
            item
            xs
            sx={{
              minWidth: 0,
              flexShrink: 1,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <InfoItem label="Nama" value={user.nama_lengkap} />
              <InfoItem label="NIM" value={user.nim} />
              <InfoItem label="Kelas" value={user.kelas?.nama || "-"} />
              <InfoItem label="Semester" value={user.smester} />
              <InfoItem label="No. Telepon" value={user.notlp} />
              <InfoItem label="Jurusan" value={user.jurusan?.namajurusan || "-"} />
              <InfoItem label="Prodi" value={user.prodi?.namaprodi || "-"} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Modifikasi InfoItem supaya label dan ":" tetap satu baris dan value membungkus dalam space yang ada

const InfoItem = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      mb: 0.05,
      maxWidth: "100%",
      flexWrap: "nowrap", // JANGAN wrap, supaya label dan ":" tetap di baris yg sama
    }}
  >
    <Typography
      variant="caption"
      fontWeight="600"
      color="text.secondary"
      sx={{
        width: 100,
        fontSize: "0.75rem",
        textAlign: "left",
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="caption"
      fontWeight="600"
      color="text.secondary"
      sx={{
        width: 10,
        textAlign: "center",
        flexShrink: 0,
      }}
    >
      :
    </Typography>
    <Typography
      variant="body2"
      fontWeight="500"
      sx={{
        color: "#333",
        fontSize: "0.75rem",
        pl: 1,
        flex: 1,
        whiteSpace: "normal", // biar teks bisa wrap ke baris berikutnya
        wordBreak: "break-word", // pecah kata panjang supaya tidak overflow
        overflowWrap: "break-word", // dukungan tambahan
      }}
    >
      {value || "-"}
    </Typography>
  </Box>
);

export default MahasiswaInfoCard;
