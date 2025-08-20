import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsPencil } from "react-icons/bs";
import swal from "sweetalert";
import emptyHuman from "../../../../src/assets/nojadwal.png";

const getNamaHari = (tanggalString) => {
    const hariIndo = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
    ];
    const date = new Date(tanggalString);
    return hariIndo[date.getDay()];
};

const TabelPeminjamanDiluarJadwal = ({ open }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [linkDrive, setLinkDrive] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        setLoading(true);
        axios
            .get(
                "http://localhost:8000/api/pengajuankegiatanhistorymahasiswa",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((res) => {
                setData(res.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Gagal ambil data", err);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "warning";
            case "diterima":
                return "success";
            case "dipinjam":
                return "info";
            case "prosespengembalian":
                return "secondary";
            case "dibatalkanpengelola":
            case "ditolak":
                return "error";
            default:
                return "default";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "pending":
                return "Menunggu Persetujuan";
            case "diterima":
                return "Telah diterima";
            case "dipinjam":
                return "Sedang Berlangsung";
            case "prosespengembalian":
                return "Proses Pengembalian";
            case "dibatalkanpengelola":
                return "Dibatalkan Pengelola";
            case "ditolak":
                return "Ditolak";
            default:
                return status;
        }
    };

    const handlePinjam = (id) => {
        const token = localStorage.getItem("token");

        const item = data.find((item) => item.id === id);

        if (item.status !== "diterima") {
            swal("Gagal", "Jadwal ini belum diterima.", "error");
            return;
        }

        if (
            item.ruangan?.statusruangan === "dipinjam" ||
            item.ruangan?.statusruangan === "diperbaiki"
        ) {
            swal(
                "Gagal",
                "Ruangan sedang dipinjam atau dalam perbaikan.",
                "error"
            );
            return;
        }

        axios
            .post(
                `http://localhost:8000/api/pinjamjadwalkegiatan/${id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then((res) => {
                swal("Berhasil", "Jadwal berhasil dipinjam.", "success");
                setData((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, status: "dipinjam" } : item
                    )
                );
            })
            .catch((err) => {
                console.error("Gagal pinjam jadwal", err);
                swal("Gagal", "Terjadi kesalahan, coba lagi.", "error");
            });
    };

    const handleBatalPengajuan = (id) => {
        const token = localStorage.getItem("token");
        axios
            .delete(`http://localhost:8000/api/pengajuankegiatan/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setData((prev) => prev.filter((item) => item.id !== id));
                swal("Berhasil!", "Pengajuan berhasil dibatalkan.", "success");
            })
            .catch((err) => {
                console.error("Gagal batal pengajuan", err);
                swal("Gagal!", "Gagal batal pengajuan, coba lagi!", "error");
            });
    };

    const handleUploadLink = () => {
        if (!linkDrive) {
            swal(
                "Peringatan",
                "Link Google Drive tidak boleh kosong.",
                "warning"
            );
            return;
        }

        const token = localStorage.getItem("token");
        axios
            .post(
                `http://localhost:8000/api/kembalikanruangankegiatan/${selectedId}`,
                { link_drive: linkDrive },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            .then(() => {
                swal("Berhasil", "Link berhasil diunggah.", "success");
                setOpenModal(false);
                setLinkDrive("");
                setSelectedId(null);

                setData((prevData) =>
                    prevData.map((item) =>
                        item.id === selectedId
                            ? {
                                  ...item,
                                  status: "prosespengembalian",
                                  statusuploadvidio: linkDrive,
                              }
                            : item
                    )
                );
            })
            .catch((err) => {
                console.error("Gagal upload link", err);
                swal("Gagal", "Terjadi kesalahan, coba lagi.", "error");
            });
    };
    const filteredData = data
        .filter(
            (item) =>
                !["selesai", "dibatalkanpengelola", "ditolak"].includes(
                    item.status
                )
        )
        .sort((a, b) => {
            const statusPriority = {
                prosespengembalian: 1,
                dipinjam: 2,
                diterima: 3,
            };
            const priorityA = statusPriority[a.status] || 999;
            const priorityB = statusPriority[b.status] || 999;
            return priorityA - priorityB;
        });

    return (
        <Paper
            elevation={3}
            sx={{
                width: "100%",
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
            <Typography
                variant="h6"
                sx={{
                    mb: 3,
                    fontWeight: "bold",
                    color: "#1976d2",
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontSize: "1rem",
                }}
            >
                📘 Pengajuan Peminjaman Diluar Perkuliahan
            </Typography>

            {filteredData.length === 0 && !loading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <img
                        src={emptyHuman}
                        alt="Belum ada peminjaman"
                        style={{ width: "150px", marginBottom: "16px" }}
                    />
                    <Typography
                        variant="body1"
                        sx={{ fontSize: "1rem", color: "#757575" }}
                    >
                        Belum ada peminjaman diluar perkuliahan saat ini.
                    </Typography>
                </Box>
            ) : (
                <TableContainer
                    sx={{
                        maxHeight: "70vh",
                        overflow: "auto",
                        borderRadius: 2,
                        backgroundColor: "#ffffff",
                    }}
                >
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead>
                            <TableRow>
                                {[
                                    "Pinjam",
                                    "Tanggal",
                                    "Hari",
                                    "Jam",
                                    "Ruangan",
                                    "Kegiatan",
                                    "Keterangan",
                                    "Status",
                                    "Batal",
                                ].map((headCell) => (
                                    <TableCell
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "0.8rem",
                                            backgroundColor: "#e3f2fd",
                                            color: "#1976d2",
                                            borderBottom: "2px solid #bbdefb",
                                        }}
                                        key={headCell}
                                        align="center"
                                    >
                                        {headCell}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        {loading ? (
                            <TableBody>
                                {[...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(9)].map((_, j) => (
                                            <TableCell
                                                key={j}
                                                align="center"
                                                sx={{ py: 0.9 }}
                                            >
                                                <Skeleton
                                                    variant="text"
                                                    width="100%"
                                                    height={17}
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        ) : (
                            <TableBody sx={{ fontSize: 11, color: "#0d47a1" }}>
                                {data
                                    .filter(
                                        (item) =>
                                            ![
                                                "selesai",
                                                "dibatalkanpengelola",
                                                "ditolak",
                                            ].includes(item.status)
                                    )
                                    .sort((a, b) => {
                                        const statusPriority = {
                                            prosespengembalian: 1,
                                            dipinjam: 2,
                                            diterima: 3,
                                        };

                                        const priorityA =
                                            statusPriority[a.status] || 999;
                                        const priorityB =
                                            statusPriority[b.status] || 999;

                                        return priorityA - priorityB;
                                    })
                                    .map((item) => {
                                        const hari = getNamaHari(item.tanggal);
                                        const jenisKegiatan = JSON.parse(
                                            item.jenis_kegiatan || "[]"
                                        ).join(", ");

                                        return (
                                            <TableRow
                                                key={item.id}
                                                sx={{
                                                    "&:nth-of-type(even)": {
                                                        backgroundColor:
                                                            "#f5faff",
                                                    },
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#f5faff",
                                                        cursor: "pointer",
                                                        transition:
                                                            "background-color 0.3s ease",
                                                    },
                                                    fontSize: 14,
                                                    color: "#0d47a1",
                                                }}
                                            >
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        py: 1.5,
                                                    }}
                                                >
                                                    <Tooltip
                                                        title="Peminjaman Sekarang"
                                                        arrow
                                                    >
                                                        <Box
                                                            onClick={() => {
                                                                if (
                                                                    item.status ===
                                                                    "diterima"
                                                                ) {
                                                                    swal({
                                                                        title: "Yakin ingin meminjam ruangan sekarang?",
                                                                        text: "Pastikan semua data sudah benar.",
                                                                        icon: "warning",
                                                                        buttons:
                                                                            [
                                                                                "Batal",
                                                                                "Ya, Pinjam Sekarang",
                                                                            ],
                                                                        dangerMode: true,
                                                                    }).then(
                                                                        (
                                                                            willPinjam
                                                                        ) => {
                                                                            if (
                                                                                willPinjam
                                                                            ) {
                                                                                handlePinjam(
                                                                                    item.id
                                                                                );
                                                                            }
                                                                        }
                                                                    );
                                                                } else if (
                                                                    item.status ===
                                                                    "dipinjam"
                                                                ) {
                                                                    setSelectedId(
                                                                        item.id
                                                                    );
                                                                    setOpenModal(
                                                                        true
                                                                    );
                                                                } else if (
                                                                    item.status ===
                                                                    "prosespengembalian"
                                                                ) {
                                                                    swal(
                                                                        "Menunggu Persetujuan",
                                                                        "Pengembalian sedang menunggu persetujuan admin pengelola. Jika disetujui, silakan kembalikan kunci ruangan ke admin. Jika ditolak, Anda dapat mengirim ulang video dokumentasi yang sesuai ketentuan.",
                                                                        "info"
                                                                    );
                                                                }
                                                            }}
                                                            sx={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                backgroundColor:
                                                                    item.status ===
                                                                    "diterima"
                                                                        ? "#0C20B5"
                                                                        : item.status ===
                                                                          "dipinjam"
                                                                        ? "#FFB300"
                                                                        : item.status ===
                                                                          "prosespengembalian"
                                                                        ? "#7E57C2"
                                                                        : "#ccc",
                                                                color: "#fff",
                                                                borderRadius:
                                                                    "8px",
                                                                width: "30px",
                                                                height: "30px",
                                                                cursor: [
                                                                    "diterima",
                                                                    "dipinjam",
                                                                    "prosespengembalian",
                                                                ].includes(
                                                                    item.status
                                                                )
                                                                    ? "pointer"
                                                                    : "not-allowed",
                                                                transition:
                                                                    "all 0.3s ease",
                                                                pointerEvents: [
                                                                    "diterima",
                                                                    "dipinjam",
                                                                    "prosespengembalian",
                                                                ].includes(
                                                                    item.status
                                                                )
                                                                    ? "auto"
                                                                    : "none",
                                                                "&:hover": {
                                                                    backgroundColor:
                                                                        item.status ===
                                                                        "diterima"
                                                                            ? "#081780"
                                                                            : item.status ===
                                                                              "dipinjam"
                                                                            ? "#FFA000"
                                                                            : item.status ===
                                                                              "prosespengembalian"
                                                                            ? "#6A1B9A"
                                                                            : "#ccc",
                                                                },
                                                            }}
                                                        >
                                                            <BsPencil
                                                                size={16}
                                                            />
                                                        </Box>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        py: 1.5,
                                                    }}
                                                >
                                                    {item.tanggal}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        py: 1.5,
                                                    }}
                                                >
                                                    {hari}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        py: 1.5,
                                                    }}
                                                >
                                                    {`${item.jammulai} - ${item.jamselesai}`}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        py: 1.5,
                                                    }}
                                                >
                                                    {item.ruangan?.name || "-"}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        maxWidth: 180,
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word",
                                                        fontStyle: "italic",
                                                        fontSize: "0.75rem",
                                                        py: 1.5,
                                                    }}
                                                >
                                                    {jenisKegiatan}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        py: 1.5,
                                                    }}
                                                >
                                                    {item.keperluan}
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        py: 1.5,
                                                    }}
                                                >
                                                    <Chip
                                                        label={getStatusLabel(
                                                            item.status
                                                        )}
                                                        color={getStatusColor(
                                                            item.status
                                                        )}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: "700",
                                                            borderRadius: 2,
                                                            textTransform:
                                                                "uppercase",
                                                            fontSize: 10,
                                                            px: 2,
                                                            py: 0.3,
                                                            boxShadow:
                                                                "0 1px 5px rgb(0 0 0 / 0.1)",
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    align="center"
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        py: 1.5,
                                                    }}
                                                >
                                                    <Tooltip
                                                        title="Batalkan Pengajuan"
                                                        arrow
                                                    >
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => {
                                                                swal({
                                                                    title: "Yakin ingin membatalkan pengajuan ini?",
                                                                    icon: "warning",
                                                                    buttons: [
                                                                        "Batal",
                                                                        "Ya, Batalkan!",
                                                                    ],
                                                                    dangerMode: true,
                                                                }).then(
                                                                    (
                                                                        willDelete
                                                                    ) => {
                                                                        if (
                                                                            willDelete
                                                                        ) {
                                                                            handleBatalPengajuan(
                                                                                item.id
                                                                            );
                                                                        }
                                                                    }
                                                                );
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        )}
                    </Table>
                </TableContainer>
            )}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 2,
                        background:
                            "linear-gradient(to bottom, #ffffff, #f9fbfd)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        color: "#1976d2",
                        pb: 0,
                    }}
                >
                    Upload Video Kegiatan
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{ mb: 1, color: "text.secondary" }}
                    >
                        Masukkan link Google Drive dari video dokumentasi
                        ruangan.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Link Google Drive"
                        variant="outlined"
                        value={linkDrive}
                        onChange={(e) => setLinkDrive(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleUploadLink}
                        variant="contained"
                        color="primary"
                        sx={{
                            background:
                                "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                            color: "#fff",
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            boxShadow: "0 4px 10px rgba(25, 118, 210, 0.3)",
                            "&:hover": {
                                background:
                                    "linear-gradient(135deg, #1565c0 0%, #2196f3 100%)",
                                boxShadow: "0 6px 14px rgba(25, 118, 210, 0.5)",
                            },
                        }}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default TabelPeminjamanDiluarJadwal;
