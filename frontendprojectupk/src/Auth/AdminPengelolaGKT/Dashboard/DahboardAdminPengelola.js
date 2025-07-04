import { Box, Grid } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../../../Components/Navbar/Navbar";
import JadwalButuhRuangan from "./CardJadwalButuhRuangan";
import PengajuanMenungguPersetujuan from "./CardPendingDashboardPengelola";
import PengajuanPengembalianPending from "./pengajuanpengembalianpending";
import RuanganLineChart from "./RuanganBarChart";

const DashboardAdminPengelolaGKT = ({ open }) => {
  const [grafikData, setGrafikData] = useState([]);

  const [pieData, setPieData] = useState({ dipinjam: 0, kosong: 0, diperbaiki: 0 });

  useEffect(() => {
    const fetchGrafikData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/ruanganstatistik");
        setGrafikData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data grafik:", error);
      }
    };

    const fetchPieData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/ruanganpersentase");
        setPieData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data pie:", error);
      }
    };

    fetchGrafikData();
    fetchPieData();
  }, []);

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100%", px: { xs: 0, sm: 0 }, py: 0 }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 4 }}>
              <JadwalButuhRuangan open={open} />
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flex: 2, minWidth: 300 }}>
                <RuanganLineChart data={grafikData} />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              columnSpacing={2}
              rowSpacing={2}
              justifyContent="center"
              sx={{ mt: -5 }} // Kurangi jarak atas
            >
              <Grid item xs={12} md={5.8}>
                <PengajuanMenungguPersetujuan open={open} />
              </Grid>
              <Grid item xs={12} md={5.8}>
                <PengajuanPengembalianPending open={open} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default DashboardAdminPengelolaGKT;
