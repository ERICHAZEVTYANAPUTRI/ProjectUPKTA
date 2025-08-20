import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import {
    Box,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
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

const SemuaJadwalKelasMahasiswa = ({ open }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const namaKelas = data[0]?.kelas?.nama ?? "";

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    "http://localhost:8000/api/jadwal-kelas-mahasiswa",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const hariOrder = [
                    "Senin",
                    "Selasa",
                    "Rabu",
                    "Kamis",
                    "Jumat",
                    "Sabtu",
                    "Minggu",
                ];
                const sortedData = res.data.sort((a, b) => {
                    const indexA = hariOrder.indexOf(capitalize(a.hari));
                    const indexB = hariOrder.indexOf(capitalize(b.hari));

                    if (indexA !== indexB) {
                        return indexA - indexB;
                    } else {
                        return (a.jammulai || "").localeCompare(
                            b.jammulai || ""
                        );
                    }
                });

                setData(sortedData);
            } catch (err) {
                console.error("Gagal mengambil data:", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        const capitalize = (str) =>
            str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        if (token) fetchData();
    }, [token]);

    const handleAjukanTukar = async (jadwalId) => {
        try {
            await axios.post(
                `http://localhost:8000/api/ajukan-tukar/${jadwalId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            swal(
                "Berhasil",
                "Permintaan tukar PJMK telah diajukan.",
                "success"
            );
        } catch (err) {
            console.error(err);
            swal("Gagal", "Gagal mengajukan tukar PJMK.", "error");
        }
    };

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
                📘 Jadwal Kuliah - {namaKelas}
            </Typography>
            {data.length === 0 && !loading ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                    <img
                        src={emptyHuman}
                        alt="Belum ada jadwal"
                        style={{ width: "150px", marginBottom: "16px" }}
                    />
                    <Typography
                        variant="body1"
                        sx={{ fontSize: "1rem", color: "#757575" }}
                    >
                        Tidak ada jadwal kuliah ditemukan.
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
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {[
                                    "Hari",
                                    "Jam",
                                    "Matakuliah",
                                    "Kelas",
                                    "Dosen",
                                    "Ruangan",
                                    "Detail",
                                    "Tukar",
                                    "Status",
                                ].map((head, i) => (
                                    <TableCell
                                        key={i}
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "0.8rem",
                                            backgroundColor: "#e3f2fd",
                                            color: "#1976d2",
                                            borderBottom: "2px solid #bbdefb",
                                        }}
                                    >
                                        {head}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [...Array(5)].map((_, idx) => (
                                    <TableRow key={idx}>
                                        {[...Array(9)].map((__, colIdx) => (
                                            <TableCell key={colIdx}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontSize: "0.75rem" }}
                                                >
                                                    <Skeleton />
                                                </Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        align="center"
                                        sx={{
                                            py: 6,
                                            color: "#999",
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Tidak ada data jadwal ditemukan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item, index) => (
                                    <TableRow
                                        key={item.id}
                                        hover
                                        onClick={() =>
                                            navigate(
                                                `/penjadwalanRuangan/detail/${item.id}`
                                            )
                                        }
                                        sx={{
                                            transition: "all 0.2s ease-in-out",
                                            "&:hover": {
                                                backgroundColor: "#f1f8ff",
                                                cursor: "pointer",
                                            },
                                        }}
                                    >
                                        <TableCell
                                            sx={{
                                                fontSize: "0.75rem",
                                                py: 1.5,
                                            }}
                                        >
                                            {item.hari}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "0.75rem",
                                                py: 1.5,
                                                fontFamily: "monospace",
                                            }}
                                        >
                                            {item.jammulai?.slice(0, 5)} -{" "}
                                            {item.jamselesai?.slice(0, 5)}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "0.75rem",
                                                py: 1.5,
                                            }}
                                        >
                                            <Tooltip
                                                title={item.kodematakuliah}
                                            >
                                                <span>
                                                    {
                                                        item.matakuliah
                                                            ?.namamatakuliah
                                                    }
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "0.75rem",
                                                py: 1.5,
                                            }}
                                        >
                                            {item.kelas?.nama}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "0.75rem",
                                                py: 1.5,
                                            }}
                                        >
                                            {item.dosen?.nama}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontSize: "0.75rem",
                                                py: 1.5,
                                            }}
                                        >
                                            {item.ruangan?.name ?? "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                onClick={() =>
                                                    navigate(
                                                        `/penjadwalanRuangan/detail/${item.id}`
                                                    )
                                                }
                                                sx={{
                                                    cursor: "pointer",
                                                    color: "#1976d2",
                                                    fontWeight: "bold",
                                                    "&:hover": {
                                                        textDecoration:
                                                            "underline",
                                                    },
                                                    fontSize: "0.75rem",
                                                }}
                                            >
                                                Lihat Detail
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    const namaPJMK =
                                                        item.mahasiswa
                                                            ?.nama_lengkap ||
                                                        "Tidak diketahui";
                                                    const nimPJMK =
                                                        item.mahasiswa?.nim ||
                                                        "-";

                                                    swal({
                                                        title: "Ajukan Tukar PJMK?",
                                                        text: `Matakuliah: ${
                                                            item.matakuliah
                                                                ?.namamatakuliah
                                                        }\nHari: ${
                                                            item.hari
                                                        }\nJam: ${item.jammulai?.slice(
                                                            0,
                                                            5
                                                        )} - ${item.jamselesai?.slice(
                                                            0,
                                                            5
                                                        )}\n\nPJMK saat ini:\n${namaPJMK} (${nimPJMK})\n\nAjukan pergantian PJMK?`,
                                                        icon: "info",
                                                        buttons: [
                                                            "Batal",
                                                            "Ya, Ajukan",
                                                        ],
                                                    }).then(
                                                        async (willSubmit) => {
                                                            if (willSubmit) {
                                                                try {
                                                                    await axios.post(
                                                                        `http://localhost:8000/api/ajukan-tukar/${item.id}`,
                                                                        {},
                                                                        {
                                                                            headers:
                                                                                {
                                                                                    Authorization: `Bearer ${token}`,
                                                                                },
                                                                        }
                                                                    );
                                                                    swal(
                                                                        "Berhasil",
                                                                        "Permintaan tukar PJMK telah diajukan.",
                                                                        "success"
                                                                    );
                                                                } catch (err) {
                                                                    console.error(
                                                                        err
                                                                    );
                                                                    const code =
                                                                        err
                                                                            .response
                                                                            ?.status;
                                                                    const pesan =
                                                                        err
                                                                            .response
                                                                            ?.data
                                                                            ?.message ||
                                                                        (code ===
                                                                        403
                                                                            ? "Akses ditolak."
                                                                            : code ===
                                                                              409
                                                                            ? "Permintaan sudah diajukan."
                                                                            : "Terjadi kesalahan.");
                                                                    swal(
                                                                        "Gagal",
                                                                        pesan,
                                                                        "error"
                                                                    );
                                                                }
                                                            }
                                                        }
                                                    );
                                                }}
                                                sx={{
                                                    color: "#fff",
                                                    backgroundColor: "#fbc02d",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#f9a825",
                                                    },
                                                    borderRadius: 2,
                                                    p: 0.8,
                                                    boxShadow:
                                                        "0 2px 6px rgba(0, 0, 0, 0.15)",
                                                }}
                                            >
                                                <SwapHorizIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    px: 1,
                                                    py: 0.5,
                                                    backgroundColor:
                                                        item.statuspeminjaman ===
                                                        "dipinjam"
                                                            ? "#43a047"
                                                            : item.statuspeminjaman ===
                                                              "prosespengembalian"
                                                            ? "#5c6bc0"
                                                            : "#ffa000",
                                                    color: "#fff",
                                                    borderRadius: 1,
                                                    fontSize: "0.7rem",
                                                    fontWeight: 500,
                                                    display: "inline-block",
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {item.statuspeminjaman}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default SemuaJadwalKelasMahasiswa;
