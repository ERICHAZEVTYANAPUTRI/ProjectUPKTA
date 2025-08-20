import {
    Box,
    Button,
    Card,
    CardContent,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const daysMap = {
    Minggu: 0,
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
};

const shouldShowJadwal = (hari, jamMulai) => {
    const now = new Date();
    const dayNumber = daysMap[hari];
    if (dayNumber === undefined) return false;

    const todayDay = now.getDay();
    let daysUntilJadwal = dayNumber - todayDay;
    if (daysUntilJadwal < 0) daysUntilJadwal += 7;

    const [hour, minute] = jamMulai.split(":").map(Number);

    const jadwalDate = new Date(now);
    jadwalDate.setHours(0, 0, 0, 0);
    jadwalDate.setDate(jadwalDate.getDate() + daysUntilJadwal);
    jadwalDate.setHours(hour, minute, 0, 0);

    const showFrom = new Date(jadwalDate.getTime() - 24 * 60 * 60 * 1000);
    const hideAfter = new Date(jadwalDate.getTime() + 12 * 60 * 60 * 1000);

    return now >= showFrom && now <= hideAfter;
};

const JadwalMahasiswa = () => {
    const [user, setUser] = useState(null);
    const [jadwalMahasiswa, setJadwalMahasiswa] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndJadwal = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Token tidak ditemukan.");

                const userRes = await axios.get(
                    "http://localhost:8000/api/user",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const loggedInUser = userRes.data;
                setUser(loggedInUser);

                const jadwalRes = await axios.get(
                    "http://localhost:8000/api/penjadwalanruanganganmahasiswa"
                );
                const semuaJadwal = jadwalRes.data;

                const jadwalSaya = semuaJadwal.filter(
                    (j) => j.mahasiswa_id === loggedInUser.id
                );
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

    const handlePinjam = (jadwal) => {
        if (jadwal.statuspeminjaman === "terpinjam") {
            swal("Info", "Jadwal ini sedang berlangsung!", "info");
            return;
        }

        swal({
            title: "Yakin ingin meminjam jadwal ini?",
            text: `${jadwal.matakuliah?.namamatakuliah || ""} pada hari ${
                jadwal.hari
            } jam ${jadwal.jammulai}`,
            icon: "warning",
            buttons: ["Batal", "Ya, Pinjam"],
            dangerMode: true,
        }).then(async (willPinjam) => {
            if (willPinjam) {
                try {
                    const token = localStorage.getItem("token");
                    await axios.put(
                        `http://localhost:8000/api/pinjamjadwal/${jadwal.id}`,
                        { statuspeminjaman: "terpinjam" },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    swal("Berhasil!", "Jadwal berhasil dipinjam.", "success");

                    setJadwalMahasiswa((prev) =>
                        prev.map((j) =>
                            j.id === jadwal.id
                                ? { ...j, statuspeminjaman: "terpinjam" }
                                : j
                        )
                    );
                } catch (error) {
                    console.error(error);
                    swal(
                        "Gagal!",
                        "Terjadi kesalahan saat meminjam jadwal.",
                        "error"
                    );
                }
            }
        });
    };

    const jadwalFiltered = jadwalMahasiswa
        .filter((item) => item.statusjadwal !== "tidakaktif")
        .filter((item) => shouldShowJadwal(item.hari, item.jammulai))
        .filter((item) => {
            const search = searchTerm.toLowerCase();
            return (
                item.hari?.toLowerCase().includes(search) ||
                `${item.jammulai} - ${item.jamselesai}`
                    .toLowerCase()
                    .includes(search) ||
                item.ruangan?.name.toLowerCase().includes(search) ||
                item.matakuliah?.namamatakuliah
                    .toLowerCase()
                    .includes(search) ||
                item.dosen?.nama.toLowerCase().includes(search)
            );
        });

    return (
        <div className="dashboard-container">
            <Navbar />
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
                                mb: 2,
                                display: "flex",
                                justifyContent: "flex-end",
                            }}
                        >
                            <TextField
                                size="small"
                                placeholder="Cari jadwal..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ width: 500 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment
                                            position="end"
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                alignItems: "center",
                                                paddingRight: 0,
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => {}}
                                                sx={{
                                                    bgcolor: "#0C20B5",
                                                    "&:hover": {
                                                        bgcolor: "#0931a7",
                                                    },
                                                    textTransform: "none",
                                                    minWidth: "60px",
                                                    height: "30px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    padding: "6px",
                                                }}
                                            >
                                                <BsSearch />
                                            </Button>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {jadwalFiltered.length === 0 ? (
                            <Typography align="center" mt={4}>
                                Belum ada jadwal tersedia.
                            </Typography>
                        ) : (
                            <TableContainer
                                sx={{
                                    border: "1px solid #e5e6ed",
                                    borderRadius: 1,
                                }}
                            >
                                <Table>
                                    <TableHead
                                        sx={{ backgroundColor: "#3449e4" }}
                                    >
                                        <TableRow>
                                            {[
                                                "No",
                                                "Hari",
                                                "Jam",
                                                "Ruangan",
                                                "Mata Kuliah",
                                                "Dosen",
                                                "Aksi",
                                                "Pinjam",
                                            ].map((head, i, arr) => (
                                                <TableCell
                                                    key={head}
                                                    align="center"
                                                    sx={{
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        borderRight:
                                                            i !== arr.length - 1
                                                                ? "2px solid white"
                                                                : "none",
                                                    }}
                                                >
                                                    {head}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {jadwalFiltered.map((item, index) => (
                                            <TableRow key={item.id} hover>
                                                <TableCell align="center">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.hari}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.jammulai} -{" "}
                                                    {item.jamselesai}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.ruangan?.name || "-"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.matakuliah
                                                        ?.namamatakuliah || "-"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {item.dosen?.nama || "-"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() =>
                                                            handleDetail(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        Detail
                                                    </Button>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                        onClick={() =>
                                                            handlePinjam(item)
                                                        }
                                                        disabled={
                                                            item.statuspeminjaman ===
                                                            "terpinjam"
                                                        }
                                                    >
                                                        {item.statuspeminjaman ===
                                                        "terpinjam"
                                                            ? "Terpinjam"
                                                            : "Pinjam"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </div>
    );
};

export default JadwalMahasiswa;
