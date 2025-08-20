<?php

use Illuminate\Http\Request;
use App\Models\PenjadwalanRuangan;
use App\Http\Controllers\sController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DosenController;
use App\Http\Controllers\KelasController;
use App\Http\Controllers\ProdiController;
use App\Http\Controllers\JurusanController;
use App\Models\peminjamanselesaisesuaijdwal;
use App\Http\Controllers\KurikulumController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\JeniskelasController;
use App\Http\Controllers\MataKuliahController;
use App\Http\Controllers\ModelkelasController;
use App\Http\Controllers\NamaGedungController;
use App\Http\Controllers\RuanganGKTController;
use App\Http\Controllers\SaranakelasController;
use App\Http\Controllers\TahunAjaranController;
use App\Http\Controllers\SmesterGenapController;
use App\Http\Controllers\DetailRuanganController;
use App\Http\Controllers\ResetPasswordcontroller;
use App\Http\Controllers\SmesterGanjilController;
use App\Http\Controllers\UserMahasiswaController;
use App\Http\Controllers\UserPengelolaController;
use App\Http\Controllers\TahunAjaranGenapController;
use App\Http\Controllers\UserAdminJurusanController;
use App\Http\Controllers\PengajuanKegiatanController;
use App\Http\Controllers\ProdiSmesterGenapController;
use App\Http\Controllers\TahunAjaranGanjilController;
use App\Http\Controllers\DashboardMahasiswaController;
use App\Http\Controllers\DashboardPengelolaController;
use App\Http\Controllers\PenjadwalanRuanganController;
use App\Http\Controllers\ProdiSmesterGanjilController;
use App\Http\Controllers\DashboardAdminJurusanController;
use App\Http\Controllers\PenjadwalanRuanganGenapController;
use App\Http\Controllers\PenjadwalanRuanganGanjilController;
use App\Http\Controllers\PengajuanPeminjamanRuanganController;
use App\Http\Controllers\PeminjamanselesaisesuaijdwalController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    $user = $request->user();

    $relations = [];

    if ($user->role === 'mahasiswa') {
        $relations = ['kelas', 'jurusan', 'prodi'];
    } elseif ($user->role === 'admin_jurusan') {
        // misalnya adminjurusan hanya perlu relasi ke jurusan (kalau ada)
        $relations = []; // atau kosong jika tidak ada relasi sama sekali
    }

    return $user->load($relations);
});

// Login Register
Route::post('login', [LoginController::class, 'login']);
Route::post('/register', [LoginController::class, 'register']);
Route::middleware('auth:sanctum')->put('/user/update', [LoginController::class, 'update']);

// Pengelola GKT
Route::get('userpengelola/{id}', [UserPengelolaController::class, 'show']);
Route::put('userpengelola/{id}', [UserPengelolaController::class, 'updatePengelola']);
Route::post('userpengelola', [UserPengelolaController::class, 'store']);
Route::delete('userpengelola/{id}', [UserPengelolaController::class, 'destroy']);
Route::get('/userpengelola', [UserPengelolaController::class, 'index']);

// Mahasiswa
Route::get('users/{id}', [UserMahasiswaController::class, 'show']);
Route::put('users/{id}', [UserMahasiswaController::class, 'update']);
Route::post('users', [UserMahasiswaController::class, 'store']);
Route::get('/users', [UserMahasiswaController::class, 'index']);
Route::delete('users/{id}', [UserMahasiswaController::class, 'destroy']);
Route::get('mahasiswa/{id}', [UserMahasiswaController::class, 'show']);


// Admin Jurusan
Route::get('useradminjurusan/{id}', [UserAdminJurusanController::class, 'show']);
Route::put('useradminjurusan/{id}', [UserAdminJurusanController::class, 'update']);
Route::post('useradminjurusan', [UserAdminJurusanController::class, 'store']);
Route::delete('useradminjurusan/{id}', [UserPengelolaController::class, 'destroy']);
Route::get('/useradminjurusan', [UserAdminJurusanController::class, 'index']);


// Data Ruangan 
Route::get('ruangan/{roomId}/detail-peminjaman', [RuanganGKTController::class, 'getDetailWithPeminjaman']);
Route::put('/ruangan', [RuanganGKTController::class, 'update']);
Route::get('/ruangans', [PenjadwalanRuanganController::class, 'tampilsemuaruangan']);
Route::delete('/ruangan/{id}', [RuanganGKTController::class, 'destroy']);
Route::get('gedungs/{gedungId}/ruangan/{ruanganId}', [RuanganGKTController::class, 'getRuanganByGedung']);
Route::put('perbaruiruangan/{id}', [RuanganGKTController::class, 'updateRuangan']);
Route::put('/gedungs/{id}', [NamaGedungController::class, 'update']);
Route::delete('/gedungs/{id}', [NamaGedungController::class, 'destroy']);
Route::get('/gedungs', [NamaGedungController::class, 'index']);
Route::post('/gedungs', [NamaGedungController::class, 'store']);
Route::get('/ruangan/{gedungId}', [RuanganGKTController::class, 'index']);
Route::post('/ruangan', [RuanganGKTController::class, 'store']);
Route::get('/gedungs/{gedungId}', [NamaGedungController::class, 'show']);
Route::get('/api/ruangan/{gedungId}', [DetailRuanganController::class, 'index']);
Route::get('ruangan/{gedungId}/detail/{roomId}', [DetailRuanganController::class, 'show']);
Route::put('ruangan/{id}', [RuanganGKTController::class, 'updateStatusDiperbaiki']);

// pengajuan peminjaman ruangan
Route::get('/peminjaman', [PengajuanPeminjamanRuanganController::class, 'index']);
Route::post('/peminjaman/{id}/terima', [PengajuanPeminjamanRuanganController::class, 'terima']);
Route::post('/peminjaman/{id}/tolak', [PengajuanPeminjamanRuanganController::class, 'tolak']);
Route::post('/peminjaman', [PengajuanPeminjamanRuanganController::class, 'store']);

// data dosen
Route::middleware('auth:sanctum')->put('/dosen/{id}', [DosenController::class, 'update']);
Route::middleware('auth:sanctum')->post('/dosen', [DosenController::class, 'store']);
Route::get('/dosen', [DosenController::class, 'index']);
Route::get('dosen/{id}', [DosenController::class, 'show']);
Route::delete('/dosen/{id}', [DosenController::class, 'destroy']);

//matakuliah
Route::middleware('auth:sanctum')->put('/matakuliah/{id}', [MataKuliahController::class, 'update']);
Route::middleware('auth:sanctum')->post('/matakuliah/store', [MataKuliahController::class, 'store']);
Route::put('/matakuliah/update-tahunajaran/{id}', [MatakuliahController::class, 'updateTahunAjaran']);
Route::get('/matakuliah', [MataKuliahController::class, 'index']);
Route::get('/matakuliah/{id}', [MataKuliahController::class, 'show']);
Route::delete('/matakuliah/{id}', [MatakuliahController::class, 'destroy']);
Route::get('/tahunajaranganjil', [MatakuliahController::class, 'indexGanjil']);
Route::get('/tahunajarangenap', [MatakuliahController::class, 'indexGenap']);
Route::get('/matakuliah/{kode}', [MatakuliahController::class, 'showByKode']);


//kurikulum
Route::middleware('auth:sanctum')->put('/kurikulum/{id}', [KurikulumController::class, 'update']);
Route::middleware('auth:sanctum')->post('/kurikulum/store', [KurikulumController::class, 'store']);
Route::put('/kurikulum/{id}/toggle-status', [KurikulumController::class, 'toggleStatus']);
Route::get('/kurikulum', [KurikulumController::class, 'index']);
Route::get('/kurikulum/{id}', [KurikulumController::class, 'show']);
Route::delete('/kurikulum/{id}', [KurikulumController::class, 'destroy']);

//pengajuan peminjaman mahasiswa
// Route::middleware('auth:sanctum')->post('/pengajuan-peminjaman', [PengajuanPeminjamanRuanganController::class, 'store']);
Route::middleware('auth:sanctum')->get('/peminjamansaya', [PengajuanPeminjamanRuanganController::class, 'userPengajuan']);
Route::middleware('auth:sanctum')->get('/peminjamansemua', [PengajuanPeminjamanRuanganController::class, 'semuaPengajuan']);
Route::get('/pengajuanpeminjamanruangan/{id}', [PengajuanPeminjamanRuanganController::class, 'show']);
Route::post('/pengembalian/{id}', [PengajuanPeminjamanRuanganController::class, 'kembalikan']);

//prodi
Route::get('/prodi', [ProdiController::class, 'index']);
Route::middleware('auth:sanctum')->post('/prodi', [ProdiController::class, 'store']);
Route::middleware('auth:sanctum')->put('/prodi/{id}', [ProdiController::class, 'update']);

Route::get('/prodi/by-jurusan/{id_jurusan}', [ProdiController::class, 'getByJurusan']);
Route::get('/prodi/{id}', [ProdiController::class, 'show']);
Route::delete('/prodi/{id}', [ProdiController::class, 'destroy']);

// tahun ajaran
Route::put('/tahunajaran/{id}/toggle-status', [TahunAjaranController::class, 'toggleStatus']);
Route::middleware('auth:sanctum')->post('/tahunajaran', [TahunAjaranController::class, 'store']);
Route::get('/tahunajaran', [TahunAjaranController::class, 'index']);
Route::get('/tahunajaran/{id}', [TahunAjaranController::class, 'show']);
Route::put('/tahunajaran/{id}', [TahunAjaranController::class, 'update']);
Route::delete('/tahunajaran/{id}', [TahunAjaranController::class, 'destroy']);

//penjadwalanruananadminjurusan
Route::post('/cek-bentrok-jadwal-form', [PenjadwalanRuanganController::class, 'cekBentrokJadwalForm']);
Route::delete('penjadwalanruangandelete/{id}', [PenjadwalanRuanganController::class, 'destroy']);
Route::post('//ruangan-terpakai', [PenjadwalanRuanganController::class, 'getRuanganDipakai']);
Route::post('/pengembaliansesuaijadwal/{id}', [PenjadwalanRuanganController::class, 'kembalikansesuaijadwal']);
Route::put('/pengembaliansesuaijadwal/tolakvideo/{id}', [PenjadwalanRuanganController::class, 'tolakVideoPengembalian'])->middleware('auth:sanctum');
Route::post('/peminjamanselesaisesuaijdwals', [PeminjamanselesaisesuaijdwalController::class, 'PengembalianDiterima']);
Route::put('/penjadwalanruanganganmahasiswabagianadminpengelola/{id}', [PenjadwalanRuanganController::class, 'updateStatus']);
Route::post('/peminjamanselesaiadminpengelolaalldata', [PeminjamanselesaisesuaijdwalController::class, 'index']);
Route::get('/peminjamanselesaimahasiswahistory', [PeminjamanselesaisesuaijdwalController::class, 'index']);

Route::get('/penjadwalanruanganmahasiswa/{id}', [PenjadwalanRuanganController::class, 'show']);
Route::get('/penjadwalanruanganganmahasiswa', [PenjadwalanRuanganController::class, 'indexMahasiswa']);
Route::get('/penjadwalanruanganadminpengelola', [PenjadwalanRuanganController::class, 'index']);
Route::put('/penjadwalanruanganadminpengelola/updateruangan/{id}', [PenjadwalanRuanganController::class, 'updateRuangan']);
Route::get('/penjadwalanruanganget', [PenjadwalanRuanganController::class, 'indexpenjadwalanruangan']);
Route::get('/penjadwalanruangangenap', [PenjadwalanRuanganController::class, 'indexGenap']);
Route::post('/penjadwalanruangan', [PenjadwalanRuanganController::class, 'storeGanjil']);

Route::post('/penjadwalanruangan', [PenjadwalanRuanganController::class, 'storePenjadwalanRuangan']);
Route::get('/penjadwalanruangan/{id}', [PenjadwalanRuanganController::class, 'show']);
Route::middleware('auth:sanctum')->post('/penjadwalan/kirim', [PenjadwalanRuanganController::class, 'kirimKeMahasiswa']);
Route::delete('penjadwalanruangan/{id}', [PenjadwalanRuanganController::class, 'destroy']);
Route::put('penjadwalanruangan/{id}', [PenjadwalanRuanganController::class, 'updatePenjadwalanRuangan']);
Route::get('/peminjamanselesaidetailadminpengelola/{id}', [PeminjamanselesaisesuaijdwalController::class, 'show']);

//kelas
Route::delete('/kelas/{id}', [KelasController::class, 'destroy']);
Route::middleware('auth:sanctum')->put('/kelasmahasiswa/edit/{id}', [KelasController::class, 'update']);
Route::middleware('auth:sanctum')->post('/kelasmahasiswa/tambah', [KelasController::class, 'store']);
Route::get('/kelasmahasiswa', [KelasController::class, 'index']);
Route::get('/kelasmahasiswa/{id}', [KelasController::class, 'show']);
Route::get('/penjadwalanruangangetdetail/{id}', [PenjadwalanRuanganController::class, 'show']);
Route::get('/penjadwalanruangangetdetailhistory/{id}', [PeminjamanselesaisesuaijdwalController::class, 'show']);



//jenis kelas
Route::get('/jeniskelas', [JeniskelasController::class, 'index']);
Route::delete('/jeniskelas/{id}', [JeniskelasController::class, 'destroy']);
Route::post('/jeniskelas', [JeniskelasController::class, 'store']);
Route::put('/jeniskelas/{id}', [JenisKelasController::class, 'update']);

//model kelas
Route::get('/modelkelas', [ModelkelasController::class, 'index']);
Route::delete('/modelkelas/{id}', [ModelkelasController::class, 'destroy']);
Route::post('/modelkelas', [ModelkelasController::class, 'store']);
Route::put('/modelkelas/{id}', [ModelkelasController::class, 'update']);

//sarana kelas
Route::get('/saranakelas', [SaranakelasController::class, 'index']);
Route::delete('/saranakelas/{id}', [SaranakelasController::class, 'destroy']);
Route::post('/saranakelas', [SaranakelasController::class, 'store']);
Route::put('/saranakelas/{id}', [SaranakelasController::class, 'update']);


// perbaiki
Route::post('/penjadwalanruanganadminpengelola/ruangan-terpakai', [PenjadwalanRuanganController::class, 'getRuanganDipakai']);
Route::put('/tolakvideoadminpengelola/{id}', [PengajuanPeminjamanRuanganController::class, 'tolakVideoPengembalianTidakSesuaiJadwal'])->middleware('auth:sanctum');
Route::put('/terimavideoadminpengelola/{id}', [PengajuanPeminjamanRuanganController::class, 'terimaVideoPengembalianTidakSesuaiJadwal'])->middleware('auth:sanctum');
Route::get('/tahunajaran', [TahunAjaranController::class, 'index']);
Route::get('/jurusan', [JurusanController::class, 'index']);
Route::put('/user/{id}', [UserMahasiswaController::class, 'update']);
Route::get('/ruanganterpinjampengelolagkt', [PenjadwalanRuanganController::class, 'semuadatatampil']);
Route::get('/detailruanganadmin', [PenjadwalanRuanganController::class, 'datadetailruanganadmin']);
Route::post('/ruangan/{id}/update-gambar', [RuanganGKTController::class, 'updateGambar']);
Route::get('/prodi/byjurusan/{jurusanId}', [PenjadwalanRuanganController::class, 'getProdiByJurusan']);
Route::get('/gedungjumlahldanr', [NamaGedungController::class, 'jmllantaidanruangan']);

//pengajuan peminjaman mahasiswa
Route::post('/dialihkan/{id}', [DashboardMahasiswaController::class, 'dialihkan'])->middleware('auth:sanctum');
Route::middleware('auth:sanctum')->post('/tandai-kelas-kosong/{id}', [DashboardMahasiswaController::class, 'tandaiKelasKosong']);
Route::middleware('auth:sanctum')->post('/pengajuan-peminjaman', [PengajuanPeminjamanRuanganController::class, 'PengajuanPeminjamanMahasiwa']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/getFilteredDosen', [PengajuanPeminjamanRuanganController::class, 'getFilteredDosen']);
    Route::get('/getFilteredMatakuliah', [PengajuanPeminjamanRuanganController::class, 'getFilteredMatakuliah']);
});
Route::middleware('auth:sanctum')->get('/jadwal/mahasiswa', [PenjadwalanRuanganController::class, 'jadwalMahasiswa']);
Route::middleware('auth:sanctum')->get('/pengajuan-pending', [PengajuanPeminjamanRuanganController::class, 'StatusPeminjamanMahasiswaPending']);
Route::middleware('auth:sanctum')->get('/pengajuan-diterima', [PengajuanPeminjamanRuanganController::class, 'StatusPeminjamanMahasiswaDiterima']);

Route::middleware('auth:sanctum')->get('/peminjaman-berlangsung', [PengajuanPeminjamanRuanganController::class, 'sedangBerlangsung']);
Route::middleware('auth:sanctum')->group(function () {

    // Endpoint untuk mengambil jadwal yang sedang berlangsung
    Route::get('/peminjaman-berlangsung', [PengajuanPeminjamanRuanganController::class, 'sedangBerlangsung']);

    // Endpoint untuk pengembalian dari pengajuan (non-jadwal tetap)
    Route::post('/kembalikan/{id}', [PengajuanPeminjamanRuanganController::class, 'kembalikan']);

    // Endpoint untuk pengembalian dari penjadwalan (jadwal tetap)
    Route::post('/kembalikansesuaijadwal/{id}', [PenjadwalanRuanganController::class, 'kembalikansesuaijadwal']);
});
Route::middleware('auth:sanctum')->post('/pinjam-jadwal/{id}', [PenjadwalanRuanganController::class, 'pinjamJadwal']);
Route::middleware('auth:sanctum')->get('/jadwal-kelas-mahasiswa', [PenjadwalanRuanganController::class, 'jadwalKelasMahasiswa']);
Route::get('/falidasicekstatusruangan', [PenjadwalanRuanganController::class, 'getJadwalByRuanganAndHari']);
Route::get('/ruangan/{id}/jadwal-harian', [PenjadwalanRuanganController::class, 'jadwalHarian']);
Route::middleware('auth:sanctum')->group(function () {
    Route::delete('/pengajuan-pinjamsaya/{id}', [PengajuanPeminjamanRuanganController::class, 'batalPinjam']);
    Route::delete('/pengajuan-pending/{id}', [PengajuanPeminjamanRuanganController::class, 'batal']);
    Route::post('/pengajuan-pinjamsaya/{id}', [PengajuanPeminjamanRuanganController::class, 'mulaiPinjam']);
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/peminjaman-ruangan/{id}', [PengajuanPeminjamanRuanganController::class, 'getBorrowersToday']);
    Route::get('/peminjaman-disetujui/{id}', [PengajuanPeminjamanRuanganController::class, 'getAcceptedBorrowersToday']);
});
Route::get('/peminjaman/pending-kecuali-hariini/{ruangan_id}', [PengajuanPeminjamanRuanganController::class, 'getOtherPendingBorrowers']);
Route::get('/peminjaman/diterima-kecuali-hariini/{ruangan_id}', [PengajuanPeminjamanRuanganController::class, 'getOtherAcceptedBorrowers']);
Route::get('/pengajuan-peminjamans', [PengajuanPeminjamanRuanganController::class, 'notifadmingktpeminjaman']);
Route::patch('/pengajuan-peminjamans/{id}/batalkan', [PengajuanPeminjamanRuanganController::class, 'batalkanpengelola']);
Route::patch('/pengajuan-peminjamans/auto-batal', [PengajuanPeminjamanRuanganController::class, 'batalkanOtomatis']);
Route::post('/user/{id}/update-password', [ResetPasswordController::class, 'updatePassword']);

//dashboard admin pengelola
Route::get('/penjadwalan/kelas-belum-jadwal', [DashboardPengelolaController::class, 'countKelasBelumJadwal']);
Route::get('/ruangandashboardpengelola', [DashboardPengelolaController::class, 'countRuanganKosong']);
Route::get('/user/aktif', [DashboardPengelolaController::class, 'countUserAktif']);
Route::get('/ruanganstatistik', [DashboardPengelolaController::class, 'statistik']);
Route::get('/ruanganpersentase', [DashboardPengelolaController::class, 'persentase']);
Route::get('/pengajuanpengembalianpending', [DashboardPengelolaController::class, 'DashboardpendingPengelola']);

//dashboard admin jurusan
Route::middleware('auth:sanctum')->get('/jumlahprodiadminjurusan', [DashboardAdminJurusanController::class, 'countByAdminJurusan']);
Route::middleware('auth:sanctum')->get('/jumlahmatakuliahadminjurusan', [DashboardAdminJurusanController::class, 'countAktif']);
Route::middleware('auth:sanctum')->get('/jumlahkelasadminjurusan', [DashboardAdminJurusanController::class, 'countkelasByAdminJurusan']);
Route::middleware('auth:sanctum')->get('/jumlahdosenadminjurusan', [DashboardAdminJurusanController::class, 'countdosenByAdminJurusan']);
Route::middleware('auth:sanctum')->get('/peminjamanpendingadminjurusan', [DashboardAdminJurusanController::class, 'dataPendingPeminjaman']);
Route::middleware('auth:sanctum')->post('/ajukan-tukar/{id}', [DashboardMahasiswaController::class, 'ajukanTukar']);
Route::post('/terima-tukar/{id}', [DashboardMahasiswaController::class, 'terimaTukar']);

//pengajuan kegiatan
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/pengajuan-kegiatan', [PengajuanKegiatanController::class, 'store']);
    Route::get('/pengajuan-kegiatan', [PengajuanKegiatanController::class, 'index']);
    Route::get('/pengajuankegiatanhistorymahasiswa', [PengajuanKegiatanController::class, 'indexmahasiswahistory']);
    Route::patch('/pengajuan-kegiatan/{id}/status', [PengajuanKegiatanController::class, 'updateStatus']);
});
Route::post('/peminjamankegiatan/{id}/terima', [PengajuanKegiatanController::class, 'terimakegiatan']);
Route::post('/peminjamankegiatan/{id}/tolak', [PengajuanKegiatanController::class, 'tolakkegiatan']);
Route::patch('/pengajuan-kegiatan/{id}/batalkan', [PengajuanKegiatanController::class, 'batalkankegiatanpengelola']);
Route::patch('/pengajuan-kegiatan/auto-batal', [PengajuanKegiatanController::class, 'batalkankegiatanOtomatis']);
Route::put('/tolakvideokegiatanpengelola/{id}', [PengajuanKegiatanController::class, 'tolakvidiokegiatanpengembalian'])->middleware('auth:sanctum');
Route::put('/terimavideokegiatanpengelola/{id}', [PengajuanKegiatanController::class, 'terimavidiokegiatanpengembalian'])->middleware('auth:sanctum');
Route::get('/pengajuan-kegiatan/{id}', [PengajuanKegiatanController::class, 'show']);
Route::middleware('auth:sanctum')->delete('/pengajuankegiatan/{id}', [PengajuanKegiatanController::class, 'batalPengajuankegiatan']);
Route::post('pinjamjadwalkegiatan/{id}', [PengajuanKegiatanController::class, 'pinjamJadwalKegiatan']);
Route::post('/kembalikanruangankegiatan/{id}', [PengajuanKegiatanController::class, 'kembalikanruangankegiatan']);
