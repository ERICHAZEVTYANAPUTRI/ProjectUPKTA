import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsPencil, BsPlus } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import Navbar from "../../../../Components/Navbar/Navbar";

const Gedung = () => {
  const [gedungs, setGedungs] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGedung, setSelectedGedung] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    gambar: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchGedungs();
  }, []);

  const fetchGedungs = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/gedungjumlahldanr");
      setGedungs(response.data);
    } catch (error) {
      console.error("Error fetching gedungs:", error);
    }
  };

  // Buka modal tambah
  const handleAddGedung = () => {
    setIsEdit(false);
    setFormData({ name: "", gambar: null });
    setFormErrors({});
    setOpenModal(true);
  };

  // Buka modal edit
  const handleUpdate = (gedung) => {
    setIsEdit(true);
    setSelectedGedung(gedung);
    setFormData({ name: gedung.name, gambar: null });
    setFormErrors({});
    setOpenModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedGedung(null);
    setFormData({ name: "", gambar: null });
    setFormErrors({});
  };

  // Handle input change (text and file)
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "gambar") {
      setFormData((prev) => ({ ...prev, gambar: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validasi form
  const validateForm = () => {
    let errors = {};
    if (!formData.name.trim()) {
      errors.name = "Nama gedung wajib diisi";
    }
    // Gambar wajib diisi hanya saat tambah, kalau edit boleh kosong (tidak update gambar)
    if (!isEdit && !formData.gambar) {
      errors.gambar = "Gambar gedung wajib diupload";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form tambah atau edit
  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      if (formData.gambar) {
        formPayload.append("gambar", formData.gambar);
      }

      if (isEdit && selectedGedung) {
        formPayload.append("_method", "PUT");

        // Update gedung
        await axios.post(`http://localhost:8000/api/gedungs/${selectedGedung.id}`, formPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        swal("Berhasil!", "Gedung berhasil diperbarui!", "success");
      } else {
        // Tambah gedung
        await axios.post("http://localhost:8000/api/gedungs", formPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        swal("Berhasil!", "Gedung berhasil ditambahkan!", "success");
      }

      fetchGedungs();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      swal("Gagal!", "Terjadi kesalahan saat menyimpan gedung.", "error");
    }
  };

  const handleDelete = async (gedungId) => {
    swal({
      title: "Yakin ingin menghapus gedung ini?",
      icon: "warning",
      buttons: ["Batal", "Hapus"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          await axios.delete(`http://localhost:8000/api/gedungs/${gedungId}`);
          setGedungs((prev) => prev.filter((g) => g.id !== gedungId));
          swal("Berhasil!", "Gedung berhasil dihapus!", "success");
        } catch (error) {
          console.error("Error deleting gedung:", error);
          swal("Gagal!", "Terjadi kesalahan saat menghapus gedung.", "error");
        }
      }
    });
  };

  const handleMoreInfo = (gedungId) => {
    navigate(`/ruangan/${gedungId}`);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button
          variant="contained"
          onClick={handleAddGedung}
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
          <BsPlus style={{ fontSize: "18px" }} />
          Tambah Gedung
        </Button>
      </Box>
      <Box
        sx={{
          width: "100%",
          borderBottom: "2px solid #0C20B5",
          marginY: 3,
          position: "relative",
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0, // Jarak antar kartu
          justifyContent: "center", // Sesuaikan dengan kebutuhan: 'flex-start', 'center', atau 'space-between'
          mt: 2,
        }}
      >
        {gedungs.map((gedung) => (
          <Card
            key={gedung.id}
            sx={{
              width: 250, // ⬅️ Tetapkan lebar tetap
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: 3,
              position: "relative",
              margin: "auto",
              my: 2, // ⬅️ Tambahkan jarak vertikal antar card (top & bottom)
            }}
          >
            {/* Wrapper gambar dengan efek hover */}
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "8px 8px 0 0",
                cursor: "pointer",
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
                  transition: "filter 0.3s ease",
                  borderRadius: "8px 8px 0 0",
                  display: "block",
                  width: "100%",
                }}
              />

              {/* Tombol edit & delete saat hover */}
              <Box
                className="overlay"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  opacity: 0,
                  pointerEvents: "none",
                  transition: "opacity 0.3s ease",
                  borderRadius: "8px 8px 0 0",
                  zIndex: 10,
                }}
              >
                <Tooltip title="Edit">
                  <Button
                    size="small"
                    sx={{
                      bgcolor: "white",
                      color: "black",
                      borderRadius: "50%",
                      minWidth: 40,
                      minHeight: 40,
                      "&:hover": { bgcolor: "#FFA500", color: "white" },
                    }}
                    onClick={() => handleUpdate(gedung)}
                  >
                    <BsPencil />
                  </Button>
                </Tooltip>

                <Tooltip title="Delete">
                  <Button
                    size="small"
                    sx={{
                      bgcolor: "white",
                      color: "black",
                      borderRadius: "50%",
                      minWidth: 40,
                      minHeight: 40,
                      "&:hover": { bgcolor: "#DC3545", color: "white" },
                    }}
                    onClick={() => handleDelete(gedung.id)}
                  >
                    <MdDelete size={20} />
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            {/* Nama Gedung */}
            <CardContent sx={{ backgroundColor: "#fff", padding: 1 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontSize: "16px",
                  textAlign: "center",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {gedung.name}
              </Typography>
            </CardContent>

            {/* Info Lantai dan Ruangan */}
            <CardContent sx={{ backgroundColor: "#f0f0f0", padding: 1 }}>
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography fontSize={16} fontWeight="bold" color="text.secondary">
                      {gedung.lantai_tertinggi || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Lantai
                    </Typography>
                  </Box>
                </Grid>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ mx: 2, borderColor: "#b0b0b0" }} // margin horizontal 2, warna abu-abu
                />

                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography fontSize={16} fontWeight="bold" color="text.secondary">
                      {gedung.jumlah_ruangan || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ruangan
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>

            {/* Tombol Lihat Gedung */}
            <Box
              sx={{
                width: "100%",
              }}
            >
              <Button
                onClick={() => handleMoreInfo(gedung.id)}
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "#1976d2",
                  fontSize: "15px",
                  fontWeight: 500,
                  textTransform: "none",
                  borderRadius: 0,
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                Lihat Gedung
              </Button>
            </Box>
          </Card>
        ))}
        {gedungs.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Tidak ada gedung tersedia.
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Silakan tambah gedung terlebih dahulu.
            </Typography>
          </Box>
        )}
      </Box>
      {/* Modal Tambah/Edit */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle
          sx={{
            textAlign: "left",
            paddingBottom: "16px",
            fontWeight: "bold",
            fontSize: "20px",
            marginTop: "20px",
            marginBottom: "-20px",
            color: "#3449e4",
          }}
        >
          {isEdit ? "Edit Gedung" : "Tambah Gedung"}
        </DialogTitle>
        <Grid item xs={12} sx={{ position: "relative", marginTop: "10px", marginBottom: "-0px" }}>
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

        <DialogContent
          autoComplete="off"
          sx={{
            padding: "24px",
            width: "400px",
            maxHeight: "250px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            overflowY: "scroll",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {/* Nama Gedung */}
          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-4px", color: "#333" }}>
              Nama Gedung
            </Typography>
            <TextField
              label="Nama Gedung"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              error={!!formErrors.name}
              helperText={formErrors.name}
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

          {/* Upload Gambar */}
          <Box sx={{ marginBottom: "10px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-4px", color: "#333" }}>
              {isEdit ? "Ganti Gambar (opsional)" : "Upload Gambar"}
            </Typography>
            <input type="file" name="gambar" accept="image/*" onChange={handleFormChange} style={{ width: "100%" }} />
            {formErrors.gambar && (
              <Typography variant="caption" color="error">
                {formErrors.gambar}
              </Typography>
            )}
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

          <Tooltip title="Simpan Ruangan?" arrow>
            <Box
              onClick={handleFormSubmit}
              component="button" // <-- Ini penting
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
              {isEdit ? "Perbarui" : "Tambah"}
              <SaveIcon fontSize="small" />
            </Box>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Gedung;
