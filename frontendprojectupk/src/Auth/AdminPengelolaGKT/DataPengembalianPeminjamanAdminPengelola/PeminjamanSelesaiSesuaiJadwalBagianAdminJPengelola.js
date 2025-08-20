import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
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
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import { BiExport, BiRefresh } from "react-icons/bi";
import { BsInfoCircle, BsSearch } from "react-icons/bs";
import { FcProcess } from "react-icons/fc";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import * as XLSX from "xlsx";
import Navbar from "../../../Components/Navbar/Navbar";

const HalamanAdminPengelolaPeminjamanSelesaiSesuaiJadwal = () => {
    const [user, setUser] = useState(null);
    const [videoUrl, setVideoUrl] = useState("");
    const [jurusanOptions, setJurusanOptions] = useState([]);
    const [selectedJurusan, setSelectedJurusan] = useState(null);
    const [selectedJadwalId, setSelectedJadwalId] = useState(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [jadwalMahasiswa, setJadwalMahasiswa] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const navigate = useNavigate();
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [orderBy, setOrderBy] = useState("");
    const [order, setOrder] = useState("asc");
    const location = useLocation();
    const [selectedPageOption, setSelectedPageOption] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    ); // default bulan ini
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [hariOptions] = useState([
        { value: "Senin", label: "Senin" },
        { value: "Selasa", label: "Selasa" },
        { value: "Rabu", label: "Rabu" },
        { value: "Kamis", label: "Kamis" },
        { value: "Jumat", label: "Jumat" },
        { value: "Sabtu", label: "Sabtu" },
    ]);
    const [selectedHari, setSelectedHari] = useState(null);
    const [prodiOptions, setProdiOptions] = useState([]);
    const [selectedProdi, setSelectedProdi] = useState(null);
    const [kelasOptions, setKelasOptions] = useState([]);
    const [selectedKelas, setSelectedKelas] = useState(null);
    const [matakuliahOptions, setMatakuliahOptions] = useState([]);
    const [selectedMatakuliah, setSelectedMatakuliah] = useState(null);
    const [dosenOptions, setDosenOptions] = useState([]);
    const [selectedDosen, setSelectedDosen] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Token tidak ditemukan.");
                const [
                    prodiRes,
                    kelasRes,
                    matakuliahRes,
                    dosenRes,
                    jurusanRes,
                ] = await Promise.all([
                    axios.get("http://localhost:8000/api/prodi", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8000/api/kelasmahasiswa", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8000/api/matakuliah", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8000/api/dosen", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:8000/api/jurusan", {
                        headers: { Authorization: `Bearer ${token}` },
                    }), // <-- Tambahkan ini
                ]);

                setProdiOptions(
                    prodiRes.data.map((item) => ({
                        value: item.id,
                        label: item.namaprodi,
                    }))
                );
                setKelasOptions(
                    kelasRes.data.map((item) => ({
                        value: item.id,
                        label: item.nama,
                    }))
                );
                setMatakuliahOptions(
                    matakuliahRes.data.map((item) => ({
                        value: item.id,
                        label: item.namamatakuliah,
                    }))
                );
                setDosenOptions(
                    dosenRes.data.map((item) => ({
                        value: item.id,
                        label: item.nama,
                    }))
                );
                setJurusanOptions(
                    jurusanRes.data.map((item) => ({
                        value: item.id,
                        label: item.namajurusan,
                    }))
                );
            } catch (error) {
                console.error("Gagal memuat data opsi filter:", error);
            }
        };
        fetchOptions();
    }, []);

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

        const sorted = [...jadwalMahasiswa].sort((a, b) => {
            if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
            if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
            return 0;
        });

        setOrder(newOrder);
        setOrderBy(column);
        setJadwalMahasiswa(sorted);
    };
    const pageOptions = [
        {
            value: "/peminjamanselesaiadminpengelolasemuadata",
            label: "Peminjaman Selesai Jadwal Kuliah",
        },
        {
            value: "/peminjamanselesaitidaksesuaijadwaladminpengelola",
            label: "Peminjaman Selesai Jadwal Kuliah Pengganti",
        },
        {
            value: "/historypeminjamankegiatan",
            label: "Peminjaman Selesai Diluar Perkuliahan",
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

    useEffect(() => {
        const fetchUserAndJadwal = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Token tidak ditemukan.");

                const userRes = await axios.get(
                    "http://localhost:8000/api/user",
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setUser(userRes.data);

                const jadwalRes = await axios.post(
                    "http://localhost:8000/api/peminjamanselesaiadminpengelolaalldata",
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setJadwalMahasiswa(jadwalRes.data);
            } catch (error) {
                console.error("Gagal memuat data:", error);
            }
        };

        fetchUserAndJadwal();
    }, []);

    const handleSearch = (term) => {
        setSearchTerm(term.toLowerCase());
        setCurrentPage(0);
    };

    const handleDetailClick = (id) => {
        navigate(`/penjadwalanRuanganHistory/detail/${id}`);
    };
    const filteredJadwal = jadwalMahasiswa.filter((item) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            (item.mahasiswa?.nama_lengkap || "")
                .toLowerCase()
                .includes(search) ||
            (item.kelas?.nama || "").toLowerCase().includes(search) ||
            (item.hari || "").toLowerCase().includes(search) ||
            (item.ruangan?.name || "").toLowerCase().includes(search) ||
            (item.matakuliah?.namamatakuliah || "")
                .toLowerCase()
                .includes(search) ||
            (item.dosen?.nama || "").toLowerCase().includes(search);
        const matchesHari = selectedHari
            ? item.hari === selectedHari.value
            : true;
        const matchesProdi = selectedProdi
            ? item.prodi?.id === selectedProdi.value
            : true;
        const matchesKelas = selectedKelas
            ? item.kelas?.id === selectedKelas.value
            : true;
        const matchesMatakuliah = selectedMatakuliah
            ? item.matakuliah?.id === selectedMatakuliah.value
            : true;
        const matchesDosen = selectedDosen
            ? item.dosen?.id === selectedDosen.value
            : true;
        const matchesJurusan = selectedJurusan
            ? item.mahasiswa?.jurusan?.id === selectedJurusan.value
            : true;

        return (
            matchesSearch &&
            matchesHari &&
            matchesProdi &&
            matchesKelas &&
            matchesMatakuliah &&
            matchesDosen &&
            matchesJurusan
        );
    });

    const pageCount = Math.ceil(filteredJadwal.length / rowsPerPage);
    const displayedItems = filteredJadwal.slice(
        currentPage * rowsPerPage,
        (currentPage + 1) * rowsPerPage
    );
    const handlePageChange = (selectedPage) => {
        setCurrentPage(selectedPage.selected);
    };

    const handleDetail = (id) => {
        navigate(`/DetailJadwalPeminjamanSelesaiAdminPengelola/${id}`);
    };

    const handleOpenVideo = (item) => {
        const driveId = item.statusuploadvidio?.split("/d/")[1]?.split("/")[0];
        if (driveId) {
            setVideoUrl(`https://drive.google.com/file/d/${driveId}/preview`);
            setSelectedJadwalId(item.id);
            setShowVideoModal(true);
        } else {
            swal("Gagal", "Link Google Drive tidak valid", "error");
        }
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
    const handleResetFilters = () => {
        setSelectedJurusan(null);
        setSelectedHari(null);
        setSelectedProdi(null);
        setSelectedKelas(null);
        setSelectedMatakuliah(null);
        setSelectedDosen(null);
        setSearchTerm("");
    };
    const exportExcelSemuaDosen = (selectedMonth, selectedYear) => {
        const dosenGrouped = {};

        filteredJadwal.forEach((item) => {
            const tanggalJadwal = new Date(item.waktu_pengembalian);
            const itemMonth = tanggalJadwal.getMonth() + 1;
            const itemYear = tanggalJadwal.getFullYear();

            if (itemMonth === selectedMonth && itemYear === selectedYear) {
                const dosenName = item.dosen?.nama || "Tanpa Dosen";
                if (!dosenGrouped[dosenName]) {
                    dosenGrouped[dosenName] = [];
                }

                dosenGrouped[dosenName].push({
                    Tanggal: tanggalJadwal.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    }),
                    Hari: item.hari || "-",
                    Jam: `${item.jammulai || "-"} - ${item.jamselesai || "-"}`,
                    Kelas: item.kelas?.nama || "-",
                    "Mata Kuliah": item.matakuliah?.namamatakuliah || "-",
                    Ruangan: item.ruangan?.name || "-",
                    Status:
                        item.statusdialihkan === "dialihkan"
                            ? "Dialihkan"
                            : item.statusdigunakan === "digunakan"
                            ? "Digunakan"
                            : item.statustidakdigunakan || "-",
                });
            }
        });

        if (Object.keys(dosenGrouped).length === 0) {
            swal("Tidak ada data untuk bulan ini", "", "info");
            return;
        }

        const workbook = XLSX.utils.book_new();

        Object.entries(dosenGrouped).forEach(([dosen, data]) => {
            const worksheet = XLSX.utils.json_to_sheet(data, {
                skipHeader: false,
            });
            const columnWidths = Object.keys(data[0]).map((key) => {
                const maxLength = Math.max(
                    key.length,
                    ...data.map((row) => String(row[key]).length)
                );
                return { wch: maxLength + 5 };
            });
            worksheet["!cols"] = columnWidths;
            const range = XLSX.utils.decode_range(worksheet["!ref"]);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!worksheet[cellRef]) continue;
                worksheet[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4F81BD" } },
                    alignment: { horizontal: "center", vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "000000" } },
                        bottom: { style: "thin", color: { rgb: "000000" } },
                        left: { style: "thin", color: { rgb: "000000" } },
                        right: { style: "thin", color: { rgb: "000000" } },
                    },
                };
            }
            for (let R = range.s.r + 1; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!worksheet[cellRef]) continue;
                    worksheet[cellRef].s = {
                        alignment: { horizontal: "center", vertical: "center" },
                        border: {
                            top: { style: "thin", color: { rgb: "000000" } },
                            bottom: { style: "thin", color: { rgb: "000000" } },
                            left: { style: "thin", color: { rgb: "000000" } },
                            right: { style: "thin", color: { rgb: "000000" } },
                        },
                    };
                }
            }

            const safeSheetName =
                dosen.length > 31 ? dosen.slice(0, 28) + "..." : dosen;
            XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
        });

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
            cellStyles: true,
        });

        const dataBlob = new Blob([excelBuffer], {
            type: "application/octet-stream",
        });

        saveAs(
            dataBlob,
            `Jadwal_Semua_Dosen_Bulan_${selectedMonth}_${selectedYear}.xlsx`
        );
    };

    return (
        <>
            <Navbar />
            <Box sx={{ mb: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
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

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={handleResetFilters}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                height: "35px",
                                fontSize: "0.8rem !important",
                                fontWeight: 500,
                                px: 1.5,
                                borderRadius: "4px",
                                textTransform: "none",
                                background:
                                    "linear-gradient(135deg, #4e54c8, #8f94fb)",
                                color: "#fff",
                                boxShadow: "0 4px 12px rgba(78, 84, 200, 0.4)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background:
                                        "linear-gradient(135deg, #5f66d2, #9ba0fc)",
                                    transform: "translateY(-1px)",
                                    boxShadow:
                                        "0 6px 14px rgba(78, 84, 200, 0.5)",
                                },
                            }}
                        >
                            <BiRefresh fontSize={18} />
                            Reset Filter Select
                        </Button>

                        <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => setShowExportModal(true)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                height: "35px",
                                fontSize: "0.8rem !important",
                                fontWeight: 500,
                                px: 1.5,
                                borderRadius: "4px",
                                textTransform: "none",
                                background:
                                    "linear-gradient(135deg, #28a745, #85d262)",
                                color: "#fff",
                                boxShadow: "0 4px 12px rgba(40, 167, 69, 0.4)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    background:
                                        "linear-gradient(135deg, #2ecc40, #a8e063)",
                                    transform: "translateY(-1px)",
                                    boxShadow:
                                        "0 6px 14px rgba(40, 167, 69, 0.5)",
                                },
                            }}
                        >
                            <BiExport fontSize={18} />
                            Export Keaktifan Dosen
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    <Select
                        options={jurusanOptions}
                        value={selectedJurusan}
                        onChange={setSelectedJurusan}
                        placeholder="Filter Jurusan"
                        isClearable
                        styles={{
                            container: (base) => ({
                                ...base,
                                minWidth: 120,
                                fontSize: "0.8rem",
                            }),
                        }}
                    />
                    <Select
                        options={hariOptions}
                        value={selectedHari}
                        onChange={setSelectedHari}
                        placeholder="Filter Hari"
                        isClearable
                        styles={{
                            container: (base) => ({
                                ...base,
                                minWidth: 110,
                                fontSize: "0.8rem",
                            }),
                        }}
                    />
                    <Select
                        options={prodiOptions}
                        value={selectedProdi}
                        onChange={setSelectedProdi}
                        placeholder="Filter Prodi"
                        isClearable
                        styles={{
                            container: (base) => ({
                                ...base,
                                minWidth: 120,
                                fontSize: "0.8rem",
                            }),
                        }}
                    />
                    <Select
                        options={kelasOptions}
                        value={selectedKelas}
                        onChange={setSelectedKelas}
                        placeholder="Filter Kelas"
                        isClearable
                        styles={{
                            container: (base) => ({
                                ...base,
                                minWidth: 110,
                                fontSize: "0.8rem",
                            }),
                        }}
                    />
                    <Select
                        options={matakuliahOptions}
                        value={selectedMatakuliah}
                        onChange={setSelectedMatakuliah}
                        placeholder="Filter Matakuliah"
                        isClearable
                        styles={{
                            container: (base) => ({
                                ...base,
                                minWidth: 140,
                                fontSize: "0.8rem",
                            }),
                        }}
                    />
                    <Select
                        options={dosenOptions}
                        value={selectedDosen}
                        onChange={setSelectedDosen}
                        placeholder="Filter Dosen"
                        isClearable
                        styles={{
                            container: (base) => ({
                                ...base,
                                minWidth: 120,
                                fontSize: "0.8rem",
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
                                    active={orderBy === "kelas_id"}
                                    direction={order}
                                    onClick={() => handleSort("kelas_id")}
                                    label="Kelas"
                                />
                            </TableCell>
                            <TableCell sx={headStyle}>
                                <CustomSortLabel
                                    active={orderBy === "mahasiswa_id"}
                                    direction={order}
                                    onClick={() => handleSort("mahasiswa_id")}
                                    label="Penggungjawab"
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
                                    active={orderBy === "status"}
                                    direction={order}
                                    onClick={() => handleSort("status")}
                                    label="Status"
                                />
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedItems.map((item, index) => (
                            <TableRow
                                key={item.id}
                                hover
                                sx={{
                                    backgroundColor:
                                        index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                                    borderBottom: "1px solid #ccc",
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
                                    {item.mahasiswa?.jurusan.namajurusan || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.prodi?.namaprodi || "-"}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    {item.ruangan?.name || "-"}
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
                                    {item.statusuploadvidio &&
                                    item.statusuploadvidio.includes("/d/") ? (
                                        <Tooltip
                                            title="Lihat video unggahan dari Google Drive"
                                            arrow
                                        >
                                            <Box
                                                onClick={() =>
                                                    handleOpenVideo(item)
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
                                                <FcProcess size={18} />
                                            </Box>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip
                                            title="Video tidak tersedia"
                                            arrow
                                        >
                                            <Box
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    cursor: "not-allowed",
                                                    border: "1.5px solid #ccc",
                                                    color: "#ccc",
                                                    fontWeight: 600,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    backgroundColor: "#f9f9f9",
                                                }}
                                            >
                                                <FcProcess size={18} />
                                            </Box>
                                        </Tooltip>
                                    )}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        ...cellStyle,
                                        backgroundColor:
                                            item.statusdialihkan === "dialihkan"
                                                ? "#ffe0b2"
                                                : item.statusdigunakan ===
                                                  "digunakan"
                                                ? "#c8e6c9"
                                                : item.statustidakdigunakan ===
                                                  "kosong"
                                                ? "#e0f7fa"
                                                : "#f5f5f5",
                                        color: "#000",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {item.statusdialihkan === "dialihkan"
                                        ? "Kelas Dialihkan"
                                        : item.statusdigunakan === "digunakan"
                                        ? "Kelas Masuk"
                                        : item.statustidakdigunakan === "kosong"
                                        ? "Kelas Kosong"
                                        : "-"}
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
            <Dialog
                open={showVideoModal}
                onClose={() => setShowVideoModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    Video Pengembalian
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowVideoModal(false)}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box
                        sx={{
                            position: "relative",
                            paddingBottom: "56.25%",
                            height: 0,
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
                            }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
            <Dialog
                open={showExportModal}
                onClose={() => setShowExportModal(false)}
                maxWidth="xs"
                fullWidth
                scroll="paper"
                PaperProps={{
                    sx: { maxHeight: "90vh" },
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        backgroundColor: "#1976d2",
                        color: "white",
                        py: 2,
                        borderBottom: "1px solid #ddd",
                        letterSpacing: 0.5,
                    }}
                >
                    📅 Pilih Tahun & Bulan
                </DialogTitle>

                <DialogContent
                    dividers
                    sx={{
                        px: 4,
                        py: 3,
                        overflowY: "auto",
                    }}
                >
                    <Box display="flex" flexDirection="column" gap={3}>
                        <TextField
                            select
                            label="Tahun"
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(parseInt(e.target.value))
                            }
                            fullWidth
                            size="small"
                            variant="outlined"
                        >
                            {Array.from({ length: 6 }, (_, i) => {
                                const year = new Date().getFullYear() - 5 + i;
                                return (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                );
                            })}
                        </TextField>

                        <TextField
                            select
                            label="Bulan"
                            value={selectedMonth}
                            onChange={(e) =>
                                setSelectedMonth(parseInt(e.target.value))
                            }
                            fullWidth
                            size="small"
                            variant="outlined"
                        >
                            {[
                                "Januari",
                                "Februari",
                                "Maret",
                                "April",
                                "Mei",
                                "Juni",
                                "Juli",
                                "Agustus",
                                "September",
                                "Oktober",
                                "November",
                                "Desember",
                            ].map((month, index) => (
                                <MenuItem key={index} value={index + 1}>
                                    {month}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{ px: 4, pb: 3, justifyContent: "flex-end" }}
                >
                    <Button
                        onClick={() => setShowExportModal(false)}
                        variant="outlined"
                        color="inherit"
                        size="small"
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={() => {
                            setShowExportModal(false);
                            exportExcelSemuaDosen(selectedMonth, selectedYear);
                        }}
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ ml: 2, textTransform: "none", borderRadius: 2 }}
                    >
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
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

export default HalamanAdminPengelolaPeminjamanSelesaiSesuaiJadwal;
