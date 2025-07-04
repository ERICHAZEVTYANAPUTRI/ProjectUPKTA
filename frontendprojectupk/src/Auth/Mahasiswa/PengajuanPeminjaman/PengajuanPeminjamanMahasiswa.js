import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Select from "react-select";
import Navbar from "../../../Components/Navbar/Navbar";

const PengajuanPeminjamanMahasiswaForm = () => {
  const [formData, setFormData] = useState({
    tanggal: "",
    hari: "",
    jammulai: "",
    jamselesai: "",
    kodematakuliah: "",
    ruangan_id: "",
    keperluan: "",
  });

  const [matakuliahOptions, setMatakuliahOptions] = useState([]);
  const [gedungList, setGedungList] = useState([]);
  const [ruanganOptions, setRuanganOptions] = useState([]);
  const [showGedungModal, setShowGedungModal] = useState(false);
  const [showRuanganModal, setShowRuanganModal] = useState(false);
  const [selectedGedungId, setSelectedGedungId] = useState("");
  const [jurusanList, setJurusanList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [allMatakuliah, setAllMatakuliah] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userRes.data;

        setFormData((prev) => ({
          ...prev,
          nama: user.nama_lengkap || "",
          nim: user.nim || "",
          jurusan: user.jurusanmahasiswa || "",
          prodi: user.prodi || "",
          kelas: user.kelas || "",
          notelepon: user.notlp || "",
        }));

        const [mkRes, gedungRes, jurusanRes, prodiRes] = await Promise.all([
          axios.get("http://localhost:8000/api/matakuliah"),
          axios.get("http://localhost:8000/api/gedungs"),
          axios.get("http://localhost:8000/api/jurusan"),
          axios.get("http://localhost:8000/api/prodi"),
        ]);

        setAllMatakuliah(mkRes.data);
        setGedungList(gedungRes.data);
        setJurusanList(jurusanRes.data);
        setProdiList(prodiRes.data);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter matakuliah by prodi
  useEffect(() => {
    if (!formData.prodi) {
      setMatakuliahOptions([]);
      return;
    }

    const filtered = allMatakuliah
      .filter((mk) => mk.prodi.id === formData.prodi)
      .map((mk) => ({
        value: mk.kodematakuliah, // HARUS sesuai database
        label: `${mk.kodematakuliah} - ${mk.namamatakuliah}`,
        dosen: mk.dosen.nama,
      }));
    setMatakuliahOptions(filtered);
  }, [allMatakuliah, formData.prodi]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleMatakuliahSelect = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      kodematakuliah: selectedOption ? selectedOption.value : "",
      dosen: selectedOption ? selectedOption.dosen : "", // optional, kalau mau tampilkan dosen
    }));
  };

  const handleGedungClick = (gedungId) => {
    setSelectedGedungId(gedungId);
    setFormData((prev) => ({
      ...prev,
      gedungId: gedungId,
      ruanganId: "", // Reset room
      namaruangan: "", // Reset room name
    }));

    fetchRuangan(gedungId);
    setShowGedungModal(false);
    setShowRuanganModal(true);
  };

  const getNamaJurusan = (id) => {
    const jurusan = jurusanList.find((j) => j.id === Number(id));
    return jurusan ? jurusan.namajurusan : "Tidak diketahui";
  };

  const getNamaProdi = (id) => {
    const prodi = prodiList.find((p) => p.id === Number(id));
    return prodi ? prodi.namaprodi : "Tidak diketahui";
  };

  const handleRuanganSelect = (ruanganId, ruanganName) => {
    setFormData((prev) => ({
      ...prev,
      ruangan_id: ruanganId,
      namaruangan: ruanganName,
    }));
    setShowRuanganModal(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const payload = {
        tanggal: formData.tanggal,
        hari: new Date(formData.tanggal).toLocaleDateString("id-ID", { weekday: "long" }).toLowerCase(),
        jammulai: formData.jammulai,
        jamselesai: formData.jamselesai,
        kodematakuliah: formData.kodematakuliah, // pastikan ini sesuai database
        ruangan_id: formData.ruangan_id,
        keperluan: formData.keperluan,
      };

      await axios.post("http://localhost:8000/api/pengajuan-peminjaman", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Pengajuan berhasil dikirim!");
      setFormData({ tanggal: "", hari: "", jammulai: "", jamselesai: "", kodematakuliah: "", ruangan_id: "", keperluan: "" });
    } catch (error) {
      console.error("Gagal mengirim:", error);
      alert("Terjadi kesalahan.");
    }
  };

  const fetchRuangan = async (gedungId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/ruangan/${gedungId}`);
      setRuanganOptions(response.data);
    } catch (error) {
      console.error("Gagal mengambil ruangan:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ margin: "20px" }}>
        <h2>Form Pengajuan Peminjaman Ruangan</h2>
        <Form onSubmit={handleSubmit}>
          <Card className="p-4">
            {["nama", "nim", "kelas", "notelepon"].map((field) => (
              <Form.Group className="mb-3" key={field}>
                <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                <Form.Control type="text" name={field} value={formData[field]} readOnly />
              </Form.Group>
            ))}

            <Form.Group className="mb-3">
              <Form.Label>Nama Jurusan</Form.Label>
              <Form.Control type="text" name="jurusan" value={getNamaJurusan(formData.jurusan)} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nama Prodi</Form.Label>
              <Form.Control type="text" name="prodi" value={getNamaProdi(formData.prodi)} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mata Kuliah</Form.Label>
              <Select options={matakuliahOptions} onChange={handleMatakuliahSelect} value={matakuliahOptions.find((opt) => opt.value === formData.matakuliah)} placeholder="Pilih Mata Kuliah" isClearable />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dosen</Form.Label>
              <Form.Control type="text" name="dosen" value={formData.dosen} readOnly />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Gedung</Form.Label>
              <Button variant="outline-primary" onClick={() => setShowGedungModal(true)}>
                Pilih Gedung
              </Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ruangan</Form.Label>
              <Form.Control type="text" name="ruanganId" value={formData.namaruangan} readOnly required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jam Mulai</Form.Label>
              <Form.Control type="time" name="jammulai" value={formData.jammulai} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jam Selesai</Form.Label>
              <Form.Control type="time" name="jamselesai" value={formData.jamselesai} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Keperluan</Form.Label>
              <Form.Control as="textarea" rows={3} name="keperluan" value={formData.keperluan} onChange={handleChange} required />
            </Form.Group>

            <Button type="submit" variant="success">
              Ajukan Peminjaman
            </Button>
          </Card>
        </Form>
      </div>

      {/* Gedung Modal */}
      {showGedungModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h4>Pilih Gedung</h4>
            <ul>
              {gedungList.map((gedung) => (
                <li key={gedung.id} onClick={() => handleGedungClick(gedung.id)} style={{ cursor: "pointer", margin: "5px 0", color: "green" }}>
                  {gedung.name}
                </li>
              ))}
            </ul>
            <Button variant="secondary" onClick={() => setShowGedungModal(false)}>
              Batal
            </Button>
          </div>
        </div>
      )}

      {/* Ruangan Modal */}
      {showRuanganModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h4>Pilih Ruangan</h4>
            <ul>
              {ruanganOptions.map((ruangan) => (
                <li key={ruangan.id} onClick={() => handleRuanganSelect(ruangan.id, ruangan.name)} style={{ cursor: "pointer", margin: "5px 0", color: "green" }}>
                  {ruangan.name}
                </li>
              ))}
            </ul>
            <Button variant="secondary" onClick={() => setShowRuanganModal(false)}>
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengajuanPeminjamanMahasiswaForm;
