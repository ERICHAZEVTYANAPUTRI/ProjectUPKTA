import { Typography } from "@mui/material";
import HalamanAdminPengelolaPengembalianSesuaiJadwal from "./PengajuanPengembalianAdminPengelolaSesuaiJadwal";
import HalamanAdminPengelolaPengembalianTidakSesuaiJadwal from "./PengajuanPengembalianAdminPengelolaTidakSesuaiJadwal";

const HalamanAdminSemuaPengembalian = () => {
  return (
    <>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        📄 Daftar Ruangan Dipinjam Sesuai Jadwal
      </Typography>
      <HalamanAdminPengelolaPengembalianTidakSesuaiJadwal />

      <Typography variant="h6" gutterBottom fontWeight="bold">
        📄 Daftar Ruangan Dipinjam Diluar Jadwal
      </Typography>
      <HalamanAdminPengelolaPengembalianSesuaiJadwal />
    </>
  );
};

export default HalamanAdminSemuaPengembalian;
