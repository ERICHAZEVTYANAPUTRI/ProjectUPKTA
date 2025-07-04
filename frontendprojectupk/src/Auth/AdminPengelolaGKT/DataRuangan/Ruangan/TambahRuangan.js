import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../Components/Sidebar/Sidebar";

const TambahRuangan = () => {
  const { gedungId } = useParams();
  const navigate = useNavigate();

  const [gedung, setGedung] = useState(null);
  const [rooms, setRooms] = useState([{ name: "", gambar: "", lantai: "", kapasitas: "", jeniskelas: "", modelkelas: "", saranakelas: "" }]);

  useEffect(() => {
    const fetchGedung = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/gedungs/${gedungId}`);
        console.log("Gedung Data:", response.data);
        setGedung(response.data);
      } catch (error) {
        console.error("Error fetching gedung:", error);
      }
    };
    fetchGedung();
  }, [gedungId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    rooms.forEach((room, index) => {
      formData.append(`name[]`, room.name);
      formData.append(`gambar[]`, room.gambar);
      formData.append(`lantai[]`, room.lantai);
      formData.append(`kapasitas[]`, room.kapasitas);
      formData.append(`jeniskelas[]`, room.jeniskelas);
      formData.append(`modelkelas[]`, room.modelkelas);
      formData.append(`saranakelas[]`, room.saranakelas);
      formData.append(`gedung[]`, gedungId);
    });

    try {
      await axios.post("http://localhost:8000/api/ruangan", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/ruangan/${gedungId}`);
    } catch (error) {
      console.error("Error adding ruangan:", error);
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
    setRooms([...rooms, { name: "", gambar: "", lantai: "", kapasitas: "", jeniskelas: "", modelkelas: "", saranakelas: "" }]);
  };

  const handleRemoveRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  return (
    <div>
      <Navbar />
      <Sidebar />
      {gedung && <h1>Tambah Ruangan Baru Di Gedung {gedung.name}</h1>}
      <Form onSubmit={handleSubmit}>
        {rooms.map((room, index) => (
          <Card key={index} className="mb-4">
            <Card.Body>
              <h5>Ruangan {index + 1}</h5>
              <Form.Group controlId={`formName${index}`}>
                <Form.Label>Nama Ruangan</Form.Label>
                <Form.Control type="text" name="name" value={room.name} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              <Form.Group controlId={`formGambar${index}`}>
                <Form.Label>Gambar Ruangan</Form.Label>
                <Form.Control type="file" name="gambar" onChange={(e) => handleFileChange(e, index)} />
              </Form.Group>

              <Form.Group controlId={`formLantai${index}`}>
                <Form.Label>Lantai</Form.Label>
                <Form.Control type="text" name="lantai" value={room.lantai} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              <Form.Group controlId={`formKapasitas${index}`}>
                <Form.Label>Kapasitas</Form.Label>
                <Form.Control type="number" name="kapasitas" value={room.kapasitas} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              <Form.Group controlId={`formJeniskelas${index}`}>
                <Form.Label>Jenis Kelas</Form.Label>
                <Form.Control type="text" name="jeniskelas" value={room.jeniskelas} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              <Form.Group controlId={`formModelkelas${index}`}>
                <Form.Label>Model Kelas</Form.Label>
                <Form.Control type="text" name="modelkelas" value={room.modelkelas} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              <Form.Group controlId={`formSaranakelas${index}`}>
                <Form.Label>Sarana Kelas</Form.Label>
                <Form.Control type="text" name="saranakelas" value={room.saranakelas} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              {rooms.length > 1 && (
                <Button variant="danger" onClick={() => handleRemoveRoom(index)} className="mt-2">
                  Hapus Ruangan
                </Button>
              )}
            </Card.Body>
          </Card>
        ))}

        <Button variant="primary" onClick={handleAddRoom} className="mb-3">
          Tambah Ruangan Lainnya
        </Button>

        <Button variant="success" type="submit">
          Tambahkan Ruangan
        </Button>
      </Form>
    </div>
  );
};

export default TambahRuangan;
