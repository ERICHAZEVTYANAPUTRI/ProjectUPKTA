import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, Divider, MenuItem, Select as MuiSelect, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { AiOutlineSchedule } from "react-icons/ai";
import { BiRefresh } from "react-icons/bi";
import { BsInfoCircle, BsPencil, BsSearch, BsTrash } from "react-icons/bs";
import { FiSend } from "react-icons/fi";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // <-- Ini untuk react-select
import swal from "sweetalert";
import Navbar from "../../../../Components/Navbar/Navbar";

const PenjadwalanRuanganPerkuliahan = () => {
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);
  const [penjadwalanList, setPenjadwalanList] = useState([]);
  const [tahunAjaranId, setTahunAjaranId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [selectedHari, setSelectedHari] = useState(null);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [selectedMatakuliah, setSelectedMatakuliah] = useState(null);
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [prodiList, setProdiList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [matakuliahList, setMatakuliahList] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const hariOptions = [
    { value: "Senin", label: "Senin" },
    { value: "Selasa", label: "Selasa" },
    { value: "Rabu", label: "Rabu" },
    { value: "Kamis", label: "Kamis" },
    { value: "Jumat", label: "Jumat" },
    { value: "Sabtu", label: "Sabtu" },
  ];
  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await axios.get("http://localhost:8000/api/tahunajaran");

        const dataByAdmin = res.data.filter((item) => item.adminjurusan_id === user.id);
        setTahunAjaranList(dataByAdmin);

        const aktif = dataByAdmin.find((item) => item.is_aktif === 1);
        if (aktif) {
          setSelectedTahunAjaran({
            value: aktif.id,
            label: `${aktif.tahun} - Semester ${aktif.semester} (Aktif)`,
          });
          setTahunAjaranId(aktif.id); // supaya penjadwalan bisa difilter
        }
      } catch (err) {
        console.error("Gagal mengambil data tahun ajaran:", err);
      }
    };

    fetchTahunAjaran();
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [prodiRes, kelasRes, matkulRes, dosenRes] = await Promise.all([
          axios.get("http://localhost:8000/api/prodi"),
          axios.get("http://localhost:8000/api/kelasmahasiswa"),
          axios.get("http://localhost:8000/api/matakuliah"),
          axios.get("http://localhost:8000/api/dosen"),
        ]);

        setProdiList(prodiRes.data.filter((item) => item.adminjurusan_id === user.id));
        setKelasList(kelasRes.data.filter((item) => item.adminjurusan_id === user.id));
        setMatakuliahList(matkulRes.data.filter((item) => item.adminjurusan_id === user.id));
        setDosenList(dosenRes.data.filter((item) => item.adminjurusan_id === user.id));
      } catch (err) {
        console.error("Gagal mengambil data master:", err);
      }
    };

    fetchAllData();
  }, []);

  // Untuk options lainnya, ambil dari data `penjadwalanList`:
  const prodiOptions = prodiList.map((item) => ({ value: item.id, label: item.namaprodi }));
  const kelasOptions = kelasList.map((item) => ({ value: item.id, label: item.nama }));
  const matakuliahOptions = matakuliahList.map((item) => ({ value: item.id, label: item.namamatakuliah }));
  const dosenOptions = dosenList.map((item) => ({ value: item.id, label: item.nama }));

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset ke halaman pertama
  };
  const user = JSON.parse(localStorage.getItem("user"));
  const hasJadwalBelumTerkirim = penjadwalanList.some((jadwal) => jadwal.statusterkirim === "belumterkirim" && jadwal.adminjurusan_id === user.id);

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";

    const sorted = [...penjadwalanList].sort((a, b) => {
      if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
      if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setOrder(newOrder);
    setOrderBy(column);
    setPenjadwalanList(sorted);
  };
  const navigate = useNavigate();
  const adaJadwalBelumTerkirim = penjadwalanList.some((item) => item.statusterkirim !== "terkirim");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const res = await axios.get("http://localhost:8000/api/penjadwalanruanganget");

        const filtered = res.data.filter((item) => item.adminjurusan_id === user.id && item.tahunajaran?.id === tahunAjaranId);
        setPenjadwalanList(filtered);
      } catch (error) {
        console.error("Gagal mengambil data penjadwalan:", error);
      }
    };

    if (tahunAjaranId) fetchData();
  }, [tahunAjaranId]);

  const handleTambahClick = () => {
    navigate("/tambahjadwalpersemester");
  };

  const handleKirimJadwal = async () => {
    if (!tahunAjaranId) {
      swal("Peringatan", "Tidak ada data tahun ajaran aktif.", "warning");
      return;
    }

    swal({
      title: "Konfirmasi",
      text: "Yakin ingin mengirim jadwal ke mahasiswa?",
      icon: "warning",
      buttons: ["Batal", "Kirim"],
      dangerMode: true,
    }).then(async (willSend) => {
      if (willSend) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            swal("Error", "User belum login atau token tidak ditemukan.", "error");
            return;
          }

          // Ambil semua jadwal belum terkirim untuk admin ini
          const res = await axios.get("http://localhost:8000/api/penjadwalanruanganget");
          const user = JSON.parse(localStorage.getItem("user"));
          const semuaJadwal = res.data.filter((item) => item.adminjurusan_id === user.id && item.statusterkirim === "belumterkirim");

          const jadwalDenganRuangan = semuaJadwal.filter((item) => item.ruangan_id);
          const jadwalTanpaRuangan = semuaJadwal.filter((item) => !item.ruangan_id);

          let icon = "success";
          let title = "Kirim Jadwal";

          if (jadwalDenganRuangan.length > 0) {
            await axios.post(
              `http://localhost:8000/api/penjadwalan/kirim`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          }

          const pesanBerhasil = `${jadwalDenganRuangan.length} jadwal berhasil dikirim ke mahasiswa.`;
          const pesanGagal = jadwalTanpaRuangan.length > 0 ? `${jadwalTanpaRuangan.length} jadwal gagal dikirim karena belum memiliki ruangan.` : "";

          if (jadwalDenganRuangan.length === 0) {
            icon = "warning"; // ubah ikon jika tidak ada yang berhasil dikirim
            title = "Perhatian";
          }

          swal(title, `${pesanBerhasil}${pesanGagal ? `\n${pesanGagal}` : ""}`, icon);

          // Refresh data
          const refresh = await axios.get("http://localhost:8000/api/penjadwalanruanganget");
          const filtered = refresh.data.filter((item) => item.adminjurusan_id === user.id);
          setPenjadwalanList(filtered);
        } catch (error) {
          console.error("Gagal mengirim jadwal:", error);
          swal("Gagal", "Terjadi kesalahan saat mengirim jadwal.", "error");
        }
      }
    });
  };

  const handleDetailClick = (id) => {
    navigate(`/penjadwalanRuangan/detail/${id}`);
  };

  const handleUpdateClick = (id) => {
    navigate(`/penjadwalanRuangan/edit/${id}`);
  };

  const handleDeleteClick = async (id) => {
    swal({
      title: "Yakin ingin menghapus jadwal ini?",
      icon: "warning",
      buttons: ["Batal", "Hapus"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`http://localhost:8000/api/penjadwalanruangandelete/${id}`);
          // Refresh data setelah hapus
          setPenjadwalanList((prev) => prev.filter((item) => item.id !== id));
          swal("Berhasil menghapus jadwal!", {
            icon: "success",
          });
        } catch (error) {
          console.error("Gagal menghapus jadwal:", error);
          swal("Gagal menghapus data.", {
            icon: "error",
          });
        }
      } else {
        // Jika batal, tidak perlu aksi apapun
      }
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSearchCategory(event.target.value);
  };

  // Filter data berdasarkan search term dan kategori pencarian
  const filteredPenjadwalan = penjadwalanList.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      searchCategory === "all"
        ? item.mahasiswa?.nama_lengkap?.toLowerCase().includes(searchLower) ||
          item.matakuliah?.namamatakuliah?.toLowerCase().includes(searchLower) ||
          item.dosen?.nama?.toLowerCase().includes(searchLower) ||
          item.prodi?.namaprodi?.toLowerCase().includes(searchLower) ||
          item.hari?.toLowerCase().includes(searchLower) ||
          item.jammulai?.toLowerCase().includes(searchLower) ||
          item.ruangan?.name.toLowerCase().includes(searchLower)
        : item[searchCategory]?.toLowerCase().includes(searchLower);

    const matchHari = selectedHari ? item.hari === selectedHari.value : true;
    const matchProdi = selectedProdi ? item.prodi?.id === selectedProdi.value : true;
    const matchKelas = selectedKelas ? item.kelas?.id === selectedKelas.value : true;
    const matchMatakuliah = selectedMatakuliah ? item.matakuliah?.id === selectedMatakuliah.value : true;
    const matchDosen = selectedDosen ? item.dosen?.id === selectedDosen.value : true;

    return matchesSearch && matchHari && matchProdi && matchKelas && matchMatakuliah && matchDosen;
  });

  // Pagination logic
  const pageCount = Math.ceil(filteredPenjadwalan.length / rowsPerPage);
  const displayedItems = filteredPenjadwalan.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

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
        color: "#FFFFFF", // label selalu putih
        fontWeight: 600,
      }}
    >
      {label}
      <Box sx={{ display: "flex", gap: "0px", ml: 0.5, mr: -1.5 }}>
        <span style={{ color: direction === "asc" && active ? "#FFFFFF" : "#aaa" }}>↑</span>
        <span style={{ color: direction === "desc" && active ? "#FFFFFF" : "#aaa" }}>↓</span>
      </Box>
    </Box>
  );
  const handleResetFilter = () => {
    setSelectedHari(null);
    setSelectedProdi(null);
    setSelectedKelas(null);
    setSelectedMatakuliah(null);
    setSelectedDosen(null);
    setSearchTerm(""); // reset pencarian juga jika perlu
  };

  return (
    <>
      <Navbar />
      <Box sx={{ mb: 2 }}>
        {/* Tombol Tambah dan Kirim di satu baris */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", mb: 2 }}>
          {/* Kiri: Select Tahun Ajaran */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Select
              options={tahunAjaranList
                .filter((item) => item.is_aktif === 0 || item.is_aktif === 1)
                .map((item) => ({
                  value: item.id,
                  label: `${item.tahun} - Semester ${item.semester} ${item.is_aktif === 0 ? "(Nonaktif)" : "(Aktif)"}`,
                }))}
              value={
                selectedTahunAjaran ||
                (() => {
                  const aktif = tahunAjaranList.find((item) => item.is_aktif === 1);
                  return aktif
                    ? {
                        value: aktif.id,
                        label: `${aktif.tahun} - Semester ${aktif.semester} (Aktif)`,
                      }
                    : null;
                })()
              }
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setSelectedTahunAjaran(selectedOption);
                  setTahunAjaranId(selectedOption.value);
                } else {
                  const aktif = tahunAjaranList.find((item) => item.is_aktif === 1);
                  if (aktif) {
                    const aktifOption = {
                      value: aktif.id,
                      label: `${aktif.tahun} - Semester ${aktif.semester} (Aktif)`,
                    };
                    setSelectedTahunAjaran(aktifOption);
                    setTahunAjaranId(aktif.id);
                  }
                }
              }}
              placeholder="Tahun Ajaran"
              isClearable
              styles={{
                container: (base) => ({
                  ...base,
                  minWidth: 160,
                  fontSize: "0.80rem",
                }),
              }}
            />
          </Box>

          {/* Kanan: Tombol-tombol */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={handleResetFilter}
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
                background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(78, 84, 200, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #5f66d2, #9ba0fc)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 14px rgba(78, 84, 200, 0.5)",
                },
              }}
            >
              <BiRefresh fontSize={18} /> Reset Filter Select
            </Button>
            {hasJadwalBelumTerkirim && (
              <Button
                variant="contained"
                onClick={handleKirimJadwal}
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
                  background: "linear-gradient(135deg, #FFA726, #FFEB3B)", // 🟠🟡 Oranye ke Kuning
                  color: "#000", // teks hitam untuk kontras
                  boxShadow: "0 4px 12px rgba(255, 193, 7, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #FB8C00, #FFF176)", // warna hover lebih gelap
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 14px rgba(255, 193, 7, 0.5)",
                  },
                }}
              >
                <FiSend style={{ fontSize: "18px" }} />
                Kirim ke Mahasiswa
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleTambahClick}
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
                background: "linear-gradient(135deg, #2e7d32, #1b5e20)",
                color: "#fff",
                boxShadow: "0 4px 10px rgba(34, 139, 34, 0.3)",
                backdropFilter: "blur(4px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #1b5e20, #145a32)",
                  boxShadow: "0 6px 14px rgba(21, 101, 42, 0.5)",
                  transform: "translateY(-2px)",
                },
                "&:active": {
                  transform: "scale(0.97)",
                  boxShadow: "0 2px 6px rgba(21, 101, 42, 0.4)",
                },
              }}
            >
              <AiOutlineSchedule style={{ fontSize: "18px" }} />
              Tambah Jadwal
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Select
            options={hariOptions}
            value={selectedHari}
            onChange={setSelectedHari}
            placeholder="Filter Hari"
            isClearable
            classNamePrefix="react-select"
            styles={{ container: (base) => ({ ...base, minWidth: 120, maxWidth: "100%", fontSize: "0.75rem" }) }}
          />
          <Select
            options={kelasOptions}
            value={selectedKelas}
            onChange={setSelectedKelas}
            placeholder="Filter Kelas"
            isClearable
            classNamePrefix="react-select"
            styles={{ container: (base) => ({ ...base, minWidth: 120, maxWidth: "100%", fontSize: "0.80rem" }) }}
          />
          <Select
            options={matakuliahOptions}
            value={selectedMatakuliah}
            onChange={setSelectedMatakuliah}
            placeholder="Filter Mata Kuliah"
            isClearable
            classNamePrefix="react-select"
            styles={{ container: (base) => ({ ...base, minWidth: 160, maxWidth: "100%", fontSize: "0.80rem" }) }}
          />
          <Select
            options={prodiOptions}
            value={selectedProdi}
            onChange={setSelectedProdi}
            placeholder="Filter Prodi"
            isClearable
            classNamePrefix="react-select"
            styles={{ container: (base) => ({ ...base, minWidth: 140, maxWidth: "100%", fontSize: "0.80rem" }) }}
          />
          <Select
            options={dosenOptions}
            value={selectedDosen}
            onChange={setSelectedDosen}
            placeholder="Filter Dosen"
            isClearable
            classNamePrefix="react-select"
            styles={{ container: (base) => ({ ...base, minWidth: 140, maxWidth: "100%", fontSize: "0.80rem" }) }}
          />
        </Box>
        {/* Garis pemisah */}
        <Divider sx={{ mb: 2, mt: 1 }} />

        {/* Show entries dan search */}
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          {/* Show entries */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: "-10px" }}>
            <Typography
              sx={{
                fontSize: "13px",
                color: "#4f4f4f", // Warna teks
                fontWeight: 500, // atau 600 jika ingin sedikit lebih tebal
              }}
              variant="body2"
            >
              Show
            </Typography>
            <MuiSelect
              size="small"
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              sx={{ fontSize: "12px", height: "25px", width: "60px" }}
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
                color: "#4f4f4f", // Warna teks
                fontWeight: 500, // atau 600 jika ingin sedikit lebih tebal
              }}
              variant="body2"
            >
              entries
            </Typography>
          </Box>
          {/* Search */}
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", ml: 2 }}>
            <TextField
              size="small"
              placeholder="Cari..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{
                width: "70%", // ⬅️ Ganti panjang sesuai kebutuhan
                fontSize: "0.75rem",
                "& input": { fontSize: "0.75rem", py: 0.7 }, // perkecil input text
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
                      "&:hover": { backgroundColor: "#081780" },
                    }}
                    onChange={handleSearch}
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
          width: "%%",
          overflowX: "auto",
          border: "1px solid #e5e6ed",
          borderRadius: 1,
          "&::-webkit-scrollbar": {
            height: "4px", // TIPIS
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1", // warna thumb
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1", // warna background track
          },

          scrollbarWidth: "thin", // Firefox
          scrollbarColor: "#c1c1c1 #f1f1f1", // Firefox
        }}
      >
        <Table aria-label="Penjadwalan" sx={{ width: "100%", minWidth: 600, tableLayout: "auto" }}>
          <TableHead sx={{ backgroundColor: "#0C20B5" }}>
            <TableRow>
              <TableCell sx={{ ...headStyle, width: "5%" }}>
                <CustomSortLabel active={orderBy === "id"} direction={order} onClick={() => handleSort("id")} label="No" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "hari"} direction={order} onClick={() => handleSort("hari")} label="Hari" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "jammulai"} direction={order} onClick={() => handleSort("jammulai")} label="Jam" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "ruangan_id"} direction={order} onClick={() => handleSort("ruangan_id")} label="Ruangan" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "kelas_id"} direction={order} onClick={() => handleSort("kelas_id")} label="Kelas" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "mahasiswa_id"} direction={order} onClick={() => handleSort("mahasiswa_id")} label="Penanggungjawab" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "kodematakuliah"} direction={order} onClick={() => handleSort("kodematakuliah")} label="Matakuliah" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "dosen_id"} direction={order} onClick={() => handleSort("dosen_id")} label="Dosen" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "prodi_id"} direction={order} onClick={() => handleSort("prodi_id")} label="Prodi" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "detail"} direction={order} onClick={() => handleSort("detail")} label="Detail" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "aksi"} direction={order} onClick={() => handleSort("aksi")} label="Aksi" />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedItems.map((item, index) => (
              <TableRow key={item.id} hover sx={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff" }}>
                <TableCell sx={cellStyle}>{index + 1 + currentPage * rowsPerPage}</TableCell>
                <TableCell sx={cellStyle}>{item.hari || "-"}</TableCell>
                <TableCell sx={cellStyle}>
                  {item.jammulai} - {item.jamselesai}
                </TableCell>
                <TableCell sx={cellStyle}>{item.ruangan?.name || "Belum Ditentukan"}</TableCell>
                <TableCell sx={cellStyle}>{item.kelas?.nama || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.mahasiswa?.nama_lengkap || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.matakuliah?.namamatakuliah || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.dosen?.nama || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.prodi?.namaprodi || "-"}</TableCell>
                <TableCell sx={cellStyle}>
                  <Tooltip title="Lihat detail penjadwalan" arrow>
                    <Box
                      onClick={() => handleDetailClick(item.id)}
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
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title="Edit data" arrow>
                      <Box
                        onClick={() => handleUpdateClick(item.id)}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          border: "1.5px solid #FFA500",
                          color: "#FFA500",
                          fontWeight: 600,
                          padding: "2px 6px", // kecilkan sedikit
                          borderRadius: 1,
                          backgroundColor: "#fffaf0",
                          fontSize: "12px",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#FFA500",
                            color: "#fff",
                          },
                        }}
                      >
                        <BsPencil size={18} />
                      </Box>
                    </Tooltip>
                    <Tooltip title="Hapus data" arrow>
                      <Box
                        onClick={() => handleDeleteClick(item.id)}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          cursor: "pointer",
                          border: "1.5px solid #DC3545",
                          color: "#DC3545",
                          fontWeight: 600,
                          padding: "2px 6px", // kecilkan sedikit
                          borderRadius: 1,
                          backgroundColor: "#fff0f0",
                          fontSize: "12px",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#DC3545",
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
                    color: "#4f4f4f", // Warna teks
                    fontWeight: 500, // atau 600 jika ingin sedikit lebih tebal
                  }}
                  colSpan={10}
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
          containerClassName={"pagination"} // penting agar selector `& ul` bekerja
          activeClassName={"active"}
          pageRangeDisplayed={1} // hanya 1 halaman di kiri-kanan current
          marginPagesDisplayed={1} // hanya tampil halaman paling awal dan akhir (optional)
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
  whiteSpace: "nowrap", // Cegah teks membungkus
  overflow: "hidden", // Sembunyikan overflow
  textOverflow: "ellipsis", // Tambahkan "..." kalau teks kepanjangan
};

const cellStyle = {
  borderRight: "1.5px solid #DBDFE1",
  fontSize: "13px",
  color: "#4f4f4f", // Warna teks
  fontWeight: 500, // atau 600 jika ingin sedikit lebih tebal
  paddingTop: "17px", // Lebih kecil
  paddingBottom: "17px",
  verticalAlign: "top", // ⬅️ Tambahkan ini
};

export default PenjadwalanRuanganPerkuliahan;
