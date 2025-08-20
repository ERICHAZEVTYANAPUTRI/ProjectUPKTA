import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Skeleton,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import swal from "sweetalert";
import emptyHuman from "../../../../src/assets/nojadwal.png";

const JadwalSedangBerlangsungCard = ({ open, shouldRefresh }) => {
    const [jadwal, setJadwal] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const extractFileIdFromUrl = (url) => {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    };
    const handleOpenDialog = (item) => {
        setSelectedItem(item);
        setVideoUrl("");
        setDialogOpen(true);
    };
    useEffect(() => {
        if (token) fetchData();
    }, [token, shouldRefresh]);

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleSubmit = async () => {
        const fileId = extractFileIdFromUrl(videoUrl.trim());
        if (!fileId) {
            swal(
                "Link tidak valid",
                "Pastikan link Google Drive mengandung file ID.",
                "warning"
            );
            return;
        }

        if (!selectedItem) {
            swal("Data tidak ditemukan", "Silakan coba lagi.", "error");
            return;
        }

        const endpoint =
            selectedItem.source === "pengajuan"
                ? `http://localhost:8000/api/kembalikan/${selectedItem.id}`
                : `http://localhost:8000/api/kembalikansesuaijadwal/${selectedItem.id}`;

        try {
            await axios.post(
                endpoint,
                { link_drive: videoUrl.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            swal("Berhasil!", "Video berhasil dikirim.", "success");
            setDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            swal(
                "Gagal",
                "Terjadi kesalahan saat mengirim link. Silakan coba lagi.",
                "error"
            );
        }
    };
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:8000/api/peminjaman-berlangsung",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setJadwal(response.data);
        } catch (err) {
            console.error("Error fetching jadwal:", err);
            setError("Gagal memuat jadwal");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);
    if (!Array.isArray(jadwal) || jadwal.length === 0)
        return (
            <Card sx={cardStyle(open)}>
                <CardContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 5,
                        gap: 2,
                        userSelect: "none",
                    }}
                >
                    <img
                        src={emptyHuman}
                        alt="Belum ada peminjaman"
                        style={{ maxWidth: 300, width: "100%", height: "auto" }}
                    />
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ fontStyle: "italic" }}
                    >
                        Belum ada peminjaman ruangan.
                    </Typography>
                </CardContent>
            </Card>
        );

    if (loading)
        return (
            <Card sx={cardStyle(open)}>
                <CardContent>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 3,
                            color: "#1976d2",
                            fontWeight: 600,
                            userSelect: "none",
                            fontSize: "16px",
                            textTransform: "uppercase",
                            borderBottom: "2px solid #1976d2",
                            pb: 1,
                        }}
                    >
                        <Skeleton width={180} />
                    </Typography>

                    {[...Array(5)].map((_, i) => (
                        <Box
                            key={i}
                            sx={{
                                display: "flex",
                                gap: 2,
                                mb: 2,
                                alignItems: "center",
                            }}
                        >
                            <Skeleton
                                variant="circular"
                                width={24}
                                height={24}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Skeleton
                                    width="30%"
                                    height={20}
                                    sx={{ mb: 0.5 }}
                                />
                                <Skeleton width="80%" height={25} />
                            </Box>
                        </Box>
                    ))}

                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Skeleton
                            variant="rectangular"
                            width={120}
                            height={40}
                            sx={{ borderRadius: 3 }}
                        />
                    </Box>
                </CardContent>
            </Card>
        );

    if (error)
        return (
            <Card sx={cardStyle(open, true)}>
                <CardContent>
                    <Typography
                        variant="body1"
                        color="error"
                        align="center"
                        fontWeight={600}
                    >
                        {error}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleOpenDialog}
                            sx={{
                                textTransform: "none",
                                boxShadow: "none",
                                px: 3,
                            }}
                        >
                            Kembalikan
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );

    return (
        <>
            {jadwal.map((item, index) => (
                <Card key={index} sx={{ ...cardStyle(open), mb: 3 }}>
                    <CardContent>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 3,
                                color: "#1976d2",
                                fontWeight: 600,
                                userSelect: "none",
                                fontSize: "16px",
                                textTransform: "uppercase",
                                borderBottom: "2px solid #1976d2",
                                pb: 1,
                            }}
                        >
                            📅 Jadwal Sedang Berlangsung
                        </Typography>

                        <InfoRow
                            icon="📚"
                            label="Matakuliah"
                            value={item.mata_kuliah}
                        />
                        <InfoRow
                            icon="🏫"
                            label="Ruangan"
                            value={item.nama_ruangan}
                        />
                        {item.hari && (
                            <InfoRow icon="📆" label="Hari" value={item.hari} />
                        )}
                        <InfoRow
                            icon="👨‍🏫"
                            label="Dosen Pengampu Matakulih"
                            value={item.dosen || "-"}
                        />
                        <InfoRow
                            icon="⏰"
                            label="Waktu"
                            value={`${item.jam_mulai} - ${item.jam_selesai}`}
                        />
                        <Divider sx={{ my: 3 }} />
                        <Box
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                            {item.statuspeminjaman === "prosespengembalian" ? (
                                <Tooltip
                                    title="Menunggu persetujuan admin"
                                    arrow
                                >
                                    <Button
                                        onClick={() =>
                                            swal(
                                                "Menunggu Persetujuan",
                                                "Pengembalian sedang menunggu persetujuan admin pengelola. Jika disetujui, silakan kembalikan kunci ruangan ke admin. Jika ditolak, Anda dapat mengirim ulang video dokumentasi yang sesuai ketentuan.",
                                                "info"
                                            )
                                        }
                                        sx={{
                                            mb: -3,
                                            background: "#e0e0e0",
                                            color: "#455a64",
                                            fontWeight: 600,
                                            borderRadius: 3,
                                            textTransform: "none",
                                            paddingX: 4,
                                            paddingY: 1.25,
                                            boxShadow: "none",
                                            cursor: "pointer",
                                            "&:hover": {
                                                background: "#d6d6d6",
                                            },
                                        }}
                                    >
                                        Menunggu Persetujuan
                                    </Button>
                                </Tooltip>
                            ) : (
                                <Tooltip title="Kembalikan jadwal" arrow>
                                    <Button
                                        onClick={() => handleOpenDialog(item)}
                                        sx={{
                                            mb: -3,
                                            background:
                                                "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                                            color: "#fff",
                                            fontWeight: 700,
                                            borderRadius: 3,
                                            textTransform: "none",
                                            paddingX: 4,
                                            paddingY: 1.25,
                                            boxShadow:
                                                "0 4px 10px rgba(25, 118, 210, 0.4)",
                                            transition: "all 0.3s ease",
                                            cursor: "pointer",
                                            "&:hover": {
                                                background:
                                                    "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                                                boxShadow:
                                                    "0 6px 14px rgba(25, 118, 210, 0.7)",
                                                transform: "translateY(-2px)",
                                            },
                                        }}
                                    >
                                        Kembalikan
                                    </Button>
                                </Tooltip>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            ))}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        p: 2,
                        background:
                            "linear-gradient(to bottom, #ffffff, #f9fbfd)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        color: "#1976d2",
                        pb: 0,
                    }}
                >
                    Upload Video Kegiatan
                </DialogTitle>

                <DialogContent sx={{ mt: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{ mb: 1, color: "text.secondary" }}
                    >
                        Masukkan link Google Drive dari video dokumentasi
                        ruangan.
                    </Typography>

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Link Google Drive Video"
                        type="url"
                        fullWidth
                        variant="outlined"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/FILE_ID/view"
                        InputProps={{
                            sx: {
                                borderRadius: 2,
                                backgroundColor: "#fff",
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions
                    sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}
                >
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            background:
                                "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                            color: "#fff",
                            fontWeight: 600,
                            textTransform: "none",
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            boxShadow: "0 4px 10px rgba(25, 118, 210, 0.3)",
                            "&:hover": {
                                background:
                                    "linear-gradient(135deg, #1565c0 0%, #2196f3 100%)",
                                boxShadow: "0 6px 14px rgba(25, 118, 210, 0.5)",
                            },
                        }}
                    >
                        Simpan
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            mb: 1.5,
            gap: 1.5,
        }}
    >
        <Typography sx={{ fontSize: 18 }}>{icon}</Typography>
        <Box>
            <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#1976d2", userSelect: "none" }}
            >
                {label}
            </Typography>
            <Typography
                variant="body1"
                sx={{ fontWeight: 700, color: "#0d47a1" }}
            >
                {value || "-"}
            </Typography>
        </Box>
    </Box>
);

const cardStyle = (open, isError = false) => ({
    width: {
        xs: "100%",
        md: open ? 525 : 645,
    },
    borderRadius: 2,
    p: 3,
    boxSizing: "border-box",
    background: isError
        ? "rgba(255, 235, 238, 0.6)"
        : "linear-gradient(to bottom, #ffffff, #f0f4f9)",
    boxShadow: isError
        ? "0 3px 10px rgba(244, 67, 54, 0.3)"
        : "0 8px 24px rgba(0, 0, 0, 0.12)",
    transition: "all 0.3s ease",
    cursor: "default",
    "&:hover": {
        boxShadow: isError
            ? "0 5px 15px rgba(244, 67, 54, 0.4)"
            : "0 12px 28px rgba(0, 0, 0, 0.15)",
        transform: "translateY(-4px)",
    },
});

export default JadwalSedangBerlangsungCard;
