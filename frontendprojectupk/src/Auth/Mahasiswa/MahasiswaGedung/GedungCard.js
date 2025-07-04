import LayersIcon from "@mui/icons-material/Layers";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { Box, Button, Card, CardContent, CardMedia, Divider, Typography } from "@mui/material";

const GedungCard = ({ gedung, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      width: 260,
      borderRadius: 2,
      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      cursor: "pointer",
      backgroundColor: "#fff",
      transition: "box-shadow 0.25s ease",
      "&:hover": {
        boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
      },
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    {/* Gambar Gedung */}
    <CardMedia
      component="img"
      height="140"
      image={`http://localhost:8000/storage/${gedung.gambar}`}
      alt={gedung.name}
      sx={{
        objectFit: "cover",
      }}
    />

    {/* Konten */}
    <CardContent sx={{ flexGrow: 1, p: 0 }}>
      <Box
        sx={{
          backgroundColor: "rgba(128, 128, 128, 0.2)",
          width: "100%",
          p: "14px 0", // tambah tinggi padding atas bawah
          m: 0,
        }}
      >
        <Typography
          variant="subtitle1"
          noWrap
          sx={{
            fontWeight: 600,
            color: "#1565c0",
            textAlign: "center",
            margin: 0, // hapus margin default
            padding: "0 12px", // kasih padding kiri kanan agar teks tidak menempel ke sisi box
            lineHeight: 1.2,
          }}
        >
          {gedung.name}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", color: "#1976d2", py: 1.3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <LayersIcon fontSize="small" />
          <Typography fontWeight={550}>{gedung.lantai_tertinggi || 0}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3 }}>
            Lantai
          </Typography>
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 2, // memberi jarak kiri-kanan divider
            borderColor: "#90caf9",
            height: 32,
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <MeetingRoomIcon fontSize="small" />
          <Typography fontWeight={550}>{gedung.jumlah_ruangan || 0}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3 }}>
            Ruangan
          </Typography>
        </Box>
      </Box>
    </CardContent>

    {/* Tombol */}
    <Button
      variant="contained"
      color="primary"
      size="small"
      fullWidth
      sx={{
        borderRadius: 0,
        fontWeight: 600,
        textTransform: "none",
        py: 1,
      }}
    >
      Lihat Gedung
    </Button>
  </Card>
);

export default GedungCard;
