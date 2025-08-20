import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
    Avatar,
    Box,
    Button,
    Card,
    Divider,
    TextField,
    Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaCameraRotate } from "react-icons/fa6";
import swal from "sweetalert";
import SkeletonProfileCard from "./SkeletonProfileCard";

const AdminJurusanProfile = ({ user, setUser, open }) => {
    const [editableUser, setEditableUser] = useState(user);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (user) {
            setEditableUser({
                ...user,
            });
            setLoading(false);
        }
    }, [user]);
    const getInitials = (name) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    const getPhotoUrl = (user) => {
        if (!user || !user.foto) return null;
        return `http://localhost:8000/storage/${user.foto.replace(/\\/g, "/")}`;
    };

    const photoUrl = getPhotoUrl(user);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSaveChanges = async () => {
        const formData = new FormData();
        formData.append("username", editableUser.username);
        formData.append("nama_lengkap", editableUser.nama_lengkap);
        formData.append("jabatan", editableUser.jabatan);
        formData.append("kodejurusan", editableUser.kodejurusan);
        formData.append("jurusan", editableUser.jurusan);
        formData.append("nip_nik_nipppk", editableUser.nip_nik_nipppk);

        const fileInput = document.getElementById("file-input");
        if (fileInput.files.length > 0) {
            formData.append("foto", fileInput.files[0]);
        }

        formData.append("_method", "PUT");

        try {
            const response = await axios.post(
                `http://localhost:8000/api/useradminjurusan/${user.id}`,
                formData
            );

            if (response.status !== 200) {
                swal("Gagal!", "Gagal memperbarui profile.", "error");
                return;
            }

            const updatedUser = {
                ...response.data.data,
            };
            setUser(updatedUser);
            setEditableUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("user-updated"));
            setImagePreview(null);
            swal(
                "Berhasil!",
                response.data.message || "Perubahan berhasil disimpan.",
                "success"
            );
        } catch (err) {
            const errorList = err.response?.data?.errors || [];
            const combinedErrors = Array.isArray(errorList)
                ? errorList.join("\n")
                : errorList;

            swal("Validasi Gagal", combinedErrors, "error");
        }
    };

    if (loading) {
        return <SkeletonProfileCard open={open} />;
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 3,
                justifyContent: "center",
                alignItems: "flex-start",
                px: 0,
                mt: 0,
            }}
        >
            <Card
                sx={{
                    width: {
                        xs: "80%",
                        sm: "88%",
                        md: open ? "480px" : "595px",
                    },
                    transition: "width 0.3s ease",
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    background: "linear-gradient(to bottom, #ffffff, #f0f4f9)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
                        transform: "translateY(-4px)",
                    },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    {imagePreview ? (
                        <Avatar
                            alt="Profile Preview"
                            src={imagePreview}
                            sx={{
                                width: 140,
                                height: 140,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                        />
                    ) : photoUrl ? (
                        <Avatar
                            alt="Profile"
                            src={photoUrl}
                            sx={{
                                width: 140,
                                height: 140,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                        />
                    ) : (
                        <Avatar
                            sx={{
                                width: 140,
                                height: 140,
                                bgcolor: "primary.main",
                                fontSize: 48,
                                fontWeight: "bold",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                        >
                            {getInitials(user.username)}
                        </Avatar>
                    )}

                    <Button
                        variant="outlined"
                        startIcon={
                            <FaCameraRotate style={{ fontSize: "14px" }} />
                        }
                        onClick={() =>
                            document.getElementById("file-input").click()
                        }
                        sx={{
                            mt: 1,
                            mb: 1,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "10px !important",
                            px: 1.5,
                            width: "auto",
                            "&:hover": {
                                bgcolor: "primary.light",
                                color: "white",
                            },
                            boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
                        }}
                    >
                        Ubah Foto
                    </Button>
                    <input
                        type="file"
                        id="file-input"
                        style={{ display: "none" }}
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                </Box>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        userSelect: "none",
                        display: "block",
                        mb: 1,
                        fontStyle: "italic",
                        fontSize: "10px",
                        lineHeight: "1.2",
                        textAlign: "center",
                    }}
                >
                    Unggah foto profil dalam format
                    <br />
                    JPG/JPEG/PNG
                </Typography>
                <Box
                    sx={{
                        flexGrow: 1,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 2,
                    }}
                >
                    <Box sx={{ gridColumn: "span 1" }}>
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 0.5,
                                fontWeight: 600,
                                color: "#4f4f4f",
                            }}
                        >
                            Username
                            <Typography
                                component="span"
                                sx={{
                                    color: "#d32f2f",
                                    fontSize: "0.95rem",
                                    ml: 1,
                                    lineHeight: 1,
                                }}
                            >
                                *
                            </Typography>
                        </Typography>
                        <TextField
                            size="small"
                            variant="outlined"
                            value={editableUser.username}
                            onChange={(e) =>
                                setEditableUser({
                                    ...editableUser,
                                    username: e.target.value,
                                })
                            }
                            fullWidth
                            placeholder="Masukkan Username..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "39px",
                                borderRadius: 1,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    color: "#666",
                                    textAlign: "left",
                                    fontSize: "14px !important",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "39px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 1,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ gridColumn: "span 1" }}>
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 0.5,
                                fontWeight: 600,
                                color: "#4f4f4f",
                            }}
                        >
                            Nama Lengkap
                            <Typography
                                component="span"
                                sx={{
                                    color: "#d32f2f",
                                    fontSize: "0.95rem",
                                    ml: 1,
                                    lineHeight: 1,
                                }}
                            >
                                *
                            </Typography>
                        </Typography>
                        <TextField
                            size="small"
                            variant="outlined"
                            value={editableUser.nama_lengkap}
                            onChange={(e) =>
                                setEditableUser({
                                    ...editableUser,
                                    nama_lengkap: e.target.value,
                                })
                            }
                            fullWidth
                            placeholder="Masukkan Nama lengkap..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "39px",
                                borderRadius: 1,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    color: "#666",
                                    textAlign: "left",
                                    fontSize: "14px !important",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "39px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 1,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ gridColumn: "span 1" }}>
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 0.5,
                                fontWeight: 600,
                                color: "#4f4f4f",
                            }}
                        >
                            Nama Jurusan
                            <Typography
                                component="span"
                                sx={{
                                    color: "#d32f2f",
                                    fontSize: "0.95rem",
                                    ml: 1,
                                    lineHeight: 1,
                                }}
                            >
                                *
                            </Typography>
                        </Typography>
                        <TextField
                            size="small"
                            variant="outlined"
                            value={editableUser.jurusan}
                            onChange={(e) =>
                                setEditableUser({
                                    ...editableUser,
                                    jurusan: e.target.value,
                                })
                            }
                            fullWidth
                            placeholder="Masukkan Nama Jurusan..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "39px",
                                borderRadius: 1,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    color: "#666",
                                    textAlign: "left",
                                    fontSize: "14px !important",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "39px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 1,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ gridColumn: "span 1" }}>
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 0.5,
                                fontWeight: 600,
                                color: "#4f4f4f",
                            }}
                        >
                            Kode Jurusan
                            <Typography
                                component="span"
                                sx={{
                                    color: "#d32f2f",
                                    fontSize: "0.95rem",
                                    ml: 1,
                                    lineHeight: 1,
                                }}
                            >
                                *
                            </Typography>
                        </Typography>
                        <TextField
                            size="small"
                            variant="outlined"
                            value={editableUser.kodejurusan}
                            onChange={(e) =>
                                setEditableUser({
                                    ...editableUser,
                                    kodejurusan: e.target.value,
                                })
                            }
                            fullWidth
                            placeholder="Masukkan Kode Jurusan..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "39px",
                                borderRadius: 1,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    color: "#666",
                                    textAlign: "left",
                                    fontSize: "14px !important",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "39px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 1,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ gridColumn: "span 1" }}>
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 0.5,
                                fontWeight: 600,
                                color: "#4f4f4f",
                            }}
                        >
                            NIP / NIK / NIPPPK
                            <Typography
                                component="span"
                                sx={{
                                    color: "#d32f2f",
                                    fontSize: "0.95rem",
                                    ml: 1,
                                    lineHeight: 1,
                                }}
                            >
                                *
                            </Typography>
                        </Typography>
                        <TextField
                            size="small"
                            variant="outlined"
                            value={editableUser.nip_nik_nipppk}
                            onChange={(e) =>
                                setEditableUser({
                                    ...editableUser,
                                    nip_nik_nipppk: e.target.value,
                                })
                            }
                            fullWidth
                            placeholder="Masukkan NIP / NIK / NIPPPK..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "39px",
                                borderRadius: 1,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    color: "#666",
                                    textAlign: "left",
                                    fontSize: "14px !important",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "39px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 1,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ gridColumn: "span 1" }}>
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 0.5,
                                fontWeight: 600,
                                color: "#4f4f4f",
                            }}
                        >
                            Jabatan
                            <Typography
                                component="span"
                                sx={{
                                    color: "#d32f2f",
                                    fontSize: "0.95rem",
                                    ml: 1,
                                    lineHeight: 1,
                                }}
                            >
                                *
                            </Typography>
                        </Typography>
                        <TextField
                            size="small"
                            variant="outlined"
                            value={editableUser.jabatan}
                            onChange={(e) =>
                                setEditableUser({
                                    ...editableUser,
                                    jabatan: e.target.value,
                                })
                            }
                            fullWidth
                            placeholder="Masukkan Nama Jabatan..."
                            InputProps={{
                                disableUnderline: false,
                            }}
                            sx={{
                                height: "39px",
                                borderRadius: 1,
                                backgroundColor: "#fff",
                                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                                "& .MuiInputBase-input": {
                                    color: "#666",
                                    textAlign: "left",
                                    fontSize: "14px !important",
                                },
                                "& input::placeholder": {
                                    fontSize: "14px",
                                    opacity: 1,
                                    color: "#888",
                                },
                                "& .MuiOutlinedInput-root": {
                                    height: "39px",
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                        {
                                            borderColor: "#0C20B5",
                                            borderWidth: "1px",
                                        },
                                    "& fieldset": {
                                        borderColor: "#ccc",
                                        borderRadius: 1,
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "#0C20B5",
                                        borderRadius: 1,
                                    },
                                },
                            }}
                        />
                    </Box>

                    {/* Spacer for alignment */}
                    <Box
                        sx={{
                            gridColumn: "span 2",
                            textAlign: "right",
                            mt: 0,
                            mb: 1,
                        }}
                    >
                        <Button
                            variant="contained"
                            size="medium"
                            onClick={handleSaveChanges}
                            sx={{
                                borderRadius: 2,
                                px: 2,
                                fontSize: "14px !important",
                                fontWeight: 600,
                                textTransform: "none",
                                boxShadow:
                                    "0 4px 10px rgba(25, 118, 210, 0.35)",
                            }}
                        >
                            Simpan
                        </Button>
                    </Box>
                </Box>
            </Card>
            <PasswordCard user={user} open={open} />
        </Box>
    );
};
const PasswordCard = ({ user, open }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmPassword) {
            swal("Gagal", "Konfirmasi password tidak cocok", "error");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8000/api/user/${user.id}/update-password`,
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword,
                }
            );

            swal(
                "Berhasil",
                response.data.message || "Password berhasil diperbarui",
                "success"
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const errors = err.response?.data?.errors || {};
            const messages = Object.values(errors).flat().join("\n");
            swal("Gagal", messages || "Gagal mengubah password", "error");
        }
    };

    return (
        <Card
            sx={{
                width: {
                    xs: "80%",
                    sm: "88%",
                    md: open ? "350px" : "450px",
                },
                transition: "width 0.3s ease",
                borderRadius: 2,
                px: 3,
                py: 1,
                background: "linear-gradient(to bottom, #ffffff, #f0f4f9)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                transition: "all 0.3s ease",
                "&:hover": {
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
                    transform: "translateY(-4px)",
                },
            }}
        >
            <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 600 }}>
                Form Reset Password
            </Typography>
            <Divider sx={{ border: 1, color: "#ccc", mt: 1, mb: 2 }} />
            <Box sx={{ gridColumn: "span 1" }}>
                <Typography
                    variant="body2"
                    sx={{
                        mb: 0.5,
                        fontWeight: 600,
                        color: "#4f4f4f",
                    }}
                >
                    Password Lama
                    <Typography
                        component="span"
                        sx={{
                            color: "#d32f2f",
                            fontSize: "0.95rem",
                            ml: 1,
                            lineHeight: 1,
                        }}
                    >
                        *
                    </Typography>
                </Typography>
                <TextField
                    type={showCurrentPassword ? "text" : "password"}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Masukkan Password Lama..."
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() =>
                                        setShowCurrentPassword((prev) => !prev)
                                    }
                                    edge="end"
                                >
                                    {showCurrentPassword ? (
                                        <VisibilityOff
                                            sx={{ fontSize: "16px" }}
                                        />
                                    ) : (
                                        <Visibility sx={{ fontSize: "16px" }} />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                        disableUnderline: false,
                    }}
                    sx={{
                        height: "39px",
                        borderRadius: 1,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                        "& .MuiInputBase-input": {
                            color: "#666",
                            textAlign: "left",
                            fontSize: "14px !important",
                        },
                        "& input::placeholder": {
                            fontSize: "14px",
                            opacity: 1,
                            color: "#888",
                        },
                        "& .MuiOutlinedInput-root": {
                            height: "39px",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#0C20B5",
                                borderWidth: "1px",
                            },
                            "& fieldset": {
                                borderColor: "#ccc",
                                borderRadius: 1,
                            },
                            "&:hover fieldset": {
                                borderColor: "#0C20B5",
                                borderRadius: 1,
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#0C20B5",
                                borderRadius: 1,
                            },
                        },
                    }}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
            </Box>
            <Box sx={{ gridColumn: "span 1", mt: 2 }}>
                <Typography
                    variant="body2"
                    sx={{
                        mb: 0.5,
                        fontWeight: 600,
                        color: "#4f4f4f",
                    }}
                >
                    Password Baru
                    <Typography
                        component="span"
                        sx={{
                            color: "#d32f2f",
                            fontSize: "0.95rem",
                            ml: 1,
                            lineHeight: 1,
                        }}
                    >
                        *
                    </Typography>
                </Typography>
                <TextField
                    type={showNewPassword ? "text" : "password"}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Masukkan Password Baru..."
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() =>
                                        setShowNewPassword((prev) => !prev)
                                    }
                                    edge="end"
                                >
                                    {showNewPassword ? (
                                        <VisibilityOff
                                            sx={{ fontSize: "16px" }}
                                        />
                                    ) : (
                                        <Visibility sx={{ fontSize: "16px" }} />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                        disableUnderline: false,
                    }}
                    sx={{
                        height: "39px",
                        borderRadius: 1,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                        "& .MuiInputBase-input": {
                            color: "#666",
                            textAlign: "left",
                            fontSize: "14px !important",
                        },
                        "& input::placeholder": {
                            fontSize: "14px",
                            opacity: 1,
                            color: "#888",
                        },
                        "& .MuiOutlinedInput-root": {
                            height: "39px",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#0C20B5",
                                borderWidth: "1px",
                            },
                            "& fieldset": {
                                borderColor: "#ccc",
                                borderRadius: 1,
                            },
                            "&:hover fieldset": {
                                borderColor: "#0C20B5",
                                borderRadius: 1,
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#0C20B5",
                                borderRadius: 1,
                            },
                        },
                    }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </Box>
            <Box sx={{ gridColumn: "span 1", mt: 2 }}>
                <Typography
                    variant="body2"
                    sx={{
                        mb: 0.5,
                        fontWeight: 600,
                        color: "#4f4f4f",
                    }}
                >
                    Konfirmasi Password
                    <Typography
                        component="span"
                        sx={{
                            color: "#d32f2f",
                            fontSize: "0.95rem",
                            ml: 1,
                            lineHeight: 1,
                        }}
                    >
                        *
                    </Typography>
                </Typography>
                <TextField
                    type={showConfirmPassword ? "text" : "password"}
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Masukkan Konfirmasi Password..."
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                    }
                                    edge="end"
                                >
                                    {showConfirmPassword ? (
                                        <VisibilityOff
                                            sx={{ fontSize: "16px" }}
                                        />
                                    ) : (
                                        <Visibility sx={{ fontSize: "16px" }} />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                        disableUnderline: false,
                    }}
                    sx={{
                        height: "39px",
                        borderRadius: 1,
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                        "& .MuiInputBase-input": {
                            color: "#666",
                            textAlign: "left",
                            fontSize: "14px !important",
                        },
                        "& input::placeholder": {
                            fontSize: "14px",
                            opacity: 1,
                            color: "#888",
                        },
                        "& .MuiOutlinedInput-root": {
                            height: "39px",
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#0C20B5",
                                borderWidth: "1px",
                            },
                            "& fieldset": {
                                borderColor: "#ccc",
                                borderRadius: 1,
                            },
                            "&:hover fieldset": {
                                borderColor: "#0C20B5",
                                borderRadius: 1,
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: "#0C20B5",
                                borderRadius: 1,
                            },
                        },
                    }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </Box>
            <Box
                sx={{ gridColumn: "span 2", textAlign: "right", mt: 2, mb: 1 }}
            >
                <Button
                    variant="contained"
                    size="medium"
                    onClick={handlePasswordUpdate}
                    sx={{
                        borderRadius: 2,
                        px: 2,
                        fontSize: "14px !important",
                        fontWeight: 600,
                        textTransform: "none",
                        boxShadow: "0 4px 10px rgba(25, 118, 210, 0.35)",
                    }}
                >
                    Simpan
                </Button>
            </Box>
        </Card>
    );
};

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        height: 39,
        borderRadius: 3,
        backgroundColor: "#fff",
        boxShadow: state.isFocused
            ? "0 0 0 2px rgba(12, 32, 181, 0.1)"
            : "0 2px 5px rgba(0, 0, 0, 0.1)",
        borderColor: state.isFocused ? "#0C20B5" : "#ccc",
        "&:hover": {
            borderColor: "#0C20B5",
        },
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),
    singleValue: (base) => ({
        ...base,
        textAlign: "start",
        color: "#666",
    }),
    placeholder: (base) => ({
        ...base,
        textAlign: "start",
    }),
};

export default AdminJurusanProfile;
