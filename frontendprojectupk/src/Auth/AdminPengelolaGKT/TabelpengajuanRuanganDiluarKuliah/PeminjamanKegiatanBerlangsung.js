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

const PeminjamanKegiatanBerlangsung = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [data, setData] = useState([]);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [selectedPengajuanId, setSelectedPengajuanId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState("");
    const [order, setOrder] = useState("asc");
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedPageOption, setSelectedPageOption] = useState(null);
    const [selectedPageLabel, setSelectedPageLabel] = useState("");
    const getDayName = (tanggal) => {
        const hariIndo = [
            "Minggu",
            "Senin",
            "Selasa",
            "Rabu",
            "Kamis",
            "Jumat",
            "Sabtu",
            "Minggu",
        ];
        const dayIndex = new Date(tanggal).getDay();
        return hariIndo[dayIndex];
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
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8000/api/pengajuan-kegiatan",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                );
                setData(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setCurrentPage(0);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };

    const handleSort = (column) => {
        const isAsc = orderBy === column && order === "asc";
        const newOrder = isAsc ? "desc" : "asc";
        const sorted = [...data].sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });
        setOrder(newOrder);
        setOrderBy(column);
        setData(sorted);
    };

    const filteredData = data
        .filter(
            (item) =>
                item.status === "dipinjam" ||
                item.status === "prosespengembalian"
        )
        .filter((item) => {
            const s = searchTerm.toLowerCase();
            return (
                item.mahasiswa?.nama_lengkap?.toLowerCase().includes(s) ||
                item.ruangan?.name?.toLowerCase().includes(s) ||
                item.tanggal.includes(s) ||
                item.jammulai.includes(s) ||
                item.jamselesai.includes(s) ||
                item.jenis_kegiatan.includes(s) ||
                item.keperluan.includes(s)
            );
        });

    const pageCount = Math.ceil(filteredData.length / rowsPerPage);
    const displayedItems = filteredData.slice(
        currentPage * rowsPerPage,
        (currentPage + 1) * rowsPerPage
    );

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuOpenId(null);
    };

    const handleDetailClick = (id) => {
        navigate(`/peminjamandiluarperkuliahan/detail/${id}`);
        handleMenuClose();
    };
    const handleTolakVideo = async (pengajuanId) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `http://localhost:8000/api/tolakvideokegiatanpengelola/${pengajuanId}`,
                {
                    status: "dipinjam",
                    statusuploadvidio: "pending",
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

            setData((prev) =>
                prev.map((p) =>
                    p.id === pengajuanId
                        ? {
                              ...p,
                              statusuploadvidio: "pending",
                              status: "dipinjam",
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
                `http://localhost:8000/api/terimavideokegiatanpengelola/${pengajuanId}`,
                {
                    status: "selesai",
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

            setData((prev) =>
                prev.map((p) =>
                    p.id === pengajuanId
                        ? {
                              ...p,
                              statusuploadvidio: "pending",
                              status: "selesai",
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
                    border: "1px solid #e5e6ed",
                    borderRadius: 1,
                    "&::-webkit-scrollbar": { height: "4px" },
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
                <Table sx={{ minWidth: 600 }}>
                    <TableHead sx={{ backgroundColor: "#0C20B5" }}>
                        <TableRow>
                            {[
                                { label: "No", key: "id" },
                                { label: "Nama", key: "nama_lengkap" },
                                { label: "Ruangan", key: "nama_ruangan" },
                                { label: "Tanggal", key: "tanggal" },
                                { label: "Hari", key: "hari" },
                                { label: "Jam", key: "jammulai" },
                                { label: "kegiatan", key: "jenis_kegiatan" },
                                { label: "Keterangan", key: "keperluan" },
                                { label: "Detail", key: "detail" },
                                { label: "Vidio", key: "vidio" },
                                { label: "Status", key: "status" },
                            ].map((col, idx) => (
                                <TableCell
                                    key={idx}
                                    sx={{
                                        ...headStyle,
                                        width: idx === 0 ? "5%" : undefined,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => handleSort(col.key)}
                                    >
                                        {col.label}
                                        <Box sx={{ display: "flex", ml: 1 }}>
                                            <span
                                                style={{
                                                    color:
                                                        orderBy === col.key &&
                                                        order === "asc"
                                                            ? "#fff"
                                                            : "#aaa",
                                                }}
                                            >
                                                ↑
                                            </span>
                                            <span
                                                style={{
                                                    color:
                                                        orderBy === col.key &&
                                                        order === "desc"
                                                            ? "#fff"
                                                            : "#aaa",
                                                }}
                                            >
                                                ↓
                                            </span>
                                        </Box>
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedItems.map((item, idx) => {
                            const jenis = (() => {
                                try {
                                    const j = JSON.parse(item.jenis_kegiatan);
                                    return Array.isArray(j)
                                        ? j.join(", ")
                                        : item.jenis_kegiatan;
                                } catch {
                                    return item.jenis_kegiatan;
                                }
                            })();
                            return (
                                <TableRow
                                    key={item.id}
                                    hover
                                    sx={{
                                        backgroundColor:
                                            idx % 2 === 0 ? "#f5f5f5" : "#fff",
                                    }}
                                >
                                    <TableCell sx={cellStyle}>
                                        {currentPage * rowsPerPage + idx + 1}
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        {item.mahasiswa?.nama_lengkap || "-"}
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        {item.ruangan?.name || "-"}
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        {item.tanggal}
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        {getDayName(item.tanggal)}
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        {item.jammulai} - {item.jamselesai}
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        {jenis}
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        {item.keperluan}
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
                                                        backgroundColor:
                                                            "#0C20B5",
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
                                                    item.status === "dipinjam"
                                                        ? "#FFA000"
                                                        : item.status ===
                                                          "prosespengembalian"
                                                        ? "#0288D1"
                                                        : "#9E9E9E",
                                            }}
                                        >
                                            {item.status === "dipinjam"
                                                ? "Berlangsung"
                                                : item.status ===
                                                  "prosespengembalian"
                                                ? "Proses Pengembalian"
                                                : "-"}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {displayedItems.length === 0 && (
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontSize: "13px",
                                        color: "#4f4f4f",
                                        fontWeight: 500,
                                    }}
                                    colSpan={9}
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

export default PeminjamanKegiatanBerlangsung;
