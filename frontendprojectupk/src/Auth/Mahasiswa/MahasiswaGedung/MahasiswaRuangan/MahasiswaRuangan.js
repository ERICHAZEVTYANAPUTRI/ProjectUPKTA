import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, MenuList, Popover, Snackbar, TextField, Typography } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import axios from "axios";
import { format, parse } from "date-fns";
import React, { useEffect, useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../../Components/Navbar/Navbar";

const MahasiswaRuangan = () => {
  const { gedungId } = useParams();
  const navigate = useNavigate();
  const parseTimeString = (timeStr) => (timeStr ? parse(timeStr, "HH:mm", new Date()) : null);
  const formatTime = (date) => (date ? format(date, "HH:mm") : "");
  const [ruangan, setRuangan] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // State to manage the Popover's anchor element
  const [selectedRoom, setSelectedRoom] = useState(null); // State to manage the selected room
  const [openSnackbar, setOpenSnackbar] = useState(false); // State for Snackbar
  const [openModal, setOpenModal] = useState(false); // State untuk mengontrol tampilan modal
  const [roomToUpdate, setRoomToUpdate] = useState(null); // State untuk menyimpan data ruangan yang dipilih untuk update
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // bulan 0-based
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`; // format yyyy-mm-dd
  function isAtLeast30MinutesLater(startTime, endTime) {
    if (!startTime || !endTime) return false; // validasi input kosong

    const start = new Date(`2000-01-01T${startTime}:00`);
    let end = new Date(`2000-01-01T${endTime}:00`);

    // Kalau end waktu lebih kecil dari start (misal lewat tengah malam), tambah 1 hari ke end
    if (end < start) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }

    const diffInMinutes = (end - start) / (1000 * 60);
    return diffInMinutes >= 30;
  }
  const [dosens, setDosens] = useState([]);
  const [matakuliahs, setMatakuliahs] = useState([]);
  const getDayName = (dateString) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dosenRes, matkulRes] = await Promise.all([
          axios.get("http://localhost:8000/api/getFilteredDosen", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/getFilteredMatakuliah", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setDosens(dosenRes.data);

        // Filter matakuliah yang tahunajaran.is_aktif === 1
        const filteredMatkul = matkulRes.data.filter((matkul) => matkul.tahunajaran?.is_aktif === 1);
        setMatakuliahs(filteredMatkul);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    fetchData();
  }, []);

  const [peminjamanData, setPeminjamanData] = useState({
    dosen_id: "",
    kodematakuliah: "",
    hari: "",
    tanggal: "",
    jammulai: "",
    jamselesai: "",
    keperluan: "",
  });
  const [tempJamselesai, setTempJamselesai] = React.useState(parseTimeString(peminjamanData.jamselesai));

  const handleSubmitPengajuan = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/pengajuan-peminjaman",
        {
          ...peminjamanData,
          ruangan_id: selectedRoom.id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      swal("Berhasil!", "Pengajuan berhasil dikirim", "success");
      setOpenModal(false);
      // Reset form
      setPeminjamanData({
        dosen_id: "",
        kodematakuliah: "",
        hari: "",
        tanggal: "",
        jammulai: "",
        jamselesai: "",
        keperluan: "",
      });
      setTempJamselesai(null); // ⬅️ Reset TimePicker agar kosong
    } catch (err) {
      console.error(err);

      const errorMessage = err?.response?.data?.message || "Pengajuan gagal dikirim";

      swal("Gagal", errorMessage, "error");
    }
  };
  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    paddingY: 1,
    paddingX: 2,
    borderRadius: 1.5,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#f0f4ff",
      boxShadow: 1,
      transform: "scale(1.01)",
    },
  };

  const [gedung, setGedung] = useState(null);

  useEffect(() => {
    const fetchGedung = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/gedungs/${gedungId}`);
        setGedung(response.data);
      } catch (error) {
        console.error("Error fetching gedung:", error);
      }
    };
    fetchGedung();
  }, [gedungId]);

  useEffect(() => {
    const fetchRuangan = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/ruangan/${gedungId}`);
        setRuangan(response.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRuangan();
  }, [gedungId]);

  const handleCardClick = (roomId, event) => {
    const selectedRoom = ruangan.find((room) => room.id === roomId);
    setSelectedRoom(selectedRoom);
    setAnchorEl(event.currentTarget); // Setel anchorEl ke elemen yang diklik
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case "dipinjam":
        return "red";
      case "diperbaiki":
        return "#d9ee18";
      case "kosong":
        return "#ecf0f1";
      default:
        return "#ecf0f1"; // Default to 'kosong' color if status is unknown
    }
  };
  const handleOpenPeminjamanModal = () => {
    handleClosePopover();

    setPeminjamanData({
      mahasiswa_id: user.id,
      dosen_id: "",
      ruangan_id: selectedRoom.id,
      kodematakuliah: "",
      hari: "",
      tanggal: "",
      jammulai: "",
      jamselesai: "",
      keperluan: "",
    });

    setOpenModal(true);
  };

  const handleAction = (action) => {
    switch (action) {
      case "detail":
        navigate(`/ruangan/${gedungId}/detail/${selectedRoom.id}`);
        break;
    }
    handleClosePopover();
  };

  return (
    <>
      <Navbar />
      {/* Informasi warna ruangan */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ width: 17, height: 17, backgroundColor: "red", borderRadius: "4px" }} />
        <Typography variant="body2" sx={{ color: "#2c3e50" }}>
          Ruangan sedang digunakan
        </Typography>
        <Box sx={{ width: 17, height: 17, backgroundColor: "#ecf0f1", borderRadius: "4px" }} />
        <Typography variant="body2" sx={{ color: "#2c3e50" }}>
          Ruangan kosong
        </Typography>
        <Box sx={{ width: 17, height: 17, backgroundColor: "#d9ee18", borderRadius: "4px" }} />
        <Typography variant="body2" sx={{ color: "#2c3e50" }}>
          Ruangan sedang diperbaiki
        </Typography>
      </Box>
      {(() => {
        // 1. Buat map lantai ke ruangan
        const groupedByFloor = ruangan.reduce((acc, room) => {
          const lantai = parseInt(room.lantai, 10) || 0;
          if (!acc[lantai]) acc[lantai] = [];
          acc[lantai].push(room);
          return acc;
        }, {});

        // 2. Cari lantai maksimum
        const maxFloor = Math.max(...Object.keys(groupedByFloor).map(Number));

        // 3. Render semua lantai dari 1 hingga maxFloor
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start", // center seluruh lantai secara horizontal
              flexWrap: "wrap",
              gap: 4,
              pb: 3,
              rowGap: 2, // Menjaga jarak antar baris lantai
            }}
          >
            {Array.from({ length: maxFloor }, (_, i) => {
              const lantai = i + 1;
              const rooms = groupedByFloor[lantai] || [];

              return (
                <Box
                  key={lantai}
                  sx={{
                    width: "200px", // Tetapkan lebar tetap per lantai
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    height: "auto", // Biarkan tinggi mengikuti konten (ruangan)
                  }}
                >
                  {/* Lantai Title */}
                  <Box
                    sx={{
                      mt: "10px",
                      width: "100%",
                      height: "40px", // Fixed height untuk title lantai
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 2,
                      backgroundColor: "#ecf0f1",
                      borderRadius: "4px",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        textAlign: "center",
                        textTransform: "uppercase",
                        color: "#2c3e50",
                        fontSize: "14px", // ⬅️ Ubah sesuai keinginan, misalnya 16px, 20px, dll
                      }}
                    >
                      Lantai {lantai}
                    </Typography>
                  </Box>

                  {/* Ruangan Cards */}
                  <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}>
                    <Grid container spacing={1.4} wrap="wrap" columns={12} justifyContent="center">
                      {rooms.length > 0 ? (
                        rooms.map((room) => (
                          <Grid item key={room.id} xs={3} sx={{ display: "flex", justifyContent: "center" }}>
                            <Card
                              onClick={(event) => handleCardClick(room.id, event)}
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: getRoomStatusColor(room.statusruangan),
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                cursor: "pointer",
                                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                                transition: "all 0.2s ease-in-out",
                                border: "1px solid #e0e0e0",
                                "&:hover": {
                                  boxShadow: "0 8px 20px rgba(0, 123, 255, 0.25)",
                                  borderColor: "#007BFF",
                                  transform: "scale(1.1)",
                                  color: "#007BFF",
                                  backgroundColor: "#f0f8ff", // sangat soft biru muda saat hover
                                },
                              }}
                            >
                              <Typography variant="caption" fontWeight="600" fontSize="9px" sx={{ color: "inherit", textTransform: "uppercase" }}>
                                {room.name}
                              </Typography>
                            </Card>
                          </Grid>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            fontStyle: "italic",
                            textAlign: "center",
                            width: "100%",
                            mb: "80px",
                            mt: 0, // Menghilangkan margin top agar dekat dengan Lantai
                          }}
                        >
                          Tidak ada ruangan
                        </Typography>
                      )}
                    </Grid>
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      })()}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: 4,
            bgcolor: "#ffffff",
            paddingY: 1,
          },
        }}
      >
        <MenuList disablePadding>
          {selectedRoom && (
            <>
              <MenuItem sx={menuItemStyle} onClick={() => handleAction("detail")}>
                <BsInfoCircle size={18} color="#0C20B5" />
                <Typography variant="body2">Lihat Detail</Typography>
              </MenuItem>

              {selectedRoom.statusruangan === "kosong" && (
                <>
                  <MenuItem sx={menuItemStyle} onClick={handleOpenPeminjamanModal}>
                    <MdEdit size={20} color="#1976d2" />
                    <Typography variant="body2">Pinjam</Typography>
                  </MenuItem>
                </>
              )}
            </>
          )}
        </MenuList>
      </Popover>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} message={snackbarMessage} />
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        {/* HEADER */}
        <DialogTitle
          sx={{
            fontWeight: "bold",
            color: "#0C20B5",
            textAlign: "center",
            backgroundColor: "#f5f8ff",
            py: 2,
            fontSize: "18px",
          }}
        >
          Form Pengajuan Peminjaman
        </DialogTitle>

        {/* BODY */}
        <DialogContent
          dividers
          sx={{
            backgroundColor: "#fafafa",
            px: 3,
            py: 2,
            minHeight: "100px", // optionally add height
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#111",
          }}
        >
          {/* Kosongkan atau isi dengan teks placeholder */}
          {/* Baris: Dosen & Matkul */}
          <Grid container spacing={2}>
            {/* Dosen dan Mata Kuliah dalam 1 baris */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Pilih Dosen
              </Typography>
              <Select
                options={dosens.map((d) => ({ value: d.id, label: d.nama }))}
                value={
                  dosens.find((d) => d.id === peminjamanData.dosen_id)
                    ? {
                        value: peminjamanData.dosen_id,
                        label: dosens.find((d) => d.id === peminjamanData.dosen_id)?.nama,
                      }
                    : null
                }
                onChange={(selected) => setPeminjamanData({ ...peminjamanData, dosen_id: selected?.value || "" })}
                styles={{
                  ...selectStyles,
                  container: (base) => ({
                    ...base,
                    minWidth: "292px", // Minimal lebar
                    maxWidth: "292px", // Minimal lebar
                    width: "100%", // Responsif
                  }),
                }}
                placeholder="Pilih Dosen..."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Mata Kuliah
              </Typography>
              <Select
                options={matakuliahs.map((m) => ({
                  value: m.kodematakuliah,
                  label: `${m.kodematakuliah} – ${m.namamatakuliah}`,
                }))}
                value={
                  peminjamanData.kodematakuliah
                    ? {
                        value: peminjamanData.kodematakuliah,
                        label: `${matakuliahs.find((m) => m.kodematakuliah === peminjamanData.kodematakuliah)?.namamatakuliah || ""} - ${peminjamanData.kodematakuliah}`,
                      }
                    : null
                }
                onChange={(selected) => setPeminjamanData({ ...peminjamanData, kodematakuliah: selected?.value || "" })}
                styles={{
                  ...selectStyles,
                  container: (base) => ({
                    ...base,
                    minWidth: "240px",
                    maxWidth: "240px", // Minimal lebar
                    width: "100%",
                  }),
                }}
                placeholder="Pilih Mata Kuliah..."
              />
            </Grid>

            <Grid item xs={3}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Tanggal
              </Typography>
              <TextField
                type="date"
                fullWidth
                value={peminjamanData.tanggal}
                onChange={(e) => {
                  const selectedDate = e.target.value;

                  if (selectedDate < todayStr) {
                    swal("Tanggal Tidak Valid", "Tanggal peminjaman tidak boleh sebelum tanggal hari ini.", "warning");
                    return; // batalkan update state
                  }

                  const dayName = getDayName(selectedDate);
                  setPeminjamanData((prev) => ({
                    ...prev,
                    tanggal: selectedDate,
                    hari: dayName,
                  }));
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
                inputProps={{ min: todayStr }} // batasi input minimal hari ini
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: "#ccc",
                    },
                    "&:hover fieldset": {
                      borderColor: "#0C20B5",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0C20B5",
                      borderWidth: "1px !important",
                    },
                  },
                }}
              />
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={2}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Jam Mulai
                </Typography>
                <TimePicker
                  ampm={false}
                  value={parseTimeString(peminjamanData.jammulai)}
                  onChange={(newValue) =>
                    setPeminjamanData({
                      ...peminjamanData,
                      jammulai: formatTime(newValue),
                    })
                  }
                  timeSteps={{ minutes: 1 }}
                  slotProps={{
                    textField: {
                      fullWidth: false,
                      size: "small",
                      sx: {
                        width: 120,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)", // 💡 efek lebih menonjol
                        borderRadius: "10px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          "& fieldset": {
                            borderColor: "#ccc",
                          },
                          "&:hover fieldset": {
                            borderColor: "#0C20B5",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#0C20B5",
                            borderWidth: "1px !important",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#0C20B5",
                            borderWidth: "1px !important", // pastikan tetap tipis
                          },
                        },
                        "& .MuiInputBase-input": {
                          fontSize: 16,
                        },
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={2}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Jam Selesai
                </Typography>
                <TimePicker
                  ampm={false}
                  value={tempJamselesai}
                  onChange={(newValue) => {
                    setTempJamselesai(newValue); // update nilai sementara
                  }}
                  onAccept={(acceptedValue) => {
                    const formattedJamMulai = peminjamanData.jammulai;
                    const formattedJamSelesai = formatTime(acceptedValue);

                    if (!isAtLeast30MinutesLater(formattedJamMulai, formattedJamSelesai)) {
                      swal("Jam Selesai Tidak Valid", "Jam selesai minimal 30 menit setelah jam mulai.", "warning");

                      // Reset jam selesai di form dan state utama
                      setTempJamselesai(null); // kosongkan input TimePicker
                      setPeminjamanData({
                        ...peminjamanData,
                        jamselesai: "",
                      });
                      return;
                    }

                    // Kalau valid update state
                    setPeminjamanData({
                      ...peminjamanData,
                      jamselesai: formattedJamSelesai,
                    });
                    setTempJamselesai(acceptedValue);
                  }}
                  timeSteps={{ minutes: 1 }}
                  slotProps={{
                    textField: {
                      fullWidth: false,
                      size: "small",
                      sx: {
                        width: 120,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        borderRadius: "10px",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          "& fieldset": {
                            borderColor: "#ccc",
                          },
                          "&:hover fieldset": {
                            borderColor: "#0C20B5",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#0C20B5",
                            borderWidth: "1px !important",
                          },
                        },
                        "& .MuiInputBase-input": {
                          fontSize: 16,
                        },
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Keperluan */}
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                <Box sx={{ width: "600px" }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Keperluan
                  </Typography>
                  <TextField
                    multiline
                    rows={3}
                    placeholder="Masukkan Keperluan..."
                    fullWidth
                    value={peminjamanData.keperluan}
                    onChange={(e) =>
                      setPeminjamanData({
                        ...peminjamanData,
                        keperluan: e.target.value,
                      })
                    }
                    InputProps={{
                      disableUnderline: false,
                    }}
                    sx={{
                      width: "100%",
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                      "& .MuiInputBase-input": {
                        textAlign: "left",
                      },
                      "& input::placeholder": {
                        fontSize: "14px",
                        opacity: 1,
                        color: "#888",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#0C20B5",
                          borderWidth: "1px",
                        },
                        "& fieldset": {
                          borderColor: "#ccc",
                          borderRadius: 3,
                        },
                        "&:hover fieldset": {
                          borderColor: "#0C20B5",
                          borderRadius: 3,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#0C20B5",
                          borderRadius: 3,
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>

        {/* FOOTER */}
        <DialogActions
          sx={{
            backgroundColor: "#f5f8ff",
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={() => setOpenModal(false)}
            variant="outlined"
            color="error"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              py: 1,
              borderColor: "#e53935", // merah soft
              color: "#e53935",
              backgroundColor: "#fff5f5",
              "&:hover": {
                backgroundColor: "#fdecea", // merah sangat muda
                borderColor: "#d32f2f",
                color: "#c62828",
              },
            }}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmitPengajuan}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.2,
              backgroundColor: "#0C20B5",
              boxShadow: "0 2px 6px rgba(12, 32, 181, 0.3)",
              "&:hover": {
                backgroundColor: "#091a8c",
                boxShadow: "0 3px 8px rgba(12, 32, 181, 0.35)",
              },
            }}
          >
            Kirim Pengajuan
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
const selectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: 45,
    borderRadius: 8,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    color: "#111", // teks terpilih
    "&:hover": {
      borderColor: "#0C20B5",
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

export default MahasiswaRuangan;
