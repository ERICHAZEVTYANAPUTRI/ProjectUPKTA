import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import idLocale from "date-fns/locale/id";
import { useEffect } from "react";
import {
    Route,
    BrowserRouter as Router,
    Routes,
    useNavigate,
} from "react-router-dom";
import DashboardAdminJurusan from "./Auth/AdminJurusan/Dashboard/DashboardAminJurusan";
import DataDosen from "./Auth/AdminJurusan/DataDosen/DataDosen";
import KelasMahasiswa from "./Auth/AdminJurusan/KelasMahasiswa/KelasMahasiswa";
import DataKurikulum from "./Auth/AdminJurusan/Kurikulum/TabelKurikulum";
import DataMatakuliah from "./Auth/AdminJurusan/Matakuliah/TabelMataKuliah";
import PenjadwalanRuanganPerkuliahan from "./Auth/AdminJurusan/PenjadwalanRuanganAdminJurusan/JadwalGanjil/DataPenjadwalanRuangan";
import DetailPenjadwalanRuanganPerkuliahanHistory from "./Auth/AdminJurusan/PenjadwalanRuanganAdminJurusan/JadwalGanjil/Detailhistorypeminjamanjadwal";
import DetailPenjadwalanRuanganPerkuliahan from "./Auth/AdminJurusan/PenjadwalanRuanganAdminJurusan/JadwalGanjil/DetailPenjadwalanRuangan";
import EditPenjadwalanRuanganPerkuliahan from "./Auth/AdminJurusan/PenjadwalanRuanganAdminJurusan/JadwalGanjil/EditpenjadwalanRuangan";
import TambahPenjadwalanRuanganPerkuliahan from "./Auth/AdminJurusan/PenjadwalanRuanganAdminJurusan/JadwalGanjil/TambahPenjadwalanRuangan";
import TabelProdi from "./Auth/AdminJurusan/Prodi/TabelProdi";
import DataTahunAjaran from "./Auth/AdminJurusan/TahunAjaran/TabelTahunAjaran";
import DashboardAdminPengelolaGKT from "./Auth/AdminPengelolaGKT/Dashboard/DahboardAdminPengelola";
import TabelAdminJurusan from "./Auth/AdminPengelolaGKT/DataAdminJurusan/TabelAdminJurusan";
import TabelMahasiswa from "./Auth/AdminPengelolaGKT/DataMahasiswa/TabelMahasiswa";
import DetailPengajuanPeminjamanRuangan from "./Auth/AdminPengelolaGKT/DataPengajuanPeminjamanRuangan/DetailPengajuanPeminjaman";
import PengajuanPeminjamanRuangan from "./Auth/AdminPengelolaGKT/DataPengajuanPeminjamanRuangan/PengajuanPeminjamanRuangan";
import PengajuanPeminjamanRuanganDiterima from "./Auth/AdminPengelolaGKT/DataPengajuanPeminjamanRuangan/PengajuanPeminjamanRuanganDiterima";
import RuanganTerpinjam from "./Auth/AdminPengelolaGKT/DataPengajuanPeminjamanRuangan/RuanganTerpinjam/RuanganTerpinjam";
import RuanganTerpinjamSesuaiJadwal from "./Auth/AdminPengelolaGKT/DataPengajuanPeminjamanRuangan/RuanganTerpinjam/RuanganTerpinjamSesuaiJadwal";
import HalamanAdminPengelolaPengembalianSesuaiJadwal from "./Auth/AdminPengelolaGKT/DataPengajuanPengembalianBagianAdminPengelola/PengajuanPengembalianAdminPengelolaSesuaiJadwal";
import HalamanAdminPengelolaPengembalianTidakSesuaiJadwal from "./Auth/AdminPengelolaGKT/DataPengajuanPengembalianBagianAdminPengelola/PengajuanPengembalianAdminPengelolaTidakSesuaiJadwal";
import HalamanAdminSemuaPengembalian from "./Auth/AdminPengelolaGKT/DataPengajuanPengembalianBagianAdminPengelola/PengembalianPeminjamanUtama";
import TabelPengelolaGKT from "./Auth/AdminPengelolaGKT/DataPengelolaGKT/TabelPengelolaGKT";
import HalamanAdminPengelolaPeminjamanSelesaiSesuaiJadwal from "./Auth/AdminPengelolaGKT/DataPengembalianPeminjamanAdminPengelola/PeminjamanSelesaiSesuaiJadwalBagianAdminJPengelola";
import PeminjamanSelesaiTidakSesuaiJadwalAdminPengelola from "./Auth/AdminPengelolaGKT/DataPengembalianPeminjamanAdminPengelola/PeminjamanSelesaiTidakSesuaiJadwalBagianAdminPengelola";
import PenjadwalanRuanganAdminPengelola from "./Auth/AdminPengelolaGKT/DataPenjadwalanRuanganMahasiswa/PenjadwalanRuanganHalamanAdminPengelola";
import Gedung from "./Auth/AdminPengelolaGKT/DataRuangan/DataGedung/Gedung";
import DetailRuangan from "./Auth/AdminPengelolaGKT/DataRuangan/Ruangan/Detailruangan";
import Ruangan from "./Auth/AdminPengelolaGKT/DataRuangan/Ruangan/Ruangan";
import Jeniskelas from "./Auth/AdminPengelolaGKT/JenisKelas/JenisKelas";
import ModelKelas from "./Auth/AdminPengelolaGKT/ModelKelas/ModelKelas";
import SaranaKelas from "./Auth/AdminPengelolaGKT/SaranaKelas/SaranaKelas";
import DetailPeminjamanDiluarPerkuliahan from "./Auth/AdminPengelolaGKT/TabelpengajuanRuanganDiluarKuliah/DetailKegiatan";
import HistoryPeminjamanKegiatan from "./Auth/AdminPengelolaGKT/TabelpengajuanRuanganDiluarKuliah/HistoryPeminjamanKegiatan";
import PeminjamanKegiatanBerlangsung from "./Auth/AdminPengelolaGKT/TabelpengajuanRuanganDiluarKuliah/PeminjamanKegiatanBerlangsung";
import TabelPengajuanKegiatan from "./Auth/AdminPengelolaGKT/TabelpengajuanRuanganDiluarKuliah/PengajuanDiluarPerkuliahan";
import TabelPengajuanKegiatanDiterima from "./Auth/AdminPengelolaGKT/TabelpengajuanRuanganDiluarKuliah/PengajuanDiluarPerkuliahanDiterima";
import DashboardMahasiswa from "./Auth/Mahasiswa/Dashboard/DashboardMHS";
import JadwalMahasiswa from "./Auth/Mahasiswa/JadwalMahasiswa/JadwalMahasiswa";
import MahasiswaGedung from "./Auth/Mahasiswa/MahasiswaGedung/MahasiswaGedung";
import MahasiswaRuangan from "./Auth/Mahasiswa/MahasiswaGedung/MahasiswaRuangan/MahasiswaRuangan";
import PeminjamanSelesaiDiluarPerkuliahan from "./Auth/Mahasiswa/PeminjamanMahasiswaSelesai/PeminjamanSelesaiDiluarPerkuliahan";
import PeminjamanSelesaiMahasiswaSesuaiJadwal from "./Auth/Mahasiswa/PeminjamanMahasiswaSelesai/PeminjamanSelesaiSesuaiJadwal";
import HalamanMahasiswaPengembalianSelesaiTidakSesuaiJadwal from "./Auth/Mahasiswa/PeminjamanMahasiswaSelesai/PeminjamanSelesaiTidakSesuaiJadwal";
import HalamanMahasiswaSesuaiJadwal from "./Auth/Mahasiswa/PeminjamanMahasiswaSesuaiTidakSesuaiJadwal/PeminjamanMahasiswaSesuaiJadwal";
import RuanganTerpinjamHalamanMahasiswa from "./Auth/Mahasiswa/PeminjamanMahasiswaSesuaiTidakSesuaiJadwal/PeminjamanMahasiswaTidakSesuaiJadwal";
import PengajuanPeminjamanMahasiswaForm from "./Auth/Mahasiswa/PengajuanPeminjaman/PengajuanPeminjamanMahasiswa";
import HalamanMahasiswaPengembalianSesuaiJadwal from "./Auth/Mahasiswa/ProsesPengembalianMahasiswa/PengembalianSesuaiJadwalMahasiswa";
import HalamanMahasiswaPengembalianTidakSesuaiJadwal from "./Auth/Mahasiswa/ProsesPengembalianMahasiswa/PengembalianTidakSesuaiJadwalMahasiswa";
import DashboardPengelolaGKT from "./Auth/PengelolaGKT/Dashboard/Dashboard";
import Profile from "./Auth/ProfileUser/ProfileUser";
import Beranda from "./Beranda/Beranda";
import SopPeminjaman from "./Beranda/SOPpeminjaman";
import SopPengembalian from "./Beranda/SOPpengembalian";
import Sidebar from "./Components/Sidebar/Sidebar";
import SidebarOpen from "./Components/Sidebar/SidebarOpen";
import LoginForm from "./Login/Login";
import RegisterForm from "./Login/Register";

function App() {
    const NavigateToBeranda = () => {
        const navigate = useNavigate();
        useEffect(() => {
            navigate("/Beranda");
        }, [navigate]);

        return null;
    };
    return (
        <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={idLocale}
        >
            <Router>
                <Routes>
                    <Route path="/" element={<NavigateToBeranda />} />
                    <Route path="/Login" element={<LoginForm />} />
                    <Route path="/Registrasi" element={<RegisterForm />} />
                    <Route path="/Beranda" element={<Beranda />} />
                    <Route path="/SOPPeminjaman" element={<SopPeminjaman />} />
                    <Route
                        path="/SOPPengembalian"
                        element={<SopPengembalian />}
                    />
                    <Route
                        path="/PengajuanPeminjamanMahasiswa"
                        element={
                            <Sidebar>
                                <PengajuanPeminjamanMahasiswaForm />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/ProfileUser"
                        element={
                            <Sidebar>
                                {(open) => <Profile open={open} />}
                            </Sidebar>
                        }
                    />
                    {/* Data Pengelola */}
                    <Route
                        path="/TabelPengelelolaGKT"
                        element={
                            <Sidebar>
                                <TabelPengelolaGKT />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/DashboardAdminPengelola"
                        element={
                            <Sidebar>
                                {(open) => (
                                    <DashboardAdminPengelolaGKT open={open} />
                                )}
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/DashboardPengelola"
                        element={
                            <Sidebar>
                                {(open) => (
                                    <DashboardPengelolaGKT open={open} />
                                )}
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/DashboardAdminJurusan"
                        element={
                            <Sidebar>
                                {(open) => (
                                    <DashboardAdminJurusan open={open} />
                                )}
                            </Sidebar>
                        }
                    />
                    {/* Data Mahasiswa */}
                    <Route
                        path="/DashboardMahasiswa"
                        element={
                            <Sidebar>
                                {(open) => <DashboardMahasiswa open={open} />}
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/TabelMahasiswa"
                        element={
                            <Sidebar>
                                <TabelMahasiswa />
                            </Sidebar>
                        }
                    />
                    {/*  Data Admin Jurusan */}
                    <Route
                        path="/TabelAdminJurusan"
                        element={
                            <Sidebar>
                                <TabelAdminJurusan />
                            </Sidebar>
                        }
                    />
                    {/*  Data gedung dan ruangan */}
                    <Route
                        path="/MahasiswaGedung"
                        element={
                            <Sidebar>
                                <MahasiswaGedung />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/ruanganmahasiswa/lihat/:gedungId"
                        element={
                            <Sidebar>
                                <MahasiswaRuangan />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/DataGedung"
                        element={
                            <Sidebar>
                                <Gedung />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/ruangan/:gedungId"
                        element={
                            <Sidebar>
                                <Ruangan />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/ruangan/:gedungId/detail/:roomId"
                        element={
                            <Sidebar>
                                <DetailRuangan />
                            </Sidebar>
                        }
                    />
                    {/*  Data Penjadwalan Ruangan */}
                    <Route
                        path="/PenjadwalanRuanganPengelola"
                        element={
                            <Sidebar>
                                <PenjadwalanRuanganAdminPengelola />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/DiterimaPinjamDiluarPerkuliahan"
                        element={
                            <Sidebar>
                                <TabelPengajuanKegiatanDiterima />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/PengajuanPinjamDiluarPerkuliahan"
                        element={
                            <Sidebar>
                                <TabelPengajuanKegiatan />
                            </Sidebar>
                        }
                    />
                    {/* Data Pengajuan Peminjaman Ruangan */}
                    <Route
                        path="/peminjamandiluarperkuliahan/detail/:id"
                        element={
                            <Sidebar>
                                {(open) => (
                                    <DetailPeminjamanDiluarPerkuliahan
                                        open={open}
                                    />
                                )}
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/pengajuanpeminjamanruangan/detail/:id"
                        element={
                            <Sidebar>
                                {(open) => (
                                    <DetailPengajuanPeminjamanRuangan
                                        open={open}
                                    />
                                )}
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/PengajuanPeminjamanRuangan"
                        element={
                            <Sidebar>
                                <PengajuanPeminjamanRuangan />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/HalamanPengembalianPengelola"
                        element={
                            <Sidebar>
                                <HalamanAdminSemuaPengembalian />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/RuanganTerpinjam"
                        element={
                            <Sidebar>
                                <RuanganTerpinjam />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/HalamanMahasiswaPengembalianTidakSesuaiJadwal"
                        element={
                            <HalamanMahasiswaPengembalianTidakSesuaiJadwal />
                        }
                    />
                    {/* Data Pengajuan pengembalian Ruangan */}
                    <Route
                        path="/peminjamanselesaisesuaijadwalbaianmahasiswa"
                        element={
                            <Sidebar>
                                <PeminjamanSelesaiMahasiswaSesuaiJadwal />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/peminjamanselesaitidaksesuaijadwaladminpengelola"
                        element={
                            <Sidebar>
                                <PeminjamanSelesaiTidakSesuaiJadwalAdminPengelola />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/persetujuanpengembaliantidaksesuaijadwal"
                        element={
                            <Sidebar>
                                <HalamanAdminPengelolaPengembalianTidakSesuaiJadwal />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/peminjamankegiatanberlangsung"
                        element={
                            <Sidebar>
                                <PeminjamanKegiatanBerlangsung />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/historypeminjamankegiatan"
                        element={
                            <Sidebar>
                                <HistoryPeminjamanKegiatan />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/peminjamanselesaidiluarperkuliahan"
                        element={
                            <Sidebar>
                                <PeminjamanSelesaiDiluarPerkuliahan />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/JenisKelas"
                        element={
                            <Sidebar>
                                <Jeniskelas />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/Modelkelas"
                        element={
                            <Sidebar>
                                <ModelKelas />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/Saranakelas"
                        element={
                            <Sidebar>
                                <SaranaKelas />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/pengembalianselesaimahasiswa"
                        element={
                            <Sidebar>
                                <HalamanMahasiswaPengembalianSelesaiTidakSesuaiJadwal />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/persetujuanpengembaliansesuaijadwal"
                        element={
                            <Sidebar>
                                <HalamanAdminPengelolaPengembalianSesuaiJadwal />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/peminjamanselesaiadminpengelolasemuadata"
                        element={
                            <Sidebar>
                                <HalamanAdminPengelolaPeminjamanSelesaiSesuaiJadwal />
                            </Sidebar>
                        }
                    />
                    {/* Data Dosen */}
                    <Route
                        path="/datadosen"
                        element={
                            <Sidebar>
                                <DataDosen />
                            </Sidebar>
                        }
                    />
                    {/* penjadwalan admin jurusan */}
                    <Route
                        path="/mahasiswa/jadwal"
                        element={
                            <Sidebar>
                                <JadwalMahasiswa />
                            </Sidebar>
                        }
                    />
                    {/* data matakuliah */}
                    <Route
                        path="/matakuliah"
                        element={
                            <Sidebar>
                                <DataMatakuliah />
                            </Sidebar>
                        }
                    />
                    {/* data kurikulum */}
                    <Route
                        path="/kurikulum"
                        element={
                            <Sidebar>
                                <DataKurikulum />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/sesuaijadwal"
                        element={
                            <Sidebar>
                                <RuanganTerpinjamSesuaiJadwal />
                            </Sidebar>
                        }
                    />
                    {/* data sesuai jadwal mahasiswa */}
                    <Route
                        path="/pengajuanpeminjamanditerima"
                        element={
                            <Sidebar>
                                <PengajuanPeminjamanRuanganDiterima />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/HalamanMahasiswaSesuaiJadwal"
                        element={<HalamanMahasiswaSesuaiJadwal />}
                    />
                    <Route
                        path="/HalamanMahasiswaPengembalianSesuaiJadwal"
                        element={<HalamanMahasiswaPengembalianSesuaiJadwal />}
                    />
                    <Route
                        path="/HalamanMahasiswaPeminjamanRuangan"
                        element={<RuanganTerpinjamHalamanMahasiswa />}
                    />
                    {/* data Prodi */}
                    <Route
                        path="/Prodi"
                        element={
                            <Sidebar>
                                <TabelProdi />
                            </Sidebar>
                        }
                    />
                    {/* data tahun ajaran */}
                    <Route
                        path="/tahunajaran"
                        element={
                            <Sidebar>
                                <DataTahunAjaran />
                            </Sidebar>
                        }
                    />
                    {/* data penjadwalan terbaru */}
                    <Route
                        path="/penjadwalanRuanganPerkuliahan"
                        element={
                            <Sidebar>
                                <PenjadwalanRuanganPerkuliahan />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/tambahjadwalpersemester"
                        element={
                            <Sidebar>
                                <TambahPenjadwalanRuanganPerkuliahan />
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/DashboardMahasiswa"
                        element={
                            <Sidebar>
                                {(open) => <DashboardMahasiswa open={open} />}
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/penjadwalanRuangan/detail/:id"
                        element={
                            <Sidebar>
                                {(open) => (
                                    <DetailPenjadwalanRuanganPerkuliahan
                                        open={open}
                                    />
                                )}
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/penjadwalanRuanganHistory/detail/:id"
                        element={
                            <Sidebar>
                                {(open) => (
                                    <DetailPenjadwalanRuanganPerkuliahanHistory
                                        open={open}
                                    />
                                )}
                            </Sidebar>
                        }
                    />
                    <Route
                        path="/penjadwalanRuangan/edit/:id"
                        element={
                            <Sidebar>
                                <EditPenjadwalanRuanganPerkuliahan />
                            </Sidebar>
                        }
                    />
                    <Route path="/Beranda" element={<SidebarOpen />} />{" "}
                    <Route
                        path="/kelasmahasiswa"
                        element={
                            <Sidebar>
                                <KelasMahasiswa />
                            </Sidebar>
                        }
                    />
                </Routes>
            </Router>
        </LocalizationProvider>
    );
}

export default App;
