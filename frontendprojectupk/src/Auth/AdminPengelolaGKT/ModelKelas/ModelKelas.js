import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  InputAdornment,
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
import { BsPencil, BsSearch, BsTrash } from "react-icons/bs";
import { IoConstructSharp } from "react-icons/io5";
import ReactPaginate from "react-paginate";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select"; // <-- Ini untuk react-select
import swal from "sweetalert";
import Navbar from "../../../Components/Navbar/Navbar";

const ModelKelas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
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
    const normalizedPath = location.pathname.toLowerCase().replace(/\/$/, "");

    const current = pageOptions.find((option) => option.value.toLowerCase().replace(/\/$/, "") === normalizedPath);

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
    { value: "/JenisKelas", label: "jenis Kelas" },
    { value: "/ModelKelas", label: "Model Kelas" },
    { value: "/SaranaKelas", label: "Sarana Kelas" },
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
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/modelkelas");
        setData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data peminjaman:", error);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((row) => {
    const search = searchTerm.toLowerCase();
    const nama = String(row.nama || "").toLowerCase();

    return nama.includes(search);
  });

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  const displayedItems = filteredData.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleDelete = async (id) => {
    swal({
      title: "Apakah kamu Yakin?",
      text: "Setelah Dihapus Data Model Kelas Tidak dapat Dikembalikan Lagi!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`http://localhost:8000/api/modelkelas/${id}`);
          swal("Berhasil!", "Model Kelas Telah Dihapus.", "success");

          // ✅ Ambil data terbaru setelah penghapusan
          const response = await axios.get("http://localhost:8000/api/modelkelas");
          setData(response.data);
        } catch (error) {
          console.error("Error deleting user:", error);
          swal("Error!", "Gagal Menghapus Model Kelas.", "error");
        }
      } else {
        swal("Model Kelas Masih Tersimpan!");
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
  const handleUpdate = (row) => {
    openEditModal(row);
  };

  const openTambahModal = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditData(row);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSaveModelKelas = async (data, id = null) => {
    try {
      if (id) {
        await axios.put(`http://localhost:8000/api/modelkelas/${id}`, data);
        swal("Berhasil!", "Data modelkelas berhasil diperbarui.", "success");
      } else {
        await axios.post(`http://localhost:8000/api/modelkelas`, data);
        swal("Berhasil!", "Data modelkelas berhasil ditambahkan.", "success");
      }

      // Ambil data terbaru dari API
      const response = await axios.get("http://localhost:8000/api/modelkelas");
      setData(response.data); // Perbarui state data

      closeModal();
    } catch (error) {
      console.error("Gagal menyimpan data modelkelas:", error);
      const message = error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      swal("Gagal!", message, "error");
    }
  };

  return (
    <>
      <ModalModelkelas open={modalOpen} handleClose={closeModal} onSave={handleSaveModelKelas} initialData={editData} />
      <Navbar />
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
          {/* Select di kiri */}
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
                maxWidth: 400,
                fontSize: "0.80rem",
              }),
            }}
          />

          {/* Button di kanan */}
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
            <IoConstructSharp style={{ fontSize: "18px" }} />
            Tambah Model Kelas
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
                    onChange={(e) => handleSearch(e.target.value)}
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
        <Table aria-label="Tabel Mahasiswa" sx={{ width: "100%", minWidth: 600, tableLayout: "auto" }}>
          <TableHead sx={{ backgroundColor: "#0C20B5" }}>
            <TableRow>
              <TableCell sx={{ ...headStyle, width: "5%" }}>
                <CustomSortLabel active={orderBy === "id"} direction={order} onClick={() => handleSort("id")} label="No" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "nama"} direction={order} onClick={() => handleSort("nama")} label="Nama" />
              </TableCell>
              <TableCell sx={headStyle}>
                <CustomSortLabel active={orderBy === "aksi"} direction={order} onClick={() => handleSort("aksi")} label="Aksi" />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedItems.map((row, index) => (
              <TableRow key={row.id} hover sx={{ backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#ffffff", borderBottom: "1px solid #ccc" }}>
                <TableCell sx={cellStyle}>{index + 1 + currentPage * rowsPerPage}</TableCell>
                <TableCell sx={cellStyle}>{row.nama}</TableCell>
                <TableCell sx={cellStyle}>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Tooltip title="Edit data" arrow>
                      <Box
                        onClick={() => handleUpdate(row)}
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
                        onClick={() => handleDelete(row.id)}
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
                  colSpan={3}
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

const ModalModelkelas = ({ open, handleClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nama: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama,
      });
    } else {
      setFormData({ nama: "" });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSave(formData, initialData?.id); // akan kirim data + id jika edit
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
          {initialData ? "Edit Model Kelas" : "Tambah Model kelas"}
        </Typography>

        <Grid item xs={12} sx={{ position: "relative", marginTop: "20px", marginBottom: "20px" }}>
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
          <Box sx={{ marginBottom: "5px", marginTop: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-4px", color: "#333" }}>
              Model kelas
            </Typography>
            <TextField
              fullWidth
              label="Model kelas"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <BsPencil style={{ color: "#777" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                height: "45px",
                width: "100%",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                "& .MuiOutlinedInput-root": {
                  height: "45px",
                  "& fieldset": {
                    borderColor: "#ccc",
                  },
                  "&:hover fieldset": {
                    borderColor: "#0C20B5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#0C20B5",
                  },
                },
              }}
            />
          </Box>
        </DialogContent>

        <Grid item xs={12} sx={{ position: "relative", marginTop: "-10px", marginBottom: "-5px" }}>
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

          <Tooltip title="Simpan Data Model kelas" arrow>
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
export default ModelKelas;
