import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  MenuItem,
  Select as MuiSelect,
  Snackbar,
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
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select"; // <-- Ini untuk react-select
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const TabelPengelolaGKT = ({ fetchData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [editPengelola, setEditPengelola] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("");
  const [order, setOrder] = useState("asc");
  const location = useLocation();
  const [selectedPageOption, setSelectedPageOption] = useState(null);
  const [selectedPageLabel, setSelectedPageLabel] = useState("");
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset ke halaman pertama
  };
  useEffect(() => {
    const current = pageOptions.find((option) => option.value === location.pathname);
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
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(0);
  };

  const pageOptions = [
    { value: "/TabelMahasiswa", label: "Mahasiswa" },
    { value: "/TabelPengelelolaGKT", label: "Pengelola GKT" },
    { value: "/TabelAdminJurusan", label: "Admin Jurusan" },
  ];
  const handlePageChange1 = (selectedOption) => {
    if (selectedOption) {
      setSelectedPageOption(selectedOption);
      navigate(selectedOption.value);
    } else {
      setSelectedPageOption(null);
    }
  };

  const [formData, setFormData] = useState({
    username: "",
    jabatan: "",
    nama_lengkap: "",
    nip_nik_nipppk: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    username: "",
    jabatan: "",
    nama_lengkap: "",
    nip_nik_nipppk: "",
    password: "",
  });
  const navigate = useNavigate();

  // Fungsi untuk mengambil data pengelola berdasarkan ID
  const fetchPengelolaById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/userpengelola/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/userpengelola");
        const filteredData = response.data.filter((user) => user.role === "pengelola_gkt");
        setData(filteredData);
      } catch (error) {
        setError("Error fetching data");
        console.error(error);
      }
    };

    fetchData();
  }, [openModal]); // Dependensi pada openModal memastikan data di-refresh saat modal dibuka

  useEffect(() => {
    if (openModal && editPengelola) {
      fetchPengelolaById(editPengelola.id); // Mengambil data pengelola berdasarkan ID
    } else {
      // Reset form ketika menambahkan pengelola baru
      setFormData({
        username: "",
        nama_lengkap: "",
        nip_nik_nipppk: "",
        jabatan: "",
        password: "",
      });
    }
  }, [openModal, editPengelola]); // Menjalankan efek hanya ketika modal dibuka atau pengelola yang diedit berubah

  const handleEdit = (pengelola) => {
    setEditPengelola(pengelola); // Set data yang akan diedit
    setFormData({
      username: pengelola.username,
      nama_lengkap: pengelola.nama_lengkap,
      nip_nik_nipppk: pengelola.nip_nik_nipppk,
      jabatan: pengelola.jabatan,
      password: "", // Kosongkan password agar pengguna bisa mengubahnya
    });
    setOpenModal(true); // Buka modal
  };

  const handleAddPengelola = () => {
    setOpenModal(true);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.username) errors.username = "Kolom wajib diisi!";
    if (!formData.nama_lengkap) errors.nama_lengkap = "Kolom wajib diisi!";
    if (!formData.nip_nik_nipppk) errors.nip_nik_nipppk = "Kolom wajib diisi!";
    if (!formData.jabatan) errors.jabatan = "Kolom wajib diisi!";
    if (!formData.password) errors.password = "Kolom wajib diisi!";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let response;
      if (editPengelola) {
        // Update pengelola yang sudah ada
        response = await axios.put(`http://localhost:8000/api/userpengelola/${editPengelola.id}`, formData);
        const updatedPengelola = response.data.data; // Data yang dikembalikan dari API

        // Cek apakah data benar-benar berhasil terupdate
        console.log("Updated Pengelola:", updatedPengelola);

        // Update data pengelola di state secara langsung
        setData((prevData) => {
          // Cari item yang sudah diupdate dan ganti dengan data yang baru
          return prevData.map((item) => (item.id === updatedPengelola.id ? updatedPengelola : item));
        });

        swal({
          title: "Sukses!",
          text: "Pengelola GKT Berhasil Diperbarui!",
          icon: "success",
          button: "OK",
        });
      } else {
        // Menambah pengelola baru
        response = await axios.post("http://localhost:8000/api/userpengelola", {
          ...formData,
          role: "pengelola_gkt",
        });
        const newPengelola = response.data.data;

        // Menambahkan pengelola baru ke data
        setData((prevData) => [...prevData, newPengelola]);

        swal({
          title: "Sukses!",
          text: "Pengelola GKT Berhasil Ditambahkan!",
          icon: "success",
          button: "OK",
        });
      }

      handleCloseModal();
      resetForm();
    } catch (error) {
      console.error(error);
      swal({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menyimpan data!",
        icon: "error",
        button: "OK",
      });
    }
  };

  const filteredData = data.filter((row) => {
    // Pastikan 'row' adalah objek yang valid sebelum mencoba mengakses properti
    if (!row) return false; // Jika row tidak ada, abaikan
    const search = searchTerm.toLowerCase();
    return (row.nama_lengkap && row.nama_lengkap.toLowerCase().includes(search)) || (row.nip_nik_nipppk && row.nip_nik_nipppk.toLowerCase().includes(search)) || (row.username && row.username.toLowerCase().includes(search));
  });

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const displayedItems = filteredData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditPengelola(null); // Reset data pengelola yang sedang diedit
    resetForm();
  };

  const handleDelete = async (id) => {
    swal({
      title: "Apakah kamu Yakin?",
      text: "Setelah Dihapus Data Pengelola Tidak dapat Dikembalikan Lagi!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`http://localhost:8000/api/userpengelola/${id}`);
          setData(data.filter((user) => user.id !== id));
          swal("Berhasil!", "Pengelola Telah Dihapus.", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          swal("Error!", "Gagal Menghapus Pengelola.", "error");
        }
      } else {
        swal("Pengelola Masih Tersimpan!");
      }
    });
  };
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (error)
    return (
      <Typography variant="h6" sx={{ mt: 10, textAlign: "center", color: "red" }}>
        {error}
      </Typography>
    );

  const resetForm = () => {
    setFormData({
      username: "",
      jabatan: "",
      nama_lengkap: "",
      nip_nik_nipppk: "",
      password: "",
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
      <Navbar />
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between", // pisahkan ke kiri dan kanan
            alignItems: "center",
            flexWrap: "wrap",
            mb: 2,
            gap: 2,
          }}
        >
          {/* KIRI: Select Pilih Halaman */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                  maxWidth: 250,
                  fontSize: "0.80rem",
                }),
              }}
            />
          </Box>

          {/* KANAN: Tombol Tambah Pengelola */}
          <Button
            variant="contained"
            onClick={handleAddPengelola}
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
            <HiOutlineUserAdd style={{ fontSize: "18px" }} />
            Tambah Pengelola
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
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
        <Table aria-label="Tabel Pengelola GKT" sx={{ width: "100%", minWidth: 600, tableLayout: "auto" }}>
          <TableHead sx={{ backgroundColor: "#0C20B5" }}>
            <TableRow>
              <TableCell sx={{ ...headStyle, width: "5%" }}>
                <CustomSortLabel active={orderBy === "id"} direction={order} onClick={() => handleSort("id")} label="No" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "username"} direction={order} onClick={() => handleSort("username")} label="Username" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "nama_lengkap"} direction={order} onClick={() => handleSort("nama_lengkap")} label="Nama" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "nip_nik_nipppk"} direction={order} onClick={() => handleSort("nip_nik_nipppk")} label="NIP / NIK / NIPPPK" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "jabatan"} direction={order} onClick={() => handleSort("jabatan")} label="Jabatan" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "aksi"} direction={order} onClick={() => handleSort("aksi")} label="Aksi" />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedItems.length > 0 ? (
              displayedItems.map((pengelola, index) => (
                <TableRow
                  key={pengelola.id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  <TableCell sx={cellStyle}>{index + 1 + currentPage * rowsPerPage}</TableCell>
                  <TableCell sx={cellStyle}>{pengelola.username}</TableCell>
                  <TableCell sx={cellStyle}>{pengelola.nama_lengkap}</TableCell>
                  <TableCell sx={cellStyle}>{pengelola.nip_nik_nipppk}</TableCell>
                  <TableCell sx={cellStyle}>{pengelola.jabatan}</TableCell>
                  <TableCell sx={cellStyle}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Tooltip title="Edit data" arrow>
                        <Box
                          onClick={() => handleEdit(pengelola)}
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
                          onClick={() => handleDelete(pengelola.id)}
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
              ))
            ) : (
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: "13px",
                    color: "#4f4f4f", // Warna teks
                    fontWeight: 500, // atau 600 jika ingin sedikit lebih tebal
                  }}
                  colSpan={6}
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

      {/* Modal Form edit Pengelola */}
      <Dialog open={openModal && editPengelola} onClose={handleCloseModal}>
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
          {editPengelola ? "Edit Pengelola GKT" : "Tambah Pengelola GKT"}
        </Typography>

        <Grid item xs={12} sx={{ position: "relative", marginTop: "20px", marginBottom: "0px" }}>
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
            width: 450,
            backgroundColor: "#f9f9f9",
            maxHeight: "300px",
            overflowY: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {/* Username */}
          <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Username
            </Typography>
            <TextField
              name="username"
              placeholder="Masukkan Username..."
              value={formData.username}
              onChange={handleFormChange}
              fullWidth
              error={!!formErrors.username}
              helperText={formErrors.username}
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

          {/* Nama Lengkap */}
          <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Nama Lengkap
            </Typography>
            <TextField
              name="nama_lengkap"
              placeholder="Masukkan Nama Lengkap..."
              value={formData.nama_lengkap}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.nama_lengkap}
              helperText={formErrors.nama_lengkap}
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

          {/* NIP / NIK / NIPPPPK */}
          <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              NIP / NIK / NIPPPPK
            </Typography>
            <TextField
              placeholder="Masukkan Nip_Nik_Nipppk..."
              name="nip_nik_nipppk"
              value={formData.nip_nik_nipppk}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.nip_nik_nipppk}
              helperText={formErrors.nip_nik_nipppk}
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

          {/* Jabatan */}
          <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Jabatan
            </Typography>
            <TextField
              placeholder="Masukkan Jabatan..."
              name="jabatan"
              value={formData.jabatan}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.jabatan}
              helperText={formErrors.jabatan}
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

          {/* Password */}
          <Box sx={{ marginBottom: "5px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Password
            </Typography>
            <TextField
              placeholder="Masukkan Password Baru..."
              autoComplete="new-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.password}
              helperText={formErrors.password}
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
        <Grid item xs={12} sx={{ position: "relative", marginTop: "0px", marginBottom: "0px" }}>
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
              onClick={handleCloseModal}
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
          <Tooltip title="Perbarui Data pengelola" arrow>
            <Box
              onClick={handleFormSubmit}
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
              {editPengelola ? "Perbarui" : "Tambah"}
              <SaveIcon fontSize="small" />
            </Box>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* Modal Form Tambah Pengelola */}
      <Dialog open={openModal && !editPengelola} onClose={handleCloseModal}>
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
          Tambah Pengelola GKT
        </Typography>
        <Grid item xs={12} sx={{ position: "relative", marginTop: "20px", marginBottom: "0px" }}>
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
            width: 450,
            backgroundColor: "#f9f9f9",
            maxHeight: "300px",
            overflowY: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {/* Username */}
          <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Username
            </Typography>
            <TextField
              placeholder="Masukkan Username..."
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.username}
              helperText={formErrors.username}
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

          {/* Nama Lengkap Field */}
          <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Nama Lengkap
            </Typography>
            <TextField
              name="nama_lengkap"
              placeholder="Masukkan Nama Lengkap..."
              value={formData.nama_lengkap}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.nama_lengkap}
              helperText={formErrors.nama_lengkap}
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

          {/* NIP / NIK / NIPPPPK Field */}
          <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              NIP / NIK / NIPPPPK
            </Typography>
            <TextField
              placeholder="Masukkan Nip_Nik_Nipppk..."
              name="nip_nik_nipppk"
              value={formData.nip_nik_nipppk}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.nip_nik_nipppk}
              helperText={formErrors.nip_nik_nipppk}
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

          {/* Jabatan Field */}
          <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Jabatan
            </Typography>
            <TextField
              placeholder="Masukkan Jabatan..."
              name="jabatan"
              value={formData.jabatan}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.jabatan}
              helperText={formErrors.jabatan}
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

          {/* Password Field */}
          <Box sx={{ marginBottom: "5px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Password
            </Typography>
            <TextField
              placeholder="Masukkan Password..."
              autoComplete="new-password" // Menambahkan autoComplete yang tepat
              type="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.password}
              helperText={formErrors.password}
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
        <Grid item xs={12} sx={{ position: "relative", marginTop: "0px", marginBottom: "0px" }}>
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
              onClick={handleCloseModal}
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
          <Tooltip title="Perbarui Data pengelola" arrow>
            <Box
              onClick={handleFormSubmit}
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
              Tanbah <SaveIcon fontSize="small" />
            </Box>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifikasi */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbarMessage.includes("Berhasil") ? "success" : "error"} onClose={handleCloseSnackbar}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
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

export default TabelPengelolaGKT;
