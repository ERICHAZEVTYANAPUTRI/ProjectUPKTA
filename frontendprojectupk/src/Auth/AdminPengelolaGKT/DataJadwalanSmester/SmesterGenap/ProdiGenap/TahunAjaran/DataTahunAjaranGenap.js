import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../../Components/Sidebar/Sidebar";

const DataTahunAjaranGenap = () => {
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

  const handleTambahTahunAjarangenap = () => {
    navigate(`/prodigenap/${kodejurusangenap}/detailgenap/${prodigenapId}/tambahtahunajarangenap`);
  };
  const handleViewPenjadwalan = (tahunAjarangenapId) => {
    navigate(`/prodigenap/${kodejurusangenap}/detailgenap/${prodigenapId}/penjadwalangenap/${tahunAjarangenapId}`);
  };

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
        DATA TAHUN AHARAN
      </h1>
      <Button variant="success" onClick={handleTambahTahunAjarangenap} className="mb-3" style={{ marginLeft: "10px" }}>
        Tambah Tahun Ajaran Baru
      </Button>

      <h1>Tahun Ajaran untuk Prodi ID {prodigenapId}</h1>
      <ul>
        {tahunAjarangenap.map((tahun) => (
          <li key={tahun.id} onClick={() => handleViewPenjadwalan(tahun.id)}>
            Semester Genap {tahun.tahunajarangenap}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataTahunAjaranGenap;
