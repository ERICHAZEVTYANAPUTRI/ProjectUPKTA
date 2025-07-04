import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { FaRegEye, FaUndo } from "react-icons/fa";
import { GrSelect } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";

import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const HalamanMahasiswaSesuaiJadwal = () => {
  const [user, setUser] = useState(null);
  const [jadwalMahasiswa, setJadwalMahasiswa] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedJadwalId, setSelectedJadwalId] = useState(null);
  const [driveLink, setDriveLink] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndJadwal = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token tidak ditemukan.");

        const userRes = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const loggedInUser = userRes.data;
        setUser(loggedInUser);

        const jadwalRes = await axios.get("http://localhost:8000/api/penjadwalanruanganganmahasiswa");
        const semuaJadwal = jadwalRes.data;

        const jadwalSaya = semuaJadwal.filter((j) => j.mahasiswa_id === loggedInUser.id);
        setJadwalMahasiswa(jadwalSaya);
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };

    fetchUserAndJadwal();
  }, []);

  const jadwalFiltered = jadwalMahasiswa
    .filter((item) => item.statuspeminjaman === "terpinjam")
    .filter(
      (item) =>
        item.matakuliah?.namamatakuliah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.matakuliah?.dosen?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaruangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hari?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuOpenId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOpenId(null);
  };

  const handleDetail = (id) => {
    navigate(`/DetailJadwal/${id}`);
    handleMenuClose();
  };

  const handleOpenDialog = (id) => {
    setSelectedJadwalId(id);
    setShowDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setDriveLink("");
    setSelectedJadwalId(null);
  };

  const handleKembalikan = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:8000/api/pengembaliansesuaijadwal/${selectedJadwalId}`, { link_drive: driveLink }, { headers: { Authorization: `Bearer ${token}` } });

      setJadwalMahasiswa((prev) => prev.filter((j) => j.id !== selectedJadwalId));
      handleDialogClose();
      swal("Berhasil!", "Link pengembalian berhasil dikirim.", "success");
    } catch (error) {
      console.error("Gagal mengirim link:", error);
      swal("Gagal!", "Gagal mengirim link pengembalian.", "error");
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
          px: 3,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          ml: "50px",
          width: "calc(100% - 100px)", // membatasi lebar konten
        }}
      >
        <Card sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
          <CardContent>
            <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              <Box>
                <TextField
                  select
                  label="Pilih Halaman"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) navigate(e.target.value);
                  }}
                  SelectProps={{ native: true }}
                  size="small"
                  sx={{ minWidth: 200 }}
                >
                  <option value="">Pilih Halaman</option>
                  <option value="/HalamanMahasiswaSesuaiJadwal">Sesuai Jadwal</option>
                  <option value="/HalamanMahasiswaPeminjamanRuangan">Tidak Sesuai Jadwal</option>
                </TextField>
              </Box>

              <Box
                sx={{
                  width: {
                    xs: "100%",
                    sm: "60%",
                    md: "68%",
                  },
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <Button variant="contained" sx={{ ml: 1, backgroundColor: "#0C20B5", "&:hover": { backgroundColor: "#081780" } }}>
                        <BsSearch />
                      </Button>
                    ),
                  }}
                />
              </Box>
            </Box>

            <TableContainer sx={{ border: "1px solid #e5e6ed", borderRadius: 1 }}>
              <Table aria-label="tabel jadwal mahasiswa">
                <TableHead sx={{ backgroundColor: "#3449e4" }}>
                  <TableRow>
                    {["No", "Hari", "Jam", "Ruangan", "Mata Kuliah", "Dosen", "Aksi"].map((head, idx) => (
                      <TableCell
                        key={idx}
                        sx={{
                          backgroundColor: "#3449e4",
                          color: "white",
                          fontWeight: "bold",
                          borderRight: idx !== 6 ? "2px solid white" : "none",
                          textAlign: "center",
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {jadwalFiltered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        Belum ada jadwal tersedia.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jadwalFiltered.map((item, index) => (
                      <TableRow
                        key={item.id}
                        hover
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#fff",
                          borderBottom: "1px solid #ccc",
                        }}
                      >
                        <TableCell sx={{ borderRight: "2px solid #e5e6ed", textAlign: "center" }}>{index + 1}</TableCell>
                        <TableCell sx={{ borderRight: "2px solid #e5e6ed", textAlign: "center" }}>{item.hari || "-"}</TableCell>
                        <TableCell sx={{ borderRight: "2px solid #e5e6ed", textAlign: "center" }}>
                          {item.jammulai} - {item.jamselesai}
                        </TableCell>
                        <TableCell sx={{ borderRight: "2px solid #e5e6ed", textAlign: "center" }}>{item.namaruangan || "-"}</TableCell>
                        <TableCell sx={{ borderRight: "2px solid #e5e6ed", textAlign: "center" }}>{item.matakuliah?.namamatakuliah || "-"}</TableCell>
                        <TableCell sx={{ borderRight: "2px solid #e5e6ed", textAlign: "center" }}>{item.matakuliah?.dosen?.nama || "-"}</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Button
                            variant="text"
                            size="small"
                            sx={{
                              minWidth: "32px",
                              p: 0.5,
                              backgroundColor: "transparent",
                              "&:hover": { backgroundColor: "transparent" },
                            }}
                            onClick={(e) => (menuOpenId === item.id ? handleMenuClose() : handleMenuOpen(e, item.id))}
                          >
                            <GrSelect style={{ fontSize: "20px", color: "#161179" }} />
                          </Button>

                          <Menu
                            id={`menu-${item.id}`}
                            anchorEl={anchorEl}
                            open={menuOpenId === item.id}
                            onClose={handleMenuClose}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            sx={{ mt: 1 }}
                          >
                            <MenuItem onClick={() => handleDetail(item.id)}>
                              <FaRegEye style={{ marginRight: 8, color: "#008080", fontSize: 18 }} />
                              Lihat Detail
                            </MenuItem>
                            <MenuItem onClick={() => handleOpenDialog(item.id)}>
                              <FaUndo style={{ marginRight: 8, color: "#FF0000", fontSize: 18 }} />
                              Kembalikan
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Dialog open={showDialog} onClose={handleDialogClose}>
              <DialogTitle>Upload Link Google Drive</DialogTitle>
              <DialogContent>
                <TextField autoFocus margin="dense" label="Link Google Drive" type="url" fullWidth variant="standard" placeholder="https://drive.google.com/..." value={driveLink} onChange={(e) => setDriveLink(e.target.value)} />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDialogClose} color="secondary">
                  Batal
                </Button>
                <Button onClick={handleKembalikan} variant="contained" color="primary" disabled={!driveLink}>
                  Kirim
                </Button>
              </DialogActions>
            </Dialog>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default HalamanMahasiswaSesuaiJadwal;
