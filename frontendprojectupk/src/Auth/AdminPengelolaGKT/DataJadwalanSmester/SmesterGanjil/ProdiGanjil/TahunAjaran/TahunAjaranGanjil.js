import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../../Components/Sidebar/Sidebar";

const TahunAjaranGanjil = () => {
  const { kodejurusanganjil, prodiganjilId } = useParams();
  const [tahunAjaranganjil, setTahunAjaranganjil] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTahunAjaranganjil = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/tahunajaranganjil/${prodiganjilId}`);
        setTahunAjaranganjil(response.data);
      } catch (error) {
        console.error("Error fetching tahun ajaran:", error);
      }
    };
    fetchTahunAjaranganjil();
  }, [prodiganjilId]);

  const handleTambahTahunAjaranganjil = () => {
    navigate(`/prodiganjil/${kodejurusanganjil}/detailganjil/${prodiganjilId}/tambahtahunajaranganjil`);
  };
  const handleViewPenjadwalan = (tahunAjaranganjilId) => {
    navigate(`/prodiganjil/${kodejurusanganjil}/detailganjil/${prodiganjilId}/penjadwalanganjil/${tahunAjaranganjilId}`);
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
        DATA TAHUN AHARAN
      </h1>
      <Button variant="success" onClick={handleTambahTahunAjaranganjil} className="mb-3" style={{ marginLeft: "10px" }}>
        Tambah Tahun Ajaran Baru
      </Button>

      <h1>Tahun Ajaran untuk Prodi ID {prodiganjilId}</h1>
      <ul>
        {tahunAjaranganjil.map((tahun) => (
          <li key={tahun.id} onClick={() => handleViewPenjadwalan(tahun.id)}>
            Semester Ganjil {tahun.tahunajaranganjil}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TahunAjaranGanjil;
