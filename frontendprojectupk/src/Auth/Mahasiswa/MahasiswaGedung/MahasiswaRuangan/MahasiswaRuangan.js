import {
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    MenuList,
    Popover,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import axios from "axios";
import { format, parse } from "date-fns";
import React, { useEffect, useState } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import swal from "sweetalert";
import Navbar from "../../../../Components/Navbar/Navbar";

const MahasiswaRuangan = () => {
    const { gedungId } = useParams();
    const navigate = useNavigate();
    const parseTimeString = (timeStr) =>
        timeStr ? parse(timeStr, "HH:mm", new Date()) : null;
    const formatTime = (date) => (date ? format(date, "HH:mm") : "");
    const [ruangan, setRuangan] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [roomToUpdate, setRoomToUpdate] = useState(null);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [openModalKegiatan, setOpenModalKegiatan] = useState(false);
    const [kegiatanData, setKegiatanData] = useState({
        tanggal: "",
        jammulai: "",
        jamselesai: "",
        keperluan: "",
        jenis_kegiatan: "",
    });
    const [tempJamselesaiKegiatan, setTempJamselesaiKegiatan] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    function isAtLeast30MinutesLater(startTime, endTime) {
        if (!startTime || !endTime) return false;

        const start = new Date(`2000-01-01T${startTime}:00`);
        let end = new Date(`2000-01-01T${endTime}:00`);
        if (end < start) {
            end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
        }

        const diffInMinutes = (end - start) / (1000 * 60);
        return diffInMinutes >= 30;
    }
    const [dosens, setDosens] = useState([]);
    const [matakuliahs, setMatakuliahs] = useState([]);
    const getDayName = (dateString) => {
        const days = [
            "Minggu",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
        ];
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
                    axios.get(
                        "http://localhost:8000/api/getFilteredMatakuliah",
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    ),
                ]);

                setDosens(dosenRes.data);

                const filteredMatkul = matkulRes.data.filter(
                    (matkul) => matkul.tahunajaran?.is_aktif === 1
                );
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
    const [tempJamselesai, setTempJamselesai] = React.useState(
        parseTimeString(peminjamanData.jamselesai)
    );

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
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            swal("Berhasil!", "Pengajuan berhasil dikirim", "success");
            setOpenModal(false);
            setPeminjamanData({
                dosen_id: "",
                kodematakuliah: "",
                hari: "",
                tanggal: "",
                jammulai: "",
                jamselesai: "",
                keperluan: "",
            });
            setTempJamselesai(null);
        } catch (err) {
            console.error(err);

            const errorMessage =
                err?.response?.data?.message || "Pengajuan gagal dikirim";

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
                const response = await axios.get(
                    `http://localhost:8000/api/gedungs/${gedungId}`
                );
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
                const response = await axios.get(
                    `http://localhost:8000/api/ruangan/${gedungId}`
                );
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
        setAnchorEl(event.currentTarget);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
    };
    const handleOpenPengajuanKegiatan = () => {
        handleClosePopover();
        setOpenModalKegiatan(true);
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
                return "#ecf0f1";
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box
                    sx={{
                        width: 17,
                        height: 17,
                        backgroundColor: "red",
                        borderRadius: "4px",
                    }}
                />
                <Typography variant="body2" sx={{ color: "#2c3e50" }}>
                    Ruangan sedang digunakan
                </Typography>
                <Box
                    sx={{
                        width: 17,
                        height: 17,
                        backgroundColor: "#ecf0f1",
                        borderRadius: "4px",
                    }}
                />
                <Typography variant="body2" sx={{ color: "#2c3e50" }}>
                    Ruangan kosong
                </Typography>
                <Box
                    sx={{
                        width: 17,
                        height: 17,
                        backgroundColor: "#d9ee18",
                        borderRadius: "4px",
                    }}
                />
                <Typography variant="body2" sx={{ color: "#2c3e50" }}>
                    Ruangan sedang diperbaiki
                </Typography>
            </Box>
            {(() => {
                const groupedByFloor = ruangan.reduce((acc, room) => {
                    const lantai = parseInt(room.lantai, 10) || 0;
                    if (!acc[lantai]) acc[lantai] = [];
                    acc[lantai].push(room);
                    return acc;
                }, {});
                const maxFloor = Math.max(
                    ...Object.keys(groupedByFloor).map(Number)
                );
                return (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-start",
                            flexWrap: "wrap",
                            gap: 4,
                            pb: 3,
                            rowGap: 2,
                        }}
                    >
                        {Array.from({ length: maxFloor }, (_, i) => {
                            const lantai = i + 1;
                            const rooms = groupedByFloor[lantai] || [];

                            return (
                                <Box
                                    key={lantai}
                                    sx={{
                                        width: "200px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        height: "auto",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            mt: "10px",
                                            width: "100%",
                                            height: "40px",
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
                                                fontSize: "14px",
                                            }}
                                        >
                                            Lantai {lantai}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            flexGrow: 1,
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <Grid
                                            container
                                            spacing={1.4}
                                            wrap="wrap"
                                            columns={12}
                                            justifyContent="center"
                                        >
                                            {rooms.length > 0 ? (
                                                rooms.map((room) => (
                                                    <Grid
                                                        item
                                                        key={room.id}
                                                        xs={3}
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                        }}
                                                    >
                                                        <Card
                                                            onClick={(event) =>
                                                                handleCardClick(
                                                                    room.id,
                                                                    event
                                                                )
                                                            }
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                backgroundColor:
                                                                    getRoomStatusColor(
                                                                        room.statusruangan
                                                                    ),
                                                                borderRadius: 2,
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                textAlign:
                                                                    "center",
                                                                cursor: "pointer",
                                                                boxShadow:
                                                                    "0 1px 6px rgba(0,0,0,0.06)",
                                                                transition:
                                                                    "all 0.2s ease-in-out",
                                                                border: "1px solid #e0e0e0",
                                                                "&:hover": {
                                                                    boxShadow:
                                                                        "0 8px 20px rgba(0, 123, 255, 0.25)",
                                                                    borderColor:
                                                                        "#007BFF",
                                                                    transform:
                                                                        "scale(1.1)",
                                                                    color: "#007BFF",
                                                                    backgroundColor:
                                                                        "#f0f8ff",
                                                                },
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="caption"
                                                                fontWeight="600"
                                                                fontSize="9px"
                                                                sx={{
                                                                    color: "inherit",
                                                                    textTransform:
                                                                        "uppercase",
                                                                }}
                                                            >
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
                                                        mt: 0,
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
                            <MenuItem
                                sx={menuItemStyle}
                                onClick={() => handleAction("detail")}
                            >
                                <BsInfoCircle size={18} color="#0C20B5" />
                                <Typography variant="body2">
                                    Lihat Detail
                                </Typography>
                            </MenuItem>

                            {selectedRoom.statusruangan === "kosong" && (
                                <>
                                    <MenuItem
                                        sx={menuItemStyle}
                                        onClick={handleOpenPeminjamanModal}
                                    >
                                        <MdEdit size={20} color="#1976d2" />
                                        <Typography variant="body2">
                                            Pinjam Kuliah Pengganti
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem
                                        sx={menuItemStyle}
                                        onClick={handleOpenPengajuanKegiatan}
                                    >
                                        <MdEdit size={20} color="#1976d2" />
                                        <Typography variant="body2">
                                            Pinjam Diluar Perkuliahan
                                        </Typography>
                                    </MenuItem>
                                </>
                            )}
                        </>
                    )}
                </MenuList>
            </Popover>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMessage}
            />
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                fullWidth
                maxWidth="sm"
            >
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
                        minHeight: "100px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#111",
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Pilih Dosen
                            </Typography>
                            <Select
                                options={dosens.map((d) => ({
                                    value: d.id,
                                    label: d.nama,
                                }))}
                                value={
                                    dosens.find(
                                        (d) => d.id === peminjamanData.dosen_id
                                    )
                                        ? {
                                              value: peminjamanData.dosen_id,
                                              label: dosens.find(
                                                  (d) =>
                                                      d.id ===
                                                      peminjamanData.dosen_id
                                              )?.nama,
                                          }
                                        : null
                                }
                                onChange={(selected) =>
                                    setPeminjamanData({
                                        ...peminjamanData,
                                        dosen_id: selected?.value || "",
                                    })
                                }
                                styles={{
                                    ...selectStyles,
                                    container: (base) => ({
                                        ...base,
                                        minWidth: "292px",
                                        maxWidth: "292px",
                                        width: "100%",
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
                                              label: `${
                                                  matakuliahs.find(
                                                      (m) =>
                                                          m.kodematakuliah ===
                                                          peminjamanData.kodematakuliah
                                                  )?.namamatakuliah || ""
                                              } - ${
                                                  peminjamanData.kodematakuliah
                                              }`,
                                          }
                                        : null
                                }
                                onChange={(selected) =>
                                    setPeminjamanData({
                                        ...peminjamanData,
                                        kodematakuliah: selected?.value || "",
                                    })
                                }
                                styles={{
                                    ...selectStyles,
                                    container: (base) => ({
                                        ...base,
                                        minWidth: "240px",
                                        maxWidth: "240px",
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
                                        swal(
                                            "Tanggal Tidak Valid",
                                            "Tanggal peminjaman tidak boleh sebelum tanggal hari ini.",
                                            "warning"
                                        );
                                        return;
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
                                inputProps={{ min: todayStr }}
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
                                    value={parseTimeString(
                                        peminjamanData.jammulai
                                    )}
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
                                                boxShadow:
                                                    "0 2px 8px rgba(0, 0, 0, 0.08)",
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
                                                        borderWidth:
                                                            "1px !important",
                                                    },
                                                    "&.Mui-focused fieldset": {
                                                        borderColor: "#0C20B5",
                                                        borderWidth:
                                                            "1px !important",
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
                                        setTempJamselesai(newValue);
                                    }}
                                    onAccept={(acceptedValue) => {
                                        const formattedJamMulai =
                                            peminjamanData.jammulai;
                                        const formattedJamSelesai =
                                            formatTime(acceptedValue);

                                        if (
                                            !isAtLeast30MinutesLater(
                                                formattedJamMulai,
                                                formattedJamSelesai
                                            )
                                        ) {
                                            swal(
                                                "Jam Selesai Tidak Valid",
                                                "Jam selesai minimal 30 menit setelah jam mulai.",
                                                "warning"
                                            );

                                            setTempJamselesai(null);
                                            setPeminjamanData({
                                                ...peminjamanData,
                                                jamselesai: "",
                                            });
                                            return;
                                        }

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
                                                boxShadow:
                                                    "0 2px 8px rgba(0, 0, 0, 0.08)",
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
                                                        borderWidth:
                                                            "1px !important",
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

                        <Grid container spacing={2}>
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Box sx={{ width: "600px" }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ mb: 0.5 }}
                                    >
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
                                            boxShadow:
                                                "0 2px 5px rgba(0, 0, 0, 0.1)",
                                            "& .MuiInputBase-input": {
                                                textAlign: "left",
                                            },
                                            "& input::placeholder": {
                                                fontSize: "14px",
                                                opacity: 1,
                                                color: "#888",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                                    {
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
                            borderColor: "#e53935",
                            color: "#e53935",
                            backgroundColor: "#fff5f5",
                            "&:hover": {
                                backgroundColor: "#fdecea",
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
            <Dialog
                open={openModalKegiatan}
                onClose={() => setOpenModalKegiatan(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        color: "#0C20B5",
                        textAlign: "center",
                    }}
                >
                    Form Pengajuan Kegiatan
                </DialogTitle>
                <DialogContent
                    dividers
                    sx={{ backgroundColor: "#fafafa", px: 3, py: 2 }}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Tanggal
                            </Typography>
                            <TextField
                                type="date"
                                fullWidth
                                value={kegiatanData.tanggal}
                                onChange={(e) =>
                                    setKegiatanData({
                                        ...kegiatanData,
                                        tanggal: e.target.value,
                                    })
                                }
                                inputProps={{ min: todayStr }}
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={2}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Jam Mulai
                            </Typography>
                            <TimePicker
                                ampm={false}
                                value={parseTimeString(kegiatanData.jammulai)}
                                onChange={(val) =>
                                    setKegiatanData({
                                        ...kegiatanData,
                                        jammulai: formatTime(val),
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
                                            boxShadow:
                                                "0 2px 8px rgba(0, 0, 0, 0.08)",
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
                                                    borderWidth:
                                                        "1px !important",
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
                                value={tempJamselesaiKegiatan}
                                onChange={(val) =>
                                    setTempJamselesaiKegiatan(val)
                                }
                                onAccept={(acceptedVal) => {
                                    const start = kegiatanData.jammulai;
                                    const end = formatTime(acceptedVal);

                                    if (!isAtLeast30MinutesLater(start, end)) {
                                        swal(
                                            "Invalid",
                                            "Jam selesai minimal 30 menit setelah jam mulai",
                                            "warning"
                                        );
                                        setTempJamselesaiKegiatan(null);
                                        setKegiatanData({
                                            ...kegiatanData,
                                            jamselesai: "",
                                        });
                                        return;
                                    }

                                    setKegiatanData({
                                        ...kegiatanData,
                                        jamselesai: end,
                                    });
                                    setTempJamselesaiKegiatan(acceptedVal);
                                }}
                                timeSteps={{ minutes: 1 }}
                                slotProps={{
                                    textField: {
                                        fullWidth: false,
                                        size: "small",
                                        sx: {
                                            width: 120,
                                            backgroundColor: "#fff",
                                            boxShadow:
                                                "0 2px 8px rgba(0, 0, 0, 0.08)",
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
                                                    borderWidth:
                                                        "1px !important",
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

                        <Grid item xs={12} sx={{ width: "100%" }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                Jenis Kegiatan
                            </Typography>
                            <CreatableSelect
                                isMulti
                                options={[
                                    { value: "UKM", label: "UKM" },
                                    {
                                        value: "Seminar Proposal",
                                        label: "Seminar Proposal",
                                    },
                                    {
                                        value: "Sidang Akhir",
                                        label: "Sidang Akhir",
                                    },
                                    {
                                        value: "Organisasi Mahasiswa",
                                        label: "Organisasi Mahasiswa",
                                    },
                                ]}
                                value={
                                    kegiatanData.jenis_kegiatan
                                        ? kegiatanData.jenis_kegiatan.map(
                                              (item) => ({
                                                  value: item,
                                                  label: item,
                                              })
                                          )
                                        : []
                                }
                                onChange={(selected) =>
                                    setKegiatanData({
                                        ...kegiatanData,
                                        jenis_kegiatan: selected
                                            ? selected.map((item) => item.value)
                                            : [],
                                    })
                                }
                                menuPortalTarget={document.body}
                                styles={{
                                    ...selectStyles,
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                    }),
                                }}
                                placeholder="Pilih atau Ketik Jenis Kegiatan"
                                isClearable
                            />
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid
                                item
                                xs={12}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Box sx={{ width: "600px" }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ mb: 0.5 }}
                                    >
                                        Keterangan
                                    </Typography>
                                    <TextField
                                        multiline
                                        rows={3}
                                        placeholder="Masukkan Keterangan..."
                                        fullWidth
                                        value={kegiatanData.keperluan}
                                        onChange={(e) =>
                                            setKegiatanData({
                                                ...kegiatanData,
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
                                            boxShadow:
                                                "0 2px 5px rgba(0, 0, 0, 0.1)",
                                            "& .MuiInputBase-input": {
                                                textAlign: "left",
                                            },
                                            "& input::placeholder": {
                                                fontSize: "14px",
                                                opacity: 1,
                                                color: "#888",
                                            },
                                            "& .MuiOutlinedInput-root": {
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                                    {
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
                <DialogActions
                    sx={{ px: 3, py: 2, backgroundColor: "#f5f8ff" }}
                >
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setOpenModalKegiatan(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            try {
                                const response = await axios.post(
                                    "http://localhost:8000/api/pengajuan-kegiatan",
                                    {
                                        mahasiswa_id: user.id,
                                        ruangan_id: selectedRoom.id,
                                        tanggal: kegiatanData.tanggal,
                                        jammulai: kegiatanData.jammulai,
                                        jamselesai: kegiatanData.jamselesai,
                                        jenis_kegiatan:
                                            kegiatanData.jenis_kegiatan,
                                        keperluan: kegiatanData.keperluan,
                                    },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                );
                                swal(
                                    "Berhasil!",
                                    "Pengajuan kegiatan berhasil dikirim",
                                    "success"
                                );

                                setOpenModalKegiatan(false);
                                setKegiatanData({
                                    tanggal: "",
                                    jammulai: "",
                                    jamselesai: "",
                                    keperluan: "",
                                    jenis_kegiatan: "",
                                });
                                setTempJamselesaiKegiatan(null);
                            } catch (err) {
                                const msg =
                                    err?.response?.data?.message ||
                                    "Gagal mengirim pengajuan kegiatan.";
                                swal("Gagal", msg, "error");
                            }
                        }}
                        sx={{ backgroundColor: "#0C20B5" }}
                    >
                        Kirim
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
        color: "#111",
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
