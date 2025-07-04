import { Box, Card, FormControl, TextField, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { BsSave } from "react-icons/bs";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../../Components/Navbar/Navbar";

const EditPenjadwalanRuanganPerkuliahan = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const { id } = useParams();
  const navigate = useNavigate();
  const adminJurusanId = Number(user.id);

  const [allMahasiswa, setAllMahasiswa] = useState([]);

  const [data, setData] = useState({
    tahunajaran_id: "",
    prodi_id: "",
    kelas_id: "",
    hari: "",
    jammulai: "",
    jamselesai: "",
    kodematakuliah: "",
    dosen_id: "",
    mahasiswa_id: "",
    kebutuhankelas: "",
  });

  const [prodiList, setProdiList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [matakuliahList, setMatakuliahList] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const hariOptions = [
    { value: "Senin", label: "Senin" },
    { value: "Selasa", label: "Selasa" },
    { value: "Rabu", label: "Rabu" },
    { value: "Kamis", label: "Kamis" },
    { value: "Jumat", label: "Jumat" },
    { value: "Sabtu", label: "Sabtu" },
  ];

  const getSelectedOption = (options, value) => options.find((opt) => opt.value === value) || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, prodi, thn, mk, dosen, mhs, kelas] = await Promise.all([
          axios.get(`http://localhost:8000/api/penjadwalanruangan/${id}`),
          axios.get("http://localhost:8000/api/prodi"),
          axios.get("http://localhost:8000/api/tahunajaran"),
          axios.get("http://localhost:8000/api/matakuliah"),
          axios.get("http://localhost:8000/api/dosen"),
          axios.get("http://localhost:8000/api/mahasiswa"),
          axios.get("http://localhost:8000/api/kelasmahasiswa"),
        ]);

        const jadwal = res.data.data;

        setData({
          ...jadwal,
          jammulai: jadwal.jammulai ? jadwal.jammulai.slice(0, 5) : "",
          jamselesai: jadwal.jamselesai ? jadwal.jamselesai.slice(0, 5) : "",
        });

        const filteredProdi = prodi.data.filter((p) => p.adminjurusan_id === adminJurusanId);

        setProdiList(
          filteredProdi.map((p) => ({
            value: p.id,
            label: p.namaprodi,
          }))
        );

        setTahunAjaranList(
          thn.data
            .filter((t) => t.adminjurusan_id === adminJurusanId && t.is_aktif === 1)
            .map((t) => ({
              value: t.id,
              label: `${t.tahun} - Semester ${t.semester}`,
              semester: t.semester,
            }))
        );

        const filteredMatakuliah = mk.data.filter((mkItem) => mkItem.adminjurusan_id === adminJurusanId && filteredProdi.some((p) => p.id === mkItem.prodi_id));

        setMatakuliahList(
          filteredMatakuliah.map((m) => ({
            value: m.kodematakuliah,
            label: `${m.kodematakuliah} - ${m.namamatakuliah}`,
          }))
        );

        setDosenList(
          dosen.data
            .filter((d) => d.adminjurusan_id === adminJurusanId)
            .map((d) => ({
              value: d.id,
              label: `${d.nama}_${d.nip}`,
            }))
        );

        setKelasList(
          kelas.data
            .filter((k) => k.adminjurusan_id === adminJurusanId)
            .map((k) => ({
              value: Number(k.id),
              label: k.nama,
              prodi_id: k.prodi_id,
            }))
        );

        // Simpan semua mahasiswa untuk dipakai di filter berikutnya
        setAllMahasiswa(mhs.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [id, adminJurusanId]);

  useEffect(() => {
    if (!data.prodi_id || !data.tahunajaran_id || !data.kelas_id) {
      setMahasiswaList([]);
      return;
    }

    const tahunAjaranTerpilih = tahunAjaranList.find((t) => t.value === data.tahunajaran_id);
    if (!tahunAjaranTerpilih) return;

    const isSemesterGanjil = tahunAjaranTerpilih.semester === "ganjil";
    const isSemesterGenap = tahunAjaranTerpilih.semester === "genap";

    const filteredMahasiswa = allMahasiswa.filter((mhs) => {
      const sameProdi = Number(mhs.prodi_id) === Number(data.prodi_id);
      const sameKelas = Number(mhs.kelas_id) === Number(data.kelas_id);
      const smt = parseInt(mhs.smester, 10);
      if (isNaN(smt)) return false;
      const cocokSemester = isSemesterGanjil ? smt % 2 === 1 : isSemesterGenap ? smt % 2 === 0 : true;
      return sameProdi && sameKelas && cocokSemester;
    });

    setMahasiswaList(
      filteredMahasiswa.map((mhs) => ({
        value: mhs.id,
        label: `${mhs.nama_lengkap}_${mhs.nim}`,
      }))
    );
  }, [data.prodi_id, data.kelas_id, data.tahunajaran_id, tahunAjaranList, allMahasiswa]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (selected, field) => {
    setData((prev) => ({
      ...prev,
      [field]: selected?.value || null,
    }));

    if (field === "prodi_id") {
      setData((prev) => ({ ...prev, kelas_id: null }));
    }
  };

  const formatTime = (time) => (time ? time.slice(0, 5) : "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:8000/api/penjadwalanruangan/${id}`, {
        ...data,
        jammulai: formatTime(data.jammulai),
        jamselesai: formatTime(data.jamselesai),
        adminjurusan_id: adminJurusanId,
      });

      swal("Berhasil", "Data berhasil diperbarui", "success").then(() => {
        navigate("/penjadwalanRuanganPerkuliahan");
      });
    } catch (err) {
      console.error(err);
      swal("Gagal", "Terjadi kesalahan saat update", "error");
    }
  };
  return (
    <>
      <Navbar />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: "bold", color: "#1976d2" }}>
            Filter Jadwal
          </Typography>
          <Card
            sx={{
              p: 2,
              mb: 4,
              bgcolor: "#fafafa",
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid #e0e0e0",
              transition: "0.3s",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0 }}>
                Tahun Ajaran
              </Typography>
              <Select
                options={tahunAjaranList}
                value={getSelectedOption(tahunAjaranList, data.tahunajaran_id)}
                onChange={(val) => handleSelect(val, "tahunajaran_id")}
                isClearable
                placeholder="Pilih Tahun Ajaran"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                maxMenuHeight={200}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0 }}>
                Prodi
              </Typography>
              <Select
                options={prodiList}
                value={getSelectedOption(prodiList, data.prodi_id)}
                onChange={(val) => handleSelect(val, "prodi_id")}
                isClearable
                placeholder="Pilih Prodi"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                maxMenuHeight={200}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0 }}>
                Kelas
              </Typography>
              <Select
                options={kelasList.filter((k) => k.prodi_id === data.prodi_id)}
                value={getSelectedOption(kelasList, data.kelas_id)}
                onChange={(val) => handleSelect(val, "kelas_id")}
                isClearable
                placeholder="Pilih Kelas"
                isDisabled={!data.prodi_id}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                maxMenuHeight={200}
              />
            </FormControl>
          </Card>
        </Box>
        {/* Bagian Kanan: Form Jadwal */}
        <Box sx={{ flex: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}>
              Formulir Jadwal Kuliah
            </Typography>
            <Card
              sx={{
                position: "relative", // ⬅️ WAJIB agar posisi absolut bekerja
                p: 3,
                mb: 4,
                bgcolor: "#fafafa",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "1px solid #e0e0e0",
                transition: "0.3s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              {/* Hari - Jam */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <FormControl fullWidth sx={{ flex: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0 }}>
                    Hari
                  </Typography>
                  <Select
                    options={hariOptions}
                    value={getSelectedOption(hariOptions, data.hari)}
                    onChange={(val) => handleSelect(val, "hari")}
                    isClearable
                    placeholder="Pilih Hari"
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ flex: 2, mt: 3 }}>
                  <Box sx={{ display: "flex", gap: 2, backgroundColor: "#fff" }}>
                    <TextField
                      label="Jam Mulai"
                      type="time"
                      name="jammulai"
                      value={data.jammulai}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      InputProps={{
                        style: { fontSize: 12, height: 36 },
                        inputProps: {
                          style: {
                            fontSize: 12,
                            padding: "5px 7px",
                          },
                        },
                      }}
                      InputLabelProps={{
                        style: { fontSize: 12 },
                        shrink: true,
                      }}
                    />

                    <TextField
                      label="Jam Selesai"
                      type="time"
                      name="jamselesai"
                      value={data.jamselesai}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      InputProps={{
                        style: { fontSize: 12, height: 36 },
                        inputProps: {
                          style: {
                            fontSize: 12,
                            padding: "5px 7px",
                          },
                        },
                      }}
                      InputLabelProps={{
                        style: { fontSize: 12 },
                        shrink: true,
                      }}
                    />
                  </Box>
                </FormControl>

                {/* Matakuliah - Dosen */}
                <FormControl fullWidth sx={{ flex: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0 }}>
                    Mata Kuliah
                  </Typography>
                  <Select
                    options={matakuliahList}
                    value={getSelectedOption(matakuliahList, data.kodematakuliah)}
                    onChange={(val) => handleSelect(val, "kodematakuliah")}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 40,
                        height: 40,
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    placeholder="Pilih Mata Kuliah"
                  />
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                {/* Dosen */}
                <FormControl fullWidth sx={{ flex: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0 }}>
                    Dosen Pengampu
                  </Typography>
                  <Select
                    options={dosenList}
                    value={getSelectedOption(dosenList, data.dosen_id)}
                    onChange={(val) => handleSelect(val, "dosen_id")}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 40,
                        height: 40,
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    placeholder="Pilih Dosen"
                  />
                </FormControl>

                {/* Penanggung Jawab */}
                <FormControl fullWidth sx={{ flex: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0 }}>
                    Penanggung Jawab
                  </Typography>
                  <Select
                    options={mahasiswaList}
                    value={getSelectedOption(mahasiswaList, data.mahasiswa_id)}
                    onChange={(val) => handleSelect(val, "mahasiswa_id")}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: 40,
                        height: 40,
                      }),
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    placeholder="Pilih Penanggung Jawab"
                  />
                </FormControl>
              </Box>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <TextField
                  InputProps={{
                    style: { fontSize: 16 },
                  }}
                  InputLabelProps={{
                    style: { fontSize: 16 },
                  }}
                  label="Kebutuhan Kelas"
                  name="kebutuhankelas"
                  multiline
                  rows={3}
                  value={data.kebutuhankelas}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    backgroundColor: "#fff",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </FormControl>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center", // tengah vertikal
                  height: "100%", // penting agar ikuti tinggi cell
                  minHeight: "100%", // tambahan agar aman di semua browser
                  gap: 1,
                  py: 1, // opsional, beri sedikit ruang
                  px: 2, // ⬅️ jarak kiri dan kanan dari batas kolom
                  justifyContent: "flex-end",
                }}
              >
                <Tooltip title="Simpan Semua Jadwal" arrow>
                  <Box
                    component="button"
                    type="submit"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      border: "1.5px solid #198754",
                      color: "#198754",
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 1,
                      backgroundColor: "#E9F7EF",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#198754",
                        color: "#fff",
                      },
                    }}
                  >
                    Simpan
                    <BsSave size={18} />
                  </Box>
                </Tooltip>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default EditPenjadwalanRuanganPerkuliahan;
