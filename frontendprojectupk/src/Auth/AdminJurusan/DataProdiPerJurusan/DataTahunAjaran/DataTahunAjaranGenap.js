import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../Components/Sidebar/Sidebar";

const DataTahunAjaranGenapAdminJurusan = () => {
  const { kodejurusangenap, prodigenapId } = useParams();
  const [tahunAjarangenap, setTahunAjarangenap] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTahunAjarangenap = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/tahunajarangenap/${prodigenapId}`);
        setTahunAjarangenap(response.data);
      } catch (error) {
        console.error("Error fetching tahun ajaran:", error);
      }
    };
    fetchTahunAjarangenap();
  }, [prodigenapId]);

  const handleViewPenjadwalan = (tahunAjarangenapId) => {
    navigate(`/prodigenapadminjurusan/${kodejurusangenap}/detailgenapadminjurusan/${prodigenapId}/penjadwalangenapadminjurusan/${tahunAjarangenapId}`);
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
        DATA TAHUN AJARAN
      </h1>

      <h1>Tahun Ajaran untuk Prodi ID {prodigenapId}</h1>
      <ul>
        {tahunAjarangenap.map((tahun) => (
          <li key={tahun.id} onClick={() => handleViewPenjadwalan(tahun.id)} style={{ cursor: "pointer", marginBottom: "10px", fontWeight: "bold" }}>
            Semester Genap {tahun.tahunajarangenap}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataTahunAjaranGenapAdminJurusan;
