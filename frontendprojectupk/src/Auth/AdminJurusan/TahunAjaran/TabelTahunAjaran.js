import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    Divider,
    Grid,
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
import { BsCalendar2Date, BsPencil, BsSearch, BsTrash } from "react-icons/bs";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const DataTahunAjaran = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [tahunAjaranList, setTahunAjaranList] = useState([]);
    const [user, setUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState("");
    const [order, setOrder] = useState("asc");
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleToggleStatus = async (ta) => {
        const token = localStorage.getItem("token");
        const newStatus = !ta.is_aktif;

        try {
            await axios.put(
                `http://localhost:8000/api/tahunajaran/${ta.id}/toggle-status`,
                {
                    is_aktif: newStatus,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setTahunAjaranList((prev) =>
                prev.map((item) =>
                    item.id === ta.id ? { ...item, is_aktif: newStatus } : item
                )
            );
        } catch (error) {
            console.error("Gagal mengubah status:", error);
            swal("Gagal!", "Terjadi kesalahan saat mengubah status.", "error");
        }
    };

    const handleSort = (column) => {
        const isAsc = orderBy === column && order === "asc";
        const newOrder = isAsc ? "desc" : "asc";

        const sorted = [...tahunAjaranList].sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });

        setOrder(newOrder);
        setOrderBy(column);
        setTahunAjaranList(sorted);
    };

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndTahunAjaran = async () => {
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

                const tahunajaranResponse = await axios.get(
                    "http://localhost:8000/api/tahunajaran",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const filtered = tahunajaranResponse.data.filter(
                    (ta) =>
                        ta.adminjurusan?.kodejurusan === userData.kodejurusan
                );

                setTahunAjaranList(filtered);
            } catch (error) {
                console.error("Gagal mengambil data:", error);
            }
        };
        fetchUserAndTahunAjaran();
    }, []);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };
    const handleUpdate = (ta) => {
        openEditModal(ta);
    };
    const filteredData = tahunAjaranList.filter(
        (ta) =>
            (ta.tahun || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ta.semester || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (ta.adminjurusan?.nama_lengkap || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

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

    const openEditModal = (data) => {
        setEditData(data);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleSaveTahunAjaran = async (data, id = null) => {
        try {
            const token = localStorage.getItem("token");

            if (!data.tahun || !data.semester) {
                swal(
                    "Gagal!",
                    "Tahun dan semester tidak boleh kosong.",
                    "warning"
                );
                return;
            }

            if (id) {
                await axios.put(
                    `http://localhost:8000/api/tahunajaran/${id}`,
                    data,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                swal(
                    "Berhasil!",
                    "Data tahun ajaran berhasil diperbarui.",
                    "success"
                );
            } else {
                data.kodejurusan = user.kodejurusan;
                data.id_jurusan = user.id_jurusan;
                data.adminjurusan_id = user.id;

                await axios.post(
                    `http://localhost:8000/api/tahunajaran`,
                    data,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                swal(
                    "Berhasil!",
                    "Data tahun ajaran berhasil ditambahkan.",
                    "success"
                );
            }

            const response = await axios.get(
                `http://localhost:8000/api/tahunajaran`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const filtered = response.data.filter(
                (ta) => ta.adminjurusan?.kodejurusan === user.kodejurusan
            );
            setTahunAjaranList(filtered);
            closeModal();
        } catch (error) {
            console.error("Gagal menyimpan data tahun ajaran:", error);
            const message =
                error.response?.data?.message ||
                "Terjadi kesalahan saat menyimpan data.";
            swal("Gagal!", message, "error");
        }
    };
    const handleDelete = async (id) => {
        swal({
            title: "Yakin ingin menghapus?",
            text: "Data tahunajaran yang dihapus tidak bisa dikembalikan!",
            icon: "warning",
            buttons: ["Batal", "Hapus"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                try {
                    const token = localStorage.getItem("token");

                    await axios.delete(
                        `http://localhost:8000/api/tahunajaran/${id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    setTahunAjaranList((prev) =>
                        prev.filter((ta) => ta.id !== id)
                    );

                    swal(
                        "Terhapus!",
                        "Data tahunajaran berhasil dihapus.",
                        "success"
                    );
                } catch (error) {
                    console.error("Gagal menghapus tahunajaran:", error);
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
            <ModalTahunajaran
                open={modalOpen}
                handleClose={closeModal}
                onSave={handleSaveTahunAjaran}
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
                        <BsCalendar2Date style={{ fontSize: "18px" }} />
                        Tambah Tahun Ajaran
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
                    {/* Show entries */}
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
                    aria-label="Data Tahun Ajaran"
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
                                    active={orderBy === "tahun"}
                                    direction={order}
                                    onClick={() => handleSort("tahun")}
                                    label="Tahun Ajaran"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "semester"}
                                    direction={order}
                                    onClick={() => handleSort("semester")}
                                    label="Semester"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "is_aktif"}
                                    direction={order}
                                    onClick={() => handleSort("is_aktif")}
                                    label="Status"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
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
                        {displayedItems.map((ta, index) => (
                            <TableRow
                                key={ta.id}
                                hover
                                sx={{
                                    backgroundColor:
                                        index % 2 === 0 ? "#F6F6F6" : "#FFFFFF",
                                }}
                            >
                                <TableCell sx={cellStyle}>
                                    {index + 1 + currentPage * rowsPerPage}
                                </TableCell>
                                <TableCell sx={cellStyle}>{ta.tahun}</TableCell>
                                <TableCell sx={cellStyle}>
                                    {ta.semester}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <IconButton
                                            onClick={() =>
                                                handleToggleStatus(ta)
                                            }
                                            sx={{
                                                color: ta.is_aktif
                                                    ? "success.main"
                                                    : "grey.500",
                                                transition: "all 0.3s ease",
                                                transform: ta.is_aktif
                                                    ? "scale(1.1)"
                                                    : "scale(1)",
                                                "&:hover": {
                                                    transform: "scale(1.2)",
                                                    color: ta.is_aktif
                                                        ? "success.dark"
                                                        : "grey.700",
                                                },
                                            }}
                                        >
                                            {ta.is_aktif ? (
                                                <ToggleOnIcon fontSize="medium" />
                                            ) : (
                                                <ToggleOffIcon fontSize="medium" />
                                            )}
                                        </IconButton>
                                        <Typography
                                            variant="body2"
                                            sx={{ minWidth: "80px" }}
                                        >
                                            {ta.is_aktif ? "Aktif" : "Nonaktif"}
                                        </Typography>
                                    </Box>
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
                                                onClick={() => handleUpdate(ta)}
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
                                                    handleDelete(ta.id)
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
                                    colSpan={5}
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
};

const cellStyle = {
    borderRight: "1.5px solid #DBDFE1",
    fontSize: "13px",
    color: "#4f4f4f",
    fontWeight: 500,
    paddingBottom: "6px",
    verticalAlign: "top",
};

const ModalTahunajaran = ({ open, handleClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        tahun: null,
        semester: null,
    });

    const currentYear = new Date().getFullYear();
    const tahunOptions = [];

    for (let i = -2; i <= 3; i++) {
        const startYear = currentYear + i;
        const endYear = startYear + 1;
        const label = `${startYear}/${endYear}`;
        tahunOptions.push({ value: label, label });
    }

    const semesterOptions = [
        { value: "ganjil", label: "Ganjil" },
        { value: "genap", label: "Genap" },
    ];

    useEffect(() => {
        if (initialData) {
            setFormData({
                tahun:
                    tahunOptions.find(
                        (opt) => opt.value === initialData.tahun
                    ) || null,
                semester:
                    semesterOptions.find(
                        (opt) =>
                            opt.value === initialData.semester.toLowerCase()
                    ) || null,
            });
        } else {
            setFormData({
                tahun: null,
                semester: null,
            });
        }
    }, [initialData]);

    const handleTahunChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            tahun: selectedOption,
        }));
    };

    const handleSemesterChange = (selectedOption) => {
        setFormData((prev) => ({
            ...prev,
            semester: selectedOption,
        }));
    };
    const handleSubmit = () => {
        onSave(
            {
                tahun: formData.tahun?.value || "",
                semester: formData.semester?.value || "",
            },
            initialData?.id
        );
    };

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
                    {initialData ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
                </Typography>

                <Grid
                    item
                    xs={12}
                    sx={{
                        position: "relative",
                        marginTop: "20px",
                        marginBottom: "20px",
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
                    sx={
                        {
                            /* styling */
                        }
                    }
                >
                    <Box sx={{ marginBottom: "15px", marginTop: "-5px" }}>
                        <Typography
                            variant="body2"
                            sx={{ marginBottom: "1px", color: "#333" }}
                        >
                            Tahun Ajaran
                        </Typography>

                        <Select
                            name="tahun"
                            options={tahunOptions}
                            value={formData.tahun}
                            onChange={handleTahunChange}
                            placeholder="Pilih Tahun Ajaran"
                            isClearable
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                                menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                }),
                                control: (provided) => ({
                                    ...provided,
                                    height: 45,
                                    borderRadius: 8,
                                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                }),
                            }}
                        />
                    </Box>

                    <Box sx={{ marginBottom: "15px" }}>
                        <Typography
                            variant="body2"
                            sx={{ marginBottom: "1px", color: "#333" }}
                        >
                            Semester
                        </Typography>

                        <Select
                            name="semester"
                            options={semesterOptions}
                            value={formData.semester}
                            onChange={handleSemesterChange}
                            placeholder="Pilih Semester"
                            isClearable
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                                menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                }),
                                control: (provided) => ({
                                    ...provided,
                                    height: 45,
                                    borderRadius: 8,
                                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                }),
                            }}
                        />
                    </Box>
                </DialogContent>

                <Grid
                    item
                    xs={12}
                    sx={{
                        position: "relative",
                        marginTop: "-10px",
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

                    <Tooltip title="Simpan Data Tahun Ajaran" arrow>
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

export default DataTahunAjaran;
