import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../Components/Sidebar/Sidebar";

const TambahProdiGenap = () => {
  const { kodejurusangenap } = useParams();
  const navigate = useNavigate();

  const [jurusan, setJurusan] = useState(null);
  const [prodigenap, setProdigenap] = useState([{ kodeprodigenap: "", singkatanprodigenap: "", namaprodigenap: "" }]);

  useEffect(() => {
    if (!kodejurusangenap) return;

    const fetchJurusangenap = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/jurusangenap/${kodejurusangenap}`);
        setJurusan(response.data);
      } catch (error) {
        console.error("Error fetching jurusan:", error);
      }
    };

    fetchJurusangenap();
  }, [kodejurusangenap]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/api/prodigenap", {
        prodigenap: prodigenap,
        kodejurusangenap: kodejurusangenap,
      });

      navigate(`/prodigenap/${kodejurusangenap}`);
    } catch (error) {
      console.error("Error adding prodi:", error);
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedProdigenap = [...prodigenap];
    updatedProdigenap[index] = { ...updatedProdigenap[index], [name]: value };
    setProdigenap(updatedProdigenap);
  };

  const handleAddProdigenap = () => {
    setProdigenap([...prodigenap, { kodeprodigenap: "", singkatanprodigenap: "", namaprodigenap: "" }]);
  };

  const handleRemoveProdigenap = (index) => {
    const updatedProdigenap = prodigenap.filter((_, i) => i !== index);
    setProdigenap(updatedProdigenap);
  };

  return (
    <div>
      <Navbar />
      <Sidebar />
      {jurusan && <h1>Tambah Prodi Baru Di Jurusan {jurusan.name}</h1>}
      <Form onSubmit={handleSubmit}>
        {prodigenap.map((program, index) => (
          <Card key={index} className="mb-4">
            <Card.Body>
              <h5>Prodi {index + 1}</h5>
              <Form.Group controlId={`formkodeprodigenap${index}`}>
                <Form.Label>Kode Prodi</Form.Label>
                <Form.Control type="text" name="kodeprodigenap" value={program.kodeprodigenap} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>
              <Form.Group controlId={`formSingkatanProdigenap${index}`}>
                <Form.Label>Singkatan Prodi</Form.Label>
                <Form.Control type="text" name="singkatanprodigenap" value={program.singkatanprodigenap} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>
              <Form.Group controlId={`formNamaProdigenap${index}`}>
                <Form.Label>Nama Prodi</Form.Label>
                <Form.Control type="text" name="namaprodigenap" value={program.namaprodigenap} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              {prodigenap.length > 1 && (
                <Button variant="danger" onClick={() => handleRemoveProdigenap(index)} className="mt-2">
                  Hapus Prodi
                </Button>
              )}
            </Card.Body>
          </Card>
        ))}

        <Button variant="primary" onClick={handleAddProdigenap} className="mb-3">
          Tambah Prodi Lainnya
        </Button>

        <Button variant="success" type="submit">
          Tambahkan Prodi
        </Button>
      </Form>
    </div>
  );
};

export default TambahProdiGenap;
