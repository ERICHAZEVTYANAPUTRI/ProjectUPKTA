import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Modal,
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
import { FcProcess } from "react-icons/fc";
import ReactPaginate from "react-paginate";
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

const HalamanMahasiswaPengembalianTidakSesuaiJadwal = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [pengajuan, setPengajuan] = useState([]);
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedPengajuanId, setSelectedPengajuanId] = useState(null);
    const [driveLink, setDriveLink] = useState("");
    const [selectedPage, setSelectedPage] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

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

    const diterimaPengajuan = pengajuan.filter(
        (item) =>
            item.status === "diterima" &&
            String(item.mahasiswapenanggungjawab) === String(user?.id) &&
            item.statuspeminjaman === "prosespengembalian" &&
            item.statusuploadvidio &&
            item.statusuploadvidio.trim() !== ""
    );

    // Lowercase searchTerm sekali saja
    const lowerSearchTerm = searchTerm.toLowerCase();

    const filteredPengajuan = diterimaPengajuan.filter(
        (item) =>
            item.nama.toLowerCase().includes(lowerSearchTerm) ||
            item.kelas.toLowerCase().includes(lowerSearchTerm) ||
            item.matakuliah.toLowerCase().includes(lowerSearchTerm) ||
            item.dosen.toLowerCase().includes(lowerSearchTerm) ||
            item.namaruangan.toLowerCase().includes(lowerSearchTerm)
    );

    const pageCount = Math.ceil(filteredPengajuan.length / itemsPerPage);
    const displayedItems = filteredPengajuan.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const handlePageChange = (event) => {
        setCurrentPage(event.selected);
    };

    const handleKirimDriveLink = async () => {
        if (!driveLink) {
            swal("Error", "Link Google Drive tidak boleh kosong", "warning");
            return;
        }
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
            setShowPopup(false);
            setDriveLink("");
            setSelectedPengajuanId(null);
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
                                <InputLabel id="select-page-label">
                                    Pilih Halaman
                                </InputLabel>
                                <Select
                                    labelId="select-page-label"
                                    value={selectedPage}
                                    label="Pilih Halaman"
                                    size="small"
                                    onChange={(e) => {
                                        setSelectedPage(e.target.value);
                                        if (e.target.value)
                                            navigate(e.target.value);
                                    }}
                                >
                                    <MenuItem value="">Pilih Halaman</MenuItem>
                                    <MenuItem value="/HalamanMahasiswaPengembalianSesuaiJadwal">
                                        Pengembalian Sesuai Jadwal
                                    </MenuItem>
                                    <MenuItem value="/HalamanMahasiswaPengembalianTidakSesuaiJadwal">
                                        Pengembalian Tidak Sesuai Jadwal
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <Box
                                sx={{
                                    flexGrow: 1,
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    alignItems: "center",
                                    ml: 2,
                                }}
                            >
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Cari..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Button
                                                    variant="contained"
                                                    sx={{
                                                        backgroundColor:
                                                            "#0C20B5",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "#081780",
                                                        },
                                                    }}
                                                    onClick={() =>
                                                        setCurrentPage(0)
                                                    }
                                                >
                                                    <BsSearch />
                                                </Button>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>

                        {displayedItems.length === 0 ? (
                            <Typography align="center" mt={5}>
                                Tidak ada pengajuan ruangan yang diterima.
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
                                                "Nama Mahasiswa",
                                                "Kelas",
                                                "Mata Kuliah",
                                                "Dosen",
                                                "Nama Ruangan",
                                                "Jam",
                                                "Info",
                                            ].map((header, index, arr) => (
                                                <TableCell
                                                    key={header}
                                                    sx={{
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        paddingTop: 1,
                                                        paddingBottom: 1,
                                                        borderRight:
                                                            index !==
                                                            arr.length - 1
                                                                ? "2px solid white"
                                                                : "none",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {header}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {displayedItems.map((item, index) => (
                                            <TableRow
                                                key={item.id}
                                                hover
                                                sx={{
                                                    backgroundColor:
                                                        index % 2 === 0
                                                            ? "#f5f5f5"
                                                            : "#fff",
                                                }}
                                            >
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderRight:
                                                            "2px solid #e5e6ed",
                                                    }}
                                                >
                                                    {index +
                                                        1 +
                                                        currentPage *
                                                            itemsPerPage}
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
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        borderRight:
                                                            "2px solid #e5e6ed",
                                                    }}
                                                >
                                                    <Button
                                                        variant="outlined"
                                                        sx={{
                                                            color: "#4CAF50",
                                                            borderColor:
                                                                "#4CAF50",
                                                            padding: "8px 12px",
                                                            fontSize: "14px",
                                                            borderRadius: 1,
                                                            display: "flex",
                                                            flexDirection:
                                                                "column",
                                                            alignItems:
                                                                "center",
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
                                                                buttons: [
                                                                    "Batal",
                                                                    "OK",
                                                                ],
                                                            }).then(
                                                                (confirmed) => {
                                                                    if (
                                                                        confirmed
                                                                    ) {
                                                                        setSelectedPengajuanId(
                                                                            item.id
                                                                        );
                                                                        setShowPopup(
                                                                            true
                                                                        );
                                                                    }
                                                                }
                                                            );
                                                        }}
                                                    >
                                                        <FcProcess
                                                            style={{
                                                                fontSize:
                                                                    "24px",
                                                            }}
                                                        />
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "14px",
                                                                textAlign:
                                                                    "center",
                                                                lineHeight: 1.2,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    marginBottom:
                                                                        "3px",
                                                                }}
                                                            >
                                                                Proses
                                                            </div>
                                                            <div>
                                                                Pengembalian
                                                            </div>
                                                        </div>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                        {pageCount > 1 && (
                            <Box
                                sx={{
                                    mt: 2,
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <ReactPaginate
                                    breakLabel="..."
                                    nextLabel="›"
                                    onPageChange={handlePageChange}
                                    pageRangeDisplayed={3}
                                    pageCount={pageCount}
                                    previousLabel="‹"
                                    containerClassName="pagination"
                                    activeClassName="active"
                                    pageClassName="page-item"
                                    pageLinkClassName="page-link"
                                    previousClassName="page-item"
                                    previousLinkClassName="page-link"
                                    nextClassName="page-item"
                                    nextLinkClassName="page-link"
                                    breakClassName="page-item"
                                    breakLinkClassName="page-link"
                                    forcePage={currentPage}
                                />
                            </Box>
                        )}

                        <Modal
                            open={showPopup}
                            onClose={() => setShowPopup(false)}
                        >
                            <Box sx={styleModal}>
                                <Typography variant="h6" mb={2}>
                                    Upload Link Google Drive
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={driveLink}
                                    onChange={(e) =>
                                        setDriveLink(e.target.value)
                                    }
                                    required
                                />
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        mt: 3,
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowPopup(false)}
                                        sx={{ mr: 2 }}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleKirimDriveLink}
                                    >
                                        Kirim
                                    </Button>
                                </Box>
                            </Box>
                        </Modal>
                    </CardContent>
                </Card>
            </Box>

            <style>{`
        .pagination {
          display: flex;
          list-style: none;
          padding: 0;
          gap: 0.5rem;
          user-select: none;
        }
        .page-item {
          border: 1px solid #0C20B5;
          border-radius: 4px;
          cursor: pointer;
        }
        .page-link {
          padding: 0.5rem 0.75rem;
          color: #0C20B5;
          text-decoration: none;
          display: block;
        }
        .page-item:hover:not(.active) {
          background-color: #0C20B5;
        }
        .page-item:hover:not(.active) .page-link {
          color: white;
        }
        .active {
          background-color: #0C20B5;
          color: white !important;
          pointer-events: none;
        }
      `}</style>
        </div>
    );
};

export default HalamanMahasiswaPengembalianTidakSesuaiJadwal;
