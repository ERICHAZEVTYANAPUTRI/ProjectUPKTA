import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    Divider,
    Grid,
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
import { BsPencil, BsSearch, BsTrash } from "react-icons/bs";
import { HiOutlineUserAdd } from "react-icons/hi";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const DataDosen = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [dosenList, setDosenList] = useState([]);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState("");
    const [order, setOrder] = useState("asc");
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSort = (column) => {
        const isAsc = orderBy === column && order === "asc";
        const newOrder = isAsc ? "desc" : "asc";

        const sorted = [...dosenList].sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });

        setOrder(newOrder);
        setOrderBy(column);
        setDosenList(sorted);
    };

    useEffect(() => {
        const fetchDosen = async () => {
            try {
                const token = localStorage.getItem("token");

                const userResponse = await axios.get(
                    "http://localhost:8000/api/user",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const userData = userResponse.data;
                setUser(userData);

                const dosenResponse = await axios.get(
                    "http://localhost:8000/api/dosen",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const filtered = dosenResponse.data.filter(
                    (d) => d.adminjurusan?.kodejurusan === userData.kodejurusan
                );

                setDosenList(filtered);
            } catch (error) {
                console.error("Gagal mengambil data:", error);
            }
        };
        fetchDosen();
    }, []);

    const filteredData = dosenList.filter((d) => {
        const term = searchTerm.toLowerCase();

        return (
            d.nama?.toLowerCase().includes(term) ||
            d.prodi?.namaprodi?.toLowerCase().includes(term) ||
            d.nip?.toLowerCase().includes(term) ||
            d.notelpon?.toLowerCase().includes(term) ||
            d.email?.toLowerCase().includes(term) ||
            d.jabatanfungsional?.toLowerCase().includes(term)
        );
    });

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };
    const handleUpdate = (d) => {
        openEditModal(d);
    };

    const pageCount = Math.ceil(filteredData.length / rowsPerPage);
    const displayedItems = filteredData.slice(
        currentPage * rowsPerPage,
        (currentPage + 1) * rowsPerPage
    );

    const handlePageChange = (selectedPage) => {
        setCurrentPage(selectedPage.selected);
    };

    const openTambahModal = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const openEditModal = (d) => {
        setEditData(d);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };
    const handleSaveDosen = async (data, id = null) => {
        try {
            const token = localStorage.getItem("token");

            if (id) {
                await axios.put(`http://localhost:8000/api/dosen/${id}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                swal("Berhasil!", "Data dosen berhasil diperbarui.", "success");
            } else {
                data.kodejurusan = user.kodejurusan;
                data.id_jurusan = user.id_jurusan;
                data.adminjurusan_id = user.id;

                await axios.post(`http://localhost:8000/api/dosen`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                swal(
                    "Berhasil!",
                    "Data dosen berhasil ditambahkan.",
                    "success"
                );
            }

            const dosenResponse = await axios.get(
                "http://localhost:8000/api/dosen",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const filtered = dosenResponse.data.filter(
                (d) => d.adminjurusan?.kodejurusan === user.kodejurusan
            );
            setDosenList(filtered);
            closeModal();
        } catch (error) {
            console.error("Gagal menyimpan data dosen:", error);
            const message =
                error.response?.data?.message ||
                "Terjadi kesalahan saat menyimpan data.";
            swal("Gagal!", message, "error");
        }
    };
    const handleDelete = async (id) => {
        swal({
            title: "Yakin ingin menghapus?",
            text: "Data Dosen yang dihapus tidak bisa dikembalikan!",
            icon: "warning",
            buttons: ["Batal", "Hapus"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const token = localStorage.getItem("token");

                    await axios.delete(
                        `http://localhost:8000/api/dosen/${id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    setDosenList((prevDosen) =>
                        prevDosen.filter((d) => d.id !== id)
                    );
                    swal(
                        "Terhapus!",
                        "Data dosen berhasil dihapus.",
                        "success"
                    );
                } catch (error) {
                    console.error("Gagal menghapus dosen:", error);
                    const message =
                        error.response?.data?.message ||
                        "Terjadi kesalahan saat menghapus data.";
                    swal("Gagal!", message, "error");
                }
            }
        });
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
            <ModalDosen
                open={modalOpen}
                handleClose={closeModal}
                onSave={handleSaveDosen}
                initialData={editData}
            />
            <Navbar />
            <Box sx={{ mb: 2 }}>
                <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}
                >
                    <Button
                        variant="contained"
                        onClick={openTambahModal}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            height: "35px",
                            fontSize: "0.9rem !important",
                            fontWeight: 500,
                            px: 1.5,
                            borderRadius: "4px",
                            textTransform: "none",
                            background:
                                "linear-gradient(135deg, #2e7d32, #1b5e20)",
                            color: "#fff",
                            boxShadow: "0 4px 10px rgba(34, 139, 34, 0.3)",
                            backdropFilter: "blur(4px)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                background:
                                    "linear-gradient(135deg, #1b5e20, #145a32)",
                                boxShadow: "0 6px 14px rgba(21, 101, 42, 0.5)",
                                transform: "translateY(-2px)",
                            },
                            "&:active": {
                                transform: "scale(0.97)",
                                boxShadow: "0 2px 6px rgba(21, 101, 42, 0.4)",
                            },
                        }}
                    >
                        <HiOutlineUserAdd style={{ fontSize: "18px" }} />
                        Tambah Dosen
                    </Button>
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
                                        onClick={() => handleSearch(searchTerm)}
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
                    aria-label="Data Dosen"
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
                                    active={orderBy === "nama"}
                                    direction={order}
                                    onClick={() => handleSort("nama")}
                                    label="Nama"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "nip"}
                                    direction={order}
                                    onClick={() => handleSort("nip")}
                                    label="Nip / Nik / Nippppk"
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
                                    active={orderBy === "notelpon"}
                                    direction={order}
                                    onClick={() => handleSort("notelpon")}
                                    label="No.Telpon"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "email"}
                                    direction={order}
                                    onClick={() => handleSort("email")}
                                    label="Email"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "jabatanfungsional"}
                                    direction={order}
                                    onClick={() =>
                                        handleSort("jabatanfungsional")
                                    }
                                    label="Jabatan"
                                />
                            </TableCell>
                            <TableCell sx={{ ...headStyle, width: "15%" }}>
                                <CustomSortLabel
                                    active={orderBy === "aksi"}
                                    direction={order}
                                    onClick={() => handleSort("aksi")}
                                    label="Aksi"
                                />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedItems.map((d, index) => (
                            <TableRow
                                key={d.id}
                                hover
                                sx={{
                                    backgroundColor:
                                        index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                                }}
                            >
                                <TableCell sx={cellStyle}>
                                    {index + 1 + currentPage * rowsPerPage}
                                </TableCell>
                                <TableCell sx={cellStyle}>{d.nama}</TableCell>
                                <TableCell sx={cellStyle}>{d.nip}</TableCell>
                                <TableCell sx={cellStyle}>
                                    {d.prodi?.namaprodi || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {d.notelpon}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {d.email || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {d.jabatanfungsional}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 1,
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Tooltip title="Edit data" arrow>
                                            <Box
                                                onClick={() => handleUpdate(d)}
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    cursor: "pointer",
                                                    border: "1.5px solid #FFA500",
                                                    color: "#FFA500",
                                                    fontWeight: 600,
                                                    padding: "2px 6px",
                                                    borderRadius: 1,
                                                    backgroundColor: "#fffaf0",
                                                    fontSize: "12px",
                                                    transition: "all 0.3s ease",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#FFA500",
                                                        color: "#fff",
                                                    },
                                                }}
                                            >
                                                <BsPencil size={18} />
                                            </Box>
                                        </Tooltip>
                                        <Tooltip title="Hapus data" arrow>
                                            <Box
                                                onClick={() =>
                                                    handleDelete(d.id)
                                                }
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    cursor: "pointer",
                                                    border: "1.5px solid #DC3545",
                                                    color: "#DC3545",
                                                    fontWeight: 600,
                                                    padding: "2px 6px",
                                                    borderRadius: 1,
                                                    backgroundColor: "#fff0f0",
                                                    fontSize: "12px",
                                                    transition: "all 0.3s ease",
                                                    "&:hover": {
                                                        backgroundColor:
                                                            "#DC3545",
                                                        color: "#fff",
                                                    },
                                                }}
                                            >
                                                <BsTrash size={18} />
                                            </Box>
                                        </Tooltip>
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
                                    colSpan={8}
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

const ModalDosen = ({ open, handleClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        nama: "",
        nip: "",
        notelpon: "",
        email: "",
        jabatanfungsional: "",
        prodi_id: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                nama: initialData.nama,
                nip: initialData.nip,
                notelpon: initialData.notelpon,
                email: initialData.email,
                jabatanfungsional: initialData.nama,
                prodi_id: initialData.prodi_id,
            });
        } else {
            setFormData({
                nama: "",
                prodi_id: "",
                nip: "",
                notelpon: "",
                email: "",
                jabatanfungsional: "",
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = () => {
        onSave(formData, initialData?.id);
    };
    const [authUser, setAuthUser] = useState(null);
    const [prodiOptions, setProdiOptions] = useState([]);
    useEffect(() => {
        axios
            .get("http://localhost:8000/api/user", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((res) => {
                setAuthUser(res.data);
            })
            .catch((err) => {
                console.error("Gagal ambil user login", err);
            });
    }, []);

    useEffect(() => {
        axios
            .get("http://localhost:8000/api/prodi")
            .then((res) => {
                setProdiOptions(res.data);
            })
            .catch((err) => {
                console.error("Gagal ambil data prodi", err);
            });
    }, []);
    const [groupedProdiOptions, setGroupedProdiOptions] = useState([]);

    useEffect(() => {
        if (!authUser || prodiOptions.length === 0) return;

        const grouped = [];

        const prodiSaya = prodiOptions.filter(
            (item) => item.adminjurusan_id === authUser.adminjurusan_id
        );
        if (prodiSaya.length > 0) {
            grouped.push({
                label: "Prodi Anda",
                options: prodiSaya.map((item) => ({
                    value: item.id,
                    label: item.namaprodi,
                })),
            });
        }

        const prodiLain = prodiOptions.filter(
            (item) => item.adminjurusan_id !== authUser.adminjurusan_id
        );

        const jurusanMap = {};

        prodiLain.forEach((item) => {
            const jurusanName = item.adminjurusan?.jurusan || "Jurusan Lain";
            if (!jurusanMap[jurusanName]) {
                jurusanMap[jurusanName] = [];
            }
            jurusanMap[jurusanName].push({
                value: item.id,
                label: item.namaprodi,
            });
        });

        Object.entries(jurusanMap).forEach(([jurusanName, options]) => {
            grouped.push({
                label: `Prodi dari Jurusan ${jurusanName}`,
                options,
            });
        });

        setGroupedProdiOptions(grouped);
    }, [authUser, prodiOptions]);

    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 450,
                    bgcolor: "#f9f9f9",
                    borderRadius: 2,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    p: 0,
                }}
            >
                <Typography
                    sx={{
                        textAlign: "left",
                        padding: "24px",
                        marginBottom: "-30px",
                        fontWeight: "bold",
                        fontSize: "20px",
                        color: "#3449e4",
                    }}
                >
                    {initialData ? "Edit Dosen" : "Tambah Dosen"}
                </Typography>

                <Grid
                    item
                    xs={12}
                    sx={{
                        position: "relative",
                        marginTop: "20px",
                        marginBottom: "18px",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "5%",
                            right: "5%",
                            borderBottom: "1px solid rgb(134, 133, 133)",
                            transform: "translateY(-50%)",
                        }}
                    />
                </Grid>

                <DialogContent
                    autoComplete="off"
                    sx={{
                        padding: "24px",
                        pt: 0,
                        backgroundColor: "#f9f9f9",
                        maxHeight: "300px",
                        overflowY: "auto",
                        "&::-webkit-scrollbar": { display: "none" },
                        scrollbarWidth: "none",
                    }}
                >
                    <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
                        <Typography
                            variant="body2"
                            sx={{ marginBottom: "-10px", color: "#333" }}
                        >
                            Nama Dosen
                        </Typography>
                        <TextField
                            fullWidth
                            name="nama"
                            value={formData.nama}
                            onChange={handleChange}
                            margin="normal"
                            placeholder="Masukkan Nama Dosen..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "45px",
                                borderRadius: 3,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    textAlign: "left",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "45px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 3,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
                        <Typography
                            variant="body2"
                            sx={{ marginBottom: "-10px", color: "#333" }}
                        >
                            NIP /NIK / NIPPPPK
                        </Typography>
                        <TextField
                            fullWidth
                            name="nip"
                            value={formData.nip}
                            onChange={handleChange}
                            margin="normal"
                            placeholder="Masukkan NIP / NIK / NIPPPPK..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "45px",
                                borderRadius: 3,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    textAlign: "left",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "45px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 3,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ marginBottom: "15px" }}>
                        <Typography
                            variant="body2"
                            sx={{ marginBottom: "6px", color: "#333" }}
                        >
                            Nama Prodi
                        </Typography>
                        <Select
                            name="prodi_id"
                            options={groupedProdiOptions}
                            value={groupedProdiOptions
                                .flatMap((group) => group.options)
                                .find((opt) => opt.value === formData.prodi_id)}
                            onChange={(selectedOption) =>
                                setFormData({
                                    ...formData,
                                    prodi_id: selectedOption?.value || "",
                                })
                            }
                            placeholder="Pilih Prodi..."
                            isClearable
                            styles={customSelectStyles}
                            menuPortalTarget={document.body}
                        />
                    </Box>
                    <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
                        <Typography
                            variant="body2"
                            sx={{ marginBottom: "-10px", color: "#333" }}
                        >
                            Nomor Telepon
                        </Typography>
                        <TextField
                            fullWidth
                            name="notelpon"
                            value={formData.notelpon}
                            onChange={handleChange}
                            margin="normal"
                            placeholder="Masukkan Nomor Telepon..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "45px",
                                borderRadius: 3,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    textAlign: "left",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "45px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 3,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
                        <Typography
                            variant="body2"
                            sx={{ marginBottom: "-10px", color: "#333" }}
                        >
                            Email
                        </Typography>
                        <TextField
                            fullWidth
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            placeholder="Masukkan Email..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "45px",
                                borderRadius: 3,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    textAlign: "left",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "45px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 3,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
                        <Typography
                            variant="body2"
                            sx={{ marginBottom: "-10px", color: "#333" }}
                        >
                            Jabatan Fungsional
                        </Typography>
                        <TextField
                            fullWidth
                            name="jabatanfungsional"
                            value={formData.jabatanfungsional}
                            onChange={handleChange}
                            margin="normal"
                            placeholder="Masukkan Jabatan Fungsional..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "45px",
                                borderRadius: 3,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    textAlign: "left",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "45px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 3,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 3,
                                    },
                                },
                            }}
                        />
                    </Box>
                </DialogContent>
                <Grid
                    item
                    xs={12}
                    sx={{
                        position: "relative",
                        marginTop: "-0px",
                        marginBottom: "-5px",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: "10%",
                            left: "5%",
                            right: "5%",
                            borderBottom: "1px solid rgb(134, 133, 133)",
                            transform: "translateY(-50%)",
                        }}
                    />
                </Grid>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        backgroundColor: "#f5f5f5",
                        borderRadius: "0 0 8px 8px",
                        justifyContent: "flex-end",
                        gap: 1.5,
                    }}
                >
                    <Tooltip title="Batal" arrow>
                        <Box
                            onClick={handleClose}
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                cursor: "pointer",
                                border: "1.5px solid #dc3545",
                                color: "#dc3545",
                                fontWeight: 600,
                                padding: "6px 14px",
                                borderRadius: 1,
                                backgroundColor: "#fdecea",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    backgroundColor: "#dc3545",
                                    color: "#fff",
                                },
                            }}
                        >
                            Batal
                            <CancelIcon fontSize="small" />
                        </Box>
                    </Tooltip>

                    <Tooltip title="Simpan Data Prodi" arrow>
                        <Box
                            onClick={handleSubmit}
                            component="button"
                            type="submit"
                            sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 0.5,
                                marginBottom: "-1px",
                                cursor: "pointer",
                                border: "1.5px solid #198754",
                                color: "#198754",
                                fontWeight: 600,
                                padding: "6px 14px",
                                borderRadius: 1,
                                backgroundColor: "#e9f7ef",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    backgroundColor: "#198754",
                                    color: "#fff",
                                },
                            }}
                        >
                            Simpan
                            <SaveIcon fontSize="small" />
                        </Box>
                    </Tooltip>
                </DialogActions>
            </Box>
        </Modal>
    );
};
const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        height: 45,
        borderRadius: 8,
        backgroundColor: "#fff",
        boxShadow: state.isFocused
            ? "0 0 0 2px rgba(12, 32, 181, 0.1)"
            : "0 2px 5px rgba(0, 0, 0, 0.1)",
        borderColor: state.isFocused ? "#0C20B5" : "#ccc",
        "&:hover": {
            borderColor: "#0C20B5",
        },
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),
    singleValue: (base) => ({
        ...base,
        textAlign: "start",
    }),
    placeholder: (base) => ({
        ...base,
        textAlign: "start",
    }),
};

export default DataDosen;
