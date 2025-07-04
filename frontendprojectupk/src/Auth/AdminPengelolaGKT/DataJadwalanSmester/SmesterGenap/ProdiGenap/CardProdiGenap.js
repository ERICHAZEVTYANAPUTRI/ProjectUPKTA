import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../Components/Sidebar/Sidebar";

const CardProdiGenap = () => {
  const { kodejurusangenap } = useParams();
  const navigate = useNavigate();
  const [prodigenap, setProdigenap] = useState([]);

  useEffect(() => {
    const fetchProdigenap = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/prodigenap/${kodejurusangenap}`);
        console.log(response.data);
        if (response.data && response.data.length > 0) {
          setProdigenap(response.data);
        } else {
          console.log("Tidak ada data prodi untuk kodejurusangenap ini.");
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
      }
    };
    fetchProdigenap();
  }, [kodejurusangenap]);

  const handleAddProdigenap = () => {
    navigate(`/tambahprodigenap/${kodejurusangenap}`);
  };

  const handleCardClick = (prodigenapId) => {
    navigate(`/prodigenap/${kodejurusangenap}/detailgenap/${prodigenapId}`);
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
        DATA PRODI
      </h1>
      <h1>Prodi di Jurusan {kodejurusangenap}</h1>
      <Button variant="success" onClick={handleAddProdigenap}>
        Tambah Prodi Baru
      </Button>
      {prodigenap.length === 0 ? (
        <p>Tidak ada data prodi untuk jurusan ini.</p>
      ) : (
        <div className="prodi-list">
          {prodigenap.map((program) => (
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
                <Card.Title>{program.kodeprodigenap}</Card.Title>
                <Card.Title>{program.singkatanprodigenap}</Card.Title>
                <Card.Title>{program.namaprodigenap}</Card.Title>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardProdiGenap;
