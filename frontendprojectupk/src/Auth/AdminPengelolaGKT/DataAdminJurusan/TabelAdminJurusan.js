import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, Grid, MenuItem, Select as MuiSelect, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsSearch, BsTrash } from "react-icons/bs";
import { HiOutlineUserAdd } from "react-icons/hi";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select"; // <-- Ini untuk react-select
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const TabelAdminJurusan = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState(""); // Error state to handle fetching issues
  const [openDialog, setOpenDialog] = useState(false);
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

  const [formData, setFormData] = useState({
    username: "",
    jabatan: "",
    kodejurusan: "",
    jurusan: "",
    nama_lengkap: "",
    nip_nik_nipppk: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const [formErrors, setFormErrors] = useState({
    username: "",
    nama_lengkap: "",
    nip_nik: "",
    jurusan: "",
    password: "",
  });
  const handlePageChange1 = (selectedOption) => {
    if (selectedOption) {
      setSelectedPageOption(selectedOption);
      navigate(selectedOption.value);
    } else {
      setSelectedPageOption(null);
    }
  };

  const validateForm = () => {
    const requiredFields = ["username", "nama_lengkap", "nip_nik_nipppk", "jabatan", "kodejurusan", "jurusan", "password"];
    const errors = {};

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "Kolom wajib diisi!";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      username: "",
      jabatan: "",
      kodejurusan: "",
      jurusan: "",
      nama_lengkap: "",
      nip_nik_nipppk: "",
      password: "",
    });
    setFormError("");
    setFormSuccess("");
  };
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/useradminjurusan");
        const filteredData = response.data.filter((user) => user.role === "admin_jurusan");
        setData(filteredData);
      } catch (error) {
        setError("Error fetching data");
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const navigate = useNavigate();

  const handleAddAdminJurusan = () => {
    navigate("/TambahAdminJurusan");
  };

  const filteredData = data.filter((row) => {
    return row.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) || row.nip_nik_nipppk?.toLowerCase().includes(searchTerm.toLowerCase()) || row.username?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const displayedItems = filteredData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const response = await axios.post("http://localhost:8000/api/useradminjurusan", {
        ...formData,
        role: "admin_jurusan",
      });
      setData([...data, response.data]); // Tambah langsung ke tabel
      swal({
        title: "Sukses!",
        text: "Admin Jurusan Berhasil Ditambahkan!",
        icon: "success",
        button: "OK",
      });

      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err) {
      setFormError("Gagal menambahkan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    swal({
      title: "Apakah kamu Yakin?",
      text: "Setelah Dihapus Data Admin Jurusan Tidak dapat Dikembalikan Lagi!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`http://localhost:8000/api/useradminjurusan/${id}`);
          setData(data.filter((user) => user.id !== id));
          swal("Berhasil!", "Admin Jurusan Telah Dihapus.", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          swal("Error!", "Gagal Menghapus Admin Jurusan.", "error");
        }
      } else {
        swal("Admin Jurusan Masih Tersimpan!");
      }
    });
  };
  if (error)
    return (
      <Typography variant="h6" sx={{ mt: 10, textAlign: "center", color: "red" }}>
        {error}
      </Typography>
    );
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
            onClick={handleOpenDialog}
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
            Tambah Admin Jurusan
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
        <Table aria-label="Tabel Admin Jurusan" sx={{ width: "100%", minWidth: 600, tableLayout: "auto" }}>
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
                <CustomSortLabel active={orderBy === "jurusan"} direction={order} onClick={() => handleSort("jurusan")} label="Jurusan" />
              </TableCell>

              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "aksi"} direction={order} onClick={() => handleSort("aksi")} label="Aksi" />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedItems.length > 0 ? (
              displayedItems.map((admin_jurusan, index) => (
                <TableRow
                  key={admin_jurusan.id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  <TableCell sx={cellStyle}>{index + 1 + currentPage * rowsPerPage}</TableCell>
                  <TableCell sx={cellStyle}>{admin_jurusan.username}</TableCell>
                  <TableCell sx={cellStyle}>{admin_jurusan.nama_lengkap}</TableCell>
                  <TableCell sx={cellStyle}>{admin_jurusan.nip_nik_nipppk}</TableCell>
                  <TableCell sx={cellStyle}>{admin_jurusan.jabatan}</TableCell>
                  <TableCell sx={cellStyle}>{admin_jurusan.jurusan}</TableCell>
                  <TableCell sx={cellStyle}>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Tooltip title="Hapus data" arrow>
                        <Box
                          onClick={() => handleDelete(admin_jurusan.id)}
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
                  colSpan={7}
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
      <Dialog open={openDialog} onClose={handleCloseDialog}>
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
          Tambah Admin Jurusan
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
          {[
            { placeholder: "Masukkan Username...", label: "Username", name: "username" },
            { placeholder: "Masukkan Nama Lengkap...", label: "Nama Lengkap", name: "nama_lengkap" },
            { placeholder: "Masukkan Nip_Nik_Nipppk...", label: "NIP / NIK / NIPPPPK", name: "nip_nik_nipppk" },
            { placeholder: "Masukkan Jabatan...", label: "Jabatan", name: "jabatan" },
            { placeholder: "Masukkan Kode Jurusan...", label: "Kode Jurusan", name: "kodejurusan" },
            { placeholder: "Masukkan Nama Jurusan", label: "Jurusan", name: "jurusan" },
            { placeholder: "Masukkan Password", label: "Password", name: "password", type: "password" },
          ].map(({ placeholder, label, name, type }) => (
            <Box sx={{ marginBottom: "10px", marginTop: "10px" }}>
              <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
                {label}
              </Typography>
              <TextField
                autoComplete="new-password" // Menambahkan autoComplete yang tepat
                name={name}
                placeholder={placeholder}
                error={!!formErrors[name]} // ← Dinamis berdasarkan nama field
                helperText={formErrors[name]} // ← Dinamis juga
                type={type || "text"}
                value={formData[name]}
                onChange={handleInputChange}
                fullWidth
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
          ))}

          {formError && (
            <Typography color="error" mt={1}>
              {formError}
            </Typography>
          )}
          {formSuccess && (
            <Typography color="primary" mt={1}>
              {formSuccess}
            </Typography>
          )}
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
              onClick={handleCloseDialog}
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
              Tambah <SaveIcon fontSize="small" />
            </Box>
          </Tooltip>
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

export default TabelAdminJurusan;
