import { Box, Card, Divider, Drawer, List, Typography, useMediaQuery, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import { BsPeople } from "react-icons/bs";
import { FaBook, FaChalkboardTeacher, FaUniversity, FaUserTie } from "react-icons/fa";
import { FaGraduationCap } from "react-icons/fa6";
import { FiAirplay } from "react-icons/fi";
import { HiOutlineCalendarDateRange, HiOutlineNewspaper } from "react-icons/hi2";
import { LuClipboardPen } from "react-icons/lu";
import { MdCalendarToday, MdEventNote, MdOutlineSwitchAccount } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";
import { TfiMenuAlt } from "react-icons/tfi";
import { useLocation } from "react-router-dom";
import LogoPoliwangi from "../../assets/LogoPoliwangi.jpeg";
import CustomDropdownMenu from "../CustomList/CustomDropdownMenu";
import CustomListItem from "../CustomList/CustomList";

const Sidebar = ({ children }) => {
  const drawerWidthOpen = 240; // semula 280
  const drawerWidthClosed = 50; // semula 60
  const [isJadwalOpen, setIsJadwalOpen] = useState(false);
  const [isPeminjamanOpen, setIsPeminjamanOpen] = useState(false);
  const isActive = (path) => location.pathname === path;
  const location = useLocation();

  const [open, setOpen] = useState(true);

  const [user, setUser] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;
  const role = user.role;

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidthOpen : drawerWidthClosed,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidthOpen : drawerWidthClosed,
            transition: "width 0.3s ease",
            boxSizing: "border-box",
            overflow: "hidden",
            marginTop: "70px", // semula "85px"
            marginLeft: open ? "20px" : "0px", // semula "30px"
            marginBottom: "20px", // semula "25px"
            height: "calc(92% - 30px)", // beri ruang lebih
            borderRadius: "8px",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
            position: "fixed",
            top: "16px",
            height: "calc(90% - 30px)",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
          },
        }}
        open={open}
      >
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: open ? "flex-end" : "center",
              alignItems: "center",
              p: 1,
            }}
          >
            <IconButton onClick={() => setOpen(!open)}>
              <TfiMenuAlt fontSize={20} />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "-20px",
              marginBottom: "1px",
              py: 2,
            }}
          >
            <img
              src={LogoPoliwangi}
              alt="Logo"
              style={{
                width: open ? 72 : 36, // semula 80 : 40
                transition: "width 0.3s",
              }}
            />
          </Box>
          {open && (
            <Typography
              variant="subtitle2"
              sx={{
                mt: 1,
                fontWeight: 600,
                color: "#444",
                ml: 2.5, // semula ml: 3
                fontSize: "0.85rem", // sedikit kecil dari default
              }}
            >
              Menu
            </Typography>
          )}

          <Divider />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 0 },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <List>
            {role === "mahasiswa" && (
              <>
                <CustomListItem to="/DashboardMahasiswa" icon={<FiAirplay size={19} />} label="Dashboard" open={open} isActive={isActive("/DashboardMahasiswa")} />
                <CustomListItem to="/MahasiswaGedung" icon={<SiGoogleclassroom size={19} />} label="Ruangan Perkuliahan" open={open} activePaths={["/ruanganmahasiswa/lihat", "/ruangan/"]} />
                <CustomListItem to="/peminjamanselesaisesuaijadwalbaianmahasiswa" icon={<HiOutlineNewspaper size={23} />} label="Riwayat Peminjaman" open={open} activePaths={["/pengembalianselesaimahasiswa"]} />
              </>
            )}

            {role === "admin_pengelola_gkt" && (
              <>
                <CustomListItem to="/DashboardAdminPengelola" icon={<FiAirplay size={19} />} label="Dashboard" open={open} />
                <CustomListItem to="/TabelMahasiswa" icon={<BsPeople size={19} />} label="Data User" open={open} activePaths={["/TabelPengelelolaGKT", "/TabelAdminJurusan"]} />
                <CustomListItem to="/JenisKelas" icon={<FaChalkboardTeacher size={19} />} label="Kategori Ruangan" open={open} activePaths={["/ModelKelas", "/SaranaKelas"]} />
                <CustomListItem to="/DataGedung" icon={<SiGoogleclassroom size={19} />} label="Data Ruangan" open={open} activePaths={["/ruangan/1", "/ruangan/1/detail"]} />
                <CustomListItem to="/PengajuanPeminjamanRuangan" icon={<LuClipboardPen size={19} />} label="Pengajuan Peminjaman" open={open} activePaths={["/pengajuanpeminjamanditerima"]} />
                <CustomListItem
                  to="/PenjadwalanRuanganPengelola"
                  icon={<HiOutlineCalendarDateRange size={21} />}
                  label="Penjadwalan Ruangan"
                  open={open}
                  activePaths={["/penjadwalanRuangan/detail", "/persetujuanpengembaliansesuaijadwal"]}
                />
                <CustomDropdownMenu
                  label="Peminjaman Ruangan"
                  icon={<MdOutlineSwitchAccount size={21} />}
                  open={open}
                  isOpen={isPeminjamanOpen}
                  setIsOpen={setIsPeminjamanOpen}
                  items={[
                    {
                      label: "Peminjaman Diluar Jadwal",
                      to: "/persetujuanpengembaliantidaksesuaijadwal",
                    },
                    {
                      label: "Peminjaman Selesai",
                      to: "/peminjamanselesaiadminpengelolasemuadata",
                      activePaths: ["/peminjamanselesaitidaksesuaijadwaladminpengelola"],
                    },
                  ]}
                />
              </>
            )}

            {role === "admin_jurusan" && (
              <>
                <CustomListItem to="/DashboardAdminJurusan" icon={<FiAirplay size={19} />} label="Dashboard" open={open} />
                <CustomListItem to="/Prodi" icon={<FaUniversity size={19} />} label="Prodi" open={open} />
                <CustomListItem to="/tahunajaran" icon={<MdCalendarToday size={19} />} label="Tahun Ajaran" open={open} />
                <CustomListItem to="/kurikulum" icon={<FaGraduationCap size={19} />} label="Kurikulum" open={open} />
                <CustomListItem to="/matakuliah" icon={<FaBook size={19} />} label="Matakuliah" open={open} />
                <CustomListItem to="/kelasmahasiswa" icon={<SiGoogleclassroom size={19} />} label="Kelas Mahasiswa" open={open} />
                <CustomListItem to="/datadosen" icon={<FaUserTie size={19} />} label="Dosen" open={open} />
                <CustomListItem
                  to="/penjadwalanRuanganPerkuliahan"
                  icon={<MdEventNote size={19} />}
                  label="Penjadwalan Ruangan"
                  open={open}
                  activePaths={["/penjadwalanRuangan/detail", "/penjadwalanRuangan/edit", "/tambahjadwalpersemester"]}
                />
              </>
            )}

            {role === "pengelola_gkt" && (
              <>
                <CustomListItem to="/DashboardAdminPengelola" icon={<FiAirplay size={19} />} label="Dashboard" open={open} />
                <CustomListItem to="/PengajuanPeminjamanRuangan" icon={<LuClipboardPen size={19} />} label="Pengajuan Peminjaman" open={open} activePaths={["/pengajuanpeminjamanditerima"]} />
                <CustomListItem to="/PenjadwalanRuanganPengelola" icon={<HiOutlineCalendarDateRange size={21} />} label="Pengajuan Jadwal" open={open} activePaths={["/penjadwalanRuangan/detail"]} />
                <CustomDropdownMenu
                  label="Peminjaman Ruangan"
                  icon={<MdOutlineSwitchAccount size={21} />}
                  open={open}
                  isOpen={isPeminjamanOpen}
                  setIsOpen={setIsPeminjamanOpen}
                  items={[
                    {
                      label: "Ruangan Sedang Digunakan",
                      to: "/sesuaijadwal",
                      activePaths: ["/RuanganTerpinjam"], // path tambahan dianggap aktif
                    },
                    {
                      label: "Pengajuan Pengembalian",
                      to: "/persetujuanpengembaliansesuaijadwal",
                      activePaths: ["/persetujuanpengembaliantidaksesuaijadwal"], // path tambahan
                    },
                    {
                      label: "Peminjaman Selesai",
                      to: "/peminjamanselesaiadminpengelolasemuadata",
                      activePaths: ["/peminjamanselesaitidaksesuaijadwaladminpengelola"],
                    },
                  ]}
                />
              </>
            )}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          marginLeft: isMobile ? 15 : open ? `${drawerWidthOpen + 25}px` : `${drawerWidthClosed + 5}px`,
          transition: "margin-left 0.3s ease",
          px: 2,
          overflow: "hidden", // ⬅️ mencegah card ikut geser saat scroll body
          pt: "160px", // untuk memberi ruang di atas (navbar)
          minHeight: "calc(100vh - 125px)",
          backgroundColor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start", // posisikan card di atas
        }}
      >
        <Card
          sx={{
            width: {
              xs: "80%", // handphone
              sm: "88%", // tablet
              md: open ? "960px" : "1170px", // tergantung sidebar
            },
            ml: {
              xs: -8, // lebih dekat ke kiri
              sm: -1,
              md: "auto", // tengah untuk tablet ke atas
            },

            height: "460px", // ⬅️ panjang tetap (fixed height)
            maxWidth: "95vw",
            minWidth: "320px",
            p: 2,
            boxShadow: 3,
            borderRadius: 1,
            backgroundColor: "#fff",
            overflowY: "auto",
            overflowX: "hidden", // opsional
            scrollbarWidth: "thin", // Firefox
            "&::-webkit-scrollbar": {
              width: "6px", // Chrome
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#bbb",
              borderRadius: "3px",
            },
          }}
        >
          {children && typeof children === "function" ? children(open) : children}
        </Card>
      </Box>
    </>
  );
};

export default Sidebar;
