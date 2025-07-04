import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../Components/Sidebar/Sidebar";

const TambahProdiGanjil = () => {
  const { kodejurusanganjil } = useParams();
  const navigate = useNavigate();

  const [jurusan, setJurusan] = useState(null);
  const [prodiganjil, setProdiganjil] = useState([{ kodeprodiganjil: "", singkatanprodiganjil: "", namaprodiganjil: "" }]);

  useEffect(() => {
    if (!kodejurusanganjil) return;

    const fetchJurusanganjil = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/jurusanganjil/${kodejurusanganjil}`);
        setJurusan(response.data);
      } catch (error) {
        console.error("Error fetching jurusan:", error);
      }
    };

    fetchJurusanganjil();
  }, [kodejurusanganjil]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/api/prodiganjil", {
        prodiganjil: prodiganjil,
        kodejurusanganjil: kodejurusanganjil,
      });

      navigate(`/prodiganjil/${kodejurusanganjil}`);
    } catch (error) {
      console.error("Error adding prodi:", error);
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedProdiganjil = [...prodiganjil];
    updatedProdiganjil[index] = { ...updatedProdiganjil[index], [name]: value };
    setProdiganjil(updatedProdiganjil);
  };

  const handleAddProdiganjil = () => {
    setProdiganjil([...prodiganjil, { kodeprodiganjil: "", singkatanprodiganjil: "", namaprodiganjil: "" }]);
  };

  const handleRemoveProdiganjil = (index) => {
    const updatedProdiganjil = prodiganjil.filter((_, i) => i !== index);
    setProdiganjil(updatedProdiganjil);
  };

  return (
    <div>
      <Navbar />
      <Sidebar />
      {jurusan && <h1>Tambah Prodi Baru Di Jurusan {jurusan.name}</h1>}
      <Form onSubmit={handleSubmit}>
        {prodiganjil.map((program, index) => (
          <Card key={index} className="mb-4">
            <Card.Body>
              <h5>Prodi {index + 1}</h5>
              <Form.Group controlId={`formkodeprodiganjil${index}`}>
                <Form.Label>Kode Prodi</Form.Label>
                <Form.Control type="text" name="kodeprodiganjil" value={program.kodeprodiganjil} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>
              <Form.Group controlId={`formSingkatanProdiganjil${index}`}>
                <Form.Label>Singkatan Prodi</Form.Label>
                <Form.Control type="text" name="singkatanprodiganjil" value={program.singkatanprodiganjil} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>
              <Form.Group controlId={`formNamaProdiganjil${index}`}>
                <Form.Label>Nama Prodi</Form.Label>
                <Form.Control type="text" name="namaprodiganjil" value={program.namaprodiganjil} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              {prodiganjil.length > 1 && (
                <Button variant="danger" onClick={() => handleRemoveProdiganjil(index)} className="mt-2">
                  Hapus Prodi
                </Button>
              )}
            </Card.Body>
          </Card>
        ))}

        <Button variant="primary" onClick={handleAddProdiganjil} className="mb-3">
          Tambah Prodi Lainnya
        </Button>

        <Button variant="success" type="submit">
          Tambahkan Prodi
        </Button>
      </Form>
    </div>
  );
};

export default TambahProdiGanjil;
