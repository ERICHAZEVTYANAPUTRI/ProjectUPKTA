import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../Components/Sidebar/Sidebar";
import "../JadwalSmester.css";

const SemesterGenapList = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const fetchSemesterGenap = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/smestergenap");
      setData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchSemesterGenap();
  }, []);

  return (
    <div className="dashboard-container-jurusan">
      <Navbar />
      <Sidebar />
      <h1 className="Dashboard-title" style={{ marginLeft: "10px" }}>
        DATA JURUSAN
      </h1>

      <div className="dashboard-scroll-area">
        {/* <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", paddingRight: "50px" }}>
          <button
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            }}
            onClick={() => {
              window.location.href = "/TambahJurusanSmesterGenap";
            }}
          >
            + Tambah Jurusan
          </button>
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((item, index) => (
            <div key={index} className="card-jurusan">
              <h3 style={{ cursor: "pointer", color: "#2563eb", textDecoration: "underline" }} onClick={() => navigate(`/prodigenap/${item.kodejurusangenap}`)}>
                {item.kodejurusangenap}
              </h3>
              <p>{item.namajurusangenap}</p>
            </div>
          ))}
          {data.length === 0 && <div className="col-span-3 text-gray-500">Tidak ada data.</div>}
        </div>
      </div>
    </div>
  );
};

export default SemesterGenapList;
