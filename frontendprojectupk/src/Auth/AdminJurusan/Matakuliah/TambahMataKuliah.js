import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const TambahMatakuliah = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const adminJurusanId = Number(user.id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    kodematakuliah: "",
    namamatakuliah: "",
    kurikulum_id: "",
    prodi_id: "",
    tahunajaran_id: "",
    sks_total: "",
    tipe: "",
    semester: "",
  });

  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [kurikulumList, setKurikulumList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kurikulumRes, prodiRes, tahunAjaranRes] = await Promise.all([axios.get("http://localhost:8000/api/kurikulum"), axios.get("http://localhost:8000/api/prodi"), axios.get("http://localhost:8000/api/tahunajaran")]);
        setKurikulumList(kurikulumRes.data.filter((k) => k.adminjurusan_id === adminJurusanId));
        setProdiList(prodiRes.data.filter((p) => p.adminjurusan_id === adminJurusanId));
        setTahunAjaranList(tahunAjaranRes.data.filter((t) => t.adminjurusan_id === adminJurusanId));
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };
    fetchData();
  }, [adminJurusanId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const dataToSend = {
        ...formData,
        semester: Number(formData.semester),
        sks_total: Number(formData.sks_total),
        adminjurusan_id: adminJurusanId,
      };

      await axios.post("http://localhost:8000/api/matakuliah/store", dataToSend);
      alert("Mata kuliah berhasil ditambahkan!");
      navigate("/matakuliah");
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrorMessage(error.response.data.message || "Validasi gagal.");
      } else {
        console.error("Gagal menyimpan mata kuliah:", error);
        setErrorMessage("Terjadi kesalahan server.");
      }
    }
  };

  const selectedProdi = prodiList.find((p) => p.id === formData.prodi_id);
  const selectedKurikulum = kurikulumList.find((k) => k.id === formData.kurikulum_id);
  const selectedTahunAjaran = tahunAjaranList.find((t) => t.id === formData.tahunajaran_id);

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="form-container" style={{ padding: "30px", marginLeft: "300px", maxWidth: "800px" }}>
        <h2>Tambah Mata Kuliah</h2>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>Kode Mata Kuliah</label>
            <input type="text" className="form-control" name="kodematakuliah" value={formData.kodematakuliah} onChange={handleChange} required />
          </div>

          <div className="form-group mb-3">
            <label>Nama Mata Kuliah</label>
            <input type="text" className="form-control" name="namamatakuliah" value={formData.namamatakuliah} onChange={handleChange} required />
          </div>

          <div className="form-group mb-3">
            <label>SKS</label>
            <input type="number" className="form-control" name="sks_total" value={formData.sks_total} onChange={handleChange} min="1" required />
          </div>

          <div className="form-group mb-3">
            <label>Tahun Ajaran</label>
            <Select
              name="tahunajaran_id"
              options={tahunAjaranList
                .filter((t) => t.is_aktif === 1) // ✅ tampilkan hanya tahun ajaran aktif
                .map((t) => ({
                  value: t.id,
                  label: `${t.tahun} - ${t.semester}`,
                }))}
              value={selectedTahunAjaran ? { value: selectedTahunAjaran.id, label: `${selectedTahunAjaran.tahun} - ${selectedTahunAjaran.semester}` } : null}
              onChange={(selected) => setFormData((prev) => ({ ...prev, tahunajaran_id: selected ? selected.value : "" }))}
              placeholder="Pilih Tahun Ajaran"
              isClearable
            />
          </div>

          <div className="form-group mb-3">
            <label>Tipe</label>
            <Select
              name="tipe"
              options={[
                { value: "teori", label: "Teori" },
                { value: "praktikum", label: "Praktikum" },
              ]}
              value={formData.tipe ? { value: formData.tipe, label: formData.tipe.charAt(0).toUpperCase() + formData.tipe.slice(1) } : null}
              onChange={(selected) => setFormData((prev) => ({ ...prev, tipe: selected ? selected.value : "" }))}
              placeholder="Pilih Tipe"
              isClearable
            />
          </div>

          <div className="form-group mb-3">
            <label>Semester</label>
            <input type="number" className="form-control" name="semester" value={formData.semester} onChange={handleChange} min="1" required />
          </div>

          <div className="form-group mb-3">
            <label>Kurikulum</label>
            <Select
              name="kurikulum_id"
              options={kurikulumList.map((k) => ({ value: k.id, label: k.nama }))}
              value={selectedKurikulum ? { value: selectedKurikulum.id, label: selectedKurikulum.nama } : null}
              onChange={(selected) => setFormData((prev) => ({ ...prev, kurikulum_id: selected ? selected.value : "" }))}
              placeholder="Pilih Kurikulum"
              isClearable
            />
          </div>

          <div className="form-group mb-3">
            <label>Prodi</label>
            <Select
              name="prodi_id"
              options={prodiList.map((p) => ({
                value: p.id,
                label: `${p.kodeprodi} - ${p.namaprodi}`,
              }))}
              value={selectedProdi ? { value: selectedProdi.id, label: `${selectedProdi.kodeprodi} - ${selectedProdi.namaprodi}` } : null}
              onChange={(selected) => setFormData((prev) => ({ ...prev, prodi_id: selected ? selected.value : "" }))}
              placeholder="Pilih Prodi"
              isClearable
            />
          </div>

          <button type="submit" className="btn btn-success">
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
};

export default TambahMatakuliah;
