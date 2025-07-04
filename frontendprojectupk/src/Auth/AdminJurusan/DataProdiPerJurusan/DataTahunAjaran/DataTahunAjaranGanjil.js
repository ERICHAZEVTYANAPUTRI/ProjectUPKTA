import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../Components/Sidebar/Sidebar";

const DataTahunAjaranGanjilAdminJurusan = () => {
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

  const handleViewPenjadwalan = (tahunAjaranganjilId) => {
    navigate(`/prodiganjiladminjurusan/${kodejurusanganjil}/detailganjiladminjurusan/${prodiganjilId}/penjadwalanganjiladminjurusan/${tahunAjaranganjilId}`);
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
        DATA TAHUN AJARAN
      </h1>

      <h1>Tahun Ajaran untuk Prodi ID {prodiganjilId}</h1>
      <ul>
        {tahunAjaranganjil.map((tahun) => (
          <li key={tahun.id} onClick={() => handleViewPenjadwalan(tahun.id)} style={{ cursor: "pointer", marginBottom: "10px", fontWeight: "bold" }}>
            Semester ganjil {tahun.tahunajaranganjil}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataTahunAjaranGanjilAdminJurusan;
