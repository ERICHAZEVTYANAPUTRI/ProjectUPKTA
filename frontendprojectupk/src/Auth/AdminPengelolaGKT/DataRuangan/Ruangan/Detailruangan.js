import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Box, Button, CircularProgress, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";

const DetailRuangan = () => {
  const { gedungId, roomId } = useParams();
  const navigate = useNavigate();
  const [combinedList, setCombinedList] = useState([]);
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [jenisKelasList, setJenisKelasList] = useState([]);
  const [modelKelasList, setModelKelasList] = useState([]);
  const [saranaKelasList, setSaranaKelasList] = useState([]);

  // State untuk data peminjaman
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [loadingPeminjaman, setLoadingPeminjaman] = useState(true);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("gambar", file);

    try {
      await axios.post(`http://localhost:8000/api/ruangan/${roomId}/update-gambar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedRoom = await axios.get(`http://localhost:8000/api/ruangan/${gedungId}/detail/${roomId}`);
      setRoom(updatedRoom.data);
    } catch (error) {
      console.error("Gagal upload gambar:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const roomResponse = await axios.get(`http://localhost:8000/api/ruangan/${gedungId}/detail/${roomId}`);
        setRoom(roomResponse.data);

        const [jenisKelasRes, modelKelasRes, saranaKelasRes] = await Promise.all([axios.get("http://localhost:8000/api/jeniskelas"), axios.get("http://localhost:8000/api/modelkelas"), axios.get("http://localhost:8000/api/saranakelas")]);

        setJenisKelasList(jenisKelasRes.data);
        setModelKelasList(modelKelasRes.data);
        setSaranaKelasList(saranaKelasRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [gedungId, roomId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingPeminjaman(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/ruangan/${roomId}/detail-peminjaman`);

        const jadwalList = res.data.jadwals || [];
        const peminjamanList = res.data.peminjaman || [];

        // Tambahkan tipe untuk membedakan
        const processedJadwal = jadwalList.map((item) => ({
          ...item,
          source: "jadwal",
          tanggal: "-", // karena tidak ada tanggal di jadwal
          keperluan: item.kebutuhankelas,
        }));

        const processedPeminjaman = peminjamanList.map((item) => ({
          ...item,
          source: "peminjaman",
        }));

        setCombinedList([...processedJadwal, ...processedPeminjaman]);
      } catch (error) {
        console.error("Gagal fetch gabungan data:", error);
      } finally {
        setLoadingPeminjaman(false);
      }
    };

    fetchData();
  }, [roomId]);

  const handleBack = () => {
    navigate(-1);
  };

  const mapIdsToNames = (ids, list) => {
    if (!ids) return "-";
    const idArray = Array.isArray(ids) ? ids : [ids];
    const names = idArray
      .map((id) => {
        const found = list.find((item) => item.id === id || item.id === Number(id));
        return found ? found.name || found.nama : id;
      })
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "-";
  };
  const userRole = localStorage.getItem("role"); // atau dari context/auth state
  const canEditImage = userRole === "admin_pengelola_gkt";

  return (
    <>
      <Navbar />
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <CircularProgress />
        </Box>
      ) : (
        room && (
          <Box sx={{ padding: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "row", mb: 5 }}>
              <Box
                sx={{
                  width: "500px",
                  padding: 2,
                  position: "relative",
                  cursor: canEditImage ? "pointer" : "default",
                  borderRadius: 2,
                  overflow: "hidden",
                  "&:hover .overlay": {
                    opacity: canEditImage ? 1 : 0,
                  },
                }}
                onClick={canEditImage ? handleImageClick : undefined}
              >
                <img
                  src={`http://localhost:8000/storage/${room.gambar}`}
                  alt={room.name}
                  style={{
                    width: "100%",
                    height: "230px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    filter: canEditImage ? "blur(0)" : "none",
                  }}
                />
                {canEditImage && (
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      bgcolor: "rgba(0, 0, 0, 0.4)",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      pointerEvents: "none",
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 48 }} />
                  </Box>
                )}
              </Box>

              <input type="file" accept="image/*" style={{ display: "none" }} ref={fileInputRef} onChange={handleImageChange} disabled={!canEditImage} />

              <Box sx={{ width: "60%", padding: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: "center", color: "#0C20B5" }}>
                  {room.name}
                </Typography>
                <Divider sx={{ mb: 3, borderColor: "#3498db", borderWidth: 2 }} />
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "8px",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="body2">
                    <strong>Lantai</strong>
                  </Typography>
                  <Typography variant="body2">: Ruangan berada di lantai {room.lantai}</Typography>

                  <Typography variant="body2">
                    <strong>Kapasitas</strong>
                  </Typography>
                  <Typography variant="body2">: Ruangan ini mampu menampung hingga {room.kapasitas} orang</Typography>

                  <Typography variant="body2">
                    <strong>Jenis Kelas</strong>
                  </Typography>
                  <Typography variant="body2">: Ruangan ini berjenis {mapIdsToNames(typeof room.jeniskelas === "string" ? JSON.parse(room.jeniskelas) : room.jeniskelas, jenisKelasList)}</Typography>

                  <Typography variant="body2">
                    <strong>Model Kelas</strong>
                  </Typography>
                  <Typography variant="body2">: Ruangan ini memiliki model {mapIdsToNames(typeof room.modelkelas === "string" ? JSON.parse(room.modelkelas) : room.modelkelas, modelKelasList)}</Typography>

                  <Typography variant="body2">
                    <strong>Sarana Kelas</strong>
                  </Typography>
                  <Typography variant="body2">: Ruangan ini memiliki sarana pendukung {mapIdsToNames(typeof room.saranakelas === "string" ? JSON.parse(room.saranakelas) : room.saranakelas, saranaKelasList)}</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
              <Tooltip title="Kembali ke daftar ruangan" placement="top">
                <Button
                  variant="contained"
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    bgcolor: "#0C20B5",
                    color: "#fff",
                    fontWeight: "bold",
                    textTransform: "none",
                    px: 3,
                    "&:hover": {
                      bgcolor: "#00109c",
                    },
                  }}
                >
                  Kembali
                </Button>
              </Tooltip>
            </Box>
            <Divider sx={{ mt: 2, mb: 3, borderColor: "#ccc", borderWidth: 1.5 }} />

            {loadingPeminjaman ? (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer
                sx={{
                  width: "100%",
                  overflowX: "auto",
                  border: "1px solid #e5e6ed",
                  borderRadius: 1,
                  "&::-webkit-scrollbar": {
                    height: "4px", // TIPIS
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#c1c1c1", // warna thumb
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f1f1f1", // warna background track
                  },

                  scrollbarWidth: "thin", // Firefox
                  scrollbarColor: "#c1c1c1 #f1f1f1", // Firefox
                }}
              >
                <Table sx={{ minWidth: 650, borderCollapse: "collapse" }} aria-label="tabel peminjaman">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#0C20B5" }}>
                      <TableCell
                        sx={{
                          color: "#fff",
                          fontWeight: "bold",
                          py: 2,
                          borderRight: "1px solid #fff",
                        }}
                      >
                        Nama Mahasiswa
                      </TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", py: 2, borderRight: "1px solid #fff" }}>Hari</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", py: 2, borderRight: "1px solid #fff" }}>Jam</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", py: 2, borderRight: "1px solid #fff" }}>Status</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold", py: 2 }}>Tipe</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {combinedList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, borderBottom: "1px solid #ddd" }}>
                          Tidak ada data peminjaman atau jadwal aktif.
                        </TableCell>
                      </TableRow>
                    ) : (
                      combinedList.map((item, index) => (
                        <TableRow
                          key={`${item.source}-${item.id}`}
                          sx={{
                            "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                            "&:hover": { backgroundColor: "#f1f5ff", cursor: "pointer" },
                          }}
                        >
                          <TableCell sx={{ py: 2, borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>{item.mahasiswa?.nama_lengkap || item.mahasiswa?.name || item.mahasiswa_id}</TableCell>
                          <TableCell sx={{ py: 2, borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>{item.hari}</TableCell>
                          <TableCell sx={{ py: 2, borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>
                            {item.jammulai} - {item.jamselesai}
                          </TableCell>
                          <TableCell sx={{ py: 2, borderRight: "1px solid #ddd", borderBottom: "1px solid #ddd" }}>{item.statuspeminjaman || "-"}</TableCell>
                          <TableCell sx={{ py: 2, borderBottom: "1px solid #ddd", fontStyle: "italic" }}>{item.source === "jadwal" ? "Jadwal Kuliah Rutin" : "Peminjaman Luar Jadwal"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )
      )}
    </>
  );
};

export default DetailRuangan;
