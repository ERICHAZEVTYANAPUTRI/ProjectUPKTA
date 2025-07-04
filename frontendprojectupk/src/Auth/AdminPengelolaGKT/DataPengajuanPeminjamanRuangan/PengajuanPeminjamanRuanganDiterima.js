import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, Divider, MenuItem, Select as MuiSelect, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { BsInfoCircle, BsSearch } from "react-icons/bs";
import { MdOutlineCancelScheduleSend } from "react-icons/md";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const PengajuanPeminjamanRuanganDiterima = () => {
  const [data, setData] = useState([]);
  const [pengajuan, setPengajuan] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const navigate = useNavigate();
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
  const [selectedJurusan, setSelectedJurusan] = useState(null);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const location = useLocation(); // untuk cek halaman aktif
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date()); // update waktu setiap 30 detik atau 1 menit
    }, 30000); // setiap 30 detik

    return () => clearInterval(interval); // clear saat komponen unmount
  }, []);

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

    const sorted = [...pengajuan].sort((a, b) => {
      if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
      if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setOrder(newOrder);
    setOrderBy(column);
    setPengajuan(sorted);
  };

  // ✅ Pindahkan ke luar useEffect agar bisa dipakai ulang
  const fetchPengajuan = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/peminjaman");
      setPengajuan(response.data);
    } catch (error) {
      console.error("Gagal mengambil data peminjaman:", error);
    }
  };

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(0);
  };

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuOpenId(id);
  };

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
            "http://localhost:8000/api/pengajuan-peminjamans/auto-batal",
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then((res) => {
            if (res.data.data.length > 0) {
              swal("Info", `${res.data.data.length} pengajuan kadaluarsa telah dibatalkan otomatis.`, "info");
            }
          });
        console.log("Pengajuan otomatis dibatalkan jika ada yang expired.");
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
          await axios.patch(`http://localhost:8000/api/pengajuan-peminjamans/${id}/batalkan`, {}, { headers: { Authorization: `Bearer ${token}` } });

          swal("Berhasil!", "Pengajuan telah dibatalkan.", "success");
          fetchPengajuan(); // Refresh data setelah update
        } catch (error) {
          console.error(error);
          swal("Gagal!", "Terjadi kesalahan saat membatalkan pengajuan.", "error");
        }
      }
    });
  };
  const isBatalkanEnabled = (item) => {
    const waktuMulai = new Date(`${item.tanggal}T${item.jammulai}`);
    const waktuBatas = new Date(waktuMulai.getTime() + 20 * 60000);

    const sudahLewat20Menit = currentTime >= waktuBatas;
    const statusBukanDipinjam = item.statuspeminjaman !== "dipinjam";

    return sudahLewat20Menit && statusBukanDipinjam;
  };
  const handleDetailClick = (id) => {
    navigate(`/pengajuanpeminjamanruangan/detail/${id}`);
    handleMenuClose();
  };

  const filteredPengajuan = pengajuan.filter((item) => {
    const nama = item.mahasiswa?.nama_lengkap?.toLowerCase() || "";
    const kelas = item.mahasiswa?.kelas?.nama?.toLowerCase() || "";
    const matakuliah = item.matakuliah?.namamatakuliah?.toLowerCase() || "";
    const dosen = item.dosen?.nama?.toLowerCase() || "";
    const namaruangan = item.namaruangan?.toLowerCase() || item.ruangan?.name?.toLowerCase() || "";
    const keperluan = item.keperluan?.toLowerCase() || "";
    const hari = item.hari?.toLowerCase() || "";
    const jurusan = item.mahasiswa?.jurusan?.namajurusan?.toLowerCase() || "";
    const prodi = item.mahasiswa?.prodi?.namaprodi?.toLowerCase() || "";

    const searchMatch =
      nama.includes(searchTerm.toLowerCase()) ||
      kelas.includes(searchTerm.toLowerCase()) ||
      matakuliah.includes(searchTerm.toLowerCase()) ||
      dosen.includes(searchTerm.toLowerCase()) ||
      namaruangan.includes(searchTerm.toLowerCase()) ||
      keperluan.includes(searchTerm.toLowerCase());

    const filterMatch =
      (!selectedHari || hari === selectedHari.toLowerCase()) &&
      (!selectedRuangan || namaruangan === selectedRuangan.toLowerCase()) &&
      (!selectedMatakuliah || matakuliah === selectedMatakuliah.toLowerCase()) &&
      (!selectedDosen || dosen === selectedDosen.toLowerCase()) &&
      (!selectedKelas || kelas === selectedKelas.toLowerCase()) &&
      (!selectedJurusan || jurusan === selectedJurusan.toLowerCase()) &&
      (!selectedProdi || prodi === selectedProdi.toLowerCase());

    return item.status === "diterima" && item.statuspeminjaman === "pending" && item.statusuploadvidio === "pending" && searchMatch && filterMatch;
  });
  const pageCount = Math.ceil(filteredPengajuan.length / rowsPerPage);
  const displayedItems = filteredPengajuan.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

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
  };

  return (
    <>
      <Navbar />
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
          {/* Header Section with Page Selector and Reset Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            {/* Page Navigation Select (LEFT) */}
            <Select
              options={[
                { value: "/PengajuanPeminjamanRuangan", label: "Pengajuan Peminjaman Ruangan" },
                { value: "/pengajuanpeminjamanditerima", label: "Pengajuan Peminjaman Diterima" },
              ]}
              value={location.pathname === "/pengajuanpeminjamanditerima" ? { value: "/pengajuanpeminjamanditerima", label: "Pengajuan Peminjaman Diterima" } : { value: "/PengajuanPeminjamanRuangan", label: "Pengajuan Peminjaman Ruangan" }}
              onChange={(e) => {
                if (e?.value) navigate(e.value); // ⬅️ tanpa reload
              }}
              placeholder="Pilih Halaman"
              isClearable={false}
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, minWidth: 240, fontSize: "0.85rem" }),
              }}
            />

            {/* Reset Filter Button (RIGHT) */}
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

          {/* Divider */}
          <Box sx={{ borderTop: "1px solid #ccc", mt: -1.5 }} />

          {/* Filter Selects Below */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Select
              options={jurusanOptions}
              value={selectedJurusan ? { value: selectedJurusan, label: selectedJurusan } : null}
              onChange={(e) => setSelectedJurusan(e?.value || "")}
              placeholder="Filter Jurusan"
              isClearable
              classNamePrefix="react-select"
              styles={{
                container: (base) => ({ ...base, minWidth: 140, fontSize: "0.80rem" }),
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
                container: (base) => ({ ...base, minWidth: 140, fontSize: "0.80rem" }),
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
                container: (base) => ({ ...base, minWidth: 120, fontSize: "0.75rem" }),
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
                container: (base) => ({ ...base, minWidth: 140, fontSize: "0.80rem" }),
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
                container: (base) => ({ ...base, minWidth: 160, fontSize: "0.80rem" }),
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
                container: (base) => ({ ...base, minWidth: 140, fontSize: "0.80rem" }),
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
                container: (base) => ({ ...base, minWidth: 140, fontSize: "0.80rem" }),
              }}
            />
          </Box>
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
        <Table aria-label="Tabel Pengajuan Peminjaman" sx={{ width: "100%", minWidth: 600, tableLayout: "auto" }}>
          <TableHead sx={{ backgroundColor: "#0C20B5" }}>
            <TableRow>
              <TableCell sx={{ ...headStyle, width: "5%" }}>
                <CustomSortLabel active={orderBy === "id"} direction={order} onClick={() => handleSort("id")} label="No" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "tanggal"} direction={order} onClick={() => handleSort("tanggal")} label="Tanggal" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "hari"} direction={order} onClick={() => handleSort("hari")} label="Hari" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "jammulai"} direction={order} onClick={() => handleSort("jammulai")} label="Jam" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "mahasiswa_id"} direction={order} onClick={() => handleSort("mahasiswa_id")} label="Kelas" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "mahasiswa_id"} direction={order} onClick={() => handleSort("mahasiswa_id")} label="Mahasiswa" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "matakuliah_id"} direction={order} onClick={() => handleSort("matakuliah_id")} label="Matakuliah" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "dosen_id"} direction={order} onClick={() => handleSort("dosen_id")} label="Dosen" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "ruangan_id"} direction={order} onClick={() => handleSort("ruangan_id")} label="Ruangan" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "keperluan"} direction={order} onClick={() => handleSort("keperluan")} label="Keperluan" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "detail"} direction={order} onClick={() => handleSort("detail")} label="Detail" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "cancel"} direction={order} onClick={() => handleSort("cancel")} label="Cancel" />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedItems.map((item, index) => (
              <TableRow key={item.id} hover sx={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff" }}>
                <TableCell sx={cellStyle}>{index + 1 + currentPage * rowsPerPage}</TableCell>
                <TableCell sx={cellStyle}>{item.tanggal || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.hari || "-"}</TableCell>
                <TableCell sx={cellStyle}>{`${item.jammulai || "-"} - ${item.jamselesai || "-"}`}</TableCell>
                <TableCell sx={cellStyle}>{item.mahasiswa?.kelas?.nama || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.mahasiswa?.nama_lengkap || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.matakuliah?.namamatakuliah || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.dosen?.nama || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.ruangan?.name || "-"}</TableCell>
                <TableCell sx={cellStyle}>{item.keperluan || "-"}</TableCell>
                <TableCell sx={cellStyle}>
                  <Tooltip title="Lihat Detail Pengajuan" arrow>
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
                  <Tooltip title="Batalkan Terima Pengajuan" arrow>
                    <Box
                      disabled={!isBatalkanEnabled(item)}
                      onClick={() => handleBatalClick(item.id)}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        cursor: isBatalkanEnabled(item) ? "pointer" : "not-allowed",
                        border: "1.5px solid #DC3545",
                        borderColor: isBatalkanEnabled(item) ? "#DC3545" : "#ccc",
                        color: isBatalkanEnabled(item) ? "#DC3545" : "#999",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: 1,
                        backgroundColor: isBatalkanEnabled(item) ? "#fff0f0" : "#f5f5f5",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: isBatalkanEnabled(item) ? "#DC3545" : "#f5f5f5",
                          color: isBatalkanEnabled(item) ? "#fff" : "#999",
                        },
                      }}
                    >
                      <MdOutlineCancelScheduleSend size={18} />
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

export default PengajuanPeminjamanRuanganDiterima;
