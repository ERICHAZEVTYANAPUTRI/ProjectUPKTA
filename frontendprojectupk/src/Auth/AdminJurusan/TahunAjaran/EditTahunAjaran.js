import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const EditTahunAjaran = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tahunAwal, setTahunAwal] = useState(null);
  const [tahunAkhir, setTahunAkhir] = useState(null);
  const [semester, setSemester] = useState(null);
  const [adminJurusanId, setAdminJurusanId] = useState(null); // Optional, depending on your auth setup

  const currentYear = new Date().getFullYear();
  const tahunOptions = Array.from({ length: 16 }, (_, i) => {
    const year = currentYear - 5 + i;
    return { value: year, label: year.toString() };
  });

  const semesterOptions = [
    { value: "ganjil", label: "Ganjil" },
    { value: "genap", label: "Genap" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/tahunajaran/${id}`);
        const data = res.data;

        // data.tahun formatnya "2024/2025"
        const [awal, akhir] = data.tahun.split("/").map((t) => parseInt(t));
        setTahunAwal({ value: awal, label: awal.toString() });
        setTahunAkhir({ value: akhir, label: akhir.toString() });
        setSemester(semesterOptions.find((opt) => opt.value === data.semester));
        setAdminJurusanId(data.adminjurusan_id);
      } catch (error) {
        alert("Gagal mengambil data tahun ajaran.");
        navigate("/tahunajaran");
      }
    };

    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (tahunAwal) {
      setTahunAkhir({ value: tahunAwal.value + 1, label: (tahunAwal.value + 1).toString() });
    } else {
      setTahunAkhir(null);
    }
  }, [tahunAwal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tahunAwal || !tahunAkhir || !semester) {
      alert("Harap isi semua field!");
      return;
    }

    const tahunFormatted = `${tahunAwal.value}/${tahunAkhir.value}`;

    try {
      await axios.put(`http://localhost:8000/api/tahunajaran/${id}`, {
        tahun: tahunFormatted,
        semester: semester.value,
        adminjurusan_id: adminJurusanId, // jika dibutuhkan
      });

      alert("Tahun ajaran berhasil diperbarui!");
      navigate("/tahunajaran");
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat memperbarui data.");
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="form-container" style={{ padding: "30px", marginLeft: "300px", maxWidth: "600px" }}>
        <h2>Edit Tahun Ajaran</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Tahun Awal</label>
            <Select options={tahunOptions} value={tahunAwal} onChange={setTahunAwal} placeholder="Pilih Tahun Awal" isClearable />
          </div>
          <div className="form-group mb-3">
            <label>Tahun Akhir</label>
            <Select options={tahunOptions} value={tahunAkhir} isDisabled placeholder="Tahun Akhir Otomatis" />
          </div>
          <div className="form-group mb-3">
            <label>Semester</label>
            <Select options={semesterOptions} value={semester} onChange={setSemester} placeholder="Pilih Semester" isClearable />
          </div>
          <button type="submit" className="btn btn-primary">
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTahunAjaran;
