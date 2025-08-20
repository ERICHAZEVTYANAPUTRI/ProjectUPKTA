import {
    HomeRounded,
    LogoutRounded,
    PersonOutlineRounded,
} from "@mui/icons-material";
import {
    AppBar,
    Avatar,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingManual from "../LazyLoading/LoadingManual";
import MapDotsBackground from "../Sidebar/SidebarOpen";

const BASE_URL = "http://localhost:8000";

const getUserData = async (token) => {
    const response = await fetch(`${BASE_URL}/api/user`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user data");
    }

    const data = await response.json();
    return data;
};

const getPhotoUrl = (user) => {
    if (!user || !user.foto) return null;
    return `${BASE_URL}/storage/${user.foto.replace(/\\/g, "/")}`;
};

const getInitials = (name) => {
    const nameArray = name.trim().split(" ");
    return nameArray.length > 1
        ? nameArray[0][0].toUpperCase() + nameArray[1][0].toUpperCase()
        : nameArray[0][0].toUpperCase();
};

const Navbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [namaGedung, setNamaGedung] = useState("");
    const profileButtonRef = useRef(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const extractGedungIdFromPath = (pathname) => {
        const match = pathname.match(
            /\/(?:ruangan|ruanganmahasiswa\/lihat)\/(\d+)/
        );
        return match ? match[1] : null;
    };

    useEffect(() => {
        const gedungId = extractGedungIdFromPath(location.pathname);

        if (gedungId) {
            fetch(`${BASE_URL}/api/gedungs/${gedungId}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("Data gedung:", data);
                    setNamaGedung(data.name || "");
                })
                .catch((error) =>
                    console.error("Gagal mengambil data gedung:", error)
                );
        }
    }, [location.pathname]);

    const open = Boolean(anchorEl);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            const storedUser = localStorage.getItem("user");

            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                getUserData(token)
                    .then((userData) => {
                        setUser(userData);
                        localStorage.setItem("user", JSON.stringify(userData));
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }
    }, []);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleClose();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) throw new Error("No token found");

            const response = await fetch(`${BASE_URL}/api/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error("Logout failed");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setLoading(false);
        }
    };
    const photoUrl = getPhotoUrl(user);

    const getPageTitle = () => {
        const path = location.pathname;

        if (
            path.startsWith("/ruangan/") ||
            path.startsWith("/ruanganmahasiswa/lihat/")
        ) {
            return namaGedung
                ? `RUANGAN DI GEDUNG ${namaGedung.toUpperCase()}`
                : "MEMUAT DATA GEDUNG...";
        }

        if (path.startsWith("/penjadwalanRuangan/edit/")) {
            return "EDIT JADWAL";
        }
        if (path.startsWith("/pengajuanpeminjamanruangan/detail/")) {
            return "DETAIL PEMINJAMAN RUANGAN KULIAH PENGGANTI";
        }
        if (path.startsWith("/peminjamandiluarperkuliahan/detail/")) {
            return "DETAIL PEMINJAMAN RUANGAN DILUAR PERKULIAHAN";
        }

        if (path.startsWith("/penjadwalanRuangan/detail/")) {
            return "DETAIL PENJADWALAN RUANGAN PERKULIAHAN";
        }

        if (path.startsWith("/penjadwalanRuanganHistory/detail/")) {
            return "DETAIL HISTORY PEMINJAMAN PENJADWALAN RUANGAN PERKULIAHAN";
        }

        switch (path) {
            case "/TabelMahasiswa":
                return "DATA MAHASISWA";
            case "/pengembalianselesaimahasiswa":
                return "RIWAYAT PEMINJAMAN RUANGAN JADWAL KULIAH PENGGANTI";
            case "/peminjamanselesaidiluarperkuliahan":
                return "RIWAYAT PEMINJAMAN RUANGAN DILUAR PERKULIAHAN";
            case "/DashboardMahasiswa":
                return "DASHBOARD MAHASISWA";
            case "/penjadwalanRuanganPerkuliahan":
                return "DATA JADWAL RUANGAN";
            case "/TabelPengelelolaGKT":
                return "DATA PENGELOLA GKT";
            case "/TabelAdminJurusan":
                return "DATA ADMIN JURUSAN";
            case "/PenjadwalanAdminPengelola":
                return "PENJADWALAN RUANGAN - SEMESTER GANJIL";
            case "/RuanganTerpinjam":
                return " RUANGAN TERPINJAM TIDAK SESUAI JADWAL";
            case "/persetujuanpengembaliantidaksesuaijadwal":
                return " PEMINJAMAN JADWAL KULIAH PENGGANTI SEDANG BERLANGSUNG";
            case "/peminjamankegiatanberlangsung":
                return " PEMINJAMAN DILUAR PERKULIAHAN SEDANG BERLANGSUNG";
            case "/persetujuanpengembaliansesuaijadwal":
                return " PEMINJAMAN JADWAL PERKULIAHAN SEDANG BERLANGSUNG";
            case "/datadosen":
                return " DATA DOSEN";
            case "/peminjamanselesaitidaksesuaijadwaladminpengelola":
                return " PEMINJAMAN SELESAI JADWAL KULIAH PENGGANTI";
            case "/historypeminjamankegiatan":
                return " PEMINJAMAN SELESAI DILUAR PERKULIAHAN";
            case "/matakuliah":
                return " DATA MATAKULIAH";
            case "/PenjadwalanRuanganPengelola":
                return " PENGAJUAN JADWAL PERKULIAHAN";
            case "/kurikulum":
                return " DATA KURIKULUM";
            case "/tahunajaran":
                return " DATA TAHUN AJARAN";
            case "/HalamanMahasiswaPeminjamanRuangan":
                return " PEMINJAMAN RUANGAN TIDAK SESUAI JADWAL";
            case "/HalamanMahasiswaPengembalianSesuaiJadwal":
                return " PENGAJUAN PEMBEMBALIAN RUANGAN SESUAI JADWAL";
            case "/HalamanMahasiswaPengembalianTidakSesuaiJadwal":
                return " PENGAJUAN PEMBEMBALIAN RUANGAN TIDAK SESUAI JADWAL";
            case "/peminjamanselesaisesuaijadwalbaianmahasiswa":
                return " RIWAYAT PEMINJAMAN RUANGAN SESUAI JADWAL";
            case "/mahasiswa/jadwal":
                return " JADWAL KULIAH HARI INI";
            case "/DataGedung":
                return " DATA GEDUNG";
            case "/pengajuanpeminjamanditerima":
                return " PENGAJUAN PEMINJAMAN RUANGAN DITERIMA JADWAL KULIAH PENGGANTI";
            case "/PengajuanPeminjamanRuangan":
                return " PENGAJUAN PEMINJAMAN RUANGAN JADWAL KULIAH PENGGANTI";
            case "/PengajuanPinjamDiluarPerkuliahan":
                return " PENGAJUAN PEMINJAMAN RUANGAN DILUAR PERKULIAHAN";
            case "/DiterimaPinjamDiluarPerkuliahan":
                return " PENGAJUAN PEMINJAMAN RUANGAN DITERIMA DILUAR PERKULIAHAN";
            case "/Prodi":
                return " DATA PRODI";
            case "/Prodi":
                return " DATA PRODI";
            case "/kelasmahasiswa":
                return " DATA KELAS";
            case "/MahasiswaGedung":
                return " GEDUNG PERKULIAHAN";
            case "/JenisKelas":
                return "JENIS KELAS";
            case "/ModelKelas":
                return "MODEL KELAS";
            case "/SaranaKelas":
                return "SARANA KELAS";
            case "/tambahjadwalpersemester":
                return " TAMBAH JADWAL";
            case "/sesuaijadwal":
                return " RUANGAN TERPINJAM SESUAI JADWAL";
            case "/peminjamanselesaiadminpengelolasemuadata":
                return " PEMINJAMAN SELESAI SESUAI JADWAL";
            case "/penjadwalanRuangan/edit/:id":
                return " EDIT JADWAL";
            case "/ProfileUser":
                return "PROFIL USER";
            case "/DashboardAdminPengelola":
                return " DASHBOARD PENGELOLA";
            case "/DashboardAdminJurusan":
                return " DASHBOARD ADMIN JURUSAN";
            default:
                return "";
        }
    };

    const pageTitle = getPageTitle();

    return (
        <>
            {loading && <LoadingManual />}{" "}
            <AppBar
                position="fixed"
                sx={{
                    left: 0,
                    width: "100vw",
                    height: "64px",
                    zIndex: (theme) => theme.zIndex.drawer - 1,
                    backgroundColor: "#1976d2",
                    boxShadow: 3,
                    borderRadius: 0,
                }}
            >
                <MapDotsBackground height={64} />{" "}
                <Toolbar sx={{ minHeight: "64px !important" }}>
                    <Box sx={{ flexGrow: 1 }} />
                    {user && (
                        <Box>
                            <IconButton
                                ref={profileButtonRef}
                                onClick={handleMenu}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    bgcolor: "rgba(255, 255, 255, 0.15)",
                                    px: 0,
                                    py: 0.3,
                                    borderRadius: 16,
                                    boxShadow:
                                        "0 0 6px rgba(255, 255, 255, 0.12)",
                                    backdropFilter: "blur(4px)",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    transition: "all 0.2s ease-in-out",
                                    height: 45,
                                    "&:hover": {
                                        boxShadow:
                                            "0 0 10px rgba(255,255,255,0.3)",
                                        bgcolor: "rgba(255,255,255,0.2)",
                                        cursor: "pointer",
                                    },
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#fff",
                                        fontWeight: 600,
                                        fontSize: "0.92rem",
                                        fontFamily: "Inter, sans-serif",
                                        whiteSpace: "nowrap",
                                        pl: 2,
                                        pr: 1,
                                    }}
                                >
                                    {user.nama_lengkap}
                                </Typography>

                                <Avatar
                                    alt={user.nama_lengkap}
                                    src={photoUrl}
                                    sx={{
                                        border: "2px solid #fff",
                                        width: 36,
                                        height: 36,
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                    }}
                                >
                                    {!photoUrl &&
                                        getInitials(user.nama_lengkap)}
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                PaperProps={{
                                    elevation: 6,
                                    sx: {
                                        mt: 1.2,
                                        minWidth: 200,
                                        borderRadius: 2,
                                        px: 1,
                                        py: 1,
                                        bgcolor: "#ffffff",
                                        boxShadow:
                                            "0 8px 20px rgba(0, 0, 0, 0.05)",
                                        fontFamily: "Inter, sans-serif",
                                        "& .MuiMenuItem-root": {
                                            borderRadius: 1.5,
                                            fontSize: "0.95rem",
                                            fontWeight: 500,
                                            py: 1.2,
                                            px: 2,
                                            color: "#333",
                                            transition: "all 0.2s",
                                            "&:hover": {
                                                bgcolor: "#e3f2fd",
                                                color: "#1976d2",
                                            },
                                        },
                                    },
                                }}
                            >
                                <MenuItem
                                    component={Link}
                                    to="/ProfileUser"
                                    onClick={handleClose}
                                >
                                    <PersonOutlineRounded
                                        sx={{
                                            mr: 1.5,
                                            fontSize: "1.3rem",
                                            color: "#1976d2",
                                        }}
                                    />
                                    Profil Saya
                                </MenuItem>

                                <MenuItem
                                    component={Link}
                                    to="/Beranda"
                                    onClick={handleClose}
                                >
                                    <HomeRounded
                                        sx={{
                                            mr: 1.5,
                                            fontSize: "1.3rem",
                                            color: "#43a047",
                                        }}
                                    />
                                    Beranda
                                </MenuItem>

                                <Box
                                    sx={{
                                        borderTop: "1px solid #e0e0e0",
                                        my: 1,
                                    }}
                                />

                                <MenuItem onClick={handleLogout}>
                                    <LogoutRounded
                                        sx={{
                                            mr: 1.5,
                                            fontSize: "1.3rem",
                                            color: "#e53935",
                                        }}
                                    />
                                    Keluar
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <AppBar
                position="fixed"
                sx={{
                    left: 0,
                    top: "64px",
                    width: "100vw",
                    height: "64px",
                    backgroundColor: "#052d89",
                    boxShadow: "none",
                    zIndex: (theme) => theme.zIndex.drawer - 2,
                    pointerEvents: "none",
                }}
            >
                <Toolbar
                    sx={{
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        px: 2,
                    }}
                />
                <Typography
                    variant="body1"
                    sx={{
                        color: "#fff",
                        fontWeight: "bold",
                        textAlign: "start",
                        position: "relative",
                        top: "-40px",
                        marginLeft: "280px",
                    }}
                >
                    {pageTitle}
                </Typography>
            </AppBar>
        </>
    );
};

export default Navbar;
