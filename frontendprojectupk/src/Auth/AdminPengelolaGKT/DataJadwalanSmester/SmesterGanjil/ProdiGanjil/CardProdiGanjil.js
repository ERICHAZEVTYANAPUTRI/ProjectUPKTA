import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../Components/Sidebar/Sidebar";

const CardProdiGanjil = () => {
  const { kodejurusanganjil } = useParams();
  const navigate = useNavigate();
  const [prodiganjil, setProdiganjil] = useState([]);

  useEffect(() => {
    const fetchProdiganjil = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/prodiganjil/${kodejurusanganjil}`);
        console.log(response.data);
        if (response.data && response.data.length > 0) {
          setProdiganjil(response.data);
        } else {
          console.log("Tidak ada data prodi untuk kodejurusanganjil ini.");
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };
    fetchProdiganjil();
  }, [kodejurusanganjil]);

  const handleAddProdi = () => {
    navigate(`/tambahprodiganjil/${kodejurusanganjil}`);
  };

  const handleCardClick = (prodiganjilId) => {
    navigate(`/prodiganjil/${kodejurusanganjil}/detailganjil/${prodiganjilId}`);
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
        DATA PRODI
      </h1>
      <h1>Prodi di Jurusan {kodejurusanganjil}</h1>
      <Button variant="success" onClick={handleAddProdi}>
        Tambah Prodi Baru
      </Button>
      {prodiganjil.length === 0 ? (
        <p>Tidak ada data prodi untuk jurusan ini.</p>
      ) : (
        <div className="prodi-list">
          {prodiganjil.map((program) => (
            <Card
              key={program.id}
              className={`prodi-card-${program.id} prodi-card`}
              style={{
                marginBottom: "20px",
                cursor: "pointer",
              }}
              onClick={() => handleCardClick(program.id)}
            >
              <Card.Body>
                <Card.Title>{program.kodeprodiganjil}</Card.Title>
                <Card.Title>{program.singkatanprodiganjil}</Card.Title>
                <Card.Title>{program.namaprodiganjil}</Card.Title>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardProdiGanjil;
