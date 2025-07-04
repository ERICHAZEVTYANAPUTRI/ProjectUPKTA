import { Box, Card, Collapse, Divider, FormControl, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import axios from "axios";
import { format, parse } from "date-fns";
import { useEffect, useState } from "react";
import { BsPlus, BsSave, BsTrash } from "react-icons/bs";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import swal from "sweetalert";
import Navbar from "../../../../Components/Navbar/Navbar";

const TambahPenjadwalanRuanganPerkuliahan = () => {
  const parseTimeString = (timeStr) => parse(timeStr, "HH:mm", new Date());

  const formatTime = (date) => format(date, "HH:mm");

  const user = JSON.parse(localStorage.getItem("user"));
  const adminJurusanId = Number(user.id);
  const cardWidth = 950; // atau 1140 jika ingin yang lebih lebar
  const [allMatakuliah, setAllMatakuliah] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [matakuliahList, setMatakuliahList] = useState([]);
  const [prodiList, setProdiList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [selectedProdi, setSelectedProdi] = useState(null);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);
  const [allMahasiswa, setAllMahasiswa] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [jadwalList, setJadwalList] = useState([]);
  const [openForm, setOpenForm] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (openForm.length === 0 && jadwalList.length > 0) {
      setOpenForm(jadwalList.map(() => true));
    }
  }, [jadwalList]);

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
        const [mhsRes, mkRes, prodiRes, thnRes, dosenRes, kelasRes] = await Promise.all([
          axios.get("http://localhost:8000/api/users"),
          axios.get("http://localhost:8000/api/matakuliah"),
          axios.get("http://localhost:8000/api/prodi"),
          axios.get("http://localhost:8000/api/tahunajaran"),
          axios.get("http://localhost:8000/api/dosen"),
          axios.get("http://localhost:8000/api/kelasmahasiswa"),
        ]);

        const filteredProdi = prodiRes.data.filter((p) => p.adminjurusan_id === adminJurusanId);
        const filteredTahun = thnRes.data.filter((t) => t.adminjurusan_id === adminJurusanId);
        const filteredMatakuliah = mkRes.data.filter((mk) => mk.adminjurusan_id === adminJurusanId && filteredProdi.some((p) => p.id === mk.prodi_id));
        const filteredMahasiswa = mhsRes.data.filter((mhs) => filteredProdi.some((p) => p.id === mhs.prodi_id));
        const filteredDosen = dosenRes.data.filter((dosen) => dosen.adminjurusan_id === adminJurusanId);
        const filteredKelas = kelasRes.data.filter((k) => k.adminjurusan_id === adminJurusanId);
        setAllMatakuliah(mkRes.data); // <-- simpan semua dulu

        setDosenList(filteredDosen.map((d) => ({ value: d.id, label: `${d.nama}_${d.nip}` })));
        setProdiList(filteredProdi.map((p) => ({ value: p.id, label: p.namaprodi })));
        setTahunAjaranList(
          filteredTahun.map((t) => ({
            value: t.id,
            label: `${t.tahun} - Semester ${t.semester}`,
            semester: t.semester,
            is_aktif: t.is_aktif, // ⬅️ Tambahkan ini
          }))
        );
        setMatakuliahList(
          filteredMatakuliah.map((mk) => ({
            value: mk.kodematakuliah,
            label: `${mk.kodematakuliah} - ${mk.namamatakuliah}`,
          }))
        );
        setAllMahasiswa(filteredMahasiswa);
        setKelasList(
          filteredKelas.map((k) => ({
            value: k.id,
            label: k.nama,
            prodi_id: k.prodi_id, // ⬅️ Tambahkan ini untuk bisa difilter
          }))
        );
      } catch (err) {
        console.error("Gagal ambil data:", err);
      }
    };
    fetchData();
  }, [adminJurusanId]);
  useEffect(() => {
    const allMatakuliahOptions = allMatakuliah.map((mk) => ({
      value: mk.kodematakuliah,
      label: `${mk.kodematakuliah} - ${mk.namamatakuliah}`,
    }));
    setMatakuliahList(allMatakuliahOptions);
  }, [allMatakuliah]);

  useEffect(() => {
    if (!selectedProdi || !selectedTahunAjaran || !selectedKelas) {
      setMahasiswaList([]);
      return;
    }

    const isSemesterGanjil = Number(selectedTahunAjaran.semester) === 1;

    const filtered = allMahasiswa.filter((mhs) => {
      const isSameProdi = Number(mhs.prodi_id) === Number(selectedProdi?.value);
      const isSameKelas = Number(mhs.kelas_id) === Number(selectedKelas?.value);

      const semesterMahasiswa = parseInt(mhs.smester, 10);
      const isSemesterGanjil = selectedTahunAjaran?.semester === "ganjil";
      const isSemesterGenap = selectedTahunAjaran?.semester === "genap";

      // Jika semester mahasiswa tidak valid, tetap lolos
      if (isNaN(semesterMahasiswa)) return false;

      // Cek apakah semester mahasiswa sesuai dengan semester tahun ajaran
      const cocokSemester = isSemesterGanjil ? semesterMahasiswa % 2 === 1 : isSemesterGenap ? semesterMahasiswa % 2 === 0 : true; // fallback

      return isSameProdi && isSameKelas && cocokSemester;
    });

    const getNamaKelas = (kelasId) => {
      const kelas = kelasList.find((k) => k.value === kelasId);
      return kelas ? kelas.label : "Tanpa Kelas";
    };

    setMahasiswaList(
      filtered.map((mhs) => ({
        value: mhs.id,
        label: `${mhs.nama_lengkap}_${mhs.nim}_${getNamaKelas(mhs.kelas_id)}`,
      }))
    );

    setJadwalList([
      {
        mahasiswa_id: "",
        dosen_id: "",
        kelas_id: "",
        hari: "",
        jammulai: "",
        jamselesai: "",
        kodematakuliah: "",
        kebutuhankelas: "",
        kelasmahasiswa_id: selectedKelas.value,
      },
    ]);
  }, [selectedProdi, selectedTahunAjaran, selectedKelas, allMahasiswa]);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...jadwalList];
    updated[index][name] = value;
    setJadwalList(updated);
  };

  const handleSelectChange = (selected, index, field) => {
    const updated = [...jadwalList];
    updated[index][field] = selected?.value || "";
    setJadwalList(updated);
  };

  const handleAddJadwal = () => {
    setJadwalList((prev) => [
      ...prev,
      {
        mahasiswa_id: "",
        dosen_id: "",
        hari: "",
        kelas_id: "",
        jammulai: "",
        jamselesai: "",
        kodematakuliah: "",
        kebutuhankelas: "",
        kelasmahasiswa_id: selectedKelas?.value || "",
      },
    ]);
    setOpenForm((prev) => [...prev, true]); // hanya form baru yang dibuka
  };

  const handleRemoveJadwal = (index) => {
    setJadwalList(jadwalList.filter((_, i) => i !== index));
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFormValid = jadwalList.every((j) => j.mahasiswa_id && j.dosen_id && j.hari && j.jammulai && j.jamselesai && j.kodematakuliah && j.kebutuhankelas);

    if (!selectedProdi || !selectedTahunAjaran || !selectedKelas || !isFormValid) {
      swal("Peringatan", "Mohon lengkapi semua field sebelum menyimpan.", "warning");
      return;
    }

    for (let i = 0; i < jadwalList.length; i++) {
      const mulai = timeToMinutes(jadwalList[i].jammulai);
      const selesai = timeToMinutes(jadwalList[i].jamselesai);

      if (selesai - mulai < 30) {
        swal("Peringatan", `Jadwal ke-${i + 1}: Jam selesai minimal 30 menit setelah jam mulai`, "error");
        return;
      }
    }

    try {
      // Cek bentrok dulu
      const res = await axios.post("http://localhost:8000/api/cek-bentrok-jadwal-form", {
        jadwals: jadwalList.map((j) => ({
          ...j,
          prodi_id: selectedProdi?.value,
          tahunajaran_id: selectedTahunAjaran?.value,
          adminjurusan_id: adminJurusanId,
          kelas_id: selectedKelas?.value,
        })),
      });

      if (res.data.bentrok.length > 0) {
        const list = res.data.bentrok.map((i) => `Jadwal ke-${i + 1}`).join(", ");
        swal("Jadwal Bentrok", `Formulir ${list}, kelas sudah memiliki jadwal kuliah lain di hari dan jam yang sama. Harap perbaiki.`, "error");
        return;
      }

      // Jika semua aman, baru kirim semua sekaligus
      await axios.post("http://localhost:8000/api/penjadwalanruangan", {
        jadwal: jadwalList.map((j) => ({
          ...j,
          prodi_id: selectedProdi?.value,
          tahunajaran_id: selectedTahunAjaran?.value,
          adminjurusan_id: adminJurusanId,
          kelas_id: selectedKelas?.value,
        })),
      });

      swal({
        title: "Berhasil!",
        text: "Jadwal berhasil ditambahkan!",
        icon: "success",
        button: "OK",
      }).then(() => {
        navigate("/penjadwalanRuanganPerkuliahan");
      });
    } catch (error) {
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errorList = error.response.data.errors;
        const formatted = Object.entries(errorList)
          .map(([index, messages]) => `Jadwal ke-${parseInt(index) + 1}: ${messages.join(", ")}`)
          .join("\n");

        swal("Gagal Menyimpan", formatted, "error");
      } else {
        swal("Error", "Terjadi kesalahan saat menyimpan.", "error");
      }
    }
  };
  const [tempJamselesaiList, setTempJamselesaiList] = useState(jadwalList.map((item) => parseTimeString(item.jamselesai) || null));

  // Fungsi validasi minimal 30 menit
  function isAtLeast30MinutesLater(startTime, endTime) {
    if (!startTime || !endTime) return false;

    const start = new Date(`2000-01-01T${startTime}:00`);
    let end = new Date(`2000-01-01T${endTime}:00`);

    if (end < start) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }

    const diffInMinutes = (end - start) / (1000 * 60);
    return diffInMinutes >= 30;
  }

  // Jangan lupa update tempJamselesaiList saat jadwalList berubah
  useEffect(() => {
    setTempJamselesaiList(jadwalList.map((item) => parseTimeString(item.jamselesai) || null));
  }, [jadwalList]);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        {/* Sidebar Filter */}
        <Box sx={{ flex: 1, minWidth: 280 }}>
          {/* Judul */}
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
            {/* Tahun Ajaran */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0 }}>
                Pilih Tahun Ajaran
              </Typography>
              <Select
                options={tahunAjaranList.filter((item) => item.is_aktif === 1)}
                value={selectedTahunAjaran}
                onChange={(value) => {
                  setSelectedTahunAjaran(value);
                  setSelectedProdi(null);
                  setSelectedKelas(null);
                }}
                placeholder="Pilih Tahun Ajaran"
                isClearable
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                maxMenuHeight={200}
              />
            </FormControl>

            {/* Prodi */}
            {selectedTahunAjaran && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0 }}>
                  Pilih Prodi
                </Typography>
                <Select
                  options={prodiList}
                  value={selectedProdi}
                  onChange={(value) => {
                    setSelectedProdi(value);
                    setSelectedKelas(null);
                  }}
                  placeholder="Pilih Prodi"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  maxMenuHeight={200}
                />
              </FormControl>
            )}

            {/* Kelas */}
            {selectedProdi && (
              <FormControl fullWidth>
                <Typography variant="subtitle2" sx={{ mb: 0 }}>
                  Pilih Kelas
                </Typography>
                <Select
                  options={kelasList.filter((k) => k.prodi_id === selectedProdi.value)}
                  value={selectedKelas}
                  onChange={setSelectedKelas}
                  placeholder="Pilih Kelas"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  maxMenuHeight={200}
                />
              </FormControl>
            )}
          </Card>
        </Box>

        {/* Form Jadwal */}
        <Box sx={{ flex: 2 }}>
          {selectedProdi && selectedTahunAjaran && selectedKelas && (
            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}>
                Formulir Jadwal Kuliah
              </Typography>

              {jadwalList.map((item, index) => (
                <Card
                  key={index}
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
                  <IconButton
                    onClick={() => setOpenForm((prev) => prev.map((val, i) => (i === index ? !val : val)))}
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12, // ⬅️ posisi kanan atas
                      zIndex: 1,
                    }}
                  >
                    {openForm[index] ? <IoIosArrowUp fontSize={20} fontWeight={600} /> : <IoIosArrowDown fontSize={20} fontWeight={600} />}
                  </IconButton>

                  <Typography sx={{ mb: 2, fontWeight: 600 }}>Jadwal {index + 1}</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Collapse in={openForm[index]}>
                    {/* Hari - Jam - Matakuliah */}
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                      {/* Hari */}
                      <FormControl fullWidth sx={{ flex: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0 }}>
                          Hari
                        </Typography>
                        <Select
                          options={hariOptions}
                          value={getSelectedOption(hariOptions, item.hari)}
                          onChange={(selected) => handleSelectChange(selected, index, "hari")}
                          placeholder="Pilih Hari"
                          isClearable
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        />
                      </FormControl>

                      {/* Jam */}
                      <FormControl fullWidth sx={{ flex: 2, mt: 3 }}>
                        <Box sx={{ display: "flex", gap: 2, backgroundColor: "#fff" }}>
                          <TimePicker
                            label="Jam Mulai"
                            value={parseTimeString(item.jammulai)}
                            onChange={(newValue) => {
                              const updated = [...jadwalList];
                              updated[index].jammulai = formatTime(newValue);
                              setJadwalList(updated);
                            }}
                            ampm={false}
                            timeSteps={{ minutes: 1 }} // 🌟 hanya tampil tiap menit
                            disablePortal={false}
                            PopperProps={{ container: document.body }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                error: false, // pastikan false, supaya border normal abu-abu

                                sx: { zIndex: 1500 },
                                InputProps: { style: { fontSize: 12, height: 36 } },
                                InputLabelProps: { style: { fontSize: 12 }, shrink: true },
                              },
                            }}
                          />
                          <TimePicker
                            label="Jam Selesai"
                            ampm={false}
                            value={tempJamselesaiList[index]}
                            onChange={(newValue) => {
                              const updatedTemp = [...tempJamselesaiList];
                              updatedTemp[index] = newValue;
                              setTempJamselesaiList(updatedTemp);
                            }}
                            onAccept={async (acceptedValue) => {
                              const formattedJamMulai = jadwalList[index].jammulai;
                              const formattedJamSelesai = formatTime(acceptedValue);

                              if (!isAtLeast30MinutesLater(formattedJamMulai, formattedJamSelesai)) {
                                await swal("Jam Selesai Tidak Valid", "Jam selesai minimal 30 menit setelah jam mulai.", "warning");

                                // Reset nilai temp dan jadwalList jamselesai
                                const resetTemp = [...tempJamselesaiList];
                                resetTemp[index] = null; // kosongkan input TimePicker
                                setTempJamselesaiList(resetTemp);

                                const updatedJadwal = [...jadwalList];
                                updatedJadwal[index].jamselesai = "";
                                setJadwalList(updatedJadwal);

                                return;
                              }

                              // Kalau valid, update jamselesai di jadwalList dan tempJamselesaiList
                              const updatedJadwal = [...jadwalList];
                              updatedJadwal[index].jamselesai = formattedJamSelesai;
                              setJadwalList(updatedJadwal);

                              const updatedTemp = [...tempJamselesaiList];
                              updatedTemp[index] = acceptedValue;
                              setTempJamselesaiList(updatedTemp);
                            }}
                            timeSteps={{ minutes: 1 }}
                            disablePortal={false}
                            PopperProps={{ container: document.body }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                error: false,
                                sx: { zIndex: 1500 },
                                InputProps: { style: { fontSize: 12, height: 36 } },
                                InputLabelProps: { style: { fontSize: 12 }, shrink: true },
                              },
                            }}
                          />
                        </Box>
                      </FormControl>

                      {/* Mata Kuliah */}
                      <FormControl fullWidth sx={{ flex: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0 }}>
                          Mata Kuliah
                        </Typography>
                        <Select
                          options={matakuliahList}
                          value={getSelectedOption(matakuliahList, item.kodematakuliah)}
                          onChange={(selected) => handleSelectChange(selected, index, "kodematakuliah")}
                          placeholder="Pilih Mata Kuliah"
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
                        />
                      </FormControl>
                    </Box>

                    {/* Dosen & Penanggung Jawab */}
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                      {/* Dosen */}
                      <FormControl fullWidth sx={{ flex: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0 }}>
                          Dosen Pengampu
                        </Typography>
                        <Select
                          options={dosenList}
                          value={getSelectedOption(dosenList, item.dosen_id)}
                          onChange={(selected) => handleSelectChange(selected, index, "dosen_id")}
                          placeholder="Pilih Dosen"
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
                        />
                      </FormControl>

                      {/* Mahasiswa */}
                      <FormControl fullWidth sx={{ flex: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0 }}>
                          Penanggung Jawab Jadwal
                        </Typography>
                        <Select
                          options={mahasiswaList}
                          value={getSelectedOption(mahasiswaList, item.mahasiswa_id)}
                          onChange={(selected) => handleSelectChange(selected, index, "mahasiswa_id")}
                          placeholder="Pilih Mahasiswa"
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
                        />
                      </FormControl>
                    </Box>

                    {/* Kebutuhan Kelas */}
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Kebutuhan Kelas"
                        name="kebutuhankelas"
                        value={item.kebutuhankelas}
                        onChange={(e) => handleInputChange(e, index)}
                        sx={{
                          backgroundColor: "#fff",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </FormControl>

                    {/* Tombol Hapus */}
                    {jadwalList.length > 1 && (
                      <Tooltip title="Hapus Jadwal Ini" arrow>
                        <Box
                          onClick={() => handleRemoveJadwal(index)}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 2,
                            cursor: "pointer",
                            border: "1.5px solid #DC3545",
                            color: "#DC3545",
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 1,
                            backgroundColor: "#fff0f0",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              backgroundColor: "#DC3545",
                              color: "#fff",
                            },
                          }}
                        >
                          Hapus Jadwal
                          <BsTrash size={18} />
                        </Box>
                      </Tooltip>
                    )}
                  </Collapse>
                </Card>
              ))}
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
                <Tooltip title="Tambah Jadwal Lagi" arrow>
                  <Box
                    onClick={handleAddJadwal}
                    sx={{
                      mb: 2.5,
                      display: "inline-flex",
                      alignItems: "center",
                      cursor: "pointer",
                      gap: 0.5,
                      border: "1.5px solid #0D6EFD",
                      color: "#0D6EFD",
                      fontWeight: 600,
                      borderRadius: 1,
                      padding: "6px 12px",
                      backgroundColor: "#E6F0FF",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: "#0D6EFD",
                        color: "#fff",
                      },
                    }}
                  >
                    Tambah
                    <BsPlus size={18} />
                  </Box>
                </Tooltip>

                {/* Simpan Jadwal */}
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
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default TambahPenjadwalanRuanganPerkuliahan;
