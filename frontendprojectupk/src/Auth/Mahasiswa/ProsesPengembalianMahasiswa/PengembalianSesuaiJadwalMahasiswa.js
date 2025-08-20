import { Box, Button, Card, CardContent, FormControl, InputAdornment, InputLabel, MenuItem, Modal, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { FcProcess } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const HalamanMahasiswaPengembalianSesuaiJadwal = () => {
  const [user, setUser] = useState(null);
  const [jadwalMahasiswa, setJadwalMahasiswa] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedJadwalId, setSelectedJadwalId] = useState(null);
  const [driveLink, setDriveLink] = useState("");
  const [selectedPage, setSelectedPage] = useState("");
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

  const handleDetail = (id) => {
    navigate(`/DetailJadwal/${id}`);
  };

  const handleKembalikan = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:8000/api/pengembaliansesuaijadwal/${selectedJadwalId}`, { link_drive: driveLink }, { headers: { Authorization: `Bearer ${token}` } });
      setJadwalMahasiswa((prev) => prev.filter((j) => j.id !== selectedJadwalId));
      setShowPopup(false);
      setDriveLink("");
      setSelectedJadwalId(null);
      swal("Berhasil!", "Link pengembalian berhasil dikirim.", "success");
    } catch (error) {
      console.error("Gagal mengirim link:", error);
      swal("Gagal!", "Gagal mengirim link pengembalian.", "error");
    }
  };

  const jadwalFiltered = jadwalMahasiswa
    .filter((item) => item.statuspeminjaman === "prosespengembalian")
    .filter((item) => item.statusuploadvidio && item.statusuploadvidio.trim() !== "")
    .filter(
      (item) =>
        item.matakuliah?.namamatakuliah?.toLowerCase().includes(searchTerm) ||
        item.matakuliah?.dosen?.nama?.toLowerCase().includes(searchTerm) ||
        item.namaruangan?.toLowerCase().includes(searchTerm) ||
        item.hari?.toLowerCase().includes(searchTerm)
    );

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
          ml: "50px",
          width: "calc(100% - 100px)",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Card sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                mb: 2,
                gap: 1,
              }}
            >
              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel id="select-page-label">Pilih Halaman</InputLabel>
                <Select
                  labelId="select-page-label"
                  value={selectedPage}
                  label="Pilih Halaman"
                  size="small"
                  onChange={(e) => {
                    setSelectedPage(e.target.value);
                    if (e.target.value) navigate(e.target.value);
                  }}
                >
                  <MenuItem value="">Pilih Halaman</MenuItem>
                  <MenuItem value="/HalamanMahasiswaPengembalianSesuaiJadwal">Pengembalian Sesuai Jadwal</MenuItem>
                  <MenuItem value="/HalamanMahasiswaPengembalianTidakSesuaiJadwal">Pengembalian Tidak Sesuai Jadwal</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", ml: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#0C20B5",

                            "&:hover": { backgroundColor: "#081780" },
                          }}
                        >
                          <BsSearch />
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            {jadwalFiltered.length === 0 ? (
              <Typography align="center" mt={5}>
                Belum ada jadwal tersedia.
              </Typography>
            ) : (
              <TableContainer sx={{ border: "1px solid #e5e6ed", borderRadius: 1 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: "#3449e4" }}>
                    <TableRow>
                      {["No", "Hari", "Jam", "Ruangan", "Mata Kuliah", "Dosen", "Status Pengembalian", "Detail", "Info"].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            paddingY: 1,
                            borderRight: "2px solid white",
                            textAlign: "center",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {jadwalFiltered.map((item, index) => (
                      <TableRow key={item.id} hover sx={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#fff" }}>
                        <TableCell align="center" sx={{ borderRight: "2px solid #e5e6ed" }}>
                          {index + 1}
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: "2px solid #e5e6ed" }}>
                          {item.hari}
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: "2px solid #e5e6ed" }}>
                          {item.jammulai} - {item.jamselesai}
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: "2px solid #e5e6ed" }}>
                          {item.namaruangan || "-"}
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: "2px solid #e5e6ed" }}>
                          {item.matakuliah?.namamatakuliah || "-"}
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: "2px solid #e5e6ed" }}>
                          {item.matakuliah?.dosen?.nama || "-"}
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: "2px solid #e5e6ed" }}>
                          <Typography fontSize="15px">Menunggu Persetujuan</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: "2px solid #e5e6ed" }}>
                          <Button variant="outlined" size="small" onClick={() => handleDetail(item.id)}>
                            Detail
                          </Button>
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            sx={{
                              color: "#4CAF50",
                              borderColor: "#4CAF50",
                              padding: "8px 12px",
                              fontSize: "14px",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 0.5,
                              minWidth: 110,
                            }}
                            onClick={() => {
                              swal({
                                title: "Konfirmasi Pengembalian",
                                text:
                                  "Menunggu persetujuan admin pengelola apakah video yang dikirim sudah sesuai atau tidak.\n\n" +
                                  "Jika tidak sesuai, peminjaman akan kembali di ruangan sedang digunakan dan silahkan upload ulang link video yang sesuai syarat dan ketentuan!",
                                icon: "info",
                                buttons: ["Batal", "OK"],
                              });
                            }}
                          >
                            <FcProcess style={{ fontSize: "24px" }} />
                            <span style={{ fontSize: "14px" }}>Proses Pengembalian</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Modal Upload Google Drive */}
            <Modal open={showPopup} onClose={() => setShowPopup(false)}>
              <Box sx={styleModal}>
                <Typography variant="h6" mb={2}>
                  Upload Link Google Drive
                </Typography>
                <TextField fullWidth type="url" placeholder="https://drive.google.com/..." value={driveLink} onChange={(e) => setDriveLink(e.target.value)} required />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                  <Button variant="outlined" onClick={() => setShowPopup(false)} sx={{ mr: 2 }}>
                    Batal
                  </Button>
                  <Button variant="contained" onClick={handleKembalikan}>
                    Kirim
                  </Button>
                </Box>
              </Box>
            </Modal>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default HalamanMahasiswaPengembalianSesuaiJadwal;
