import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import { Box, Typography } from "@mui/material";

const EmptyGedungState = () => (
  <Box
    sx={{
      textAlign: "center",
      py: 8,
      color: "text.secondary",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
    }}
  >
    <HomeWorkOutlinedIcon sx={{ fontSize: 60, color: "#90caf9" }} />
    <Typography variant="h6" sx={{ fontWeight: "medium" }}>
      Tidak ada gedung tersedia saat ini
    </Typography>
    <Typography variant="body2" sx={{ maxWidth: 280, mx: "auto" }}>
      Silakan cek kembali nanti atau hubungi admin untuk informasi lebih lanjut.
    </Typography>
  </Box>
);

export default EmptyGedungState;
