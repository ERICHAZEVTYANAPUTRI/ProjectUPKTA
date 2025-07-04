import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import { Box, Button, DialogActions, DialogContent, Divider, Grid, IconButton, MenuItem, Modal, Select as MuiSelect, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsJournalPlus, BsPencil, BsSearch, BsTrash } from "react-icons/bs";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // <-- Ini untuk react-select
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const DataKurikulum = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [kurikulumList, setKurikulumList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset ke halaman pertama
  };
  const handleToggleStatus = async (kur) => {
    const token = localStorage.getItem("token");
    const newStatus = !kur.is_aktif;

    try {
      await axios.put(
        `http://localhost:8000/api/kurikulum/${kur.id}/toggle-status`,
        {
          is_aktif: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update state setelah sukses
      setKurikulumList((prev) => prev.map((item) => (item.id === kur.id ? { ...item, is_aktif: newStatus } : item)));
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      swal("Gagal!", "Terjadi kesalahan saat mengubah status.", "error");
    }
  };

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";

    const sorted = [...kurikulumList].sort((a, b) => {
      if (a[column] < b[column]) return newOrder === "asc" ? -1 : 1;
      if (a[column] > b[column]) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setOrder(newOrder);
    setOrderBy(column);
    setKurikulumList(sorted);
  };

  useEffect(() => {
    const fetchKurikulum = async () => {
      try {
        const token = localStorage.getItem("token");

        const userResponse = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = userResponse.data;
        setUser(userData);

        const kurikulumResponse = await axios.get("http://localhost:8000/api/kurikulum", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filtered = kurikulumResponse.data.filter((kur) => kur.adminjurusan?.kodejurusan === userData.kodejurusan);

        setKurikulumList(filtered);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };
    const fetchProdi = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/prodi");
        setProdiList(res.data);
      } catch (error) {
        console.error("Error fetching data prodi:", error);
      }
    };

    fetchKurikulum();
    fetchProdi();
  }, []);

  const getNamaProdi = (idProdi) => {
    const prodi = prodiList.find((p) => p.id === idProdi); // GANTI dari 'nama' ke 'id'
    return prodi ? prodi.namaprodi : "Tidak diketahui";
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(0);
  };

  const handleUpdate = (kur) => {
    openEditModal(kur);
  };

  const filteredData = kurikulumList.filter((kur) => {
    const term = searchTerm.toLowerCase();

    return (
      kur.nama?.toLowerCase().includes(term) ||
      kur.prodi?.namaprodi?.toLowerCase().includes(term) ||
      kur.tahun_mulai?.toLowerCase().includes(term) ||
      kur.tahun_selesai?.toLowerCase().includes(term) ||
      kur.total_sks?.toString().includes(term) ||
      kur.deskripsi?.toLowerCase().includes(term)
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

  const openEditModal = (prodi) => {
    setEditData(prodi);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSaveKurikulum = async (data, id = null) => {
    try {
      const token = localStorage.getItem("token");

      if (id) {
        await axios.put(`http://localhost:8000/api/kurikulum/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        swal("Berhasil!", "Data kurikulum berhasil diperbarui.", "success");
      } else {
        data.kodejurusan = user.kodejurusan;
        data.id_jurusan = user.id_jurusan;
        data.adminjurusan_id = user.id;

        await axios.post(`http://localhost:8000/api/kurikulum/store`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        swal("Berhasil!", "Data kurikulum berhasil ditambahkan.", "success");
      }

      const kurikulumResponse = await axios.get("http://localhost:8000/api/kurikulum", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = kurikulumResponse.data.filter((kur) => kur.adminjurusan?.kodejurusan === user.kodejurusan);
      setKurikulumList(filtered);
      closeModal();
    } catch (error) {
      console.error("Gagal menyimpan data kurikulum:", error);
      const message = error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      swal("Gagal!", message, "error");
    }
  };
  const handleDelete = async (id) => {
    swal({
      title: "Yakin ingin menghapus?",
      text: "Data kurikulum yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      buttons: ["Batal", "Hapus"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          const token = localStorage.getItem("token");

          await axios.delete(`http://localhost:8000/api/kurikulum/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setKurikulumList((prev) => prev.filter((kur) => kur.id !== id));
          swal("Terhapus!", "Data kurikulum berhasil dihapus.", "success");
        } catch (error) {
          console.error("Gagal menghapus kurikulum:", error);
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
      <Box sx={{ display: "flex", gap: "0px", ml: 0.5, mr: -1 }}>
        <span style={{ color: direction === "asc" && active ? "#FFFFFF" : "#aaa" }}>↑</span>
        <span style={{ color: direction === "desc" && active ? "#FFFFFF" : "#aaa" }}>↓</span>
      </Box>
    </Box>
  );

  return (
    <>
      <ModalKurikulum open={modalOpen} handleClose={closeModal} onSave={handleSaveKurikulum} initialData={editData} />
      <Navbar />
      <Box sx={{ mb: 2 }}>
        {/* Tombol tambah di kanan atas */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
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
              background: "linear-gradient(135deg, #2e7d32, #1b5e20)", // green soft elegant
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
            <BsJournalPlus style={{ fontSize: "18px" }} />
            Tambah Kurikulum
          </Button>
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
        <Table aria-label="Data Kurikulum" sx={{ width: "100%", minWidth: 600, tableLayout: "auto" }}>
          <TableHead sx={{ backgroundColor: "#0C20B5" }}>
            <TableRow>
              <TableCell sx={{ ...headStyle, width: "5%" }}>
                <CustomSortLabel active={orderBy === "id"} direction={order} onClick={() => handleSort("id")} label="No" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "nama"} direction={order} onClick={() => handleSort("nama")} label="Kurikulum" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "prodi_id"} direction={order} onClick={() => handleSort("prodi_id")} label="Prodi" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "tahun_mulai"} direction={order} onClick={() => handleSort("tahun_mulai")} label="Tahun Mulai" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "tahun_selesai"} direction={order} onClick={() => handleSort("tahun_selesai")} label="Tahun Selesai" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "total_sks"} direction={order} onClick={() => handleSort("total_sks")} label="Total sks" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "is_aktif"} direction={order} onClick={() => handleSort("is_aktif")} label="Status" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "deskripsi"} direction={order} onClick={() => handleSort("deskripsi")} label="Deskripsi" />
              </TableCell>
              <TableCell sx={{ ...headStyle, width: "15%" }}>
                <CustomSortLabel active={orderBy === "aksi"} direction={order} onClick={() => handleSort("aksi")} label="Aksi" />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedItems.map((kur, index) => (
              <TableRow key={kur.id} hover sx={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff" }}>
                <TableCell sx={cellStyle}>{index + 1 + currentPage * rowsPerPage}</TableCell>
                <TableCell sx={cellStyle}>{kur.nama}</TableCell> {/* GANTI dari namakurikulum */}
                <TableCell sx={cellStyle}>{getNamaProdi(kur.prodi_id)}</TableCell> {/* GANTI dari id_prodi */}
                <TableCell sx={cellStyle}>{kur.tahun_mulai}</TableCell>
                <TableCell sx={cellStyle}>{kur.tahun_selesai || "-"}</TableCell>
                <TableCell sx={cellStyle}>{kur.total_sks || "-"}</TableCell>
                <TableCell
                  sx={{
                    ...cellStyle,
                    width: { xs: "80px", sm: "100px", md: "100px" }, // responsive
                    paddingLeft: 1,
                    paddingRight: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      onClick={() => handleToggleStatus(kur)}
                      sx={{
                        color: kur.is_aktif ? "success.main" : "grey.500",
                        transition: "all 0.3s ease",
                        transform: kur.is_aktif ? "scale(1.1)" : "scale(1)",
                        "&:hover": {
                          transform: "scale(1.2)",
                          color: kur.is_aktif ? "success.dark" : "grey.700",
                        },
                      }}
                    >
                      {kur.is_aktif ? <ToggleOnIcon fontSize="medium" /> : <ToggleOffIcon fontSize="medium" />}
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: "80px" }}>
                      {kur.is_aktif ? "Aktif" : "Nonaktif"}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={cellStyle}>{kur.deskripsi || "-"}</TableCell>
                <TableCell sx={cellStyle}>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title="Edit data" arrow>
                      <Box
                        onClick={() => handleUpdate(kur)}
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
                        onClick={() => handleDelete(kur.id)}
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
const ModalKurikulum = ({ open, handleClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nama: "",
    prodi_id: "",
    tahun_mulai: "",
    tahun_selesai: "",
    total_sks: "",
    deskripsi: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama,
        prodi_id: initialData.prodi_id,
        tahun_mulai: initialData.tahun_mulai,
        tahun_selesai: initialData.tahun_selesai,
        total_sks: initialData.total_sks,
        deskripsi: initialData.deskripsi,
      });
    } else {
      setFormData({ nama: "", prodi_id: "", tahun_mulai: "", tahun_selesai: "", total_sks: "", deskripsi: "" });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData, initialData?.id); // ✅ sudah benar
  };
  const [authUser, setAuthUser] = useState(null);
  const [prodiOptions, setProdiOptions] = useState([]);
  const currentYear = new Date().getFullYear();
  const tahunOptions = Array.from({ length: 11 }, (_, i) => currentYear + i);
  const getTahunSelesaiOptions = (startYear) => {
    if (!startYear) return [];
    return Array.from({ length: 11 }, (_, i) => parseInt(startYear) + i);
  };

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
      axios
        .get("http://localhost:8000/api/prodi")
        .then((res) => {
          const filtered = res.data.filter((prodi) => prodi.adminjurusan_id === authUser.id);
          setProdiOptions(filtered);
        })
        .catch((err) => {
          console.error("Gagal ambil data prodi", err);
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
          {initialData ? "Edit Kurikulum" : "Tambah Kurikulum"}
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
              Nama Kurikulum
            </Typography>
            <TextField
              fullWidth
              name="nama"
              placeholder="Masukkan Nama Kurikulum..."
              value={formData.nama}
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

          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "4px", color: "#333" }}>
              Nama Prodi
            </Typography>
            <Select
              name="prodi_id"
              options={prodiOptions.map((prodi) => ({ value: prodi.id, label: prodi.namaprodi }))}
              value={
                formData.prodi_id
                  ? {
                      value: formData.prodi_id,
                      label: prodiOptions.find((p) => p.id === formData.prodi_id)?.namaprodi,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                handleChange({
                  target: {
                    name: "prodi_id",
                    value: selectedOption ? selectedOption.value : "",
                  },
                })
              }
              placeholder="Pilih Prodi..."
              isClearable
              styles={customSelectStyles}
              menuPortalTarget={document.body}
            />
          </Box>

          <Box sx={{ marginBottom: "10px", marginTop: "20px" }}>
            <Typography variant="body2" sx={{ marginBottom: "4px", color: "#333" }}>
              Tahun Mulai
            </Typography>
            <Select
              name="tahun_mulai"
              options={tahunOptions.map((year) => ({ value: year, label: String(year) }))}
              value={formData.tahun_mulai ? { value: formData.tahun_mulai, label: String(formData.tahun_mulai) } : null}
              onChange={(selectedOption) => {
                handleChange({
                  target: {
                    name: "tahun_mulai",
                    value: selectedOption ? selectedOption.value : "",
                  },
                });
                if (!selectedOption) {
                  handleChange({ target: { name: "tahun_selesai", value: "" } });
                }
              }}
              placeholder="Pilih Tahun Mulai..."
              isClearable
              styles={customSelectStyles}
              menuPortalTarget={document.body}
            />
          </Box>

          <Box sx={{ marginBottom: "10px", marginTop: "20px" }}>
            <Typography variant="body2" sx={{ marginBottom: "4px", color: "#333" }}>
              Tahun Selesai
            </Typography>
            <Select
              name="tahun_selesai"
              options={getTahunSelesaiOptions(formData.tahun_mulai).map((year) => ({
                value: year,
                label: String(year),
              }))}
              value={formData.tahun_selesai ? { value: formData.tahun_selesai, label: String(formData.tahun_selesai) } : null}
              onChange={(selectedOption) =>
                handleChange({
                  target: {
                    name: "tahun_selesai",
                    value: selectedOption ? selectedOption.value : "",
                  },
                })
              }
              placeholder={formData.tahun_mulai ? "Pilih Tahun Selesai..." : "Pilih Tahun Mulai Dulu..."}
              isClearable
              isDisabled={!formData.tahun_mulai}
              styles={{
                ...customSelectStyles,
                control: (base, state) => ({
                  ...customSelectStyles.control(base, state),
                  backgroundColor: !formData.tahun_mulai ? "#e0e0e0" : "#fff",
                }),
              }}
              menuPortalTarget={document.body}
            />
          </Box>
          <Box sx={{ marginBottom: "5px", marginTop: "20px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Total ks
            </Typography>
            <TextField
              fullWidth
              name="total_sks"
              value={formData.total_sks}
              onChange={handleChange}
              margin="normal"
              placeholder="Masukkan Total Sks..."
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
          <Box sx={{ marginBottom: "5px", marginTop: "15px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Deskripsi
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4} // Ganti sesuai kebutuhan tinggi teks
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              margin="normal"
              placeholder="Masukkan Deskripsi..."
              InputProps={{
                disableUnderline: false,
              }}
              sx={{
                width: "100%",
                borderRadius: "8px",
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

          <Tooltip title="Simpan Data Kurikulum" arrow>
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

export default DataKurikulum;
