import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import Navbar from "../../../Components/Navbar/Navbar";
import Sidebar from "../../../Components/Sidebar/Sidebar";

const TambahKurikulum = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [nama, setNama] = useState("");
  const [idProdi, setIdProdi] = useState("");
  const [tahunMulai, setTahunMulai] = useState("");
  const [tahunSelesai, setTahunSelesai] = useState("");
  const [totalSks, setTotalSks] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [isAktif, setIsAktif] = useState(true);
  const [prodiList, setProdiList] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/prodi")
      .then((res) => {
        const filteredProdi = res.data.filter((prodi) => prodi.adminjurusan_id === user.id);
        const options = filteredProdi.map((prodi) => ({
          value: prodi.id,
          label: `${prodi.kodeprodi} - ${prodi.namaprodi}`,
        }));
        setProdiList(options);
      })
      .catch((err) => console.error("Gagal memuat data prodi:", err));
  }, []);

  const generateYears = (start = 2000, end = new Date().getFullYear() + 10) => {
    const years = [];
    for (let year = end; year >= start; year--) {
      years.push(year);
    }
    return years;
  };

  const tahunOptions = generateYears();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/kurikulum/store", {
        nama,
        prodi_id: idProdi,
        tahun_mulai: tahunMulai,
        tahun_selesai: tahunSelesai || null,
        total_sks: totalSks || null,
        is_aktif: isAktif,
        deskripsi,
        adminjurusan_id: user?.id,
      });
      alert("Kurikulum berhasil ditambahkan!");
      navigate("/kurikulum");
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Gagal menyimpan data.");
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <Sidebar />
      <div className="form-container" style={{ padding: "30px", marginLeft: "300px", maxWidth: "800px" }}>
        <h2>Tambah Kurikulum</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formProdi" className="mb-3">
            <Form.Label>Program Studi</Form.Label>
            <Select options={prodiList} value={prodiList.find((opt) => opt.value === idProdi)} onChange={(selected) => setIdProdi(selected?.value || "")} placeholder="Pilih Prodi" isClearable required />
          </Form.Group>

          <Form.Group controlId="formNama" className="mb-3">
            <Form.Label>Nama Kurikulum</Form.Label>
            <Form.Control type="text" value={nama} onChange={(e) => setNama(e.target.value)} required />
          </Form.Group>

          <Form.Group controlId="formTahunMulai" className="mb-3">
            <Form.Label>Tahun Mulai</Form.Label>
            <Form.Select value={tahunMulai} onChange={(e) => setTahunMulai(e.target.value)} required>
              <option value="">Pilih Tahun</option>
              {tahunOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="formTahunSelesai" className="mb-3">
            <Form.Label>Tahun Selesai (Opsional)</Form.Label>
            <Form.Select value={tahunSelesai} onChange={(e) => setTahunSelesai(e.target.value)}>
              <option value="">Pilih Tahun</option>
              {tahunOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group controlId="formTotalSks" className="mb-3">
            <Form.Label>Total SKS (Opsional)</Form.Label>
            <Form.Control type="number" min="0" value={totalSks} onChange={(e) => setTotalSks(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="formDeskripsi" className="mb-3">
            <Form.Label>Deskripsi (Opsional)</Form.Label>
            <Form.Control as="textarea" rows={3} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
          </Form.Group>

          <Form.Group controlId="formIsAktif" className="mb-3">
            <Form.Check type="checkbox" label="Aktifkan Kurikulum" checked={isAktif} onChange={(e) => setIsAktif(e.target.checked)} />
          </Form.Group>

          <Button variant="primary" type="submit">
            Simpan
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default TambahKurikulum;
