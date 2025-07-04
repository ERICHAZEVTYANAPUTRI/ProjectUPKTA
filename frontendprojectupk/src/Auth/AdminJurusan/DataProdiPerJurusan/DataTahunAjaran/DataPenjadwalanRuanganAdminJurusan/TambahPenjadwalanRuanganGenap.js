import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Navbar from "../../../../../Components/Navbar/Navbar";
import Sidebar from "../../../../../Components/Sidebar/Sidebar";

const TambahPenjadwalGenapAdminJurusan = () => {
  const { kodejurusangenap, prodigenapId, tahunAjarangenapId } = useParams();
  const [tahunAjaran, setTahunAjaran] = useState(null);
  const [matakuliahList, setMatakuliahList] = useState([]);
  const [filteredMatakuliahList, setFilteredMatakuliahList] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMahasiswa = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/mahasiswa");
        const options = response.data.map((mhs) => ({
          value: mhs.id,
          label: `${mhs.nama_lengkap} - ${mhs.prodi ?? "Prodi tidak tersedia"} - ${mhs.kelas ?? "Kelas tidak tersedia"}`,
          data: mhs,
        }));
        setMahasiswaList(options);
      } catch (error) {
        console.error("Gagal mengambil data mahasiswa:", error);
      }
    };
    fetchMahasiswa();
  }, []);

  useEffect(() => {
    const fetchMatakuliah = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/matakuliah");
        const options = response.data.map((mk) => ({
          value: mk.kodemk,
          label: ` ${mk.kodemk} - ${mk.namamk}`,
        }));
        setMatakuliahList(options);
      } catch (error) {
        console.error("Gagal mengambil data mata kuliah:", error);
      }
    };
    fetchMatakuliah();
  }, []);

  const hariOptions = [
    { value: "Senin", label: "Senin" },
    { value: "Selasa", label: "Selasa" },
    { value: "Rabu", label: "Rabu" },
    { value: "Kamis", label: "Kamis" },
    { value: "Jumat", label: "Jumat" },
    { value: "Sabtu", label: "Sabtu" },
    { value: "Minggu", label: "Minggu" },
  ];

  const [jadwalList, setJadwalList] = useState([
    {
      mahasiswapenanggungjawab: "",
      hari: "",
      jammulai: "",
      jamselesai: "",
      kodemk: "",
      kebutuhankelas: "",
    },
  ]);

  const handleHariChange = (selectedOption, index) => {
    const updatedList = [...jadwalList];
    updatedList[index].hari = selectedOption?.value || "";
    setJadwalList(updatedList);
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedList = [...jadwalList];
    updatedList[index][name] = value;
    setJadwalList(updatedList);
  };

  const handleSelectChange = (selectedOption, index) => {
    const updatedList = [...jadwalList];
    const selectedMahasiswa = selectedOption?.data || null;
    updatedList[index].mahasiswapenanggungjawab = selectedOption?.value || "";
    updatedList[index].mahasiswaData = selectedMahasiswa;
    setJadwalList(updatedList);

    if (selectedMahasiswa && selectedMahasiswa.smester) {
      axios
        .get("http://localhost:8000/api/kurikulum")
        .then((response) => {
          const kurikulumFiltered = response.data.filter((k) => k.smester === selectedMahasiswa.smester);
          const kodemkList = kurikulumFiltered.map((k) => k.kodemk);
          const mkFiltered = matakuliahList.filter((mk) => kodemkList.includes(mk.value));
          setFilteredMatakuliahList(mkFiltered);
        })
        .catch((err) => {
          console.error("Gagal mengambil data kurikulum:", err);
        });
    }
  };

  const handleAddJadwal = () => {
    setJadwalList([
      ...jadwalList,
      {
        mahasiswapenanggungjawab: "",
        hari: "",
        jammulai: "",
        jamselesai: "",
        kodemk: "",
        kebutuhankelas: "",
      },
    ]);
  };

  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/tahunajarangenap/${tahunAjarangenapId}`);
        if (response.data) {
          setTahunAjaran(response.data);
        } else {
          setTahunAjaran([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data tahun ajaran:", error);
      }
    };

    fetchTahunAjaran();
  }, [tahunAjarangenapId]);

  const handleRemoveJadwal = (index) => {
    const filtered = jadwalList.filter((_, i) => i !== index);
    setJadwalList(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedJadwal = jadwalList.map((item) => ({
      mahasiswapenanggungjawab: item.mahasiswapenanggungjawab,
      hari: item.hari,
      jammulai: item.jammulai,
      jamselesai: item.jamselesai,
      kodemk: item.kodemk,
      kebutuhankelas: item.kebutuhankelas,
    }));

    try {
      await axios.post("http://localhost:8000/api/penjadwalangenap", {
        tahunajarangenap_id: tahunAjarangenapId,
        jadwal: formattedJadwal,
      });

      navigate(`/prodigenapadminjurusan/${kodejurusangenap}/detailgenapadminjurusan/${prodigenapId}/penjadwalangenapadminjurusan/${tahunAjarangenapId}`);
    } catch (error) {
      console.error("Gagal menyimpan jadwal:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <Sidebar />
      <div style={{ marginLeft: "20px", marginTop: "20px" }}>
        <h2>Tambah Jadwal Kuliah Semester Genap</h2>
      </div>
      <Form onSubmit={handleSubmit} style={{ margin: "20px" }}>
        {jadwalList.map((item, index) => (
          <Card key={index} className="mb-4">
            <Card.Body>
              <h5>Jadwal {index + 1}</h5>

              <Form.Group className="mb-2">
                <Form.Label>PJMK</Form.Label>
                <Select options={mahasiswaList} value={mahasiswaList.find((opt) => opt.value === item.mahasiswapenanggungjawab)} onChange={(selected) => handleSelectChange(selected, index)} placeholder="-- Pilih Mahasiswa --" />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Hari</Form.Label>
                <Select options={hariOptions} value={hariOptions.find((opt) => opt.value === item.hari)} onChange={(selected) => handleHariChange(selected, index)} placeholder="-- Pilih Hari --" />
              </Form.Group>

              <Form.Group>
                <Form.Label>Jam</Form.Label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Form.Control type="time" name="jammulai" value={item.jammulai} onChange={(e) => handleChange(e, index)} required />
                  <span style={{ alignSelf: "center" }}>-</span>
                  <Form.Control type="time" name="jamselesai" value={item.jamselesai} onChange={(e) => handleChange(e, index)} required />
                </div>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Mata Kuliah</Form.Label>
                <Select
                  options={filteredMatakuliahList}
                  value={filteredMatakuliahList.find((opt) => opt.value === item.kodemk)}
                  onChange={(selected) => {
                    const updatedList = [...jadwalList];
                    updatedList[index].kodemk = selected?.value || "";
                    setJadwalList(updatedList);
                  }}
                  placeholder="-- Pilih Mata Kuliah --"
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Kebutuhan Kelas</Form.Label>
                <Form.Control type="text" name="kebutuhankelas" value={item.kebutuhankelas} onChange={(e) => handleChange(e, index)} required />
              </Form.Group>

              {jadwalList.length > 1 && (
                <Button variant="danger" onClick={() => handleRemoveJadwal(index)} className="mt-2">
                  Hapus Jadwal Ini
                </Button>
              )}
            </Card.Body>
          </Card>
        ))}

        <Button variant="primary" onClick={handleAddJadwal} className="mb-3">
          Tambah Jadwal Lainnya
        </Button>

        <Button variant="success" type="submit">
          Simpan Semua Jadwal
        </Button>
      </Form>
    </div>
  );
};

export default TambahPenjadwalGenapAdminJurusan;
