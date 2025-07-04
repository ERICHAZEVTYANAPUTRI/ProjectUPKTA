import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Divider,
  FormControlLabel,
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
import { BiRefresh } from "react-icons/bi";
import { BsDoorOpen, BsInfoCircle, BsSearch } from "react-icons/bs";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const PenjadwalanRuanganAdminPengelola = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [gedungList, setGedungList] = useState([]);
  const [selectedGedungId, setSelectedGedungId] = useState("");
  const [ruanganPilihan, setRuanganPilihan] = useState([]);
  const [selectedJurusan, setSelectedJurusan] = useState(null);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [showRuanganOnly, setShowRuanganOnly] = useState(false);
  const [filterTanpaRuangan, setFilterTanpaRuangan] = useState(false);
  const [searchRuanganTerm, setSearchRuanganTerm] = useState("");
  const [selectedHari, setSelectedHari] = useState("");
  const [selectedRuangan, setSelectedRuangan] = useState("");
  const [selectedMatakuliah, setSelectedMatakuliah] = useState("");
  const [selectedDosen, setSelectedDosen] = useState("");
  const [matakuliahList, setMatakuliahList] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [kelasList, setKelasList] = useState([]);
  const [jurusanList, setJurusanList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [selectedPageOption, setSelectedPageOption] = useState({
    label: "Penjadwalan Ruangan",
    value: "/PenjadwalanRuanganPengelola",
  });

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [jurusanRes, prodiRes, dosenRes, ruanganRes, kelasRes, matkulRes] = await Promise.all([
          axios.get("http://localhost:8000/api/jurusan"),
          axios.get("http://localhost:8000/api/prodi"),
          axios.get("http://localhost:8000/api/dosen"),
          axios.get("http://localhost:8000/api/ruangans"),
          axios.get("http://localhost:8000/api/kelasmahasiswa"),
          axios.get("http://localhost:8000/api/matakuliah"),
        ]);
        setJurusanList(jurusanRes.data);
        setProdiList(prodiRes.data);
        setDosenList(dosenRes.data);
        setRuanganList(ruanganRes.data);
        setKelasList(kelasRes.data);
        const matkulFiltered = matkulRes.data.filter((m) => m.tahun_ajaran && m.tahun_ajaran.is_aktif === 1);

        setMatakuliahList(matkulFiltered);
      } catch (error) {
        console.error("Gagal fetch master data:", error);
      }
    };

    fetchMasterData();
  }, []);

  const uniqueOptions = (field) => {
    const values = data.map((item) => item[field] || "").filter(Boolean);
    return [...new Set(values)].map((v) => ({ label: v, value: v }));
  };

  const hariOptions = [
    { value: "Senin", label: "Senin" },
    { value: "Selasa", label: "Selasa" },
    { value: "Rabu", label: "Rabu" },
    { value: "Kamis", label: "Kamis" },
    { value: "Jumat", label: "Jumat" },
    { value: "Sabtu", label: "Sabtu" },
  ];
  const ruanganOptions = ruanganList.map((item) => ({
    value: item.name,
    label: item.name,
  }));

  const matakuliahOptions = matakuliahList.map((item) => ({
    value: item.namamatakuliah,
    label: item.namamatakuliah,
  }));

  const dosenOptions = dosenList.map((item) => ({
    value: item.nama,
    label: item.nama,
  }));

  const kelasOptions = kelasList.map((item) => ({
    value: item.nama, // asumsi properti kelas adalah 'nama'
    label: item.nama,
  }));

  const jurusanOptions = jurusanList.map((item) => ({
    value: item.namajurusan,
    label: item.namajurusan,
  }));
  const prodiOptions = prodiList.map((item) => ({
    value: item.namaprodi,
    label: item.namaprodi,
  }));

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset ke halaman pertama
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

  const navigate = useNavigate();

  const handleProdiChange = (selected) => {
    setSelectedProdi(selected);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/penjadwalanruanganadminpengelola");
        setData(res.data);
      } catch (error) {
        console.error("Gagal mengambil data penjadwalan:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(0);
  };

  // Di atas return JSX (dalam komponen):
  const ruanganByLantai = {};
  let lantaiTertinggi = 1;

  ruanganPilihan.forEach((r) => {
    const lantai = r.lantai || 1;
    if (!ruanganByLantai[lantai]) {
      ruanganByLantai[lantai] = [];
    }
    ruanganByLantai[lantai].push(r);
    if (lantai > lantaiTertinggi) lantaiTertinggi = lantai;
  });

  const handleOpenModal = async (itemId) => {
    setSelectedItemId(itemId);
    setShowModal(true);
    setShowRuanganOnly(false); // <-- Tambahkan baris ini untuk reset tampilan
    setSelectedGedungId("");
    setRuanganPilihan([]);
    try {
      const response = await axios.get("http://localhost:8000/api/gedungjumlahldanr");
      setGedungList(response.data);
    } catch (error) {
      console.error("Gagal mengambil daftar gedung:", error);
    }
  };

  const handleGedungClick = async (gedungId) => {
    setSelectedGedungId(gedungId);
    setShowRuanganOnly(true);

    const currentItem = data.find((item) => item.id === selectedItemId);
    if (!currentItem) return;

    try {
      // Ambil ruangan berdasarkan gedung
      const responseRuangan = await axios.get(`http://localhost:8000/api/ruangan/${gedungId}`);
      const allRuangan = responseRuangan.data;

      // Ambil ruangan yang sudah terpakai di waktu yang sama
      const responseTerpakai = await axios.post(`http://localhost:8000/api/penjadwalanruanganadminpengelola/ruangan-terpakai`, {
        hari: currentItem.hari,
        jammulai: currentItem.jammulai,
        jamselesai: currentItem.jamselesai,
      });

      const terpakaiIds = responseTerpakai.data.ruangan_terpakai;

      // Tandai mana yang terpakai
      const ruanganDenganStatus = allRuangan.map((r) => ({
        ...r,
        terpakai: terpakaiIds.includes(r.id),
      }));

      setRuanganPilihan(ruanganDenganStatus);
    } catch (error) {
      console.error("Gagal mengambil data ruangan:", error);
    }
  };

  const handleGedungChange = async (e) => {
    const id = e.target.value;
    setSelectedGedungId(id);
    try {
      const response = await axios.get(`http://localhost:8000/api/ruangan/${id}`);
      setRuanganPilihan(response.data);
    } catch (error) {
      console.error("Gagal mengambil ruangan:", error);
    }
  };

  const handleSimpanRuangan = async (ruangan_Id) => {
    try {
      // Cari data item yang sedang diedit
      const currentItem = data.find((item) => item.id === selectedItemId);
      if (!currentItem) {
        swal("Error", "Data jadwal tidak ditemukan", "error");
        return;
      }

      // Kirim juga hari, jammulai, jamselesai ke backend untuk validasi bentrok
      await axios.put(`http://localhost:8000/api/penjadwalanruanganadminpengelola/updateruangan/${selectedItemId}`, {
        ruangan_id: ruangan_Id,
        hari: currentItem.hari,
        jammulai: currentItem.jammulai,
        jamselesai: currentItem.jamselesai,
      });

      // Update state lokal
      const selectedRuangan = ruanganPilihan.find((r) => r.id === ruangan_Id);
      setData((prev) => prev.map((item) => (item.id === selectedItemId ? { ...item, ruangan_id: ruangan_Id, ruangan: selectedRuangan } : item)));

      setShowModal(false);
      setSelectedGedungId("");
      setRuanganPilihan([]);
      swal("Berhasil!", "Ruangan berhasil dijadwalkan.", "success");
    } catch (error) {
      if (error.response && error.response.status === 422) {
        // Kalau error validasi bentrok jadwal dari backend
        swal("Gagal!", error.response.data.message || "Ruangan sudah dijadwalkan pada hari dan jam tersebut.", "warning");
      } else {
        console.error("Gagal menyimpan ruangan:", error);
        swal("Gagal!", "Terjadi kesalahan saat menjadwalkan ruangan.", "error");
      }
    }
  };
  const handleDetailClick = (id) => {
    navigate(`/penjadwalanRuangan/detail/${id}`);
  };

  const filteredData = data.filter((row) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      String(row.mahasiswa?.nama_lengkap || "")
        .toLowerCase()
        .includes(search) ||
      String(row.matakuliah?.namamatakuliah || "")
        .toLowerCase()
        .includes(search) ||
      String(row.dosen?.nama || "")
        .toLowerCase()
        .includes(search) ||
      String(row.hari || "")
        .toLowerCase()
        .includes(search) ||
      String(row.ruangan.name || "")
        .toLowerCase()
        .includes(search);
    const matchesHari = selectedHari ? row.hari === selectedHari : true;
    const matchesRuangan = selectedRuangan ? row.ruangan?.name === selectedRuangan : true;
    const matchesMatakuliah = selectedMatakuliah ? row.matakuliah?.namamatakuliah === selectedMatakuliah : true;
    const matchesDosen = selectedDosen ? row.dosen?.nama === selectedDosen : true;
    const matchesRuanganFilter = filterTanpaRuangan ? !row.ruangan_id : true;
    const matchesKelas = selectedKelas ? row.kelas?.nama === selectedKelas : true;
    const matchesJurusan = selectedJurusan ? row.mahasiswa?.jurusan?.namajurusan === selectedJurusan : true;
    const matchesProdi = selectedProdi ? row.prodi?.namaprodi === selectedProdi : true;

    return matchesSearch && matchesRuanganFilter && matchesHari && matchesRuangan && matchesMatakuliah && matchesDosen && matchesRuanganFilter && matchesKelas && matchesJurusan && matchesProdi;
  });

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const displayedItems = filteredData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

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
    setSelectedJurusan("");
    setSelectedProdi("");
    setSelectedHari("");
    setSelectedRuangan("");
    setSelectedMatakuliah("");
    setSelectedDosen("");
    setSelectedKelas("");
    setFilterTanpaRuangan(false); // reset checkbox juga
  };

  return (
    <>
      <Navbar />
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap", // responsif di layar kecil
            }}
          >
            <Select
              value={selectedPageOption} // Menampilkan label aktif
              options={[
                { label: "Penjadwalan Ruangan", value: "/PenjadwalanRuanganPengelola" },
                { label: "Jadwal Berlangsung", value: "/persetujuanpengembaliansesuaijadwal" },
              ]}
              onChange={(selected) => {
                if (selected) {
                  setSelectedPageOption(selected); // Update tampilan label aktif
                  navigate(selected.value); // Navigasi ke halaman
                }
              }}
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({
                  ...base,
                  fontSize: "0.85rem",
                }),
              }}
            />
            {/* Tombol Reset */}
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
          </Box>
          <Divider sx={{ mb: 0.5, mt: 1 }} />

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 0.5, alignItems: "flex-end" }}>
            <Select
              options={jurusanOptions}
              value={selectedJurusan ? { value: selectedJurusan, label: selectedJurusan } : null}
              onChange={(e) => setSelectedJurusan(e?.value || "")}
              placeholder="Filter jurusan"
              isClearable
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, minWidth: 140, maxWidth: "100%", fontSize: "0.80rem" }),
              }}
            />
            <Select
              options={prodiOptions}
              value={selectedProdi ? { value: selectedProdi, label: selectedProdi } : null}
              onChange={(e) => setSelectedProdi(e?.value || "")}
              placeholder="Filter Prodi"
              isClearable
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, minWidth: 140, maxWidth: "100%", fontSize: "0.80rem" }),
              }}
            />

            <Select
              options={hariOptions}
              value={selectedHari ? { value: selectedHari, label: selectedHari } : null}
              onChange={(e) => setSelectedHari(e?.value || "")}
              placeholder="Filter Hari"
              isClearable
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, minWidth: 120, maxWidth: "100%", fontSize: "0.75rem" }),
              }}
            />

            <Select
              options={ruanganOptions}
              value={selectedRuangan ? { value: selectedRuangan, label: selectedRuangan } : null}
              onChange={(e) => setSelectedRuangan(e?.value || "")}
              placeholder="Filter Ruangan"
              isClearable
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, minWidth: 140, maxWidth: "100%", fontSize: "0.80rem" }),
              }}
            />

            <Select
              options={matakuliahOptions}
              value={selectedMatakuliah ? { value: selectedMatakuliah, label: selectedMatakuliah } : null}
              onChange={(e) => setSelectedMatakuliah(e?.value || "")}
              placeholder="Filter Mata Kuliah"
              isClearable
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, minWidth: 160, maxWidth: "100%", fontSize: "0.80rem" }),
              }}
            />

            <Select
              options={dosenOptions}
              value={selectedDosen ? { value: selectedDosen, label: selectedDosen } : null}
              onChange={(e) => setSelectedDosen(e?.value || "")}
              placeholder="Filter Dosen"
              isClearable
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, minWidth: 140, maxWidth: "100%", fontSize: "0.80rem" }),
              }}
            />

            <Select
              options={kelasOptions}
              value={selectedKelas ? { value: selectedKelas, label: selectedKelas } : null}
              onChange={(e) => setSelectedKelas(e?.value || "")}
              placeholder="Filter Kelas"
              isClearable
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, minWidth: 140, maxWidth: "100%", fontSize: "0.80rem" }),
              }}
            />
          </Box>

          {/* Checkbox langsung di bawah Select, dengan jarak sangat kecil */}
          <FormControlLabel
            control={
              <Checkbox
                checked={filterTanpaRuangan}
                onChange={() => setFilterTanpaRuangan((prev) => !prev)}
                sx={{
                  "& .MuiSvgIcon-root": {
                    fontSize: 18,
                    color: "#888",
                    marginTop: 0,
                    marginRight: 0, // jarak kecil antara checkbox dan label
                  },
                  paddingTop: 0,
                  paddingBottom: 0,
                  marginTop: 0,
                  marginBottom: 0,
                }}
              />
            }
            label="Tampilkan hanya yang belum punya ruangan"
            sx={{
              fontStyle: "italic",
              color: "#888888",
              marginTop: 0,
              marginBottom: 0,
              "& .MuiFormControlLabel-label": {
                fontStyle: "italic",
                color: "#888888",
                fontSize: "0.75rem",
                marginTop: 0,
                marginBottom: 0,
              },
            }}
          />
        </Box>
        <Divider sx={{ mb: 2, mt: 1 }} />

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
              onChange={(e) => handleSearch(e.target.value)}
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

      {/* Table */}
      <TableContainer
        sx={{
          width: "100%",
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
                <CustomSortLabel active={orderBy === "jurusanmahasiswa_id"} direction={order} onClick={() => handleSort("jurusanmahasiswa_id")} label="Jurusan" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "prodi_id"} direction={order} onClick={() => handleSort("prodi_id")} label="Prodi" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "ruangan_id"} direction={order} onClick={() => handleSort("ruangan_id")} label="Ruangan" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "detail"} direction={order} onClick={() => handleSort("detail")} label="Detail" />
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
                <TableCell sx={cellStyle}>{item.kelas?.nama || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.mahasiswa?.nama_lengkap || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.matakuliah?.namamatakuliah || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.dosen?.nama || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.mahasiswa?.jurusan?.namajurusan || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.prodi?.namaprodi || "-"}</TableCell>
                <TableCell sx={cellStyle}>
                  <Tooltip title="Klik untuk memilih ruangan" arrow>
                    <Box
                      onClick={() => handleOpenModal(item.id)}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: item.ruangan?.name ? "#0C20B5" : "#1976d2",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "1.5px solid",
                        borderColor: item.ruangan?.name ? "#0C20B5" : "#1976d2",
                        borderRadius: 1,
                        padding: "4px 8px",
                        transition: "all 0.3s ease",
                        backgroundColor: item.ruangan?.name ? "#f5f7ff" : "#e3f2fd",
                        "&:hover": {
                          backgroundColor: item.ruangan?.name ? "#0C20B5" : "#1976d2",
                          color: "#fff",
                          borderColor: item.ruangan?.name ? "#0C20B5" : "#1976d2",
                        },
                        userSelect: "none",
                      }}
                    >
                      {item.ruangan?.name || "Pilih Ruangan"}
                      <BsDoorOpen size={18} />
                    </Box>
                  </Tooltip>
                </TableCell>
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

      {/* Modal for Ruangan Selection */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setShowRuanganOnly(false); // reset saat modal ditutup
          setSelectedGedungId(null);
          setRuanganPilihan([]);
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            position: "absolute",
            top: "50%",
            left: "50%",
            boxShadow: 24, // atur bayangan, opsional
            border: "none", // pastikan tidak ada border
            outline: "none", // hilangkan outline default
            transform: "translate(-50%, -50%)",
            overflowY: "auto",
            p: 4,
            borderRadius: 2,
            width: "80%",
            maxWidth: 700,
            maxHeight: "60vh",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {!showRuanganOnly ? (
            // Tampilkan daftar gedung
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 3 }}>
              {gedungList.length === 0 ? (
                <Typography>Tidak ada gedung.</Typography>
              ) : (
                gedungList.map((gedung) => (
                  <Grid item xs={12} sm={6} md={4} key={gedung.id}>
                    <Card
                      sx={{
                        width: 220,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        mt: 2, // margin-top
                        mb: 2, // margin-bottom
                        ml: 1, // margin-left
                        mr: 1, // margin-right
                        boxShadow: 3,
                        position: "relative",
                        cursor: "pointer",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.03)",
                          boxShadow: 6,
                        },
                      }}
                      onClick={() => handleGedungClick(gedung.id)}
                    >
                      {/* Wrapper gambar dengan efek hover */}
                      <Box
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "12px 12px 0 0",
                          "&:hover .overlay": {
                            opacity: 1,
                            pointerEvents: "auto",
                          },
                          "&:hover img": {
                            filter: "blur(4px)",
                            transition: "filter 0.3s ease",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={`http://localhost:8000/storage/${gedung.gambar}`}
                          alt={`Gambar ${gedung.name}`}
                          sx={{
                            height: 130,
                            objectFit: "cover",
                            width: "100%",
                            transition: "filter 0.3s ease",
                            borderRadius: "12px 12px 0 0",
                          }}
                        />
                        {/* Overlay camera icon (opsional, bisa dihapus jika tak perlu upload) */}
                        <Box
                          className="overlay"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            bgcolor: "rgba(0, 0, 0, 0.4)",
                            opacity: 0,
                            transition: "opacity 0.3s ease",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            pointerEvents: "none",
                          }}
                        >
                          <Tooltip title="Lihat isi gedung" placement="top">
                            <InfoOutlinedIcon sx={{ fontSize: 48 }} />
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Nama Gedung */}
                      <CardContent sx={{ backgroundColor: "#fff", py: 1, px: 2 }}>
                        <Typography
                          variant="h5"
                          component="div"
                          sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: 16,
                          }}
                        >
                          {gedung.name}
                        </Typography>
                      </CardContent>

                      {/* Info Lantai & Ruangan */}
                      <CardContent sx={{ backgroundColor: "#f5f5f5", py: 1, px: 2, mb: -2 }}>
                        <Grid container spacing={2} justifyContent="center" alignItems="center">
                          <Grid item xs={6}>
                            <Box textAlign="center">
                              <Typography fontSize={15} fontWeight="bold" color="text.secondary">
                                {gedung.lantai_tertinggi || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Lantai
                              </Typography>
                            </Box>
                          </Grid>

                          <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "#ccc" }} />

                          <Grid item xs={6}>
                            <Box textAlign="center">
                              <Typography fontSize={15} fontWeight="bold" color="text.secondary">
                                {gedung.jumlah_ruangan || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Ruangan
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          ) : (
            // Tampilkan daftar ruangan saja
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<span style={{ fontWeight: "bold", fontSize: "15px" }}>←</span>}
                  onClick={() => {
                    setShowRuanganOnly(false);
                    setRuanganPilihan([]);
                    setSelectedGedungId(null);
                    setSearchRuanganTerm(""); // reset search saat kembali
                  }}
                  sx={{
                    backgroundColor: "#0C20B5",
                    color: "white",
                    textTransform: "none",
                    fontWeight: 500,
                    height: "35px",
                    fontSize: "0.9rem !important",
                    borderRadius: 1,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#081780",
                      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
                    },
                  }}
                >
                  Kembali ke Pilih Gedung
                </Button>

                <Box sx={{ flex: "1" }}>
                  <TextField
                    size="small"
                    placeholder="Cari ruangan..."
                    value={searchRuanganTerm}
                    onChange={(e) => setSearchRuanganTerm(e.target.value)}
                    fullWidth
                    sx={{
                      width: "100%", // ⬅️ Ganti panjang sesuai kebutuhan
                      fontSize: "0.70rem",
                      "& input": { fontSize: "0.70rem", py: 0.7 }, // perkecil input text
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
                        >
                          <BsSearch />
                        </Button>
                      ),
                    }}
                  />
                </Box>
              </Box>
              <Divider sx={{ mb: 5, borderColor: "#ccc", borderWidth: 1 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, mt: -4 }}>
                <Box sx={{ width: 17, height: 17, backgroundColor: "gray", borderRadius: "4px" }} />
                <Typography sx={{ color: "#2c3e50", fontWeight: "600", fontSize: "12px" }}>Ruangan Sudah Dijadwalkan</Typography>
              </Box>

              {(() => {
                const semuaRuanganCocok = ruanganPilihan.filter((r) => r.name.toLowerCase().includes(searchRuanganTerm.toLowerCase()));

                if (searchRuanganTerm) {
                  // Saat search aktif, tampilkan lantai yang punya ruangan cocok saja
                  if (semuaRuanganCocok.length === 0) {
                    return (
                      <Typography variant="body1" sx={{ textAlign: "center", mt: 5, color: "gray" }}>
                        Ruangan tidak ditemukan.
                      </Typography>
                    );
                  }

                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                      {Array.from({ length: lantaiTertinggi }, (_, i) => {
                        const lantai = i + 1;
                        const ruanganLantai = (ruanganByLantai[lantai] || []).filter((r) => r.name.toLowerCase().includes(searchRuanganTerm.toLowerCase()));

                        if (ruanganLantai.length === 0) return null; // sembunyikan lantai tanpa ruangan cocok

                        return (
                          <Box key={lantai} sx={{ minWidth: 150, maxWidth: 150 }}>
                            <Box
                              sx={{
                                backgroundColor: "#e0e0e0",
                                borderRadius: 1.5,
                                px: 2,
                                py: 0.5,
                                mb: 2,
                                display: "flex", // Tambahkan ini
                                alignItems: "center", // Pusatkan secara vertikal
                                justifyContent: "center", // Pusatkan secara horizontal
                                width: "auto",
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "14px",
                                  color: "#333",
                                }}
                              >
                                Lantai {lantai}
                              </Typography>
                            </Box>

                            <Grid container spacing={2} justifyContent="center">
                              {ruanganLantai.map((r) => (
                                <Grid item xs={6} sm={4} md={1} key={r.id}>
                                  <Box
                                    onClick={() => !r.terpakai && handleSimpanRuangan(r.id)}
                                    sx={{
                                      border: "1.5px solid",
                                      borderColor: r.terpakai ? "#ccc" : "#0C20B5",
                                      borderRadius: 1.5,
                                      padding: 1,
                                      textAlign: "center",
                                      cursor: r.terpakai ? "not-allowed" : "pointer",
                                      fontWeight: 6,
                                      fontWeight: 600,
                                      fontSize: "12px",
                                      color: r.terpakai ? "#aaa" : "#0C20B5",
                                      backgroundColor: r.terpakai ? "#f0f0f0" : "#f5f7ff",
                                      transition: "0.3s",
                                      "&:hover": {
                                        backgroundColor: r.terpakai ? "#f0f0f0" : "#0C20B5",
                                        color: r.terpakai ? "#aaa" : "#fff",
                                      },
                                    }}
                                  >
                                    {r.name}
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        );
                      })}
                    </Box>
                  );
                } else {
                  // Saat search kosong, tampilkan semua lantai
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
                      {Array.from({ length: lantaiTertinggi }, (_, i) => {
                        const lantai = i + 1;
                        const ruanganLantai = ruanganByLantai[lantai] || [];

                        return (
                          <Box key={lantai} sx={{ minWidth: 150, maxWidth: 150 }}>
                            <Box
                              sx={{
                                backgroundColor: "#e0e0e0",
                                borderRadius: 1.5,
                                px: 2,
                                py: 0.5,
                                mb: 2,
                                display: "flex", // Tambahkan ini
                                alignItems: "center", // Pusatkan secara vertikal
                                justifyContent: "center", // Pusatkan secara horizontal
                                width: "auto",
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "14px",
                                  color: "#333",
                                }}
                              >
                                Lantai {lantai}
                              </Typography>
                            </Box>

                            {ruanganLantai.length === 0 ? (
                              <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic", color: "gray" }}>
                                Tidak ada ruangan.
                              </Typography>
                            ) : (
                              <Grid container spacing={2} justifyContent="center">
                                {ruanganLantai.map((r) => (
                                  <Grid item xs={6} sm={4} md={1} key={r.id}>
                                    <Box
                                      onClick={() => !r.terpakai && handleSimpanRuangan(r.id)}
                                      sx={{
                                        border: "1.5px solid",
                                        borderColor: r.terpakai ? "#ccc" : "#0C20B5",
                                        borderRadius: 1.5,
                                        padding: 1,
                                        textAlign: "center",
                                        cursor: r.terpakai ? "not-allowed" : "pointer",
                                        fontWeight: 600,
                                        fontSize: "12px",
                                        color: r.terpakai ? "#aaa" : "#0C20B5",
                                        backgroundColor: r.terpakai ? "#f0f0f0" : "#f5f7ff",
                                        transition: "0.3s",
                                        "&:hover": {
                                          backgroundColor: r.terpakai ? "#f0f0f0" : "#0C20B5",
                                          color: r.terpakai ? "#aaa" : "#fff",
                                        },
                                      }}
                                    >
                                      {r.name}
                                    </Box>
                                  </Grid>
                                ))}
                              </Grid>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  );
                }
              })()}
            </>
          )}
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

export default PenjadwalanRuanganAdminPengelola;
