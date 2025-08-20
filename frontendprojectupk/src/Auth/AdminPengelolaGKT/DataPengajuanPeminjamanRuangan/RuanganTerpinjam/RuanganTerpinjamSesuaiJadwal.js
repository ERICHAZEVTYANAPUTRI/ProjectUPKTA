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
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import Navbar from "../../../../Components/Navbar/Navbar";

const RuanganTerpinjamSesuaiJadwal = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;
    const [showModal, setShowModal] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [gedungList, setGedungList] = useState([]);
    const [selectedGedungId, setSelectedGedungId] = useState("");
    const [ruanganPilihan, setRuanganPilihan] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState("");
    const [order, setOrder] = useState("asc");
    const location = useLocation();
    const [selectedPageOption, setSelectedPageOption] = useState(null);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        const current = pageOptions.find(
            (option) => option.value === location.pathname
        );
        setSelectedPageOption(current || null);
    }, [location.pathname]);
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
    const pageOptions = [
        { value: "/sesuaijadwal", label: "Jadwal Dipinjam" },
        { value: "/RuanganTerpinjam", label: "Peminjaman Diluar Jadwal" },
    ];
    const handlePageChange1 = (selectedOption) => {
        if (selectedOption) {
            setSelectedPageOption(selectedOption);
            navigate(selectedOption.value);
        } else {
            setSelectedPageOption(null);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8000/api/ruanganterpinjampengelolagkt"
                );
                const filteredData = res.data.filter(
                    (item) => item.statuspeminjaman === "dipinjam"
                );
                setData(filteredData);
            } catch (error) {
                console.error("Gagal mengambil data penjadwalan:", error);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleOpenModal = async (itemId) => {
        setSelectedItemId(itemId);
        setShowModal(true);
        setSelectedGedungId("");
        setRuanganPilihan([]);
        try {
            const response = await axios.get(
                "http://localhost:8000/api/gedungs"
            );
            setGedungList(response.data);
        } catch (error) {
            console.error("Gagal mengambil daftar gedung:", error);
        }
    };

    const handleGedungChange = async (e) => {
        const id = e.target.value;
        setSelectedGedungId(id);
        try {
            const response = await axios.get(
                `http://localhost:8000/api/ruangan/${id}`
            );
            setRuanganPilihan(response.data);
        } catch (error) {
            console.error("Gagal mengambil ruangan:", error);
        }
    };

    const handleSimpanRuangan = async (ruanganName) => {
        try {
            await axios.put(
                `http://localhost:8000/api/penjadwalanruanganganjiladminpengelola/updateruangan/${selectedItemId}`,
                {
                    namaruangan: ruanganName,
                }
            );

            setData((prev) =>
                prev.map((item) =>
                    item.id === selectedItemId
                        ? { ...item, namaruangan: ruanganName }
                        : item
                )
            );

            setShowModal(false);
            setSelectedGedungId("");
            setRuanganPilihan([]);
        } catch (error) {
            console.error("Gagal menyimpan ruangan:", error);
        }
    };

    const handleDetailClick = (id) => {
        navigate(`/penjadwalanRuangan/detail/${id}`);
    };

    const filteredData = data.filter((item) => {
        const search = searchTerm.toLowerCase();
        return (
            item.mahasiswa?.nama_lengkap.toLowerCase().includes(search) ||
            item.matakuliah?.namamatakuliah.toLowerCase().includes(search) ||
            item.matakuliah?.dosen?.nama.toLowerCase().includes(search) ||
            item.hari.toLowerCase().includes(search) ||
            item.jammulai.toLowerCase().includes(search) ||
            item.jamselesai.toLowerCase().includes(search) ||
            item.namaruangan?.toLowerCase().includes(search)
        );
    });

    const displayedItems = filteredData.slice(
        currentPage * rowsPerPage,
        (currentPage + 1) * rowsPerPage
    );

    const pageCount = Math.ceil(filteredData.length / rowsPerPage);

    const handlePageChange = (selectedPage) => {
        setCurrentPage(selectedPage.selected);
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
                                minWidth: 120,
                                maxWidth: "100%",
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
                    aria-label="Tabel Mahasiswa"
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
                                    label="Penanggungjawab"
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
                                    active={orderBy === "jurusan_id"}
                                    direction={order}
                                    onClick={() => handleSort("jurusan_id")}
                                    label="Jurusan"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "prodi_id"}
                                    direction={order}
                                    onClick={() => handleSort("prodi_id")}
                                    label="Prodi"
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
                                    active={orderBy === "detail"}
                                    direction={order}
                                    onClick={() => handleSort("detail")}
                                    label="Detail"
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
                                    {item.hari || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>{`${
                                    item.jammulai || "-"
                                } - ${item.jamselesai || "-"}`}</TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.kelas?.nama || "-"}
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
                                    {item.mahasiswa?.jurusan?.namajurusan ||
                                        "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.prodi?.namaprodi || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.ruangan?.name || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 1,
                                            justifyContent: "center",
                                        }}
                                    >
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
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredData.length === 0 && (
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

export default RuanganTerpinjamSesuaiJadwal;
