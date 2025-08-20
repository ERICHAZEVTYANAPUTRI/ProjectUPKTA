import { Box, Grid } from "@mui/material";
import { useState } from "react";
import Navbar from "../../../Components/Navbar/Navbar";
import MahasiswaInfoCard from "./InfoMahasiswaCard";
import JadwalSedangBerlangsungCard from "./JadwalBerlangsungCard";
import TabelPeminjamanDiluarJadwal from "./PeminjamanDiluarJadwal";
import PengajuanPendingCard from "./PengajuanJadwalPendingCard";
import PengajuanPeminjamaDiterimaCard from "./PengajuanPeminjamanDiterima";
import SemuaJadwalKelasMahasiswa from "./SemuaJadwalKelas";
import JadwalkelasPJMK from "./SemuaJadwalPJMK";

const DashboardMahasiswa = ({ open }) => {
    const [refreshBerlangsung, setRefreshBerlangsung] = useState(false);

    const handleRefreshBerlangsung = () => {
        setRefreshBerlangsung((prev) => !prev);
    };

    return (
        <>
            <Navbar />
            <Box sx={{ minHeight: "100%", px: { xs: 0, sm: 0 }, py: 0 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 4 }}>
                            <MahasiswaInfoCard open={open} />
                        </Box>
                        <Box>
                            <JadwalSedangBerlangsungCard
                                open={open}
                                shouldRefresh={refreshBerlangsung}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Grid container spacing={3} direction="column">
                            <Grid item>
                                <JadwalkelasPJMK
                                    open={open}
                                    onJadwalDipinjam={handleRefreshBerlangsung}
                                />
                            </Grid>
                            <Grid item>
                                <PengajuanPeminjamaDiterimaCard
                                    open={open}
                                    onJadwalDipinjam={handleRefreshBerlangsung}
                                />
                            </Grid>
                            <Grid item>
                                <PengajuanPendingCard open={open} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Box mt={5}>
                    <SemuaJadwalKelasMahasiswa open={open} />
                </Box>
                <Box mt={5}>
                    <TabelPeminjamanDiluarJadwal open={open} />
                </Box>
            </Box>
        </>
    );
};

export default DashboardMahasiswa;
