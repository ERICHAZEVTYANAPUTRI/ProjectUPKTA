import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    Box,
    Collapse,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import emptyHuman from "../../../../src/assets/nojadwal.png";

const LS_KEY_KELAS_KOSONG = "kelasKosongHariIni";
const LS_KEY_KELAS_DIALIHKAN = "kelasDialihkanHariIni";

const getTodayString = () => new Date().toISOString().slice(0, 10);

const loadFromLocalStorage = (key) => {
    const data = localStorage.getItem(key);
    if (!data) return [];

    try {
        const parsed = JSON.parse(data);
        if (parsed.date !== getTodayString()) {
            localStorage.removeItem(key);
            return [];
        }
        return parsed.ids || [];
    } catch {
        localStorage.removeItem(key);
        return [];
    }
};

const JadwalkelasPJMK = ({ open, onJadwalDipinjam }) => {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTable, setShowTable] = useState(true);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [sudahTandai, setSudahTandai] = useState([]);
    const [kelasKosongHariIni, setKelasKosongHariIni] = useState(() =>
        loadFromLocalStorage(LS_KEY_KELAS_KOSONG)
    );
    const [kelasDialihkanHariIni, setKelasDialihkanHariIni] = useState(() =>
        loadFromLocalStorage(LS_KEY_KELAS_DIALIHKAN)
    );

    const [serverTime, setServerTime] = useState(new Date());
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const selectedJadwal = jadwal.find((item) => item.id === selectedId);
    const getDateTimeFromTime = (timeStr) => {
        if (!timeStr) return null;
        const now = serverTime;
        const [hour, minute] = timeStr.split(":").map(Number);
        const dateTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour,
            minute,
            0
        );
        return dateTime;
    };

    useEffect(() => {
        localStorage.setItem(
            LS_KEY_KELAS_KOSONG,
            JSON.stringify({ date: getTodayString(), ids: kelasKosongHariIni })
        );
    }, [kelasKosongHariIni]);

    useEffect(() => {
        localStorage.setItem(
            LS_KEY_KELAS_DIALIHKAN,
            JSON.stringify({
                date: getTodayString(),
                ids: kelasDialihkanHariIni,
            })
        );
    }, [kelasDialihkanHariIni]);

    const isTombolDialihkanAktif = (item) => {
        const now = serverTime;
        const hariSekarang = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
        })
            .format(now)
            .toLowerCase();
        const hariJadwal = item.hari.toLowerCase();
        const jamSelesai = getDateTimeFromTime(item.jamselesai);

        return (
            hariSekarang === hariJadwal &&
            now <= jamSelesai &&
            !kelasKosongHariIni.includes(item.id) &&
            !kelasDialihkanHariIni.includes(item.id)
        );
    };

    const isTombolKelasKosongAktif = (item) => {
        const now = serverTime;
        const hariSekarang = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
        })
            .format(now)
            .toLowerCase();
        const hariJadwal = item.hari.toLowerCase();
        const jamSelesai = getDateTimeFromTime(item.jamselesai);

        return (
            hariSekarang === hariJadwal &&
            now <= jamSelesai &&
            !kelasKosongHariIni.includes(item.id) &&
            !kelasDialihkanHariIni.includes(item.id)
        );
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const today = getTodayString();
            const kosongData = JSON.parse(
                localStorage.getItem(LS_KEY_KELAS_KOSONG)
            );
            const dialihkanData = JSON.parse(
                localStorage.getItem(LS_KEY_KELAS_DIALIHKAN)
            );

            if (kosongData?.date !== today) {
                setKelasKosongHariIni([]);
                localStorage.removeItem(LS_KEY_KELAS_KOSONG);
            }
            if (dialihkanData?.date !== today) {
                setKelasDialihkanHariIni([]);
                localStorage.removeItem(LS_KEY_KELAS_DIALIHKAN);
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const showPinjamButton = (() => {
        if (!selectedJadwal) return false;

        const now = serverTime;
        const jamMulaiDate = getDateTimeFromTime(selectedJadwal.jammulai);
        const jamSelesaiDate = getDateTimeFromTime(selectedJadwal.jamselesai);
        if (!jamMulaiDate || !jamSelesaiDate) return false;

        const hariSekarang = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
        })
            .format(now)
            .toLowerCase();
        const hariJadwal = selectedJadwal.hari.toLowerCase();

        return hariSekarang === hariJadwal && now <= jamSelesaiDate;
    })();

    const handleDialihkan = (jadwalId) => {
        setKelasDialihkanHariIni((prev) => [...prev, jadwalId]);
    };
    const handleKelasKosong = (jadwalId) => {
        setKelasKosongHariIni((prev) => [...prev, jadwalId]);
    };

    const handleDetailClick = (event, id) => {
        setAnchorEl(event.currentTarget);
        setSelectedId(id);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };
    const handlePinjam = () => {
        handleCloseMenu();

        swal({
            title: "Yakin ingin meminjam jadwal ini?",
            text: "Apakah Anda yakin ingin mulai meminjam ruangan ini?",
            icon: "warning",
            buttons: ["Batal", "Ya, Pinjam"],
            dangerMode: true,
        }).then(async (willPinjam) => {
            if (willPinjam) {
                try {
                    await axios.post(
                        `http://localhost:8000/api/pinjam-jadwal/${selectedId}`,
                        { statuspeminjaman: "dipinjam" },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    swal(
                        "Berhasil",
                        "Jadwal berhasil dipinjam.",
                        "success"
                    ).then(() => {
                        onJadwalDipinjam?.();
                    });
                    fetchJadwal();
                } catch (error) {
                    console.error(error);
                    if (error.response && error.response.status === 400) {
                        swal("Gagal", error.response.data.message, "error");
                    } else {
                        swal(
                            "Gagal",
                            "Terjadi kesalahan saat meminjam jadwal.",
                            "error"
                        );
                    }
                }
            }
        });
    };

    const handleLihatDetail = () => {
        handleCloseMenu();
        navigate(`/penjadwalanRuangan/detail/${selectedId}`);
    };

    const fetchJadwal = async () => {
        try {
            setLoading(true);
            if (!token) throw new Error("Token tidak ditemukan");

            const response = await axios.get(
                "http://localhost:8000/api/jadwal/mahasiswa",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const serverDate = response.headers["date"];
            if (serverDate) setServerTime(new Date(serverDate));
            const hariOrder = [
                "Senin",
                "Selasa",
                "Rabu",
                "Kamis",
                "Jumat",
                "Sabtu",
                "Minggu",
            ];
            const sortedJadwal = response.data.sort((a, b) => {
                const indexA = hariOrder.indexOf(a.hari);
                const indexB = hariOrder.indexOf(b.hari);

                if (indexA !== indexB) {
                    return indexA - indexB;
                } else {
                    return a.jammulai.localeCompare(b.jammulai);
                }
            });

            setJadwal(sortedJadwal);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const interval = setInterval(() => {
            setServerTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchJadwal();
    }, [token]);

    useEffect(() => {
        const checkForMissedJadwal = () => {
            if (!jadwal?.length) return;

            const now = serverTime;
            const hariSekarang = new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
            })
                .format(now)
                .toLowerCase();

            jadwal.forEach(async (item) => {
                const hariJadwal = item.hari.toLowerCase();
                const jamSelesai = getDateTimeFromTime(item.jamselesai);
                const sudahLewat = now > jamSelesai;
                const sudahDiproses =
                    kelasKosongHariIni.includes(item.id) ||
                    kelasDialihkanHariIni.includes(item.id) ||
                    item.statuspeminjaman === "dipinjam" ||
                    item.statuspeminjaman === "prosespengembalian";
                if (
                    hariSekarang === hariJadwal &&
                    sudahLewat &&
                    !sudahDiproses &&
                    !sudahTandai.includes(item.id)
                ) {
                    setSudahTandai((prev) => [...prev, item.id]);
                    try {
                        await axios.post(
                            `http://localhost:8000/api/tandai-kelas-kosong/${item.id}`,
                            {},
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        setKelasKosongHariIni((prev) => [...prev, item.id]);
                    } catch (err) {}
                }
            });
        };
        checkForMissedJadwal();

        const interval = setInterval(() => {
            checkForMissedJadwal();
        }, 60000);

        return () => clearInterval(interval);
    }, [jadwal, serverTime, kelasKosongHariIni, kelasDialihkanHariIni, token]);

    const handleTerimaPergantian = (jadwalId, pengaju) => {
        handleCloseMenu();
        swal({
            title: "Konfirmasi Terima PJMK",
            text: `Nama: ${pengaju?.nama_lengkap}\nNIM: ${pengaju?.nim}\n\nTerima pengajuan pergantian PJMK?`,
            icon: "warning",
            buttons: ["Batal", "Ya, Terima"],
            dangerMode: true,
        }).then((willAccept) => {
            if (willAccept) {
                axios
                    .post(
                        `http://localhost:8000/api/terima-tukar/${jadwalId}`,
                        null,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                    .then(() => {
                        swal(
                            "Berhasil!",
                            "Pengajuan PJMK telah diterima.",
                            "success"
                        );
                        setJadwal((prev) =>
                            prev.filter((j) => j.id !== jadwalId)
                        );
                        fetchJadwal();
                    })
                    .catch((err) => {
                        console.error(err);
                        swal(
                            "Gagal",
                            "Terjadi kesalahan saat memproses.",
                            "error"
                        );
                    });
            }
        });
    };

    if (!Array.isArray(jadwal) || jadwal.length === 0) {
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
                    <img
                        src={emptyHuman}
                        alt="Belum ada jadwal kelas"
                        style={{ maxWidth: 200, width: "100%" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        Belum ada jadwal sebagai PJMK.
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
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                minHeight="24px"
                marginTop="-15px"
            >
                {loading ? (
                    <Skeleton variant="text" width={140} height={28} />
                ) : (
                    <Typography
                        sx={{
                            mb: -1,
                            color: "#1976d2",
                            fontWeight: 600,
                            userSelect: "none",
                            fontSize: "16px",
                        }}
                    >
                        📅 Jadwal Sebagai PJMK
                    </Typography>
                )}
                <IconButton
                    size="small"
                    onClick={() => setShowTable((prev) => !prev)}
                    sx={{ color: "#1976d2", mt: loading ? 0 : 2 }}
                    aria-label="Toggle jadwal"
                >
                    {showTable ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            {!showTable && loading && (
                <>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            height={40}
                            sx={{
                                mb: 1.5,
                                borderRadius: 1,
                            }}
                        />
                    ))}
                </>
            )}

            {!showTable && !loading && jadwal.length === 0 && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                >
                    Tidak ada jadwal ditemukan.
                </Typography>
            )}

            {!showTable && !loading && jadwal.length > 0 && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.75rem" }}
                >
                    {jadwal.length} jadwal tersedia sebagai PJMK.
                </Typography>
            )}

            <Collapse in={showTable} timeout="auto" unmountOnExit>
                {loading ? (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <Skeleton
                                key={i}
                                variant="rectangular"
                                height={40}
                                sx={{
                                    mb: 1.5,
                                    borderRadius: 1,
                                }}
                            />
                        ))}
                    </>
                ) : jadwal.length === 0 ? (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Tidak ada jadwal ditemukan.
                    </Typography>
                ) : (
                    <Table
                        size="small"
                        aria-label="mini jadwal table"
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
                            {jadwal.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell sx={{ fontSize: "0.75rem" }}>
                                        {item.hari}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.75rem" }}>
                                        {item.jammulai?.slice(0, 5)} -{" "}
                                        {item.jamselesai?.slice(0, 5)}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.75rem" }}>
                                        {item.matakuliah?.namamatakuliah || "-"}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Klik">
                                            <IconButton
                                                size="small"
                                                onClick={(e) =>
                                                    handleDetailClick(
                                                        e,
                                                        item.id
                                                    )
                                                }
                                                aria-label="detail jadwal"
                                                sx={{
                                                    color: "#1976d2",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "rgba(25, 118, 210, 0.1)",
                                                    },
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

            <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                        width: "fit-content",
                        minWidth: 90,
                        maxWidth: 180,
                        backgroundColor: "#fff",
                        py: 0.5,
                    },
                }}
            >
                {selectedJadwal &&
                    isTombolDialihkanAktif(selectedJadwal) &&
                    selectedJadwal.statuspeminjaman !== "dipinjam" &&
                    selectedJadwal.statuspeminjaman !==
                        "prosespengembalian" && (
                        <MenuItem
                            onClick={async () => {
                                handleCloseMenu();
                                const confirm = await swal({
                                    title: "kelas dialihkan?",
                                    text: "yakin jadwal kelas dialihkan untuk hari ini?.",
                                    icon: "warning",
                                    buttons: ["Batal", "Ya, Dialihkan"],
                                    dangerMode: true,
                                });

                                if (confirm) {
                                    try {
                                        await axios.post(
                                            `http://localhost:8000/api/dialihkan/${selectedJadwal.id}`,
                                            { statusdialihkan: "dialihkan" },
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            }
                                        );

                                        setKelasDialihkanHariIni((prev) => [
                                            ...prev,
                                            selectedJadwal.id,
                                        ]);

                                        swal(
                                            "Berhasil",
                                            "Kelas ditandai sebagai dialihkan.",
                                            "success"
                                        );
                                    } catch (error) {
                                        console.error(error);
                                        swal(
                                            "Gagal",
                                            "Tidak bisa tandai kelas sebagai dialihkan.",
                                            "error"
                                        );
                                    }
                                }
                            }}
                            sx={{
                                fontSize: "0.75rem",
                                px: 1.5,
                                py: 0.75,
                                gap: 1,
                                color: "#fb8c00",
                                "&:hover": {
                                    backgroundColor: "#fff3e0",
                                },
                            }}
                        >
                            🚧 Dialihkan
                        </MenuItem>
                    )}

                {selectedJadwal &&
                    isTombolKelasKosongAktif(selectedJadwal) &&
                    selectedJadwal.statuspeminjaman !== "dipinjam" &&
                    selectedJadwal.statuspeminjaman !==
                        "prosespengembalian" && (
                        <MenuItem
                            onClick={() => {
                                handleCloseMenu();
                                swal({
                                    title: "kelas kosong?",
                                    text: "Yakin jadwal kelas kosong hari ini?.",
                                    icon: "warning",
                                    buttons: ["Batal", "Ya"],
                                    dangerMode: true,
                                }).then(async (willDo) => {
                                    if (willDo) {
                                        try {
                                            await axios.post(
                                                `http://localhost:8000/api/tandai-kelas-kosong/${selectedJadwal.id}`,
                                                {},
                                                {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                }
                                            );
                                            setKelasKosongHariIni((prev) => [
                                                ...prev,
                                                selectedJadwal.id,
                                            ]);
                                            swal(
                                                "Berhasil",
                                                "Kelas ditandai kosong.",
                                                "success"
                                            );
                                        } catch (err) {
                                            swal(
                                                "Gagal",
                                                "Tidak bisa tandai kelas kosong.",
                                                "error"
                                            );
                                        }
                                    }
                                });
                            }}
                            sx={{
                                fontSize: "0.75rem",
                                px: 1.5,
                                py: 0.75,
                                gap: 1,
                                color: "#d32f2f",
                                "&:hover": { backgroundColor: "#ffebee" },
                            }}
                        >
                            🚫 Kelas Kosong
                        </MenuItem>
                    )}
                {selectedJadwal &&
                    !kelasKosongHariIni.includes(selectedJadwal.id) &&
                    !kelasDialihkanHariIni.includes(selectedJadwal.id) &&
                    selectedJadwal.statuspeminjaman !== "dipinjam" &&
                    selectedJadwal.statuspeminjaman !== "prosespengembalian" &&
                    showPinjamButton && (
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
                <MenuItem
                    onClick={handleLihatDetail}
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
                    <VisibilityIcon fontSize="inherit" />
                    Detail
                </MenuItem>
                {selectedJadwal?.status_pengajuan_pjmk === "menunggu" && (
                    <MenuItem
                        onClick={() =>
                            handleTerimaPergantian(
                                selectedJadwal.id,
                                selectedJadwal.pengaju_pjmk
                            )
                        }
                        sx={{
                            fontSize: "0.75rem",
                            color: "green",
                            px: 1.5,
                            py: 0.75,
                            gap: 1,
                            "& svg": { fontSize: "1rem" },
                            "&:hover": {
                                backgroundColor: "#e8f5e9",
                            },
                        }}
                    >
                        <CheckCircleIcon fontSize="inherit" />
                        Terima PJMK
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
    background: isError
        ? "rgba(255, 235, 238, 0.6)"
        : "linear-gradient(to bottom, #ffffff, #f0f4f9)",
    boxShadow: isError
        ? "0 3px 10px rgba(244, 67, 54, 0.3)"
        : "0 8px 24px rgba(0, 0, 0, 0.12)",
    transition: "all 0.3s ease",
    cursor: "default",
    "&:hover": {
        boxShadow: isError
            ? "0 5px 15px rgba(244, 67, 54, 0.4)"
            : "0 12px 28px rgba(0, 0, 0, 0.15)",
        transform: "translateY(-4px)",
    },
});

export default JadwalkelasPJMK;
