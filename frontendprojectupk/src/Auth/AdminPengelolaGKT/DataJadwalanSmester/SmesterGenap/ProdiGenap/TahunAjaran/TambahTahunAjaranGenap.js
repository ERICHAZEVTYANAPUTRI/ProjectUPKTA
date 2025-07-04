import axios from "axios";
import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../../Components/Sidebar/Sidebar";

const TambahTahunAjaranGenap = () => {
  const { prodigenapId, kodejurusangenap } = useParams();
  const navigate = useNavigate();

  const [tahunAjarangenap, setTahunAjarangenap] = useState([{ tahun: "", semester: "genap" }]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...tahunAjarangenap];
    updated[index][name] = value;
    setTahunAjarangenap(updated);
  };

  const handleAddTahun = () => {
    setTahunAjarangenap([...tahunAjarangenap, { tahun: "", semester: "genap" }]);
  };

  const handleRemoveTahun = (index) => {
    const updated = tahunAjarangenap.filter((_, i) => i !== index);
    setTahunAjarangenap(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/tahunajarangenap", {
        kodeprodigenap: prodigenapId,
        tahun_ajaran: tahunAjarangenap.map((item) => ({
          tahunajarangenap: item.tahun,
        })),
      });
      navigate(`/prodigenap/${kodejurusangenap}/detailgenap/${prodigenapId}`);
    } catch (error) {
      console.error("Error adding tahun ajaran:", error);
    }
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1>Tambah Tahun Ajaran untuk Prodi ID: {prodigenapId}</h1>
      <Form onSubmit={handleSubmit}>
        {tahunAjarangenap.map((item, index) => (
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

              {tahunAjarangenap.length > 1 && (
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

export default TambahTahunAjaranGenap;
