import axios from "axios";
import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../../Components/Sidebar/Sidebar";

const TambahTahunAjaranGanjil = () => {
  const { prodiganjilId, kodejurusanganjil } = useParams();
  const navigate = useNavigate();

  const [tahunAjaranganjil, setTahunAjaranganjil] = useState([{ tahun: "", semester: "ganjil" }]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...tahunAjaranganjil];
    updated[index][name] = value;
    setTahunAjaranganjil(updated);
  };

  const handleAddTahun = () => {
    setTahunAjaranganjil([...tahunAjaranganjil, { tahun: "", semester: "ganjil" }]);
  };

  const handleRemoveTahun = (index) => {
    const updated = tahunAjaranganjil.filter((_, i) => i !== index);
    setTahunAjaranganjil(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/tahunajaranganjil", {
        kodeprodiganjil: prodiganjilId,
        tahun_ajaran: tahunAjaranganjil.map((item) => ({
          tahunajaranganjil: item.tahun,
        })),
      });
      navigate(`/prodiganjil/${kodejurusanganjil}/detailganjil/${prodiganjilId}`);
    } catch (error) {
      console.error("Error adding tahun ajaran:", error);
    }
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1>Tambah Tahun Ajaran untuk Prodi ID: {prodiganjilId}</h1>
      <Form onSubmit={handleSubmit}>
        {tahunAjaranganjil.map((item, index) => (
          <Card key={index} className="mb-3">
            <Card.Body>
              <h5>Tahun Ajaran {index + 1}</h5>
              <Form.Group>
                <Form.Label>Tahun</Form.Label>
                <Form.Control type="text" name="tahun" value={item.tahun} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label>Semester</Form.Label>
                <Form.Control type="text" name="semester" value={item.semester} disabled />
              </Form.Group>

              {tahunAjaranganjil.length > 1 && (
                <Button variant="danger" className="mt-2" onClick={() => handleRemoveTahun(index)}>
                  Hapus
                </Button>
              )}
            </Card.Body>
          </Card>
        ))}

        <Button variant="primary" onClick={handleAddTahun}>
          Tambah Tahun Ajaran Lagi
        </Button>

        <Button variant="success" type="submit" className="ms-2">
          Simpan
        </Button>
      </Form>
    </div>
  );
};

export default TambahTahunAjaranGanjil;
