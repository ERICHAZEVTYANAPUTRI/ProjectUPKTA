import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, MenuItem, MenuList, Popover, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsInfoCircle, BsPlus } from "react-icons/bs";
import { MdBuild, MdCheckCircle, MdDelete, MdEdit } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select"; // <-- Ini untuk react-select
import swal from "sweetalert";
import Navbar from "../../../../Components/Navbar/Navbar";

const Ruangan = () => {
  const { gedungId } = useParams();
  const navigate = useNavigate();
  const [ruangan, setRuangan] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // State to manage the Popover's anchor element
  const [selectedRoom, setSelectedRoom] = useState(null); // State to manage the selected room
  const [openSnackbar, setOpenSnackbar] = useState(false); // State for Snackbar
  const [openModal, setOpenModal] = useState(false); // State untuk mengontrol tampilan modal
  const [roomToUpdate, setRoomToUpdate] = useState(null); // State untuk menyimpan data ruangan yang dipilih untuk update
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [jenisKelasOptions, setJenisKelasOptions] = useState([]);
  const [modelKelasOptions, setModelKelasOptions] = useState([]);
  const [saranaKelasOptions, setSaranaKelasOptions] = useState([]);
  const parseRoomData = (room) => {
    const parseArray = (str) => {
      try {
        return JSON.parse(str);
      } catch {
        return [];
      }
    };

    return {
      ...room,
      jeniskelas: parseArray(room.jeniskelas),
      modelkelas: parseArray(room.modelkelas),
      saranakelas: parseArray(room.saranakelas),
    };
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [jenis, model, sarana] = await Promise.all([axios.get("http://localhost:8000/api/jeniskelas"), axios.get("http://localhost:8000/api/modelkelas"), axios.get("http://localhost:8000/api/saranakelas")]);

        setJenisKelasOptions(jenis.data.map((item) => ({ value: String(item.id), label: item.nama })));
        setModelKelasOptions(model.data.map((item) => ({ value: String(item.id), label: item.nama })));
        setSaranaKelasOptions(sarana.data.map((item) => ({ value: String(item.id), label: item.nama })));
      } catch (error) {
        console.error("Gagal mengambil data select:", error);
      }
    };

    fetchOptions();
  }, []);

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    paddingY: 1,
    paddingX: 2,
    borderRadius: 1.5,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#f0f4ff",
      boxShadow: 1,
      transform: "scale(1.01)",
    },
  };
  const handleMultiSelectChange = (selected, name, index) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][name] = selected; // selected adalah array objek dari react-select
    setRooms(updatedRooms);
  };

  const [formData, setFormData] = useState({
    name: "",
    lantai: "",
    kapasitas: "",
    jeniskelas: "",
    modelkelas: "",
    saranakelas: "",
  });
  const [gedung, setGedung] = useState(null);
  const [rooms, setRooms] = useState([
    {
      name: "",
      gambar: "",
      lantai: "",
      kapasitas: "",
      jeniskelas: [], // ✅ array kosong
      modelkelas: [], // ✅ array kosong
      saranakelas: [], // ✅ array kosong
    },
  ]);

  const [open, setOpen] = useState(false); // Modal state

  useEffect(() => {
    const fetchGedung = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/gedungs/${gedungId}`);
        setGedung(response.data);
      } catch (error) {
        console.error("Error fetching gedung:", error);
      }
    };
    fetchGedung();
  }, [gedungId]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/ruangan/${gedungId}`);
      setRooms(response.data); // Update state rooms dengan data terbaru
    } catch (error) {
      console.error("Error fetching ruangan:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah form melakukan reload halaman

    const formData = new FormData();

    // Menambahkan data dari setiap ruangan
    rooms.forEach((room, index) => {
      formData.append(`name[${index}]`, room.name);
      formData.append(`lantai[${index}]`, room.lantai);
      formData.append(`kapasitas[${index}]`, room.kapasitas);
      formData.append(`gedung[${index}]`, gedungId);

      // Konversi array objek react-select ke array string
      const jeniskelasValues = room.jeniskelas?.map((item) => item.value) || [];
      const modelkelasValues = room.modelkelas?.map((item) => item.value) || [];
      const saranakelasValues = room.saranakelas?.map((item) => item.value) || [];

      jeniskelasValues.forEach((val, i) => formData.append(`jeniskelas[${index}][${i}]`, val));
      modelkelasValues.forEach((val, i) => formData.append(`modelkelas[${index}][${i}]`, val));
      saranakelasValues.forEach((val, i) => formData.append(`saranakelas[${index}][${i}]`, val));

      if (room.gambar) {
        formData.append(`gambar[${index}]`, room.gambar);
      }
    });

    try {
      // Mengirimkan data ke server menggunakan axios
      const response = await axios.post("http://localhost:8000/api/ruangan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newRooms = response.data;
      const parsedRooms = newRooms.map((room) => ({
        ...parseRoomData(room),
        statusruangan: room.statusruangan || "kosong", // set default status ruangan kosong jika tidak ada
      }));
      setRuangan((prev) => [...prev, ...parsedRooms]);

      setOpen(false); // Tutup modal
      setRooms([
        {
          name: "",
          gambar: "",
          lantai: "",
          kapasitas: "",
          jeniskelas: [],
          modelkelas: [],
          saranakelas: [],
        },
      ]); // Reset form

      swal({
        title: "Sukses!",
        text: "Ruangan berhasil ditambahkan.",
        icon: "success",
        button: "OK",
      });
    } catch (error) {
      console.error("Error adding ruangan:", error);

      // Menampilkan SweetAlert error jika gagal
      swal({
        title: "Error!",
        text: "Terjadi kesalahan saat menambahkan ruangan.",
        icon: "error",
        button: "Coba Lagi",
      });
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], [name]: value };
    setRooms(updatedRooms);
  };

  const handleFileChange = (e, index) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], gambar: e.target.files[0] };
    setRooms(updatedRooms);
  };

  const handleAddRoom = () => {
    setRooms([
      ...rooms,
      {
        name: "",
        gambar: "",
        lantai: "",
        kapasitas: "",
        jeniskelas: "",
        modelkelas: "",
        saranakelas: "",
      },
    ]);
  };

  const handleRemoveRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  const handleClickOpen = () => {
    setOpen(true); // Open the modal
  };

  const handleClose = () => {
    setOpen(false); // Close the modal
  };

  useEffect(() => {
    const fetchRuangan = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/ruangan/${gedungId}`);
        const parsed = response.data.map(parseRoomData);
        setRuangan(parsed);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRuangan();
  }, [gedungId]);

  const handleCardClick = (roomId, event) => {
    const selectedRoom = ruangan.find((room) => room.id === roomId);
    setSelectedRoom(selectedRoom);
    setAnchorEl(event.currentTarget); // Setel anchorEl ke elemen yang diklik
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        image: file, // Store the image file in state
      }));
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };
  const handleOpenModal = () => {
    if (selectedRoom) {
      // Parsing string ke array dulu
      const parseArray = (str) => {
        try {
          return JSON.parse(str);
        } catch (e) {
          return [];
        }
      };

      // Fungsi untuk mencocokkan ID dengan options dari API
      const mapToOptions = (ids, options) => {
        if (!Array.isArray(ids)) return [];
        return options.filter((option) => ids.includes(String(option.value)));
      };

      const jeniskelasIDs = Array.isArray(selectedRoom.jeniskelas) ? selectedRoom.jeniskelas : JSON.parse(selectedRoom.jeniskelas || "[]");

      const modelkelasIDs = Array.isArray(selectedRoom.modelkelas) ? selectedRoom.modelkelas : JSON.parse(selectedRoom.modelkelas || "[]");

      const saranakelasIDs = Array.isArray(selectedRoom.saranakelas) ? selectedRoom.saranakelas : JSON.parse(selectedRoom.saranakelas || "[]");

      setFormData({
        name: selectedRoom.name,
        lantai: selectedRoom.lantai,
        kapasitas: selectedRoom.kapasitas,
        jeniskelas: jenisKelasOptions.filter((opt) => jeniskelasIDs.includes(opt.value)),
        modelkelas: modelKelasOptions.filter((opt) => modelkelasIDs.includes(opt.value)),
        saranakelas: saranaKelasOptions.filter((opt) => saranakelasIDs.includes(opt.value)),
      });
    }

    setOpenModal(true);
    handleClosePopover();
  };
  const handleCloseModal = () => {
    setOpenModal(false); // Tutup modal
  };

  const handleModalClose = () => {
    setOpenModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const getRoomStatusColor = (status) => {
    switch (status) {
      case "dipinjam":
        return "red";
      case "diperbaiki":
        return "#d9ee18";
      case "kosong":
        return "#ecf0f1";
      default:
        return "#ecf0f1"; // Default to 'kosong' color if status is unknown
    }
  };

  const handleUpdateRoom = async () => {
    try {
      const jeniskelasValues = formData.jeniskelas ? formData.jeniskelas.map((item) => String(item.value)) : [];
      const modelkelasValues = formData.modelkelas ? formData.modelkelas.map((item) => String(item.value)) : [];
      const saranakelasValues = formData.saranakelas ? formData.saranakelas.map((item) => String(item.value)) : [];

      const payload = {
        name: formData.name,
        lantai: formData.lantai,
        kapasitas: parseInt(formData.kapasitas, 10),
        jeniskelas: jeniskelasValues,
        modelkelas: modelkelasValues,
        saranakelas: saranakelasValues,
      };

      console.log("Payload dikirim:", payload);

      const response = await axios.put(`http://localhost:8000/api/perbaruiruangan/${selectedRoom.id}`, payload);

      if (response.status === 200) {
        setRuangan(ruangan.map((room) => (room.id === selectedRoom.id ? { ...room, ...payload } : room)));
        swal({
          title: "Berhasil!",
          text: "Ruangan berhasil diperbarui.",
          icon: "success",
          button: "OK",
        });
        setOpenModal(false);
      }
    } catch (error) {
      console.error("Error update ruangan:", error);
      swal({
        title: "Gagal!",
        text: "Gagal memperbarui ruangan.",
        icon: "error",
        button: "OK",
      });
    }
  };
  const handleAction = (action) => {
    switch (action) {
      case "detail":
        navigate(`/ruangan/${gedungId}/detail/${selectedRoom.id}`);
        break;

      case "update":
        navigate(`/update-ruangan/${gedungId}/${selectedRoom.id}`);
        break;

      case "updateStatus":
        // SweetAlert1 untuk konfirmasi
        swal({
          title: "Apakah Anda yakin?",
          text: "Status ruangan akan diperbarui menjadi 'Diperbaiki'.",
          icon: "warning",
          buttons: ["Batal", "Ya, Perbarui!"],
          dangerMode: true,
        }).then((willUpdate) => {
          if (willUpdate) {
            // Lakukan update status ruangan
            axios
              .put(`http://localhost:8000/api/ruangan/${selectedRoom.id}`, { statusruangan: "diperbaiki" })
              .then(() => {
                // Update status ruangan di UI langsung setelah berhasil
                setRuangan(ruangan.map((room) => (room.id === selectedRoom.id ? { ...room, statusruangan: "diperbaiki" } : room)));

                // Tampilkan notifikasi sukses menggunakan SweetAlert1
                swal({
                  title: "Berhasil!",
                  text: "Status ruangan berhasil diperbarui ke 'Diperbaiki'.",
                  icon: "success",
                  button: "OK",
                });
              })
              .catch((error) => {
                console.error("Error updating room status:", error);
                // Tampilkan notifikasi gagal menggunakan SweetAlert1
                swal({
                  title: "Gagal!",
                  text: "Gagal memperbarui status ruangan.",
                  icon: "error",
                  button: "OK",
                });
              });
          }
        });
        break;

      default:
        break;
    }
    handleClosePopover();
  };

  const handleDelete = async () => {
    // SweetAlert1 for deletion confirmation
    swal({
      title: "Apakah Anda yakin?",
      text: `Anda akan menghapus ruangan ${selectedRoom.name}.`,
      icon: "warning",
      buttons: ["Batal", "Ya, Hapus!"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        try {
          // Menghapus ruangan dengan axios
          await axios.delete(`http://localhost:8000/api/ruangan/${selectedRoom.id}`);

          // Menghapus ruangan dari state ruangan
          setRuangan(ruangan.filter((room) => room.id !== selectedRoom.id));

          // Menampilkan SweetAlert sukses
          swal({
            title: "Sukses!",
            text: `Ruangan ${selectedRoom.name} berhasil dihapus.`,
            icon: "success",
            button: "OK",
          });
        } catch (error) {
          console.error("Error deleting room:", error);

          // Menampilkan SweetAlert error jika penghapusan gagal
          swal({
            title: "Gagal!",
            text: "Terjadi kesalahan saat menghapus ruangan.",
            icon: "error",
            button: "Coba Lagi",
          });
        }
      }
    });
    handleClosePopover();
  };

  const handleUpdateStatusToKosong = () => {
    swal({
      title: "Apakah Anda yakin?",
      text: "Status ruangan akan diperbarui menjadi 'Kosong'.",
      icon: "warning",
      buttons: ["Batal", "Ya, Perbarui!"],
      dangerMode: true,
    }).then((willUpdate) => {
      if (willUpdate) {
        axios
          .put(`http://localhost:8000/api/ruangan/${selectedRoom.id}`, { statusruangan: "kosong" })
          .then(() => {
            setRuangan(ruangan.map((room) => (room.id === selectedRoom.id ? { ...room, statusruangan: "kosong" } : room)));
            swal({
              title: "Berhasil!",
              text: "Status ruangan berhasil diperbarui ke 'Kosong'.",
              icon: "success",
              button: "OK",
            });
          })
          .catch((error) => {
            console.error("Error updating room status:", error);
            swal({
              title: "Gagal!",
              text: "Gagal memperbarui status ruangan.",
              icon: "error",
              button: "OK",
            });
          });
      }
    });
    handleClosePopover();
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0 }}>
        <Button
          variant="contained"
          onClick={handleClickOpen}
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
          Tambah Ruangan
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

      {/* Informasi warna ruangan */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box sx={{ width: 17, height: 17, backgroundColor: "red", borderRadius: "4px" }} />
        <Typography variant="body2" sx={{ color: "#2c3e50" }}>
          Ruangan sedang digunakan
        </Typography>
        <Box sx={{ width: 17, height: 17, backgroundColor: "#ecf0f1", borderRadius: "4px" }} />
        <Typography variant="body2" sx={{ color: "#2c3e50" }}>
          Ruangan kosong
        </Typography>
        <Box sx={{ width: 17, height: 17, backgroundColor: "#d9ee18", borderRadius: "4px" }} />
        <Typography variant="body2" sx={{ color: "#2c3e50" }}>
          Ruangan sedang diperbaiki
        </Typography>
      </Box>

      {(() => {
        // 1. Buat map lantai ke ruangan
        const groupedByFloor = ruangan.reduce((acc, room) => {
          const lantai = parseInt(room.lantai, 10) || 0;
          if (!acc[lantai]) acc[lantai] = [];
          acc[lantai].push(room);
          return acc;
        }, {});

        // 2. Cari lantai maksimum
        const maxFloor = Math.max(...Object.keys(groupedByFloor).map(Number));

        // 3. Render semua lantai dari 1 hingga maxFloor
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start", // center seluruh lantai secara horizontal
              flexWrap: "wrap",
              gap: 4,
              pb: 3,
              rowGap: 2, // Menjaga jarak antar baris lantai
            }}
          >
            {Array.from({ length: maxFloor }, (_, i) => {
              const lantai = i + 1;
              const rooms = groupedByFloor[lantai] || [];

              return (
                <Box
                  key={lantai}
                  sx={{
                    width: "200px", // Tetapkan lebar tetap per lantai
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    height: "auto", // Biarkan tinggi mengikuti konten (ruangan)
                  }}
                >
                  {/* Lantai Title */}
                  <Box
                    sx={{
                      mt: "10px",
                      width: "100%",
                      height: "40px", // Fixed height untuk title lantai
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 2,
                      backgroundColor: "#ecf0f1",
                      borderRadius: "4px",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        textAlign: "center",
                        textTransform: "uppercase",
                        color: "#2c3e50",
                        fontSize: "14px", // ⬅️ Ubah sesuai keinginan, misalnya 16px, 20px, dll
                      }}
                    >
                      Lantai {lantai}
                    </Typography>
                  </Box>

                  {/* Ruangan Cards */}
                  <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-start", alignItems: "flex-start" }}>
                    <Grid container spacing={1.4} wrap="wrap" columns={12} justifyContent="center">
                      {rooms.length > 0 ? (
                        rooms.map((room) => (
                          <Grid item key={room.id} xs={3} sx={{ display: "flex", justifyContent: "center" }}>
                            <Card
                              onClick={(event) => handleCardClick(room.id, event)}
                              sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: getRoomStatusColor(room.statusruangan),
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                cursor: "pointer",
                                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                                transition: "all 0.2s ease-in-out",
                                border: "1px solid #e0e0e0",
                                "&:hover": {
                                  boxShadow: "0 8px 20px rgba(0, 123, 255, 0.25)",
                                  borderColor: "#007BFF",
                                  transform: "scale(1.1)",
                                  color: "#007BFF",
                                  backgroundColor: "#f0f8ff", // sangat soft biru muda saat hover
                                },
                              }}
                            >
                              <Typography variant="caption" fontWeight="600" fontSize="9px" sx={{ color: "inherit", textTransform: "uppercase" }}>
                                {room.name}
                              </Typography>
                            </Card>
                          </Grid>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            fontStyle: "italic",
                            textAlign: "center",
                            width: "100%",
                            mb: "80px",
                            mt: 0, // Menghilangkan margin top agar dekat dengan Lantai
                          }}
                        >
                          Tidak ada ruangan
                        </Typography>
                      )}
                    </Grid>
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      })()}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: 4,
            bgcolor: "#ffffff",
            paddingY: 1,
          },
        }}
      >
        <MenuList disablePadding>
          {/* Jika status ruangan "kosong" */}
          {selectedRoom && selectedRoom.statusruangan === "kosong" && (
            <>
              <MenuItem sx={menuItemStyle} onClick={() => handleAction("detail")}>
                <BsInfoCircle size={18} color="#0C20B5" />
                <Typography variant="body2">Lihat Detail</Typography>
              </MenuItem>

              <MenuItem sx={menuItemStyle} onClick={handleOpenModal}>
                <MdEdit size={20} color="#1976d2" />
                <Typography variant="body2">Update</Typography>
              </MenuItem>

              <MenuItem sx={menuItemStyle} onClick={handleDelete}>
                <MdDelete size={20} color="#d32f2f" />
                <Typography variant="body2">Hapus</Typography>
              </MenuItem>

              <Divider sx={{ my: 0.5 }} />

              <MenuItem sx={menuItemStyle} onClick={() => handleAction("updateStatus")}>
                <MdBuild size={20} color="#ffa000" />
                <Typography variant="body2">Tandai Diperbaiki</Typography>
              </MenuItem>
            </>
          )}

          {/* Jika status ruangan "diperbaiki" */}
          {selectedRoom && selectedRoom.statusruangan === "diperbaiki" && (
            <>
              <MenuItem sx={menuItemStyle} onClick={() => handleAction("detail")}>
                <BsInfoCircle size={18} color="#0C20B5" />
                <Typography variant="body2">Lihat Detail</Typography>
              </MenuItem>

              <MenuItem sx={menuItemStyle} onClick={handleUpdateStatusToKosong}>
                <MdCheckCircle size={20} color="#2e7d32" />
                <Typography variant="body2">Selesai Diperbaiki</Typography>
              </MenuItem>
            </>
          )}

          {/* Jika status ruangan "dipinjam" */}
          {selectedRoom && selectedRoom.statusruangan === "dipinjam" && (
            <MenuItem sx={menuItemStyle} onClick={() => handleAction("detail")}>
              <BsInfoCircle size={18} color="#0C20B5" />
              <Typography variant="body2">Lihat Detail</Typography>
            </MenuItem>
          )}
        </MenuList>
      </Popover>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle
          sx={{
            textAlign: "left",
            padding: "24px",
            marginBottom: "-30px",
            fontWeight: "bold",
            fontSize: "20px",
            color: "#3449e4",
          }}
        >
          Edit Ruangan
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
        {/* Modal Content */}
        <DialogContent
          autocomplete="off"
          sx={{
            padding: "24px",
            width: "400px",
            maxHeight: "250px",
            backgroundColor: "#f9f9f9",

            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            overflowY: "scroll", // Membuat konten bisa digulir
            "&::-webkit-scrollbar": {
              display: "none", // Menyembunyikan scrollbar di Webkit (Chrome/Safari)
            },
            scrollbarWidth: "none", // Menyembunyikan scrollbar di Firefox
          }}
          autoComplete="off"
        >
          {/* Nama Ruangan */}
          <Box sx={{ marginBottom: "5px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Nama Ruangan
            </Typography>
            <TextField
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              placeholder="Masukkan Kapasitas Ruangan..."
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
          {/* Lantai */}
          <Box sx={{ marginBottom: "5px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Lantai Ruangan
            </Typography>
            <TextField
              name="lantai"
              value={formData.lantai}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              placeholder="Masukkan Kapasitas Ruangan..."
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

          {/* Kapasitas */}
          <Box sx={{ marginBottom: "5px" }}>
            <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
              Kapasitas Ruangan
            </Typography>
            <TextField
              name="kapasitas"
              value={formData.kapasitas}
              onChange={handleFormChange}
              fullWidth
              margin="normal"
              placeholder="Masukkan Kapasitas Ruangan..."
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
          {/* Jenis Kelas */}
          <Box sx={{ marginBottom: "15px" }}>
            <Typography variant="body2" sx={{ marginBottom: "5px", color: "#333" }}>
              Jenis Kelas
            </Typography>
            <Select
              isMulti
              name="jeniskelas"
              options={jenisKelasOptions}
              value={formData.jeniskelas}
              onChange={(selected) => setFormData((prev) => ({ ...prev, jeniskelas: selected }))}
              placeholder="Pilih Jenis Kelas..."
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: 45,
                  borderRadius: 12,
                  borderColor: "#ccc",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  "&:hover": { borderColor: "#0C20B5" },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#e6f0ff",
                  color: "#0C20B5",
                }),
              }}
            />
          </Box>

          {/* Model Kelas */}
          <Box sx={{ marginBottom: "15px" }}>
            <Typography variant="body2" sx={{ marginBottom: "5px", color: "#333" }}>
              Model Kelas
            </Typography>
            <Select
              isMulti
              name="modelkelas"
              options={modelKelasOptions}
              value={formData.modelkelas}
              onChange={(selected) => setFormData((prev) => ({ ...prev, modelkelas: selected }))}
              placeholder="Pilih Model Kelas..."
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: 45,
                  borderRadius: 12,
                  borderColor: "#ccc",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  "&:hover": { borderColor: "#0C20B5" },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#e6f0ff",
                  color: "#0C20B5",
                }),
              }}
            />
          </Box>

          {/* Sarana Kelas */}
          <Box sx={{ marginBottom: "15px" }}>
            <Typography variant="body2" sx={{ marginBottom: "5px", color: "#333" }}>
              Sarana Kelas
            </Typography>
            <Select
              isMulti
              name="saranakelas"
              options={saranaKelasOptions}
              value={formData.saranakelas}
              onChange={(selected) => setFormData((prev) => ({ ...prev, saranakelas: selected }))}
              placeholder="Pilih Jenis Kelas..."
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: 45,
                  borderRadius: 12,
                  borderColor: "#ccc",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  "&:hover": { borderColor: "#0C20B5" },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#e6f0ff",
                  color: "#0C20B5",
                }),
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

          <Tooltip title="Simpan Perbarui ruangan?" arrow>
            <Box
              onClick={handleUpdateRoom}
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
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)} message={snackbarMessage} />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle
          sx={{
            textAlign: "left",
            padding: "24px",
            marginBottom: "-30px",
            fontWeight: "bold",
            fontSize: "20px",
            color: "#3449e4",
          }}
        >
          Tambah Ruangan
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

        <form onSubmit={handleSubmit}>
          {rooms.map((room, index) => (
            <DialogContent
              autocomplete="off"
              sx={{
                padding: "24px",
                width: "400px",
                maxHeight: "250px",
                backgroundColor: "#f9f9f9",
                alignItems: "flex-start", // Ini memastikan isi kiri
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                overflowY: "scroll", // Membuat konten bisa digulir
                "&::-webkit-scrollbar": {
                  display: "none", // Menyembunyikan scrollbar di Webkit (Chrome/Safari)
                },
                scrollbarWidth: "none", // Menyembunyikan scrollbar di Firefox
              }}
              autoComplete="off"
            >
              <Grid item xs={12}>
                <Box sx={{ marginBottom: "5px" }}>
                  <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
                    Nama Ruangan
                  </Typography>
                  <TextField
                    name="name"
                    value={room.name}
                    onChange={(e) => handleChange(e, index)}
                    fullWidth
                    margin="normal"
                    placeholder="Masukkan Nama Ruangan..."
                    InputProps={{
                      disableUnderline: true,
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
              </Grid>

              {/* Gambar Ruangan */}
              <Grid item xs={12}>
                <Box sx={{ marginBottom: "5px" }}>
                  <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
                    Gambar Ruangan
                  </Typography>
                  <TextField
                    type="file"
                    name="gambar"
                    onChange={(e) => handleFileChange(e, index)}
                    fullWidth
                    margin="normal"
                    sx={{
                      height: "45px",
                      borderRadius: 3, // Rounded corners for modern feel
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                      "& .MuiOutlinedInput-root": {
                        height: "45px",
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#0C20B5",
                          borderWidth: "1px", // default MUI = 2px (tebal)
                        },
                        "& fieldset": {
                          borderColor: "#ccc",
                          borderRadius: 3, // <-- Tambahkan ini supaya border radius ke fieldset
                        },
                        "&:hover fieldset": {
                          borderColor: "#0C20B5",
                          borderRadius: 3, // pastikan juga saat hover radius tetap
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#0C20B5",
                          borderRadius: 3, // dan saat fokus juga
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>

              {/* Lantai */}
              <Grid item xs={6}>
                <Box sx={{ marginBottom: "5px" }}>
                  <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
                    Lantai Ruangan
                  </Typography>
                  <TextField
                    name="lantai"
                    value={room.lantai}
                    onChange={(e) => handleChange(e, index)}
                    fullWidth
                    placeholder="Masukkan Lantai Ruangan..."
                    margin="normal"
                    InputProps={{
                      disableUnderline: true,
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
              </Grid>

              {/* Kapasitas */}
              <Grid item xs={6}>
                <Box sx={{ marginBottom: "5px" }}>
                  <Typography variant="body2" sx={{ marginBottom: "-10px", color: "#333" }}>
                    Kapasitas Ruangan
                  </Typography>
                  <TextField
                    type="number"
                    name="kapasitas"
                    value={room.kapasitas}
                    onChange={(e) => handleChange(e, index)}
                    fullWidth
                    margin="normal"
                    placeholder="Masukkan Kapasitas Ruangan..."
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
              </Grid>

              {/* Jenis Kelas */}
              <Box sx={{ marginBottom: "15px" }}>
                <Typography variant="body2" sx={{ marginBottom: "5px", color: "#333" }}>
                  Jenis Ruangan
                </Typography>
                {rooms.map((room, index) => (
                  <Select
                    key={index}
                    isMulti
                    name="jeniskelas"
                    options={jenisKelasOptions}
                    value={room.jeniskelas}
                    onChange={(selected) => handleMultiSelectChange(selected, "jeniskelas", index)}
                    placeholder="Pilih Jenis Ruangan..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 45,
                        borderRadius: 12,
                        borderColor: "#ccc",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                        "&:hover": { borderColor: "#0C20B5" },
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#e6f0ff",
                        color: "#0C20B5",
                      }),
                    }}
                  />
                ))}
              </Box>

              {/* Model Kelas */}
              <Box sx={{ marginBottom: "15px" }}>
                <Typography variant="body2" sx={{ marginBottom: "5px", color: "#333" }}>
                  Model Ruangan
                </Typography>
                {rooms.map((room, index) => (
                  <Select
                    key={index}
                    isMulti
                    name="modelkelas"
                    options={modelKelasOptions}
                    value={room.modelkelas}
                    onChange={(selected) => handleMultiSelectChange(selected, "modelkelas", index)}
                    placeholder="Pilih Model Ruangan..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 45,
                        borderRadius: 12,
                        borderColor: "#ccc",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                        "&:hover": { borderColor: "#0C20B5" },
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#e6f0ff",
                        color: "#0C20B5",
                      }),
                    }}
                  />
                ))}
              </Box>

              {/* Sarana Kelas */}
              <Box sx={{ marginBottom: "15px" }}>
                <Typography variant="body2" sx={{ marginBottom: "5px", color: "#333" }}>
                  Sarana Ruangan
                </Typography>
                {rooms.map((room, index) => (
                  <Select
                    key={index}
                    isMulti
                    name="saranakelas"
                    options={saranaKelasOptions}
                    value={room.saranakelas}
                    onChange={(selected) => handleMultiSelectChange(selected, "saranakelas", index)}
                    placeholder="Pilih Sarana Ruangan..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 45,
                        borderRadius: 12,
                        borderColor: "#ccc",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                        "&:hover": { borderColor: "#0C20B5" },
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#e6f0ff",
                        color: "#0C20B5",
                      }),
                    }}
                  />
                ))}
              </Box>
            </DialogContent>
          ))}
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

            <Tooltip title="Simpan Ruangan?" arrow>
              <Box
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
                Simpan
                <SaveIcon fontSize="small" />
              </Box>
            </Tooltip>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default Ruangan;
