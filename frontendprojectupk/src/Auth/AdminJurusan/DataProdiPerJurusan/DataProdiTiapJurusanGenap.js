import axios from "axios";
import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const DataProdiTiapJurusanGenap = () => {
  // State untuk menyimpan data prodi
  const [prodigenap, setProdigenap] = useState([]);
  const [user, setUser] = useState(null); // State untuk data user
  const navigate = useNavigate();

  useEffect(() => {
    // Fungsi untuk mendapatkan data user yang sedang login
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage

        if (!token) {
          throw new Error("No token found, user is not authenticated");
        }

        // Include the token in the Authorization header
        const response = await axios.get("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the headers
          },
        });

        setUser(response.data); // Simpan data user ke state
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && user.kodejurusan) {
      // Setelah data user didapatkan, kita bisa ambil prodi berdasarkan kodejurusan
      const fetchProdigenap = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/prodigenap/${user.kodejurusan}`); // Gunakan kodejurusan dari user
          if (response.data && response.data.length > 0) {
            setProdigenap(response.data); // Simpan data prodi ke state
          } else {
            console.log("Tidak ada data prodi untuk kodejurusanganjil ini.");
          }
        } catch (error) {
          console.error("Error fetching programs:", error);
        }
      };
      fetchProdigenap();
    }
  }, [user]); // Efek ini dijalankan setelah data user tersedia

  const handleCardClick = (prodigenapId) => {
    if (user && user.kodejurusan) {
      navigate(`/prodigenap/${user.kodejurusangenap}/detailgenap/${prodigenapId}/lihattahunajaran`);
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

export default DataProdiTiapJurusanGenap;
