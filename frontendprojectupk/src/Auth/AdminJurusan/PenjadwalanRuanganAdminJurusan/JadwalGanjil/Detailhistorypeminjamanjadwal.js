import { Avatar, Box, CircularProgress, Grid, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../../../Components/Navbar/Navbar";

const DetailPenjadwalanRuanganPerkuliahanHistory = ({ open }) => {
    const { id } = useParams();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [gedungs, setGedungs] = useState([]);
    const [jenisKelasList, setJenisKelasList] = useState([]);
    const [modelKelasList, setModelKelasList] = useState([]);
    const [saranaKelasList, setSaranaKelasList] = useState([]);

    useEffect(() => {
        const fetchRefData = async () => {
            try {
                const [jenis, model, sarana] = await Promise.all([
                    axios.get("http://localhost:8000/api/jeniskelas"),
                    axios.get("http://localhost:8000/api/modelkelas"),
                    axios.get("http://localhost:8000/api/saranakelas"),
                ]);
                setJenisKelasList(jenis.data);
                setModelKelasList(model.data);
                setSaranaKelasList(sarana.data);
            } catch (error) {
                console.error("Gagal fetch master data:", error);
            }
        };
        fetchRefData();
    }, []);
    const mapIdsToNames = (ids, list) => {
        if (!ids) return "-";
        const idArray = Array.isArray(ids)
            ? ids
            : typeof ids === "string"
            ? JSON.parse(ids)
            : [ids];

        const names = idArray
            .map((id) => {
                const found = list.find(
                    (item) => item.id === id || item.id === Number(id)
                );
                return found?.name || found?.nama || "-";
            })
            .filter(Boolean);

        return names.length > 0 ? names.join(", ") : "-";
    };

    useEffect(() => {
        axios
            .get("http://localhost:8000/api/gedungs")
            .then((res) => setGedungs(res.data))
            .catch((err) => console.error(err));
    }, []);

    const gedungId = data?.ruangan?.gedung;
    const gedungNama =
        gedungs.find((g) => String(g.id) === String(gedungId))?.name || "-";

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8000/api/penjadwalanruangangetdetailhistory/${id}`
                );
                setData(res.data.data);
            } catch (err) {
                console.error("Gagal mengambil data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const {
        kelas,
        mahasiswa,
        matakuliah,
        prodi,
        dosen,
        hari,
        jammulai,
        jamselesai,
        kebutuhankelas,
        statuspeminjaman,
        kurikulum,
        ruangan,
    } = data || {};

    return (
        <>
            <Navbar />
            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                {loading ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Grid
                            alignItems="flex-start"
                            justifyContent="center"
                            container
                            spacing={3}
                        >
                            <Grid item xs={12} md={6} sx={{ height: "100%" }}>
                                <Box
                                    sx={{
                                        width: {
                                            xs: "80%",
                                            sm: "95%",
                                            md: open ? "440px" : "550px",
                                        },
                                        mx: "auto",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: "100%",
                                            backgroundColor: "#e3f2fd",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 1,
                                            mb: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#0d47a1",
                                            }}
                                        >
                                            👨‍🎓 Mahasiswa Penanggungjawab
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <Avatar
                                            variant="rounded"
                                            src={
                                                mahasiswa?.foto
                                                    ? `http://localhost:8000/storage/${mahasiswa.foto}`
                                                    : undefined
                                            }
                                            sx={{
                                                width: 100,
                                                height: 140,
                                                objectFit: "cover",
                                            }}
                                        />
                                        <Box>
                                            {[
                                                {
                                                    label: "Nama",
                                                    value:
                                                        mahasiswa?.nama_lengkap ||
                                                        "-",
                                                },
                                                {
                                                    label: "NIM",
                                                    value:
                                                        mahasiswa?.nim || "-",
                                                },
                                                {
                                                    label: "Kelas",
                                                    value: kelas?.nama || "-",
                                                },
                                                {
                                                    label: "Semester",
                                                    value:
                                                        mahasiswa?.smester ||
                                                        "-",
                                                },
                                                {
                                                    label: "No. Telepon",
                                                    value:
                                                        mahasiswa?.notlp || "-",
                                                },
                                                {
                                                    label: "Jurusan",
                                                    value:
                                                        mahasiswa?.jurusan
                                                            ?.namajurusan ||
                                                        "-",
                                                },
                                                {
                                                    label: "Program Studi",
                                                    value:
                                                        mahasiswa?.prodi
                                                            ?.namaprodi || "-",
                                                },
                                            ].map(({ label, value }) => (
                                                <Box
                                                    key={label}
                                                    sx={{
                                                        display: "flex",
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            minWidth: "120px",
                                                        }}
                                                    >
                                                        {label}
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            width: "20px",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        :
                                                    </Box>
                                                    <Box>{value}</Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6} sx={{ height: "100%" }}>
                                <Box
                                    sx={{
                                        width: {
                                            xs: "80%",
                                            sm: "95%",
                                            md: open ? "480px" : "550px",
                                        },
                                        mx: "auto",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: "100%",
                                            backgroundColor: "#e3f2fd",
                                            px: 2,
                                            py: 1,
                                            borderRadius: 1,
                                            mb: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{
                                                fontWeight: "bold",
                                                color: "#0d47a1",
                                            }}
                                        >
                                            🏫 Detail Ruangan
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", gap: 2 }}>
                                        <Avatar
                                            variant="rounded"
                                            src={
                                                data?.ruangan?.gambar
                                                    ? `http://localhost:8000/storage/${data.ruangan.gambar}`
                                                    : undefined
                                            }
                                            sx={{ width: 150, height: 120 }}
                                        />
                                        <Box>
                                            {[
                                                {
                                                    label: "Gedung",
                                                    value: gedungNama,
                                                },
                                                {
                                                    label: "Ruangan",
                                                    value:
                                                        data?.ruangan?.name ||
                                                        "-",
                                                },
                                                {
                                                    label: "Lantai",
                                                    value:
                                                        data?.ruangan?.lantai ||
                                                        "-",
                                                },
                                                {
                                                    label: "Kapasitas",
                                                    value:
                                                        data?.ruangan
                                                            ?.kapasitas || "-",
                                                },
                                                {
                                                    label: "Jenis Kelas",
                                                    value: mapIdsToNames(
                                                        typeof data?.ruangan
                                                            ?.jeniskelas ===
                                                            "string"
                                                            ? JSON.parse(
                                                                  data.ruangan
                                                                      .jeniskelas
                                                              )
                                                            : data?.ruangan
                                                                  ?.jeniskelas,
                                                        jenisKelasList
                                                    ),
                                                },
                                                {
                                                    label: "Model",
                                                    value: mapIdsToNames(
                                                        typeof data?.ruangan
                                                            ?.modelkelas ===
                                                            "string"
                                                            ? JSON.parse(
                                                                  data.ruangan
                                                                      .modelkelas
                                                              )
                                                            : data?.ruangan
                                                                  ?.modelkelas,
                                                        modelKelasList
                                                    ),
                                                },
                                                {
                                                    label: "Sarana",
                                                    value: mapIdsToNames(
                                                        typeof data?.ruangan
                                                            ?.saranakelas ===
                                                            "string"
                                                            ? JSON.parse(
                                                                  data.ruangan
                                                                      .saranakelas
                                                              )
                                                            : data?.ruangan
                                                                  ?.saranakelas,
                                                        saranaKelasList
                                                    ),
                                                },
                                            ].map(({ label, value }) => (
                                                <Box
                                                    key={label}
                                                    sx={{
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        mb: 0.5,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            minWidth: "120px",
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        {label}
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            width: "20px",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        :
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        {value}
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <Box
                                            sx={{
                                                width: {
                                                    xs: "80%",
                                                    sm: "95%",
                                                    md: open
                                                        ? "280px"
                                                        : "330px",
                                                },
                                                mx: "auto",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: "#e3f2fd",
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: 1,
                                                    mb: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="h5"
                                                    gutterBottom
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#0d47a1",
                                                    }}
                                                >
                                                    📘 Detail Mata Kuliah
                                                </Typography>
                                            </Box>
                                            {[
                                                {
                                                    label: "Matakuliah",
                                                    value:
                                                        matakuliah?.namamatakuliah ||
                                                        "-",
                                                },
                                                {
                                                    label: "Kurikulum",
                                                    value:
                                                        matakuliah?.kurikulum
                                                            ?.nama || "-",
                                                },
                                                {
                                                    label: "Tahun Ajaran",
                                                    value:
                                                        data.matakuliah
                                                            ?.tahunajaran
                                                            ?.tahun &&
                                                        data.matakuliah
                                                            ?.tahunajaran
                                                            ?.semester
                                                            ? `${data.matakuliah.tahunajaran.tahun} - ${data.matakuliah.tahunajaran.semester}`
                                                            : "-",
                                                },
                                                {
                                                    label: "SKS",
                                                    value:
                                                        matakuliah?.sks_total ||
                                                        "-",
                                                },
                                                {
                                                    label: "Tipe",
                                                    value:
                                                        matakuliah?.tipe || "-",
                                                },
                                            ].map(({ label, value }) => (
                                                <Box
                                                    key={label}
                                                    sx={{
                                                        display: "flex",
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            minWidth: "100px",
                                                        }}
                                                    >
                                                        {label}
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            width: "20px",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        :
                                                    </Box>
                                                    <Box>{value}</Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Box
                                            sx={{
                                                width: {
                                                    xs: "80%",
                                                    sm: "95%",
                                                    md: open
                                                        ? "280px"
                                                        : "330px",
                                                },
                                                mx: "auto",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: "#e3f2fd",
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: 1,
                                                    mb: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="h5"
                                                    gutterBottom
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#0d47a1",
                                                    }}
                                                >
                                                    🗓️ Detail Jadwal
                                                </Typography>
                                            </Box>
                                            {[
                                                {
                                                    label: "Hari",
                                                    value: hari || "-",
                                                },
                                                {
                                                    label: "Jam",
                                                    value:
                                                        jammulai && jamselesai
                                                            ? `${jammulai} - ${jamselesai}`
                                                            : "-",
                                                },
                                                {
                                                    label: "Kebutuhan",
                                                    value:
                                                        kebutuhankelas || "-",
                                                },
                                                {
                                                    label: "Status Jadwal",
                                                    value:
                                                        statuspeminjaman || "-",
                                                },
                                            ].map(({ label, value }) => (
                                                <Box
                                                    key={label}
                                                    sx={{
                                                        display: "flex",
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            minWidth: "100px",
                                                        }}
                                                    >
                                                        {label}
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            width: "20px",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        :
                                                    </Box>
                                                    <Box>{value}</Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Box
                                            sx={{
                                                width: {
                                                    xs: "80%",
                                                    sm: "95%",
                                                    md: open
                                                        ? "330px"
                                                        : "400px",
                                                },
                                                mx: "auto",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    backgroundColor: "#e3f2fd",
                                                    px: 2,
                                                    py: 1,
                                                    borderRadius: 1,
                                                    mb: 2,
                                                }}
                                            >
                                                <Typography
                                                    variant="h5"
                                                    gutterBottom
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#0d47a1",
                                                    }}
                                                >
                                                    👨‍🏫 Detail Dosen
                                                </Typography>
                                            </Box>
                                            {[
                                                {
                                                    label: "Nama",
                                                    value: dosen?.nama || "-",
                                                },
                                                {
                                                    label: "NIP",
                                                    value: dosen?.nip || "-",
                                                },
                                                {
                                                    label: "No. Telepon",
                                                    value:
                                                        dosen?.notelpon || "-",
                                                },
                                                {
                                                    label: "Program Studi",
                                                    value:
                                                        dosen?.prodi
                                                            ?.namaprodi || "-",
                                                },
                                                {
                                                    label: "Email",
                                                    value: dosen?.email || "-",
                                                },
                                                {
                                                    label: "Sebagai",
                                                    value:
                                                        dosen?.jabatanfungsional ||
                                                        "-",
                                                },
                                            ].map(({ label, value }) => (
                                                <Box
                                                    key={label}
                                                    sx={{
                                                        display: "flex",
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            minWidth: "100px",
                                                        }}
                                                    >
                                                        {label}
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            width: "20px",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        :
                                                    </Box>
                                                    <Box>{value}</Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
        </>
    );
};

export default DetailPenjadwalanRuanganPerkuliahanHistory;
