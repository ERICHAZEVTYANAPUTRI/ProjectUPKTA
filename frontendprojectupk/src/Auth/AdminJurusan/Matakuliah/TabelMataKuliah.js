import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Checkbox, DialogActions, DialogContent, Divider, Grid, MenuItem, Modal, Select as MuiSelect, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { BiRefresh } from "react-icons/bi";
import { BsBook, BsPencil, BsSearch, BsTrash } from "react-icons/bs";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // <-- Ini untuk react-select
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";
import "../DataDosen/DataDosen.css"; // Import any custom styles if needed

const DataMatakuliah = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [matakuliahList, setMatakuliahList] = useState([]);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const [selectedTahunAjaranSelect, setSelectedTahunAjaranSelect] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [modalTahunOpen, setModalTahunOpen] = useState(false);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset ke halaman pertama
  };

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";

    const sorted = [...matakuliahList].sort((a, b) => {
      if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
      if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setOrder(newOrder);
    setOrderBy(column);
    setMatakuliahList(sorted);
  };
  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/tahunajaran", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedTahun = response.data.sort((a, b) => b.is_aktif - a.is_aktif);
        setTahunAjaranList(sortedTahun);

        if (sortedTahun.length > 0) {
          const aktif = sortedTahun.find((item) => item.is_aktif === 1);
          if (aktif) {
            setSelectedTahunAjaranSelect({
              value: aktif.id,
              label: `${aktif.tahun} - Semester ${aktif.semester} (Aktif)`,
            });
          }
        }
        setTahunAjaranList(sortedTahun);
      } catch (error) {
        console.error("Gagal memuat tahun ajaran:", error);
      }
    };
    const fetchMatakuliah = async () => {
      try {
        const token = localStorage.getItem("token");

        const userResponse = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = userResponse.data;
        setUser(userData);

        const matakuliahResponse = await axios.get("http://localhost:8000/api/matakuliah", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filtered = matakuliahResponse.data.filter((mk) => mk.adminjurusan?.kodejurusan === userData.kodejurusan);

        setMatakuliahList(filtered);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };
    fetchTahunAjaran();
    fetchMatakuliah();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(0);
  };

  const handleUpdate = (mk) => {
    openEditModal(mk);
  };

  const filteredData = matakuliahList.filter((mk) => {
    // Cek apakah tahun ajaran aktif
    const isAktif = mk.tahun_ajaran?.is_aktif === 1;

    // Kalau belum pilih apa-apa, hanya tampilkan matkul dari tahun ajaran aktif
    if (!selectedTahunAjaranSelect) {
      return isAktif;
    }

    // Jika sudah memilih, cocokkan berdasarkan tahunajaran_id
    if (mk.tahunajaran_id !== selectedTahunAjaranSelect.value) {
      return false;
    }

    // Lanjutkan filter pencarian teks
    const term = searchTerm.toLowerCase();
    return (
      (mk.namamatakuliah || "").toLowerCase().includes(term) ||
      (mk.kodematakuliah || "").toLowerCase().includes(term) ||
      (mk.tahun_ajaran?.tahun || "").toLowerCase().includes(term) ||
      (mk.kurikulum?.nama || "").toLowerCase().includes(term) ||
      (mk.prodi?.namaprodi || "").toLowerCase().includes(term) ||
      (mk.tipe || "").toLowerCase().includes(term) ||
      String(mk.semester || "")
        .toLowerCase()
        .includes(term) ||
      String(mk.sks_total || "")
        .toLowerCase()
        .includes(term)
    );
  });

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const displayedItems = filteredData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const openTambahModal = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEditModal = (mk) => {
    setEditData(mk);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSaveMatakuliah = async (data, id = null) => {
    try {
      const token = localStorage.getItem("token");

      if (id) {
        await axios.put(`http://localhost:8000/api/matakuliah/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        swal("Berhasil!", "Data matakuliah berhasil diperbarui.", "success");
      } else {
        data.kodejurusan = user.kodejurusan;
        data.id_jurusan = user.id_jurusan;
        data.adminjurusan_id = user.id;

        await axios.post(`http://localhost:8000/api/matakuliah/store`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        swal("Berhasil!", "Data matakuliah berhasil ditambahkan.", "success");
      }

      const matakuliahResponse = await axios.get("http://localhost:8000/api/matakuliah", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = matakuliahResponse.data.filter((mk) => mk.adminjurusan?.kodejurusan === user.kodejurusan);
      setMatakuliahList(filtered);
      closeModal();
    } catch (error) {
      console.error("Gagal menyimpan data matakuliah:", error);
      const message = error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      swal("Gagal!", message, "error");
    }
  };
  const handleDelete = async (id) => {
    swal({
      title: "Yakin ingin menghapus?",
      text: "Data matakuliah yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      buttons: ["Batal", "Hapus"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const token = localStorage.getItem("token");

          await axios.delete(`http://localhost:8000/api/matakuliah/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setMatakuliahList((prev) => prev.filter((mk) => mk.id !== id));
          swal("Terhapus!", "Data matakuliah berhasil dihapus.", "success");
        } catch (error) {
          console.error("Gagal menghapus matakuliah:", error);
          const message = error.response?.data?.message || "Terjadi kesalahan saat menghapus data.";
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

  return (
    <>
      <ModalMatakuliah open={modalOpen} handleClose={closeModal} onSave={handleSaveMatakuliah} initialData={editData} />
      <Navbar />
      <Box sx={{ mb: 2 }}>
        {/* Tombol tambah di kanan atas */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Select
              options={tahunAjaranList.map((item) => ({
                value: item.id,
                label: `${item.tahun} - Semester ${item.semester} ${item.is_aktif ? "(Aktif)" : "(Nonaktif)"}`,
                is_aktif: item.is_aktif, // ⬅️ tambahkan ini!
              }))}
              value={selectedTahunAjaranSelect}
              onChange={(selectedOption) => {
                if (!selectedOption) {
                  const activeOption = tahunAjaranList.find((item) => item.is_aktif);
                  if (activeOption) {
                    setSelectedTahunAjaranSelect({
                      value: activeOption.id,
                      label: `${activeOption.tahun} - Semester ${activeOption.semester} (Aktif)`,
                      is_aktif: true,
                    });
                  } else {
                    setSelectedTahunAjaranSelect(null); // fallback jika tidak ada yang aktif
                  }
                } else {
                  setSelectedTahunAjaranSelect(selectedOption);
                }

                setCurrentPage(0); // reset ke halaman pertama
              }}
              placeholder="Pilih Tahun Ajaran"
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {selectedIds.length > 0 && (
              <Button
                onClick={() => setModalTahunOpen(true)}
                variant="outlined"
                color="secondary"
                size="small"
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
                <BiRefresh fontSize={18} /> Perbarui Tahun Ajaran
              </Button>
            )}

            {/* Kanan - Tombol Tambah */}
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
              <BsBook style={{ fontSize: "18px" }} />
              Tambah Matakuliah
            </Button>
          </Box>
        </Box>

        {/* Garis pemisah */}
        <Divider sx={{ mb: 2 }} />

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

      {/* Mata Kuliah Table */}
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
        <Table aria-label="Data Matakuliah" sx={{ width: "100%", minWidth: 600, tableLayout: "auto" }}>
          <TableHead sx={{ backgroundColor: "#0C20B5" }}>
            <TableRow>
              <TableCell padding="checkbox" sx={headStyle}>
                <Checkbox
                  size="small"
                  sx={{
                    p: "5px",
                    "& .MuiSvgIcon-root": {
                      fontSize: 18,
                      backgroundColor: "#fff", // putih di dalam kotak
                      borderRadius: "4px",
                      border: "1px solid #ccc", // tambahkan outline agar terlihat
                    },
                    "&.Mui-checked .MuiSvgIcon-root": {
                      backgroundColor: "#1976d2", // warna kotak saat dicentang
                      color: "#fff", // warna centangnya
                    },
                  }}
                  color="primary"
                  checked={selectedIds.length === displayedItems.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(displayedItems.map((mk) => mk.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "kodematakuliah"} direction={order} onClick={() => handleSort("kodematakuliah")} label="Kode" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "namamatakuliah"} direction={order} onClick={() => handleSort("namamatakuliah")} label="Nama" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "sks_total"} direction={order} onClick={() => handleSort("sks_total")} label="Sks" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "tipe"} direction={order} onClick={() => handleSort("tipe")} label="Tipe" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "tahunajaran_id"} direction={order} onClick={() => handleSort("tahunajaran_id")} label="Tahun Ajaran" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "semester"} direction={order} onClick={() => handleSort("semester")} label="Semester" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "kurikulum_id"} direction={order} onClick={() => handleSort("kurikulum_id")} label="Kurikulum" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "prodi_id"} direction={order} onClick={() => handleSort("prodi_id")} label="Prodi" />
              </TableCell>
              <TableCell sx={{ ...headStyle, width: "15%" }}>
                <CustomSortLabel active={orderBy === "aksi"} direction={order} onClick={() => handleSort("aksi")} label="Aksi" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedItems.map((mk, index) => (
              <TableRow key={mk.id} hover sx={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff" }}>
                <TableCell padding="checkbox" sx={cellStyle}>
                  <Checkbox
                    color="primary"
                    size="small"
                    sx={{
                      p: "5px",
                      "& .MuiSvgIcon-root": {
                        fontSize: 18,
                        backgroundColor: "#fff", // putih di dalam kotak
                        borderRadius: "4px",
                        border: "1px solid #ccc", // tambahkan outline agar terlihat
                      },
                      "&.Mui-checked .MuiSvgIcon-root": {
                        backgroundColor: "#1976d2", // warna kotak saat dicentang
                        color: "#fff", // warna centangnya
                      },
                    }}
                    checked={selectedIds.includes(mk.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds((prev) => [...prev, mk.id]);
                      } else {
                        setSelectedIds((prev) => prev.filter((id) => id !== mk.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={cellStyle}>{mk.kodematakuliah}</TableCell>
                <TableCell sx={cellStyle}>{mk.namamatakuliah}</TableCell>
                <TableCell sx={cellStyle}>{mk.sks_total}</TableCell>
                <TableCell sx={cellStyle}>{mk.tipe}</TableCell>
                <TableCell sx={cellStyle}>{mk.tahun_ajaran ? `${mk.tahun_ajaran.tahun} - ${mk.tahun_ajaran.semester}` : "—"}</TableCell>
                <TableCell sx={cellStyle}>{mk.semester}</TableCell>
                <TableCell sx={cellStyle}>{mk.kurikulum?.nama || "—"}</TableCell>
                <TableCell sx={cellStyle}>{mk.prodi?.namaprodi || "—"}</TableCell>
                <TableCell sx={cellStyle}>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title="Edit data" arrow>
                      <Box
                        onClick={() => handleUpdate(mk)}
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
                        onClick={() => handleDelete(mk.id)}
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

      <Modal open={modalTahunOpen} onClose={() => setModalTahunOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            minWidth: { xs: 280, sm: 400 },
            width: "90%",
            maxWidth: 420,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Pilih Tahun Ajaran Baru
          </Typography>

          <Select
            styles={customStyles}
            placeholder="Pilih tahun ajaran..."
            options={tahunAjaranList.map((ta) => ({
              label: `${ta.tahun} - ${ta.semester}${ta.is_aktif ? " (Aktif)" : ""}`,
              value: ta.id,
              is_aktif: ta.is_aktif,
            }))}
            onChange={async (selected) => {
              if (!selected) return;
              const tahunajaran_id = selected.value;
              try {
                const token = localStorage.getItem("token");

                await Promise.all(selectedIds.map((id) => axios.put(`http://localhost:8000/api/matakuliah/update-tahunajaran/${id}`, { tahunajaran_id }, { headers: { Authorization: `Bearer ${token}` } })));

                swal("Berhasil!", "Tahun ajaran berhasil diperbarui.", "success");
                setSelectedIds([]);
                setModalTahunOpen(false);

                const res = await axios.get("http://localhost:8000/api/matakuliah", {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const filtered = res.data.filter((mk) => mk.adminjurusan?.kodejurusan === user.kodejurusan);
                setMatakuliahList(filtered);
              } catch (err) {
                console.error(err);
                swal("Gagal", "Terjadi kesalahan saat memperbarui tahun ajaran.", "error");
              }
            }}
          />
        </Box>
      </Modal>
    </>
  );
};
const customStyles = {
  control: (base) => ({
    ...base,
    padding: 2,
    borderRadius: 6,
    borderColor: "#d1d5db",
    boxShadow: "none",
    "&:hover": { borderColor: "#1976d2" },
    fontSize: 14,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    fontSize: 14,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#E3F2FD" : "#fff",
    color: "#333",
    fontWeight: state.data.is_aktif ? "bold" : "normal",
    fontSize: 14,
  }),
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

const ModalMatakuliah = ({ open, handleClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    kodematakuliah: "",
    namamatakuliah: "",
    prodi_id: "",
    kurikulum_id: "",
    tahunajaran_id: "",
    tipe: "",
    semester: "",
    sks_total: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        namamatakuliah: initialData.namamatakuliah,
        kodematakuliah: initialData.kodematakuliah,
        prodi_id: initialData.prodi_id,
        kurikulum_id: initialData.kurikulum_id,
        tahunajaran_id: initialData.tahunajaran_id,
        tipe: initialData.tipe,
        semester: initialData.semester,
        sks_total: initialData.sks_total,
      });
    } else {
      setFormData({ namamatakuliah: "", kodematakuliah: "", prodi_id: "", kurikulum_id: "", tahunajaran_id: "", sks_total: "", semester: "" });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const tipeOptions = [
    { value: "praktikum", label: "Praktikum" },
    { value: "teori", label: "Teori" },
  ];

  const handleSubmit = () => {
    onSave(formData, initialData?.id); // ✅ sudah benar
  };
  const [authUser, setAuthUser] = useState(null);
  const [prodiOptions, setProdiOptions] = useState([]);
  const [kurikulumOptions, setKurikulumOptions] = useState([]);
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);

  // Ambil user login dari API
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // pastikan token tersimpan
        },
      })
      .then((res) => {
        setAuthUser(res.data);
      })
      .catch((err) => {
        console.error("Gagal ambil user login", err);
      });
  }, []);

  // Ambil prodi berdasarkan adminjurusan_id setelah user didapat
  useEffect(() => {
    if (authUser) {
      // Ambil data Prodi
      axios
        .get("http://localhost:8000/api/prodi")
        .then((res) => {
          const filtered = res.data.filter((prodi) => prodi.adminjurusan_id === authUser.id);
          setProdiOptions(filtered);
        })
        .catch((err) => {
          console.error("Gagal ambil data prodi", err);
        });

      // Ambil data Kurikulum (hanya yang is_aktif === 1)
      axios
        .get("http://localhost:8000/api/kurikulum")
        .then((res) => {
          const filtered = res.data.filter((kur) => kur.adminjurusan_id === authUser.id && kur.is_aktif === 1);
          setKurikulumOptions(filtered);
        })
        .catch((err) => {
          console.error("Gagal ambil data kurikulum", err);
        });

      // Ambil data Tahun Ajaran (hanya yang is_aktif === 1)
      axios
        .get("http://localhost:8000/api/tahunajaran")
        .then((res) => {
          const filtered = res.data.filter((th) => th.adminjurusan_id === authUser.id && th.is_aktif === 1);
          setTahunAjaranOptions(filtered);
        })
        .catch((err) => {
          console.error("Gagal ambil data tahun ajaran", err);
        });
    }
  }, [authUser]);
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
        {/* Title */}
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
          {initialData ? "Edit Matakuliah" : "Tambah Matakuliah"}
        </Typography>

        <Grid item xs={12} sx={{ position: "relative", marginTop: "20px", marginBottom: "18px" }}>
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

        {/* Content */}
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
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Kode Matakuliah
            </Typography>
            <TextField
              fullWidth
              name="kodematakuliah"
              placeholder="Masukkan Kode Matakuliah..."
              value={formData.kodematakuliah}
              onChange={handleChange}
              margin="normal"
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
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Nama Matakuliah
            </Typography>
            <TextField
              fullWidth
              name="namamatakuliah"
              value={formData.namamatakuliah}
              onChange={handleChange}
              margin="normal"
              placeholder="Masukkan Nama Matakuliah..."
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
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
            <Typography variant="body2" sx={{ marginBottom: "6px", color: "#333" }}>
              Tahun Ajaran
            </Typography>
            <Select
              name="tahunajaran_id"
              options={tahunAjaranOptions.map((item) => ({
                value: item.id,
                label: `${item.tahun} - ${item.semester}`,
              }))}
              value={tahunAjaranOptions
                .map((item) => ({
                  value: item.id,
                  label: `${item.tahun} - ${item.semester}`,
                }))
                .find((opt) => opt.value === formData.tahunajaran_id)}
              onChange={(selectedOption) => setFormData({ ...formData, tahunajaran_id: selectedOption?.value || "" })}
              placeholder="Pilih Tahun Ajaran..."
              isClearable
              styles={customSelectStyles}
              menuPortalTarget={document.body}
            />
          </Box>
          <Box sx={{ marginBottom: "15px" }}>
            <Typography variant="body2" sx={{ marginBottom: "6px", color: "#333" }}>
              Nama Kurikulum
            </Typography>
            <Select
              name="kurikulum_id"
              options={kurikulumOptions.map((item) => ({
                value: item.id,
                label: item.nama,
              }))}
              value={kurikulumOptions.map((item) => ({ value: item.id, label: item.nama })).find((opt) => opt.value === formData.kurikulum_id)}
              onChange={(selectedOption) => setFormData({ ...formData, kurikulum_id: selectedOption?.value || "" })}
              placeholder="Pilih Kurikulum..."
              isClearable
              styles={customSelectStyles}
              menuPortalTarget={document.body}
            />
          </Box>
          <Box sx={{ marginBottom: "15px" }}>
            <Typography variant="body2" sx={{ marginBottom: "6px", color: "#333" }}>
              Nama Prodi
            </Typography>
            <Select
              name="prodi_id"
              options={prodiOptions.map((item) => ({
                value: item.id,
                label: item.namaprodi,
              }))}
              value={prodiOptions.map((item) => ({ value: item.id, label: item.namaprodi })).find((opt) => opt.value === formData.prodi_id)}
              onChange={(selectedOption) => setFormData({ ...formData, prodi_id: selectedOption?.value || "" })}
              placeholder="Pilih Prodi..."
              isClearable
              styles={customSelectStyles}
              menuPortalTarget={document.body}
            />
          </Box>
          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "6px", color: "#333" }}>
              Tipe
            </Typography>
            <Select
              name="tipe"
              options={tipeOptions}
              value={tipeOptions.find((opt) => opt.value === formData.tipe)}
              onChange={(selectedOption) => setFormData({ ...formData, tipe: selectedOption?.value || "" })}
              placeholder="Pilih Tipe..."
              isClearable
              styles={customSelectStyles}
              menuPortalTarget={document.body}
            />
          </Box>
          <Box sx={{ marginBottom: "15px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Semester
            </Typography>
            <TextField
              fullWidth
              name="semester"
              placeholder="Masukkan Smester..."
              value={formData.semester}
              onChange={handleChange}
              margin="normal"
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
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Total sks
            </Typography>
            <TextField
              fullWidth
              name="sks_total"
              placeholder="Masukkan Total Sks..."
              value={formData.sks_total}
              onChange={handleChange}
              margin="normal"
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
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
        <Grid item xs={12} sx={{ position: "relative", marginTop: "-0px", marginBottom: "-5px" }}>
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

        {/* Actions */}
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
    boxShadow: state.isFocused ? "0 0 0 2px rgba(12, 32, 181, 0.1)" : "0 2px 5px rgba(0, 0, 0, 0.1)",
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

export default DataMatakuliah;
