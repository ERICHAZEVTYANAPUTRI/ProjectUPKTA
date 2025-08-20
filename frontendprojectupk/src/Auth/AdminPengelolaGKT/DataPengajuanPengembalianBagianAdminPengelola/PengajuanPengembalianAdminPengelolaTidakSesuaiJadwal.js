import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
    Box,
    Button,
    Divider,
    IconButton,
    MenuItem,
    Modal,
    Select as MuiSelect,
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
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsInfoCircle, BsSearch } from "react-icons/bs";
import { FcProcess } from "react-icons/fc";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const styleModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    width: { xs: "90%", md: 600 },
    maxHeight: "90vh",
    overflowY: "auto",
};

const HalamanAdminPengelolaPengembalianTidakSesuaiJadwal = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [pengajuan, setPengajuan] = useState([]);
    const [user, setUser] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [selectedPengajuanId, setSelectedPengajuanId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const navigate = useNavigate();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState("");
    const [selectedPageOption, setSelectedPageOption] = useState(null);
    const [order, setOrder] = useState("asc");
    const location = useLocation();
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleSort = (column) => {
        const isAsc = orderBy === column && order === "asc";
        const newOrder = isAsc ? "desc" : "asc";

        const sorted = [...pengajuan].sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });

        setOrder(newOrder);
        setOrderBy(column);
        setPengajuan(sorted);
    };
    useEffect(() => {
        const current = pageOptions.find(
            (option) => option.value === location.pathname
        );
        setSelectedPageOption(current || null);
    }, [location.pathname]);

    const pageOptions = [
        {
            value: "/persetujuanpengembaliantidaksesuaijadwal",
            label: "Peminjaman Jadwal Kuliah Pengganti",
        },
        {
            value: "/peminjamankegiatanberlangsung",
            label: "Peminjaman Diluar Perkuliah",
        },
    ];
    const handlePageChange1 = (selectedOption) => {
        if (selectedOption) {
            setSelectedPageOption(selectedOption);
            navigate(selectedOption.value);
        } else {
            setSelectedPageOption(null);
        }
    };
    const handlePageChange = (selectedPage) => {
        setCurrentPage(selectedPage.selected);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Token tidak ditemukan.");

                const res = await axios.get("http://localhost:8000/api/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
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
                    "http://localhost:8000/api/peminjamansemua",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
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
            (item.status === "diterima" &&
                item.statuspeminjaman === "dipinjam") ||
            (item.status === "prosespengembalian" &&
                item.statuspeminjaman === "prosespengembalian" &&
                item.statusuploadvidio &&
                item.statusuploadvidio.trim() !== "")
    );

    const handleSearch = (term) => {
        setSearchTerm(term.toLowerCase());
        setCurrentPage(0);
    };

    const filteredPengajuan = diterimaPengajuan.filter((item) => {
        const nama = item.mahasiswa?.nama_lengkap?.toLowerCase() || "";
        const kelas = item.mahasiswa?.kelas?.nama?.toLowerCase() || "";
        const matakuliah = item.matakuliah?.namamatakuliah?.toLowerCase() || "";
        const dosen = item.matakuliah?.dosen?.nama?.toLowerCase() || "";
        const ruangan = item.ruangan?.name?.toLowerCase() || "";

        return (
            nama.includes(searchTerm) ||
            kelas.includes(searchTerm) ||
            matakuliah.includes(searchTerm) ||
            dosen.includes(searchTerm) ||
            ruangan.includes(searchTerm)
        );
    });

    const pageCount = Math.ceil(filteredPengajuan.length / rowsPerPage);
    const sortedPengajuan = [...filteredPengajuan].sort((a, b) => {
        if (
            a.statuspeminjaman === "prosespengembalian" &&
            b.statuspeminjaman !== "prosespengembalian"
        )
            return -1;
        if (
            a.statuspeminjaman !== "prosespengembalian" &&
            b.statuspeminjaman === "prosespengembalian"
        )
            return 1;
        return 0;
    });

    const displayedItems = sortedPengajuan.slice(
        currentPage * rowsPerPage,
        (currentPage + 1) * rowsPerPage
    );

    const handleTolakVideo = async (pengajuanId) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `http://localhost:8000/api/tolakvideoadminpengelola/${pengajuanId}`,
                {
                    status: "diterima",
                    statusuploadvidio: "pending",
                    statuspeminjaman: "dipinjam",
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            swal(
                "Video Ditolak",
                "Mahasiswa Harus Upload Ulang Vidio Yang Sesuai Dengan ketentuan.",
                "info"
            );

            setPengajuan((prev) =>
                prev.map((p) =>
                    p.id === pengajuanId
                        ? {
                              ...p,
                              statusuploadvidio: "pending",
                              statuspeminjaman: "dipinjam",
                              status: "diterima",
                          }
                        : p
                )
            );
            setShowVideoModal(false);
        } catch (error) {
            console.error(error);
            swal("Gagal!", "Terjadi kesalahan saat menolak video.", "error");
        }
    };

    const handleTerimaVideo = async (pengajuanId) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `http://localhost:8000/api/terimavideoadminpengelola/${pengajuanId}`,
                {
                    status: "selesai",
                    statuspeminjaman: "selesai",
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            swal(
                "Berhasil!",
                "Data peminjaman disimpan sebagai selesai dan status jadwal diperbarui.",
                "success"
            );

            setPengajuan((prev) =>
                prev.map((p) =>
                    p.id === pengajuanId
                        ? {
                              ...p,
                              statusuploadvidio: "pending",
                              statuspeminjaman: "dipinjam",
                          }
                        : p
                )
            );
            setShowVideoModal(false);
        } catch (error) {
            console.error(error);
            swal("Gagal!", "Terjadi kesalahan saat menolak video.", "error");
        }
    };
    const handleDetailClick = (id) => {
        navigate(`/pengajuanpeminjamanruangan/detail/${id}`);
    };
    const CustomSortLabel = ({ active, direction, onClick, label }) => (
        <Box
            onClick={onClick}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                justifyContent: "space-between",
                cursor: "pointer",
                color: "#FFFFFF",
                fontWeight: 600,
            }}
        >
            {label}
            <Box sx={{ display: "flex", gap: "0px", ml: 0.5, mr: -1.5 }}>
                <span
                    style={{
                        color:
                            direction === "asc" && active ? "#FFFFFF" : "#aaa",
                    }}
                >
                    ↑
                </span>
                <span
                    style={{
                        color:
                            direction === "desc" && active ? "#FFFFFF" : "#aaa",
                    }}
                >
                    ↓
                </span>
            </Box>
        </Box>
    );

    return (
        <>
            <Navbar />
            <Box sx={{ mb: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        flexWrap: "wrap",
                        mb: 2,
                    }}
                >
                    <Select
                        options={pageOptions}
                        value={selectedPageOption}
                        onChange={handlePageChange1}
                        placeholder="Pilih Halaman"
                        isClearable
                        styles={{
                            container: (base) => ({
                                ...base,
                                fontSize: "0.80rem",
                            }),
                        }}
                    />
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            marginBottom: "-10px",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "13px",
                                color: "#4f4f4f",
                                fontWeight: 500,
                            }}
                            variant="body2"
                        >
                            Show
                        </Typography>
                        <MuiSelect
                            size="small"
                            value={rowsPerPage}
                            onChange={handleChangeRowsPerPage}
                            sx={{
                                fontSize: "12px",
                                height: "25px",
                                width: "60px",
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        maxHeight: 120,
                                        width: "60px",
                                        mt: 0.5,
                                        overflowY: "auto",
                                        scrollbarWidth: "none",
                                        "&::-webkit-scrollbar": {
                                            display: "none",
                                        },
                                    },
                                },
                            }}
                        >
                            {[5, 10, 25].map((value) => (
                                <MenuItem
                                    key={value}
                                    value={value}
                                    sx={{
                                        fontSize: "13px",
                                        py: 0.5,
                                        minHeight: "unset",
                                        justifyContent: "center",
                                        textAlign: "center",
                                    }}
                                >
                                    {value}
                                </MenuItem>
                            ))}
                        </MuiSelect>
                        <Typography
                            sx={{
                                fontSize: "13px",
                                color: "#4f4f4f",
                                fontWeight: 500,
                            }}
                            variant="body2"
                        >
                            entries
                        </Typography>
                    </Box>
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
                            placeholder="Cari..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            sx={{
                                width: "70%",
                                fontSize: "0.75rem",
                                "& input": { fontSize: "0.75rem", py: 0.7 },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <Button
                                        variant="contained"
                                        sx={{
                                            padding: "4.5px 9px",
                                            fontSize: "0.7rem",
                                            ml: 1,
                                            backgroundColor: "#0C20B5",
                                            "&:hover": {
                                                backgroundColor: "#081780",
                                            },
                                        }}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                    >
                                        <BsSearch size={14} />
                                    </Button>
                                ),
                            }}
                        />
                    </Box>
                </Box>
            </Box>

            <TableContainer
                sx={{
                    width: "100%",
                    overflowX: "auto",
                    border: "1px solid #e5e6ed",
                    borderRadius: 1,
                    "&::-webkit-scrollbar": {
                        height: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#c1c1c1",
                        borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "#f1f1f1",
                    },

                    scrollbarWidth: "thin",
                    scrollbarColor: "#c1c1c1 #f1f1f1",
                }}
            >
                <Table
                    aria-label="Tabel Pengajuan Ruangan"
                    sx={{ width: "100%", minWidth: 600, tableLayout: "auto" }}
                >
                    <TableHead sx={{ backgroundColor: "#0C20B5" }}>
                        <TableRow>
                            <TableCell sx={{ ...headStyle, width: "5%" }}>
                                <CustomSortLabel
                                    active={orderBy === "id"}
                                    direction={order}
                                    onClick={() => handleSort("id")}
                                    label="No"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "tanggal"}
                                    direction={order}
                                    onClick={() => handleSort("tanggal")}
                                    label="Tanggal"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "hari"}
                                    direction={order}
                                    onClick={() => handleSort("hari")}
                                    label="Hari"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "jammulai"}
                                    direction={order}
                                    onClick={() => handleSort("jammulai")}
                                    label="Jam"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "mahasiswa_id"}
                                    direction={order}
                                    onClick={() => handleSort("mahasiswa_id")}
                                    label="Kelas"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "mahasiswa_id"}
                                    direction={order}
                                    onClick={() => handleSort("mahasiswa_id")}
                                    label="Mahasiswa"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "kodematakuliah"}
                                    direction={order}
                                    onClick={() => handleSort("kodematakuliah")}
                                    label="Matakuliah"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "dosen_id"}
                                    direction={order}
                                    onClick={() => handleSort("dosen_id")}
                                    label="Dosen"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "ruangan_id"}
                                    direction={order}
                                    onClick={() => handleSort("ruangan_id")}
                                    label="Ruangan"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "keperluan"}
                                    direction={order}
                                    onClick={() => handleSort("keperluan")}
                                    label="Keperluan"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "detail"}
                                    direction={order}
                                    onClick={() => handleSort("detail")}
                                    label="Detail"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "vidio"}
                                    direction={order}
                                    onClick={() => handleSort("vidio")}
                                    label="Vidio"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "statuspeminjaman"}
                                    direction={order}
                                    onClick={() =>
                                        handleSort("statuspeminjaman")
                                    }
                                    label="Status"
                                />
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {displayedItems.map((item, index) => (
                            <TableRow
                                key={item.id}
                                sx={{
                                    backgroundColor:
                                        index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                                }}
                            >
                                <TableCell sx={cellStyle}>
                                    {index + 1 + currentPage * rowsPerPage}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.tanggal || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.hari || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>{`${
                                    item.jammulai || "-"
                                } - ${item.jamselesai || "-"}`}</TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.mahasiswa?.kelas?.nama || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.mahasiswa?.nama_lengkap || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.matakuliah?.namamatakuliah || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.dosen?.nama || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.ruangan?.name || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.keperluan || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <Tooltip
                                        title="Lihat detail penjadwalan"
                                        arrow
                                    >
                                        <Box
                                            onClick={() =>
                                                handleDetailClick(item.id)
                                            }
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                cursor: "pointer",
                                                border: "1.5px solid #0C20B5",
                                                color: "#0C20B5",
                                                fontWeight: 600,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 1,
                                                backgroundColor: "#f0f3ff",
                                                transition: "all 0.3s ease",
                                                "&:hover": {
                                                    backgroundColor: "#0C20B5",
                                                    color: "#fff",
                                                },
                                            }}
                                        >
                                            <BsInfoCircle size={18} />
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <Tooltip
                                        title={
                                            item.statusuploadvidio &&
                                            item.statusuploadvidio.includes(
                                                "/d/"
                                            )
                                                ? "Lihat video unggahan dari Google Drive"
                                                : "Belum ada video yang diunggah"
                                        }
                                        arrow
                                    >
                                        <Box
                                            onClick={() => {
                                                const link =
                                                    item.statusuploadvidio;
                                                if (
                                                    link &&
                                                    link.trim() !== ""
                                                ) {
                                                    const driveId =
                                                        link.includes("/d/")
                                                            ? link
                                                                  .split(
                                                                      "/d/"
                                                                  )[1]
                                                                  ?.split(
                                                                      "/"
                                                                  )[0]
                                                            : null;
                                                    if (driveId) {
                                                        setVideoUrl(
                                                            `https://drive.google.com/file/d/${driveId}/preview`
                                                        );
                                                    } else {
                                                        setVideoUrl(null);
                                                    }
                                                    setSelectedPengajuanId(
                                                        item.id
                                                    );
                                                    setShowVideoModal(true);
                                                }
                                            }}
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                cursor:
                                                    item.statusuploadvidio &&
                                                    item.statusuploadvidio.includes(
                                                        "/d/"
                                                    )
                                                        ? "pointer"
                                                        : "not-allowed",
                                                pointerEvents:
                                                    item.statusuploadvidio &&
                                                    item.statusuploadvidio.includes(
                                                        "/d/"
                                                    )
                                                        ? "auto"
                                                        : "none",
                                                border: "1.5px solid",
                                                borderColor:
                                                    item.statusuploadvidio &&
                                                    item.statusuploadvidio.includes(
                                                        "/d/"
                                                    )
                                                        ? "#0C20B5"
                                                        : "#ccc",
                                                color:
                                                    item.statusuploadvidio &&
                                                    item.statusuploadvidio.includes(
                                                        "/d/"
                                                    )
                                                        ? "#0C20B5"
                                                        : "#999",
                                                fontWeight: 600,
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 1,
                                                backgroundColor:
                                                    item.statusuploadvidio &&
                                                    item.statusuploadvidio.includes(
                                                        "/d/"
                                                    )
                                                        ? "#f0f3ff"
                                                        : "#f9f9f9",
                                                transition: "all 0.3s ease",
                                                "&:hover": {
                                                    backgroundColor:
                                                        item.statusuploadvidio &&
                                                        item.statusuploadvidio.includes(
                                                            "/d/"
                                                        )
                                                            ? "#0C20B5"
                                                            : undefined,
                                                    color:
                                                        item.statusuploadvidio &&
                                                        item.statusuploadvidio.includes(
                                                            "/d/"
                                                        )
                                                            ? "#fff"
                                                            : undefined,
                                                },
                                            }}
                                        >
                                            <FcProcess size={18} />
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <Box
                                        sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            color: "#fff",
                                            display: "inline-block",
                                            backgroundColor:
                                                item.statuspeminjaman ===
                                                "dipinjam"
                                                    ? "#FFA000"
                                                    : item.statuspeminjaman ===
                                                      "prosespengembalian"
                                                    ? "#0288D1"
                                                    : "#9E9E9E",
                                        }}
                                    >
                                        {item.statuspeminjaman === "dipinjam"
                                            ? "Berlangsung"
                                            : item.statuspeminjaman ===
                                              "prosespengembalian"
                                            ? "Proses Pengembalian"
                                            : "-"}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {displayedItems.length === 0 && (
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontSize: "13px",
                                        color: "#4f4f4f",
                                        fontWeight: 500,
                                    }}
                                    colSpan={11}
                                    align="center"
                                >
                                    Tidak ada data.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <StyledPaginateContainer>
                <ReactPaginate
                    previousLabel={<ChevronLeft />}
                    nextLabel={<ChevronRight />}
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                    containerClassName={"pagination"}
                    activeClassName={"active"}
                    pageRangeDisplayed={1}
                    marginPagesDisplayed={1}
                    breakLabel={"..."}
                />
            </StyledPaginateContainer>

            <Modal
                open={showVideoModal}
                onClose={() => setShowVideoModal(false)}
                aria-labelledby="modal-video-title"
                closeAfterTransition
            >
                <Box sx={styleModal}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Typography
                            id="modal-video-title"
                            variant="h6"
                            component="h2"
                        >
                            Video Pengembalian
                        </Typography>
                        <IconButton onClick={() => setShowVideoModal(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {videoUrl ? (
                        <Box
                            sx={{
                                position: "relative",
                                paddingBottom: "56.25%",
                                height: 0,
                                mb: 3,
                            }}
                        >
                            <iframe
                                src={videoUrl}
                                title="Drive Video"
                                frameBorder="0"
                                allowFullScreen
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: 4,
                                }}
                            />
                        </Box>
                    ) : (
                        <Typography
                            sx={{ mb: 3, color: "red", fontWeight: 500 }}
                        >
                            Link Google Drive tidak valid atau tidak bisa
                            ditampilkan. Namun Anda masih bisa menolak video
                            ini.
                        </Typography>
                    )}

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() =>
                                handleTolakVideo(selectedPengajuanId)
                            }
                        >
                            Tolak
                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => {
                                if (selectedPengajuanId)
                                    handleTerimaVideo(selectedPengajuanId);
                            }}
                        >
                            Terima
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};
const StyledPaginateContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(1),
    "& ul": {
        display: "flex",
        listStyle: "none",
        padding: 0,
        gap: 0,
    },
    "& li": {
        border: "1px solid #d0d0d0",
        padding: "6px 12px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        color: "#333",
        transition: "all 0.2s ease",
    },
    "& li:hover": {
        backgroundColor: "#e0e0e0",
    },
    "& li.active": {
        backgroundColor: "#0C20B5",
        color: "#fff",
        fontWeight: 600,
        border: "1px solid #0C20B5",
    },
}));

const headStyle = {
    color: "white",
    fontWeight: "bold",
    paddingTop: 1,
    fontSize: "13px",
    paddingBottom: 1,
    borderRight: "1.5px solid white",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

const cellStyle = {
    borderRight: "1.5px solid #DBDFE1",
    fontSize: "13px",
    color: "#4f4f4f",
    fontWeight: 500,
    paddingTop: "17px",
    paddingBottom: "17px",
    verticalAlign: "top",
};

export default HalamanAdminPengelolaPengembalianTidakSesuaiJadwal;
