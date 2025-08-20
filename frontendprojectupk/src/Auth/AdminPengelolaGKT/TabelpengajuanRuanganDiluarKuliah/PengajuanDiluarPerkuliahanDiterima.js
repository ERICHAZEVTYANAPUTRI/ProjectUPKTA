import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
    Box,
    Button,
    Divider,
    MenuItem,
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
import { MdOutlineCancelScheduleSend } from "react-icons/md";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const TabelPengajuanKegiatanDiterima = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [data, setData] = useState([]);
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
            value: "/PengajuanPinjamDiluarPerkuliahan",
            label: "pengajuan Peminjaman Diluar Perkuliahan",
        },
        {
            value: "/DiterimaPinjamDiluarPerkuliahan",
            label: "Diterima Peminjaman Diluar Perkuliahan",
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
        .filter((item) => item.status === "diterima")
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

    useEffect(() => {
        const autoBatalkan = async () => {
            try {
                const token = localStorage.getItem("token");
                await axios
                    .patch(
                        "http://localhost:8000/api/pengajuan-kegiatan/auto-batal",
                        {},
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    )
                    .then((res) => {
                        if (res.data.data.length > 0) {
                            swal(
                                "Info",
                                `${res.data.data.length} pengajuan kadaluarsa telah dibatalkan otomatis.`,
                                "info"
                            );
                        }
                    });
                console.log(
                    "Pengajuan otomatis dibatalkan jika ada yang expired."
                );
            } catch (error) {
                console.error("Gagal batalkan otomatis:", error);
            }
        };

        autoBatalkan();
    }, []);

    const handleBatalClick = (id) => {
        swal({
            title: "Batalkan Pengajuan?",
            text: "Setelah dibatalkan, status pengajuan tidak bisa dikembalikan.",
            icon: "warning",
            buttons: ["Batal", "Ya, Batalkan"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const token = localStorage.getItem("token");
                    await axios.patch(
                        `http://localhost:8000/api/pengajuan-kegiatan/${id}/batalkan`,
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setData((prevList) =>
                        prevList.filter((item) => item.id !== id)
                    );

                    swal("Berhasil!", "Pengajuan telah dibatalkan.", "success");
                } catch (error) {
                    console.error(error);
                    swal(
                        "Gagal!",
                        "Terjadi kesalahan saat membatalkan pengajuan.",
                        "error"
                    );
                }
            }
        });
    };
    const handleDetailClick = (id) => {
        navigate(`/peminjamandiluarperkuliahan/detail/${id}`);
        handleMenuClose();
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
                    {/* Search */}
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
                                { label: "Batal", key: "batal" },
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
                                            title="Lihat Detail Pengajuan"
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
                                                    padding: "4px 10px",
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
                                            title="Batalkan Terima Pengajuan"
                                            arrow
                                        >
                                            <Box
                                                onClick={() =>
                                                    handleBatalClick(item.id)
                                                }
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    cursor: "pointer",
                                                    border: "1.5px solid #DC3545",
                                                    borderColor: "#DC3545",
                                                    color: "#DC3545",
                                                    fontWeight: 600,
                                                    padding: "4px 10px",
                                                    borderRadius: 1,
                                                    backgroundColor: "#fff0f0",
                                                    transition: "all 0.3s ease",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#DC3545",
                                                        color: "#fff",
                                                    },
                                                }}
                                            >
                                                <MdOutlineCancelScheduleSend
                                                    size={18}
                                                />
                                            </Box>
                                        </Tooltip>
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

export default TabelPengajuanKegiatanDiterima;
