import { Box, Skeleton } from "@mui/material";

const GedungCardSkeleton = () => (
  <Box
    sx={{
      width: 230,
      borderRadius: 3,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      overflow: "hidden",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      p: 0,
    }}
  >
    <Skeleton variant="rectangular" height={130} animation="wave" />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="80%" height={28} animation="wave" />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Skeleton variant="text" width={50} height={24} animation="wave" />
        <Skeleton variant="text" width={50} height={24} animation="wave" />
      </Box>
    </Box>
    <Skeleton variant="rectangular" height={36} animation="wave" sx={{ borderRadius: "0 0 12px 12px" }} />
  </Box>
);

export default GedungCardSkeleton;
