import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { Avatar, Box, Card, Chip, Divider, MenuItem, Select, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";

// Tidak ada perubahan pada import

const PengajuanMenungguPersetujuan = ({ open }) => {
  const [dataPending, setDataPending] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/pengajuanpengembalianpending"); // pastikan endpoint ini hanya kirim status "dipinjam"
        setDataPending(res.data.data); // akses array-nya langsung
      } catch (error) {
        console.error("Gagal mengambil data pengajuan:", error);
      }
    };
    fetchData();
  }, []);

  const paginatedData = dataPending.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(dataPending.length / rowsPerPage);

  return (
    <Card
      elevation={0}
      sx={{
        mt: 3,
        p: 2,
        borderRadius: 2,
        background: "#fff",
        border: "1px solid #e0e0e0",
        boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
        width: {
          xs: "100%",
          sm: "95%",
          md: open ? "415px" : "500px",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography fontWeight={700} sx={{ fontSize: "0.85rem" }}>
          🔔 Pengajuan Pengembalian
        </Typography>
        <Select
          size="small"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(1);
          }}
          sx={{
            fontSize: "0.7rem",
            height: 28,
            width: 55,
          }}
        >
          {[3, 5, 7, 10].map((val) => (
            <MenuItem key={val} value={val} sx={{ fontSize: "0.7rem" }}>
              {val}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* List Content */}
      {paginatedData.length === 0 ? (
        <Typography align="center" sx={{ fontSize: "0.75rem", fontStyle: "italic", color: "gray", my: 2 }}>
          Tidak ada pengajuan Pengembalian menunggu persetujuan.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {paginatedData.map((item) => (
            <Card
              key={item.id}
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                background: "#fffefc",
                borderLeft: "4px solid #ff9800",
                borderRadius: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                "&:hover": { backgroundColor: "#fff8e1" },
              }}
            >
              <Avatar src={`http://localhost:8000/storage/${item.foto}`} alt={item.nama_lengkap} />
              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={600} sx={{ fontSize: "0.8rem" }}>
                  {item.nama_lengkap} ({item.nim})
                </Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                  {item.keperluan} | {item.jammulai.slice(0, 5)} - {item.jamselesai.slice(0, 5)}
                </Typography>
              </Box>
              <Chip
                icon={<HourglassTopIcon sx={{ fontSize: "0.9rem", color: "#fff" }} />}
                label="Pending"
                size="small"
                sx={{
                  backgroundColor: "#ff9800",
                  color: "#fff",
                  fontSize: "0.65rem",
                  px: 1,
                  height: 22,
                }}
              />
            </Card>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
          {[...Array(totalPages)].map((_, index) => (
            <Box
              key={index}
              onClick={() => setPage(index + 1)}
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: "0.75rem",
                borderRadius: 1.5,
                cursor: "pointer",
                backgroundColor: page === index + 1 ? "#ff9800" : "#f0f0f0",
                color: page === index + 1 ? "#fff" : "#333",
                fontWeight: 600,
                transition: "0.2s",
                "&:hover": {
                  backgroundColor: page === index + 1 ? "#fb8c00" : "#e0e0e0",
                },
              }}
            >
              {index + 1}
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
};

export default PengajuanMenungguPersetujuan;
