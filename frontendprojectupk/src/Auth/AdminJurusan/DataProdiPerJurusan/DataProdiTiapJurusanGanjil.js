import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const DataProdiTiapJurusanGanjil = () => {
  const [prodiganjil, setProdiganjil] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found, user is not authenticated");
        }
        const response = await axios.get("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && user.kodejurusan) {
      const fetchProdiganjil = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/prodiganjil/${user.kodejurusan}`);
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
    }
  }, [user]);

  const handleCardClick = (prodiganjilId) => {
    if (user && user.kodejurusan) {
      navigate(`/prodiganjil/${user.kodejurusanganjil}/detailganjil/${prodiganjilId}/lihattahunajaran`);
    }
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
        DATA PRODI
      </h1>
      <h1>Prodi di Jurusan {user ? user.jurusan : "loading..."}</h1>
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

export default DataProdiTiapJurusanGanjil;
