import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const TambahTahunAjaran = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [tahunAwal, setTahunAwal] = useState(null);
  const [tahunAkhir, setTahunAkhir] = useState(null);
  const [semester, setSemester] = useState(null);

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

    const tahunFormatted = `${tahunAwal.value}/${tahunAkhir.value}`; // contoh: "2024/2025"

    try {
      await axios.post("http://localhost:8000/api/tahunajaran", {
        tahun: tahunFormatted,
        semester: semester.value,
        adminjurusan_id: user?.id,
        is_aktif: true, // default true, sesuai migration
      });

      alert("Tahun ajaran berhasil ditambahkan!");
      navigate("/tahunajaran");
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    }
  };
  return (
    <div className="dashboard-container">
      <div className="form-container" style={{ padding: "30px", marginLeft: "300px", maxWidth: "600px" }}>
        <h2>Tambah Tahun Ajaran</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Tahun Awal</label>
            <Select options={tahunOptions} value={tahunAwal} onChange={setTahunAwal} placeholder="Pilih Tahun Awal" isClearable />
          </div>
          <div className="form-group mb-3">
            <label>Tahun Akhir</label>
            <Select
              options={tahunOptions}
              value={tahunAkhir}
              isDisabled // 🔒 disabled agar tidak bisa diubah manual
              placeholder="Tahun Akhir Otomatis"
            />
          </div>
          <div className="form-group mb-3">
            <label>Semester</label>
            <Select options={semesterOptions} value={semester} onChange={setSemester} placeholder="Pilih Semester" isClearable />
          </div>
          <button type="submit" className="btn btn-success">
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
};

export default TambahTahunAjaran;
