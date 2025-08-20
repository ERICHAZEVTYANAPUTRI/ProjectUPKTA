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
import { MdBrowserUpdated } from "react-icons/md";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const TabelPengajuanKegiatan = () => {
    const [pengajuan, setPengajuan] = useState([]);
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
        .filter((item) => item.status === "pending")
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

    const isWaktuBentrok = (startA, endA, startB, endB) => {
        return startA < endB && endA > startB;
    };

    const handleAksi = async (id) => {
        const pengajuanItem = data.find((item) => item.id === id);
        const tanggal = pengajuanItem.tanggal;
        const hari = getDayName(tanggal);
        const ruanganId = pengajuanItem.ruangan?.id;
        const jamMulai = pengajuanItem.jammulai;
        const jamSelesai = pengajuanItem.jamselesai;

        try {
            const token = localStorage.getItem("token");

            // 🔹 Ambil jadwal ruangan
            const response = await axios.get(
                `http://localhost:8000/api/ruangan/${ruanganId}/jadwal-harian`,
                {
                    params: { hari },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const jadwalList = response.data;

            // 🔹 Ambil pengajuan peminjaman yang statusnya dipinjam & diterima
            const pengajuanResponse = await axios.get(
                `http://localhost:8000/api/pengajuan-peminjamans`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // 🔹 Ambil pengajuan kegiatan
            const kegiatanResponse = await axios.get(
                `http://localhost:8000/api/pengajuan-kegiatan`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const kegiatanList = kegiatanResponse.data.data.filter(
                (item) =>
                    item.ruangan_id === ruanganId &&
                    item.tanggal === tanggal &&
                    item.status === "diterima"
            );

            const pengajuanDiterima = pengajuanResponse.data.filter(
                (item) =>
                    item.ruangan_id === ruanganId &&
                    item.hari === hari &&
                    item.status === "diterima"
            );

            // 🔹 Format jadwal rutin dan pengajuan
            const formatStatus = (status) => {
                switch (status) {
                    case "pending":
                    case "belumdipinjam":
                        return "Belum Dipinjam";
                    case "dipinjam":
                        return "Sedang Dipinjam";
                    case "diterima":
                        return "Diterima";
                    case "selesai":
                        return "Selesai";
                    default:
                        return "Status Tidak Diketahui";
                }
            };
            const kegiatanText =
                kegiatanList.length > 0
                    ? kegiatanList
                          .map((k, i) => {
                              const nama =
                                  k.mahasiswa?.nama_lengkap ||
                                  "Tidak diketahui";
                              const jenis =
                                  JSON.parse(k.jenis_kegiatan || "[]").join(
                                      ", "
                                  ) || "-";
                              return `${i + 1}) ${k.jammulai} - ${
                                  k.jamselesai
                              } | Oleh: ${nama} | Kegiatan: ${jenis}`;
                          })
                          .join("\n")
                    : "Tidak ada pengajuan kegiatan diterima untuk tanggal tersebut.";

            const jadwalText =
                jadwalList.length > 0
                    ? jadwalList
                          .map((j, i) => {
                              const kelas = j.kelas?.nama || "Tidak diketahui";
                              const status = formatStatus(j.statuspeminjaman);
                              return `${i + 1}) ${j.jammulai} - ${
                                  j.jamselesai
                              } | Kelas: ${kelas} => Status: ${status}`;
                          })
                          .join("\n")
                    : "Tidak ada jadwal harian untuk hari tersebut.";

            const pengajuanText =
                pengajuanDiterima.length > 0
                    ? pengajuanDiterima
                          .map((j, i) => {
                              const kelas =
                                  j.mahasiswa?.kelas?.nama || "Tidak diketahui";
                              const nama =
                                  j.mahasiswa?.nama_lengkap ||
                                  "Nama tidak tersedia";
                              return `${i + 1}) ${j.jammulai} - ${
                                  j.jamselesai
                              } | Kelas: ${kelas} | Oleh: ${nama}`;
                          })
                          .join("\n")
                    : "Tidak ada peminjaman yang sedang berjalan untuk tanggal tersebut.";

            // 🔹 Konfirmasi swal utama
            const confirm = await swal({
                title: "Konfirmasi Aksi Pengajuan",
                text:
                    `Pengajuan untuk hari ${hari}, ${tanggal} \npada pukul ${jamMulai} - ${jamSelesai}.\n\n` +
                    `🟦 RUANGAN: ${
                        pengajuanItem.ruangan?.name?.toUpperCase() ||
                        "TIDAK DIKETAHUI"
                    }\n\n` +
                    `📌 Jadwal Ruangan Kuliah Rutin:\n${jadwalText}\n\n` +
                    `📌 Pengajuan Peminjaman Jadwal Pengganti Diterima:\n${pengajuanText}\n\n` +
                    `📌 Jadwal Kegiatan Diterima:\n${kegiatanText}\n\n` +
                    `⚠️ Apakah Anda yakin ingin menyetujui pengajuan ini?\nPeriksa kembali untuk menghindari bentrok jadwal.`,
                icon: "warning",
                buttons: {
                    reject: {
                        text: "Tidak, Tolak",
                        value: "tolak",
                        className: "swal-button--tolak",
                    },
                    accept: {
                        text: "Ya, Terima",
                        value: "terima",
                        className: "swal-button--terima",
                    },
                },
                dangerMode: true,
            });

            // 🔹 Jika user klik "Terima"
            if (confirm === "terima") {
                const waktuMulaiPengajuan = new Date(`${tanggal}T${jamMulai}`);
                const waktuSelesaiPengajuan = new Date(
                    `${tanggal}T${jamSelesai}`
                );

                // 🔍 1. Cek bentrok dengan pengajuan aktif (dipinjam / prosespengembalian)
                const pengajuanBentrok = pengajuanResponse.data.find((p) => {
                    const sameRuangan = p.ruangan_id === ruanganId;
                    const sameTanggal = p.tanggal === tanggal;
                    const sameHari = p.hari === hari;
                    const statusValid =
                        p.status === "diterima" &&
                        (p.statuspeminjaman === "dipinjam" ||
                            p.statuspeminjaman === "prosespengembalian");

                    if (
                        !(sameRuangan && sameTanggal && sameHari && statusValid)
                    )
                        return false;

                    const mulai = new Date(`${p.tanggal}T${p.jammulai}`);
                    const selesai = new Date(`${p.tanggal}T${p.jamselesai}`);

                    return isWaktuBentrok(
                        waktuMulaiPengajuan,
                        waktuSelesaiPengajuan,
                        mulai,
                        selesai
                    );
                });

                if (pengajuanBentrok) {
                    const kelas =
                        pengajuanBentrok.mahasiswa?.kelas?.nama ||
                        "Tidak diketahui";
                    const nama =
                        pengajuanBentrok.mahasiswa?.nama_lengkap ||
                        "Nama tidak diketahui";
                    const mulai = pengajuanBentrok.jammulai;
                    const selesai = pengajuanBentrok.jamselesai;

                    const hasil = await swal({
                        title: "Bentrok Pengajuan Aktif!",
                        text: `Bentrok dengan peminjaman aktif oleh mahasiswa "${nama}" (kelas: ${kelas})\nJam ${mulai} - ${selesai}.\n\nRuangan tidak tersedia di waktu tersebut.`,
                        icon: "error",
                        buttons: {
                            cancel: {
                                text: "Kembali",
                                value: null,
                            },
                            reject: {
                                text: "Tolak Pengajuan",
                                value: "tolak",
                            },
                        },
                    });

                    if (hasil === "tolak") {
                        await axios.post(
                            `http://localhost:8000/api/peminjamankegiatan/${id}/tolak`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setPengajuan((prev) =>
                            prev.filter((item) => item.id !== id)
                        );
                        handleMenuClose();
                        swal(
                            "Ditolak!",
                            "Pengajuan ditolak karena bentrok dengan peminjaman aktif.",
                            "info"
                        );
                    }

                    return;
                }

                // 🔍 2. Cek bentrok dengan jadwal rutin (sudah difilter statusterkirim === terkirim dari backend)
                const jadwalBentrok = jadwalList.find((j) => {
                    const mulai = new Date(`${tanggal}T${j.jammulai}`);
                    const selesai = new Date(`${tanggal}T${j.jamselesai}`);
                    return isWaktuBentrok(
                        waktuMulaiPengajuan,
                        waktuSelesaiPengajuan,
                        mulai,
                        selesai
                    );
                });

                if (jadwalBentrok) {
                    const kelas =
                        jadwalBentrok.kelas?.nama || "Tidak diketahui";
                    const mulai = jadwalBentrok.jammulai;
                    const selesai = jadwalBentrok.jamselesai;

                    const hasil = await swal({
                        title: "Bentrok Jadwal Rutin!",
                        text: `Bentrok dengan jadwal kelas "${kelas}" pada jam ${mulai} - ${selesai}.\n\nRuangan diprioritaskan untuk jadwal rutin.`,
                        icon: "error",
                        buttons: {
                            cancel: {
                                text: "Kembali",
                                value: null,
                            },
                            reject: {
                                text: "Tolak Pengajuan",
                                value: "tolak",
                            },
                        },
                    });

                    if (hasil === "tolak") {
                        await axios.post(
                            `http://localhost:8000/api/peminjamankegiatan/${id}/tolak`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setPengajuan((prev) =>
                            prev.filter((item) => item.id !== id)
                        );
                        handleMenuClose();
                        swal(
                            "Ditolak!",
                            "Pengajuan ditolak karena bentrok dengan jadwal rutin.",
                            "info"
                        );
                    }

                    return;
                }
                // 🔍 3. Cek bentrok dengan kegiatan
                const kegiatanBentrok = kegiatanList.find((k) => {
                    const mulai = new Date(`${tanggal}T${k.jammulai}`);
                    const selesai = new Date(`${tanggal}T${k.jamselesai}`);
                    return isWaktuBentrok(
                        waktuMulaiPengajuan,
                        waktuSelesaiPengajuan,
                        mulai,
                        selesai
                    );
                });

                if (kegiatanBentrok) {
                    const nama =
                        kegiatanBentrok.mahasiswa?.nama_lengkap ||
                        "Tidak diketahui";
                    const jenis = JSON.parse(
                        kegiatanBentrok.jenis_kegiatan || "[]"
                    ).join(", ");
                    const mulai = kegiatanBentrok.jammulai;
                    const selesai = kegiatanBentrok.jamselesai;

                    const hasil = await swal({
                        title: "Bentrok dengan Kegiatan!",
                        text: `Bentrok dengan kegiatan "${jenis}" oleh "${nama}"\nJam ${mulai} - ${selesai}.\n\nSilakan tolak atau pilih waktu lain.`,
                        icon: "error",
                        buttons: {
                            cancel: {
                                text: "Kembali",
                                value: null,
                            },
                            reject: {
                                text: "Tolak Pengajuan",
                                value: "tolak",
                            },
                        },
                    });

                    if (hasil === "tolak") {
                        await axios.post(
                            `http://localhost:8000/api/peminjamankegiatan/${id}/tolak`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setPengajuan((prev) =>
                            prev.filter((item) => item.id !== id)
                        );
                        handleMenuClose();
                        swal(
                            "Ditolak!",
                            "Pengajuan ditolak karena bentrok dengan kegiatan.",
                            "info"
                        );
                    }

                    return;
                }

                // ✅ Jika tidak bentrok, terima pengajuan
                await axios.post(
                    `http://localhost:8000/api/peminjamankegiatan/${id}/terima`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setData((prev) => prev.filter((item) => item.id !== id));
                handleMenuClose();
                swal("Berhasil!", "Pengajuan telah diterima.", "success");
            }
            // 🔹 Jika user klik "Tolak"
            else if (confirm === "tolak") {
                await axios.post(
                    `http://localhost:8000/api/peminjamankegiatan/${id}/tolak`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setData((prev) => prev.filter((item) => item.id !== id));
                handleMenuClose();
                swal("Ditolak!", "Pengajuan telah ditolak.", "success");
            }
        } catch (error) {
            console.error("Gagal memproses aksi pengajuan:", error);

            const message =
                error?.response?.data?.message ||
                "Terjadi kesalahan saat memproses pengajuan.";

            swal("Gagal!", message, "error");
        }
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
                                {
                                    label: "Jam",
                                    key: "jammulai",
                                },
                                { label: "Kegiatan", key: "jenis_kegiatan" },
                                { label: "Keterangan", key: "Keterangan" },
                                { label: "Detail", key: "Detail" },
                                { label: "Aksi", key: "aksi" },
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
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Tooltip title="Lihat Aksi" arrow>
                                                <Box
                                                    onClick={() =>
                                                        handleAksi(item.id)
                                                    }
                                                    sx={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 0.5,
                                                        cursor: "pointer",
                                                        backgroundColor:
                                                            "#FFF8E1",
                                                        border: "1.5px solid #b3c849",
                                                        color: "#dark",
                                                        fontWeight: 600,
                                                        padding: "2px 8px",
                                                        borderRadius: 1,
                                                        fontSize: "12px",
                                                        transition:
                                                            "all 0.3s ease",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "#b3c849",
                                                            color: "#fff",
                                                        },
                                                    }}
                                                >
                                                    <MdBrowserUpdated fontSize="24px" />
                                                </Box>
                                            </Tooltip>
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

export default TabelPengajuanKegiatan;
