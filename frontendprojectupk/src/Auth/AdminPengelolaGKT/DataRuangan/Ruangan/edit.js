import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../Components/Sidebar/Sidebar";

const EditRuangan = () => {
  const { gedungId, roomId } = useParams();
  const navigate = useNavigate();

  const [gedung, setGedung] = useState(null);
  const [room, setRoom] = useState({
    name: "",
    gambar: null,
    lantai: "",
    kapasitas: "",
    jeniskelas: "",
    modelkelas: "",
    saranakelas: "",
  });

  const [loading, setLoading] = useState(true); // Track loading state for room data
  const [open, setOpen] = useState(true); // Make modal open by default for direct editing

  // Fetch Gedung details (optional)
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

  // Fetch Room details for editing
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/ruangan/${roomId}`);
        console.log(response.data); // Log fetched data to check if it's correct
        setRoom(response.data); // Populate room state with the fetched data
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching room:", error);
        setLoading(false); // Ensure loading is set to false even if there's an error
      }
    };
    fetchRoom();
  }, [roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", room.name);
    formData.append("gambar", room.gambar);
    formData.append("lantai", room.lantai);
    formData.append("kapasitas", room.kapasitas);
    formData.append("jeniskelas", room.jeniskelas);
    formData.append("modelkelas", room.modelkelas);
    formData.append("saranakelas", room.saranakelas);
    formData.append("gedung", gedungId);

    try {
      await axios.put(`http://localhost:8000/api/ruangan/${roomId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/ruangan/${gedungId}`);
    } catch (error) {
      console.error("Error updating ruangan:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom({ ...room, [name]: value });
  };

  const handleFileChange = (e) => {
    setRoom({ ...room, gambar: e.target.files[0] });
  };

  const handleClose = () => {
    setOpen(false); // Close the modal
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while data is being fetched
  }

  // Make sure room data is populated
  console.log(room); // Log room state to check if data is populated

  return (
    <div>
      <Navbar />
      <Sidebar />
      {gedung && <h1>Edit Ruangan Di Gedung {gedung.name}</h1>}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Edit Ruangan</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField label="Nama Ruangan" name="name" value={room.name} onChange={handleChange} fullWidth required />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Gambar Ruangan" type="file" name="gambar" onChange={handleFileChange} fullWidth />
              </Grid>

              <Grid item xs={6}>
                <TextField label="Lantai" name="lantai" value={room.lantai} onChange={handleChange} fullWidth required />
              </Grid>

              <Grid item xs={6}>
                <TextField label="Kapasitas" type="number" name="kapasitas" value={room.kapasitas} onChange={handleChange} fullWidth required />
              </Grid>

              <Grid item xs={6}>
                <TextField label="Jenis Kelas" name="jeniskelas" value={room.jeniskelas} onChange={handleChange} fullWidth required />
              </Grid>

              <Grid item xs={6}>
                <TextField label="Model Kelas" name="modelkelas" value={room.modelkelas} onChange={handleChange} fullWidth required />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Sarana Kelas" name="saranakelas" value={room.saranakelas} onChange={handleChange} fullWidth required />
              </Grid>
            </Grid>

            <DialogActions>
              <Button variant="outlined" onClick={handleClose} color="secondary">
                Batal
              </Button>
              <Button variant="contained" type="submit" color="primary">
                Simpan Perubahan
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditRuangan;
