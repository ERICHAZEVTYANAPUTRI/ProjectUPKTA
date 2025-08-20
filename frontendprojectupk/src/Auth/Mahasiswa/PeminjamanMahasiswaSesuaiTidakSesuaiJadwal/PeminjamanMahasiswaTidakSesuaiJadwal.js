import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputAdornment,
    MenuItem,
    Select,
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
import { MdOutlineScheduleSend } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const RuanganTerpinjamHalamanMahasiswa = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [pengajuan, setPengajuan] = useState([]);
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedPengajuanId, setSelectedPengajuanId] = useState(null);
    const [driveLink, setDriveLink] = useState("");
    const [pageSelection, setPageSelection] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Token tidak ditemukan.");

                const res = await axios.get("http://localhost:8000/api/user", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(res.data);
            } catch (err) {
                console.error("Gagal mengambil data user:", err);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchPengajuan = async () => {
            if (!user) return;

            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    "http://localhost:8000/api/peminjamansaya",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setPengajuan(response.data);
            } catch (error) {
                console.error("Gagal mengambil data peminjaman:", error);
            }
        };

        fetchPengajuan();
    }, [user]);

    const handleSubmitDriveLink = async () => {
        if (!driveLink.includes("drive.google.com")) {
            alert("Link harus berupa tautan Google Drive.");
            return;
        }

        if (window.confirm("Apakah Anda yakin ingin mengirim link ini?")) {
            try {
                await axios.post(
                    `http://localhost:8000/api/pengembalian/${selectedPengajuanId}`,
                    {
                        link_drive: driveLink,
                    }
                );

                setPengajuan((prev) =>
                    prev.filter((item) => item.id !== selectedPengajuanId)
                );
                alert("Link berhasil dikirim!");
                setShowPopup(false);
                setDriveLink("");
                setSelectedPengajuanId(null);
            } catch (error) {
                console.error("Gagal mengirim link:", error);
                alert("Gagal mengirim link.");
            }
        }
    };
    const mapPengajuan = pengajuan.map((item) => ({
        ...item,
        nama: item.mahasiswa?.nama_lengkap || "Tidak Diketahui",
        kelas: item.mahasiswa?.kelas || "-",
        matakuliah: item.matakuliah?.namamatakuliah || "-",
        dosen: item.matakuliah?.dosen?.nama || "-",
        namaruangan: item.ruangan?.name || "-",
        jam: `${item.jammulai} - ${item.jamselesai}`,
    }));

    const diterimaPengajuan = mapPengajuan.filter(
        (item) =>
            item.status === "diterima" &&
            String(item.mahasiswa_id) === String(user?.id) &&
            !(
                item.statuspeminjaman === "prosespengembalian" &&
                item.statusuploadvidio?.trim() !== ""
            )
    );

    const filteredPengajuan = diterimaPengajuan.filter((item) =>
        [item.nama, item.kelas, item.matakuliah, item.dosen, item.namaruangan]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-container-jurusan">
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
                            <FormControl sx={{ minWidth: 180 }}>
                                <Select
                                    size="small"
                                    displayEmpty
                                    value={pageSelection}
                                    onChange={(e) => {
                                        setPageSelection(e.target.value);
                                        if (e.target.value)
                                            navigate(e.target.value);
                                    }}
                                    sx={{ fontSize: 14, height: "40px" }}
                                    renderValue={(selected) => {
                                        if (!selected) return "Pilih Halaman";
                                        const map = {
                                            "/HalamanMahasiswaSesuaiJadwal":
                                                "Sesuai Jadwal",
                                            "/HalamanMahasiswaPeminjamanRuangan":
                                                "Tidak Sesuai Jadwal",
                                        };
                                        return map[selected] || selected;
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Pilih Halaman</em>
                                    </MenuItem>
                                    <MenuItem value="/HalamanMahasiswaSesuaiJadwal">
                                        Sesuai Jadwal
                                    </MenuItem>
                                    <MenuItem value="/HalamanMahasiswaPeminjamanRuangan">
                                        Tidak Sesuai Jadwal
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                size="small"
                                placeholder="Cari..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ width: "665px", height: "40px" }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    backgroundColor: "#0C20B5",

                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#081780",
                                                    },
                                                }}
                                            >
                                                <BsSearch />
                                            </Button>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* Popup Upload Link */}
                        {showPopup && (
                            <Box
                                sx={{
                                    position: "fixed",
                                    inset: 0,
                                    bgcolor: "rgba(0, 0, 0, 0.3)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    zIndex: 1300,
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: "background.paper",
                                        borderRadius: 2,
                                        p: 3,
                                        width: 400,
                                        boxShadow: 24,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 2,
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        Silahkan Upload Video Ruangan Berupa
                                        Link Google Drive!!
                                    </Typography>
                                    <TextField
                                        type="url"
                                        placeholder="https://drive.google.com/..."
                                        value={driveLink}
                                        onChange={(e) =>
                                            setDriveLink(e.target.value)
                                        }
                                        fullWidth
                                        required
                                    />
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: 1,
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={() => setShowPopup(false)}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmitDriveLink}
                                            disabled={!driveLink.trim()}
                                        >
                                            Kirim
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        {/* Table */}
                        <TableContainer
                            sx={{
                                maxWidth: 900,
                                mx: "auto",
                                border: "1px solid #e5e6ed",
                                borderRadius: 1,
                            }}
                        >
                            <Table aria-label="Data Ruangan Terpinjam">
                                <TableHead sx={{ backgroundColor: "#3449e4" }}>
                                    <TableRow>
                                        {[
                                            "No",
                                            "Nama",
                                            "Kelas",
                                            "Mata Kuliah",
                                            "Dosen",
                                            "Ruangan",
                                            "Jam",
                                            "Kembalikan",
                                        ].map((head, idx) => (
                                            <TableCell
                                                key={idx}
                                                sx={{
                                                    backgroundColor: "#3449e4",
                                                    color: "white",
                                                    fontWeight: "bold",
                                                    borderRight:
                                                        idx !== 7
                                                            ? "2px solid white"
                                                            : "none",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {head}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPengajuan.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                align="center"
                                                sx={{ py: 3 }}
                                            >
                                                Tidak ada pengajuan ruangan yang
                                                diterima.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPengajuan.map((item, index) => (
                                            <TableRow
                                                key={item.id}
                                                hover
                                                sx={{
                                                    backgroundColor:
                                                        index % 2 === 0
                                                            ? "#f5f5f5"
                                                            : "#fff",
                                                    borderBottom:
                                                        "1px solid #ccc",
                                                }}
                                            >
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderRight:
                                                            "2px solid #e5e6ed",
                                                    }}
                                                >
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderRight:
                                                            "2px solid #e5e6ed",
                                                    }}
                                                >
                                                    {item.nama}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderRight:
                                                            "2px solid #e5e6ed",
                                                    }}
                                                >
                                                    {item.kelas}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderRight:
                                                            "2px solid #e5e6ed",
                                                    }}
                                                >
                                                    {item.matakuliah}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderRight:
                                                            "2px solid #e5e6ed",
                                                    }}
                                                >
                                                    {item.dosen}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderRight:
                                                            "2px solid #e5e6ed",
                                                    }}
                                                >
                                                    {item.namaruangan}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderRight:
                                                            "2px solid #e5e6ed",
                                                    }}
                                                >
                                                    {item.jam}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => {
                                                            setSelectedPengajuanId(
                                                                item.id
                                                            );
                                                            setShowPopup(true);
                                                        }}
                                                        sx={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            gap: 0.5,
                                                            py: "6px",
                                                            px: "10px",
                                                            mt: 1,
                                                            mb: 1,
                                                            border: "1.5px solid #d32f2f",
                                                            color: "#d32f2f",
                                                            fontWeight: 600,
                                                            backgroundColor:
                                                                "#fdecea",
                                                            "&:hover": {
                                                                backgroundColor:
                                                                    "#d32f2f",
                                                                color: "#fff",
                                                            },
                                                        }}
                                                        startIcon={
                                                            <MdOutlineScheduleSend
                                                                style={{
                                                                    fontSize: 20,
                                                                }}
                                                            />
                                                        }
                                                    >
                                                        Kembalikan
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Box>
        </div>
    );
};

export default RuanganTerpinjamHalamanMahasiswa;
