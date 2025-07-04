import { Box, Grid } from "@mui/material";
import Navbar from "../../../Components/Navbar/Navbar";
import HorizontalCards from "./CardBox";
import TabelPeminjamanPending from "./MahasiswaTidakMelakukanPembelajaran";

const DashboardAdminJurusan = ({ open }) => {
  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100%", px: { xs: 0, sm: 0 }, py: 0 }}>
        <Grid container spacing={3}>
          {/* Kolom Kiri */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <HorizontalCards open={open} />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <TabelPeminjamanPending open={open} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default DashboardAdminJurusan;
