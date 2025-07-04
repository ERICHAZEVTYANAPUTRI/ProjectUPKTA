import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Box, Collapse, IconButton, Menu, MenuItem, Paper, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import emptyHuman from "../../../../src/assets/nojadwal.png";

const PengajuanPeminjamaDiterimaCard = ({ open, onJadwalDipinjam }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [serverTime, setServerTime] = useState(new Date());
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const menuOpen = Boolean(anchorEl);
  const selectedPengajuan = data.find((item) => item.id === selectedId);
  const canShowPinjamButton = (item) => {
    if (!item || item.status !== "diterima") return false;

    const now = serverTime; // pakai waktu server yang sudah disinkronisasi
    const tanggal = item.tanggal; // format: "YYYY-MM-DD"
    const mulaiDateTime = new Date(`${tanggal}T${item.jammulai}`);
    const selesaiDateTime = new Date(`${tanggal}T${item.jamselesai}`);
    const waktuBolehPinjam = new Date(mulaiDateTime.getTime() - 5 * 60 * 1000);

    return now >= waktuBolehPinjam && now <= selesaiDateTime;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/pengajuan-diterima", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const serverDate = response.headers["date"];
      if (serverDate) setServerTime(new Date(serverDate));
      setData(response.data || []);
    } catch (err) {
      console.error("Error fetching diterima pengajuan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);
  useEffect(() => {
    const interval = setInterval(() => {
      setServerTime((prev) => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDetailClick = (id) => {
    setAnchorEl(null);
    navigate(`/pengajuanpeminjamanruangan/detail/${id}`);
  };

  const handleOpenMenu = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handlePinjam = async () => {
    handleCloseMenu();

    const confirm = await swal({
      title: "Mulai Peminjaman?",
      text: "Apakah Anda yakin ingin mulai meminjam ruangan ini?",
      icon: "warning",
      buttons: ["Batal", "Ya, Pinjam"],
      dangerMode: true,
    });

    if (confirm) {
      try {
        await axios.post(`http://localhost:8000/api/pengajuan-pinjamsaya/${selectedId}`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        swal("Berhasil", "Jadwal berhasil dipinjam.", "success").then(() => {
          onJadwalDipinjam?.(); // Trigger refresh
        });
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 400) {
          // Tampilkan pesan khusus dari backend
          swal("Gagal", error.response.data.message, "error");
        } else {
          swal("Gagal", "Terjadi kesalahan saat meminjam jadwal.", "error");
        }
      }
    }
  };
  const handleBatal = async () => {
    handleCloseMenu();

    const confirm = await swal({
      title: "Batalkan Peminjaman?",
      text: "Apakah Anda yakin ingin menarik Peminjaman ini?",
      icon: "warning",
      buttons: ["Batal", "Ya, Batalkan"],
      dangerMode: true,
    });

    if (confirm) {
      try {
        await axios.delete(`http://localhost:8000/api/pengajuan-pinjamsaya/${selectedId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        swal("Berhasil", "Peminjaman berhasil dibatalkan.", "success");
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
        swal("Gagal", "Gagal membatalkan Peminjaman.", "error");
      }
    }
  };

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Paper
        elevation={3}
        sx={{
          width: { xs: "100%", md: open ? 380 : 480 },
          borderRadius: 3,
          p: 2,
          boxSizing: "border-box",
          background: "linear-gradient(to bottom,#fff,#f0f4f9)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          textAlign: "center",
        }}
      >
        <Box sx={{ py: 4 }}>
          <img src={emptyHuman} alt="Belum ada jadwal kelas" style={{ maxWidth: 200, width: "100%" }} />
          <Typography variant="body2" color="text.secondary">
            Belum ada pengajuan diterima.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        width: { xs: "100%", md: open ? 380 : 480 },
        borderRadius: 2,
        p: 2,
        boxSizing: "border-box",
        background: "linear-gradient(to bottom, #ffffff, #f0f4f9)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-4px)",
        },
        overflowX: "auto",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" minHeight="24px">
        {loading ? (
          <Box sx={{ width: 140, height: 24 }}>
            <Skeleton width="100%" height="100%" />
          </Box>
        ) : (
          <Typography sx={{ color: "#1976d2", fontWeight: 600, fontSize: "16px", userSelect: "none" }}>📄 Pengajuan Diterima</Typography>
        )}
        <IconButton size="small" onClick={() => setShowTable((prev) => !prev)} sx={{ color: "#1976d2" }} aria-label="Toggle pengajuan">
          {showTable ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Info Saat Tertutup */}
      {/* Saat belum expand dan masih loading */}
      {!showTable && loading && (
        <>
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
        </>
      )}

      {/* Info Saat Tertutup dan sudah tidak loading */}
      {!showTable && !loading && data.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem", mb: 1 }}>
          {data.length} pengajuan diterima
        </Typography>
      )}
      {/* Collapse Table */}
      <Collapse in={showTable} timeout="auto" unmountOnExit>
        {loading ? (
          <>
            <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          </>
        ) : data.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Tidak ada pengajuan diterima.
          </Typography>
        ) : (
          <Table
            size="small"
            sx={{
              borderCollapse: "collapse",
              "& th, & td": {
                border: "1px solid rgba(224, 224, 224, 1)",
                padding: "6px 12px",
              },
              "& th": {
                backgroundColor: "#e3f2fd",
                color: "#1976d2",
                fontWeight: 600,
              },
              "& tr:hover": {
                backgroundColor: "#f5faff",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Hari</TableCell>
                <TableCell>Jam</TableCell>
                <TableCell>Matakuliah</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontSize: "0.75rem" }}>{item.hari}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {item.jammulai?.slice(0, 5)} - {item.jamselesai?.slice(0, 5)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>{item.matakuliah?.namamatakuliah || "-"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Lihat Aksi">
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenMenu(e, item.id)}
                        sx={{
                          color: "#1976d2",
                          "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Collapse>
      {/* Popup Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            minWidth: 90,
            py: 0.5,
            backgroundColor: "#fff",
          },
        }}
      >
        <MenuItem
          onClick={handleBatal}
          sx={{
            fontSize: "0.75rem",
            gap: 1,
            px: 1.5,
            py: 0.75,
            color: "#c62828",
            "&:hover": { backgroundColor: "#ffebee" },
          }}
        >
          <DeleteIcon fontSize="small" />
          Batal
        </MenuItem>
        <MenuItem
          onClick={() => handleDetailClick(selectedId)}
          sx={{
            fontSize: "0.75rem",
            px: 1.5,
            py: 0.75,
            gap: 1,
            color: "#0d47a1",
            minHeight: "32px",
            "& svg": {
              fontSize: "1rem",
            },
            "&:hover": {
              backgroundColor: "#e3f2fd",
            },
          }}
        >
          <VisibilityIcon fontSize="small" />
          Detail
        </MenuItem>
        {selectedPengajuan && canShowPinjamButton(selectedPengajuan) && (
          <MenuItem
            onClick={handlePinjam}
            sx={{
              fontSize: "0.75rem",
              px: 1.5,
              py: 0.75,
              gap: 1,
              color: "#0d47a1",
              minHeight: "32px",
              "& svg": {
                fontSize: "1rem",
              },
              "&:hover": {
                backgroundColor: "#e3f2fd",
              },
            }}
          >
            <AddCircleOutlineIcon fontSize="inherit" />
            Pinjam
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};
const cardStyle = (open, isError = false) => ({
  width: { xs: "100%", md: open ? 380 : 480 },
  borderRadius: 4,
  p: 3,
  boxSizing: "border-box",
  background: isError ? "rgba(255, 235, 238, 0.6)" : "linear-gradient(to bottom, #ffffff, #f0f4f9)",
  boxShadow: isError ? "0 3px 10px rgba(244, 67, 54, 0.3)" : "0 8px 24px rgba(0, 0, 0, 0.12)",
  transition: "all 0.3s ease",
  cursor: "default",
  "&:hover": {
    boxShadow: isError ? "0 5px 15px rgba(244, 67, 54, 0.4)" : "0 12px 28px rgba(0, 0, 0, 0.15)",
    transform: "translateY(-4px)",
  },
});

export default PengajuanPeminjamaDiterimaCard;
