import { Box, Card, CardContent, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsClockHistory, BsDoorClosed, BsDoorOpen, BsExclamationTriangle } from "react-icons/bs";

const gradientColors = ["linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)", "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)"];

const icons = [<BsClockHistory size={20} color="#111" />, <BsDoorClosed size={20} color="#111" />, <BsDoorOpen size={20} color="#111" />, <BsExclamationTriangle size={20} color="#111" />];

const JadwalButuhRuangan = ({ open }) => {
  const [cards, setCards] = useState([
    { title: "Belum Dijadwalkan", content: "Loading..." },
    { title: "User Penggua", content: "Loading..." },
    { title: "Ruangan Tersedia", content: "Loading..." },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kelasBelumJadwal = await axios.get("http://localhost:8000/api/penjadwalan/kelas-belum-jadwal");
        const ruanganKosong = await axios.get("http://localhost:8000/api/ruangandashboardpengelola");
        const userAktif = await axios.get("http://localhost:8000/api/user/aktif");

        setCards([
          {
            title: "Belum Memiliki Ruangan",
            content: kelasBelumJadwal.data.message || "Data tidak tersedia",
          },
          {
            title: "User pengguna",
            content: userAktif.data.message || "Data tidak tersedia",
          },
          {
            title: "Ruangan Tersedia",
            content: ruanganKosong.data.message || "Data tidak tersedia",
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setCards([
          { title: "Belum Dijadwalkan", content: "Gagal mengambil data" },
          { title: "User Pengguna", content: "Gagal mengambil data" },
          { title: "Ruangan Tersedia", content: "Gagal mengambil data" },
        ]);
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 3,
        mt: 2,
        px: 2,
      }}
    >
      {cards.map((card, index) => {
        const gradient = gradientColors[index % gradientColors.length];
        const colors = gradient.match(/#[0-9a-fA-F]{6}/g) || ["#fff", "#fff"];

        return (
          <Card
            key={index}
            sx={{
              width: {
                xs: "90%",
                sm: "88%",
                md: open ? "280px" : "340px",
              },
              borderRadius: 1, // lebih tajam
              background: gradient,
              color: "#111",
              boxShadow: `0 6px 20px ${colors[0]}33`,
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              borderLeft: `6px solid ${colors[1]}`,
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: `0 16px 32px ${colors[1]}66`,
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "4px",
                background: "linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 70%)",
                animation: "glowBar 2s infinite linear",
                zIndex: 2,
              },
              "@keyframes glowBar": {
                "0%": { transform: "translateX(-100%)" },
                "100%": { transform: "translateX(100%)" },
              },
            }}
          >
            {/* Angka di pojok kanan atas */}
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 12,
                backgroundColor: "rgba(255,255,255,0.6)",
                borderRadius: "10px",
                px: 1.5,
                py: 0.5,
                fontWeight: "bold",
                fontSize: "0.75rem",
                color: "#111",
                boxShadow: "0 0 8px rgba(0,0,0,0.1)",
                zIndex: 3,
              }}
            >
              {card.content?.match(/\d+/)?.[0] || ""}
            </Box>

            <CardContent sx={{ py: 3, px: 2, position: "relative", zIndex: 2 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                <Box
                  className="iconWrapper"
                  sx={{
                    background: "rgba(255,255,255,0.4)",
                    borderRadius: "50%",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.3s ease",
                  }}
                >
                  {icons[index]}
                </Box>
                <Typography variant="subtitle1" fontWeight={700} fontSize="0.85rem" sx={{ color: "#111" }}>
                  {card.title}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  fontSize: "0.8rem",
                  color: "#222",
                  lineHeight: 1.5,
                }}
              >
                {card.content}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default JadwalButuhRuangan;
