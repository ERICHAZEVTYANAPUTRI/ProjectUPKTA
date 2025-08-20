import { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import AdminJurusanProfile from "./ProfileAdminJurusan";
import AdminPengelolaProfile from "./ProfileAdminPengelola";
import MahasiswaProfile from "./ProfileMahasiswa";
import PengelolaProfile from "./ProfilePengelola";

import {
    Box,
    CircularProgress,
    Container,
    Stack,
    Typography,
} from "@mui/material";

const Profile = ({ open }) => {
    const [user, setUser] = useState(null);
    const [editableUser, setEditableUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        console.log("Stored user:", storedUser);
        if (storedUser) {
            setUser(storedUser);
            setEditableUser(storedUser);
        }
    }, []);

    const handleSaveChanges = (updatedUser) => {
        console.log("Saving user:", updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditableUser(updatedUser);
    };
    const renderRoleComponent = () => {
        switch (user?.role) {
            case "admin_jurusan":
                return (
                    <AdminJurusanProfile
                        open={open}
                        user={user}
                        setUser={setUser}
                    />
                );
            case "admin_pengelola_gkt":
                return (
                    <AdminPengelolaProfile
                        open={open}
                        user={user}
                        setUser={setUser}
                    />
                );
            case "mahasiswa":
                return (
                    <MahasiswaProfile
                        open={open}
                        user={editableUser}
                        setUser={handleSaveChanges}
                    />
                );
            case "pengelola_gkt":
                return (
                    <PengelolaProfile
                        open={open}
                        user={user}
                        setUser={setUser}
                    />
                );
            default:
                return (
                    <Typography color="error">Role tidak dikenali</Typography>
                );
        }
    };

    if (!user || !editableUser)
        return (
            <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
                <CircularProgress />
            </Container>
        );

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: "100%", px: { xs: 0, sm: 0 }, py: 0 }}>
                <Stack spacing={3}>
                    <Box>{renderRoleComponent()}</Box>
                </Stack>
            </Box>
        </>
    );
};

export default Profile;
