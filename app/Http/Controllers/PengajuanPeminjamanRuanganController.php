<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Dosen;
use App\Models\Prodi;
use App\Models\Jurusan;
use App\Models\Matakuliah;
use App\Models\RuanganGKT;
use Illuminate\Http\Request;
use App\Models\PenjadwalanRuangan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\PengajuanPeminjamanRuangan;

class PengajuanPeminjamanRuanganController extends Controller
{
public function StatusPeminjamanMahasiswaDiterima()
{
    $mahasiswaId = auth()->user()->id;

        $data = PengajuanPeminjamanRuangan::with([
                'mahasiswa',
                'matakuliah',
                'ruangan',
                'mahasiswa.jurusan',
                'mahasiswa.prodi',
                'mahasiswa.kelas',
                'dosen',
                'dosen.prodi',
            ])
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('status', 'diterima')
            ->where('statuspeminjaman', 'pending')
            ->where('statusuploadvidio', 'pending')
            ->get();

        return response()->json($data);
}
    public function StatusPeminjamanMahasiswaPending()
{
    // Ambil mahasiswa_id dari user yang login
    $mahasiswaId = auth()->user()->id;  // Asumsi user yang login adalah mahasiswa dan idnya sesuai mahasiswa_id

    $data = PengajuanPeminjamanRuangan::with([
        'mahasiswa',
        'matakuliah',
        'ruangan',
        'mahasiswa.jurusan',
        'mahasiswa.prodi',
        'mahasiswa.kelas',
        'dosen',
        'dosen.prodi',
    ])
    ->where('mahasiswa_id', $mahasiswaId)
    ->where('status', 'pending')
        ->where('statuspeminjaman', 'pending')
    ->where('statusuploadvidio', 'pending')
    ->get();

    return response()->json($data);
}

    public function index()
    {
    $data = PengajuanPeminjamanRuangan::with('mahasiswa','matakuliah','ruangan','mahasiswa.jurusan','mahasiswa.prodi','mahasiswa.kelas','dosen','dosen.prodi')
        ->get();  // Mengambil data dengan filter yang sudah ditentukan

    return response()->json($data);
    }
    
public function mulaiPinjam($id)
{
    $user = auth()->user();

    // Validasi user login dan role mahasiswa
    if (!$user || $user->role !== 'mahasiswa') {
        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    // Ambil data pengajuan
    $peminjaman = PengajuanPeminjamanRuangan::find($id);
    if (!$peminjaman) {
        return response()->json(['message' => 'Pengajuan tidak ditemukan.'], 404);
    }

    // Pastikan pengajuan ini milik mahasiswa yang login
    if ($peminjaman->mahasiswa_id !== $user->id) {
        return response()->json(['message' => 'Pengajuan ini bukan milik Anda.'], 403);
    }

    // Pastikan status pengajuan sudah diterima dan belum dipinjam
    if ($peminjaman->status !== 'diterima' || $peminjaman->statuspeminjaman !== 'pending') {
        return response()->json(['message' => 'Pengajuan belum siap dipinjam atau sudah dipinjam.'], 400);
    }

    // Validasi hari dan waktu peminjaman
    $hariSekarang = strtolower(now()->locale('id')->isoFormat('dddd'));
    $hariJadwal = strtolower($peminjaman->hari); // Pastikan field `hari` ada di database

    if ($hariSekarang !== $hariJadwal) {
        return response()->json(['message' => 'Hari ini bukan jadwal peminjaman ruangan Anda.'], 400);
    }

    try {
        $jamMulai = Carbon::createFromFormat('H:i:s', $peminjaman->jammulai);
    } catch (\Exception $e) {
        $jamMulai = Carbon::createFromFormat('H:i', $peminjaman->jammulai);
    }

    $waktuBolehPinjam = $jamMulai->copy()->subMinutes(5);
    // Cek status ruangan
    $ruangan = RuanganGKT::find($peminjaman->ruangan_id);
    if ($ruangan && in_array($ruangan->statusruangan, ['dipinjam', 'diperbaiki'])) {
        return response()->json([
            'message' => 'Ruangan sedang ' . $ruangan->statusruangan . ', tidak bisa dipinjam.'
        ], 400);
    }

    // Update status peminjaman
    $peminjaman->statuspeminjaman = 'dipinjam';
    $peminjaman->save();

    // Update status ruangan
    if ($ruangan) {
        $ruangan->statusruangan = 'dipinjam';
        $ruangan->save();
    }

    return response()->json(['message' => 'Peminjaman dimulai. Selamat menggunakan ruangan!']);
}

public function tolak($id)
{
    $peminjaman = PengajuanPeminjamanRuangan::findOrFail($id);
    $peminjaman->delete();

    return response()->json(['message' => 'Pengajuan berhasil dihapus karena ditolak.']);
}
public function store(Request $request) //Mahasiswa mengajukan peminjaman.
{
    $validated = $request->validate([
        'tanggal' => 'required|date',
        'hari' => 'required|string|max:10',
        'jammulai' => 'required|date_format:H:i',
        'jamselesai' => 'required|date_format:H:i',
        'kodematakuliah' => 'required|string|exists:matakuliahs,kodematakuliah',
        'ruangan_id' => 'required|exists:ruangan_g_k_t_s,id',
        'keperluan' => 'required|string',
    ]);

    $pengajuan = PengajuanPeminjamanRuangan::create([
        'mahasiswa_id' => auth()->id(),
        'ruangan_id' => $validated['ruangan_id'],
        'kodematakuliah' => $validated['kodematakuliah'],
        'hari' => $validated['hari'],
        'tanggal' => $validated['tanggal'],
        'jammulai' => $validated['jammulai'],
        'jamselesai' => $validated['jamselesai'],
        'keperluan' => $validated['keperluan'],
    ]);

    return response()->json(['message' => 'Pengajuan berhasil disimpan.'], 201);
}
    public function kembalikan(Request $request, $id)
{
    $request->validate([
        'link_drive' => 'required|url|max:255',
    ]);

    $pengajuan = PengajuanPeminjamanRuangan::findOrFail($id);
    $pengajuan->statusuploadvidio = $request->link_drive;
    $pengajuan->statuspeminjaman = 'prosespengembalian';
    $pengajuan->status = 'prosespengembalian';
    $pengajuan->save();

    return response()->json(['message' => 'Pengembalian berhasil diproses.']);
}
public function userPengajuan() //Mengambil semua pengajuan peminjaman dari user yang login (mahasiswa tertentu).
{
    $userId = Auth::id();

    $data = PengajuanPeminjamanRuangan::with('mahasiswa','matakuliah','ruangan','mahasiswa.jurusan','mahasiswa.prodi','mahasiswa.kelas','dosen','dosen.prodi')
    ->where('mahasiswa_id', $userId)
    ->get();

    return response()->json($data);
}
public function semuaPengajuan()
{
    $pengajuan = PengajuanPeminjamanRuangan::with('mahasiswa','matakuliah','ruangan','mahasiswa.jurusan','mahasiswa.prodi','mahasiswa.kelas','dosen','dosen.prodi')->get();

    return response()->json($pengajuan);
}
    public function tolakVideoPengembalianTidakSesuaiJadwal($id) //Jika video pengembalian tidak sesuai jadwal, maka statusnya dikembalikan k
    {
    $jadwal = PengajuanPeminjamanRuangan::find($id);

    if (!$jadwal) {
        return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
    }

    // Update status sesuai permintaan
    $jadwal->status = 'diterima';
    $jadwal->statuspeminjaman = 'dipinjam';
    $jadwal->statusuploadvidio = 'pending';
    $jadwal->save();

    return response()->json([
        'message' => 'Video pengembalian berhasil ditolak dan status diperbarui.',
        'jadwal' => $jadwal,
    ]);
    }
public function terimaVideoPengembalianTidakSesuaiJadwal($id)
{
    $jadwal = PengajuanPeminjamanRuangan::find($id);

    if (!$jadwal) {
        return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
    }

    // Update status peminjaman
    $jadwal->statuspeminjaman = 'selesai';
    $jadwal->status = 'selesai';
    $jadwal->save();

    // Update status ruangan menjadi 'kosong'
    $ruangan = RuanganGKT::find($jadwal->ruangan_id);
    if ($ruangan) {
        $ruangan->statusruangan = 'kosong';
        $ruangan->save();
    }

    return response()->json([
        'message' => 'Video pengembalian berhasil diterima dan status diperbarui.',
        'jadwal' => $jadwal,
    ]);
}
        public function show($id) //Menampilkan detail pengajuan berdasarkan ID
{
    $jadwal = PengajuanPeminjamanRuangan::with([
        'mahasiswa','matakuliah','matakuliah.tahunajaran','matakuliah.kurikulum','ruangan','mahasiswa.jurusan','mahasiswa.prodi','mahasiswa.kelas','dosen','dosen.prodi'])->find($id);

    if (!$jadwal) {
        return response()->json(['message' => 'Data tidak ditemukan'], 404);
    }

return response()->json([
    'data' => $jadwal
]);
}

public function PengajuanPeminjamanMahasiwa(Request $request)
{
    // Validasi input
    $validator = Validator::make($request->all(), [
        'ruangan_id'       => 'required|exists:ruangan_g_k_t_s,id',
        'dosen_id'         => 'required|exists:dosens,id',
        'kodematakuliah'   => 'required|exists:matakuliahs,kodematakuliah',
        'hari'             => 'required|string|max:15',
        'tanggal'          => 'required|date',
        'jammulai'         => 'required',
        'jamselesai'       => 'required|after:jammulai',
        'keperluan'        => 'required|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validasi gagal',
            'errors'  => $validator->errors()
        ], 422);
    }

    // Cek status ruangan
    $ruangan = RuanganGKT::find($request->ruangan_id);
    if ($ruangan && in_array($ruangan->statusruangan, ['dipinjam', 'diperbaiki'])) {
        return response()->json([
            'message' => 'Ruangan sedang ' . $ruangan->statusruangan . ', tidak dapat dipinjam.'
        ], 400);
    }

    $jammulai = Carbon::parse($request->jammulai)->format('H:i:s');
    $jamselesai = Carbon::parse($request->jamselesai)->format('H:i:s');

    // ✅ Cek bentrok dengan Jadwal Tetap
    $jadwalBentrok = PenjadwalanRuangan::where('ruangan_id', $request->ruangan_id)
        ->where('hari', $request->hari)
        ->where('statusjadwal', 'aktif')
        ->where(function ($query) use ($jammulai, $jamselesai) {
            $query->where('jammulai', '<', $jamselesai)
                ->where('jamselesai', '>', $jammulai);
        })
        ->exists();

    if ($jadwalBentrok) {
        return response()->json([
            'message' => 'Hari dan jam yang anda ajukan bentrok dengan jadwal kuliah tetap dengan kelas lain, mohon pilih ruangan lain untuk dipinjam.'
        ], 400);
    }

    // ✅ Cek bentrok dengan Pengajuan Peminjaman (flexibel)
    $pengajuanBentrok = PengajuanPeminjamanRuangan::where('ruangan_id', $request->ruangan_id)
        ->where('tanggal', $request->tanggal)
        ->whereIn('status', ['pending', 'diterima'])
        ->where(function ($query) use ($jammulai, $jamselesai) {
            $query->where('jammulai', '<', $jamselesai)
                ->where('jamselesai', '>', $jammulai);
        })
        ->exists();

    if ($pengajuanBentrok) {
        return response()->json([
            'message' => 'Tanggal/Hari dan jam yang anda ajukan sudah ada yang mengajukan terlebih dahulu silahkan pilih ruangan lain untuk menghindari bentrok ruangan.'
        ], 400);
    }

    // Simpan pengajuan
    $pengajuan = PengajuanPeminjamanRuangan::create([
        'mahasiswa_id'       => Auth::id(),
        'ruangan_id'         => $request->ruangan_id,
        'dosen_id'           => $request->dosen_id,
        'kodematakuliah'     => $request->kodematakuliah,
        'hari'               => $request->hari,
        'tanggal'            => $request->tanggal,
        'jammulai'           => $jammulai,
        'jamselesai'         => $jamselesai,
        'keperluan'          => $request->keperluan,
        'status'             => 'pending',
        'statuspeminjaman'   => 'pending',
        'statusuploadvidio'  => 'pending',
    ]);

    return response()->json([
        'message'  => 'Pengajuan berhasil dikirim',
        'pengajuan' => $pengajuan
    ], 201);
}
public function getByJurusan(Request $request)
{
    $user = auth()->user();

    if (!$user || $user->role !== 'mahasiswa') {
        return response()->json(['message' => 'Akses ditolak. Hanya mahasiswa.'], 403);
    }

    // Ambil jurusan berdasarkan jurusanmahasiswa_id (asumsikan ini adalah ID jurusan)
    $jurusan = Jurusan::find($user->jurusanmahasiswa_id);

    if (!$jurusan) {
        return response()->json(['message' => 'Jurusan tidak ditemukan.'], 404);
    }

    // Query matakuliah dengan adminjurusan yang punya kodejurusan & jurusan sama dengan jurusan mahasiswa
    $matakuliahs = Matakuliah::whereHas('adminjurusan', function ($query) use ($jurusan) {
        $query->where('kodejurusan', $jurusan->kodejurusan)
              ->where('jurusan', $jurusan->namajurusan);
    })->with(['adminjurusan', 'tahun_ajaran', 'kurikulum', 'prodi'])->get();

    return response()->json($matakuliahs);
}
// Di Controller
public function getFilteredDosen(Request $request)
{
    $mahasiswa = auth()->user(); // diasumsikan sudah login
    $jurusan = Jurusan::find($mahasiswa->jurusanmahasiswa_id);

    $kodejurusan = $jurusan->kodejurusan;
    $namajurusan = $jurusan->namajurusan;

    // Ambil dosen di jurusan yang sama
    $dosens = Dosen::with(['adminjurusan'])
        ->whereHas('adminjurusan', function ($query) use ($kodejurusan, $namajurusan) {
            $query->where('kodejurusan', $kodejurusan)
                  ->where('jurusan', $namajurusan);
        })
        ->get();

    return response()->json($dosens);
}
public function getFilteredMatakuliah(Request $request)
{
    $mahasiswa = auth()->user();
    $jurusan = Jurusan::find($mahasiswa->jurusanmahasiswa_id);

    $kodejurusan = $jurusan->kodejurusan;
    $namajurusan = $jurusan->namajurusan;

    $matakuliah = Matakuliah::with(['adminjurusan','tahunajaran'])
        ->whereHas('adminjurusan', function ($query) use ($kodejurusan, $namajurusan) {
            $query->where('kodejurusan', $kodejurusan)
                  ->where('jurusan', $namajurusan);
        })
        ->get();

    return response()->json($matakuliah);
}

public function sedangBerlangsung(Request $request)
{
    $mahasiswaId = auth()->user()->id;

    // Data dari jadwal kuliah (penjadwalan_ruangans)
    $penjadwalan = DB::table('penjadwalan_ruangans')
        ->join('matakuliahs', 'penjadwalan_ruangans.kodematakuliah', '=', 'matakuliahs.kodematakuliah')
        ->join('dosens', 'penjadwalan_ruangans.dosen_id', '=', 'dosens.id')
        ->join('ruangan_g_k_t_s', 'penjadwalan_ruangans.ruangan_id', '=', 'ruangan_g_k_t_s.id')
        ->select(
            'penjadwalan_ruangans.id',
            'penjadwalan_ruangans.mahasiswa_id',
            'matakuliahs.namamatakuliah as mata_kuliah',
            'dosens.nama as dosen',
            'ruangan_g_k_t_s.name as nama_ruangan',
            'penjadwalan_ruangans.hari',
            'penjadwalan_ruangans.jammulai as jam_mulai',
            'penjadwalan_ruangans.jamselesai as jam_selesai',
            'penjadwalan_ruangans.statuspeminjaman',
        )
        ->where('penjadwalan_ruangans.mahasiswa_id', $mahasiswaId)
        ->whereIn('penjadwalan_ruangans.statuspeminjaman', ['dipinjam', 'prosespengembalian'])
        ->get();

    // Data dari peminjaman non-kuliah (pengajuan_peminjaman_ruangans)
    $peminjaman = DB::table('pengajuan_peminjaman_ruangans')
        ->join('matakuliahs', 'pengajuan_peminjaman_ruangans.kodematakuliah', '=', 'matakuliahs.kodematakuliah')
        ->join('dosens', 'pengajuan_peminjaman_ruangans.dosen_id', '=', 'dosens.id')
        ->join('ruangan_g_k_t_s', 'pengajuan_peminjaman_ruangans.ruangan_id', '=', 'ruangan_g_k_t_s.id')
        ->select(
            'pengajuan_peminjaman_ruangans.id',
            'pengajuan_peminjaman_ruangans.mahasiswa_id',
            'matakuliahs.namamatakuliah as mata_kuliah',
            'dosens.nama as dosen',
            'ruangan_g_k_t_s.name as nama_ruangan',
            'pengajuan_peminjaman_ruangans.hari',
            'pengajuan_peminjaman_ruangans.jammulai as jam_mulai',
            'pengajuan_peminjaman_ruangans.jamselesai as jam_selesai',
            'pengajuan_peminjaman_ruangans.statuspeminjaman',
        )
        ->where('pengajuan_peminjaman_ruangans.mahasiswa_id', $mahasiswaId)
        ->whereIn('pengajuan_peminjaman_ruangans.statuspeminjaman', ['dipinjam', 'prosespengembalian'])
        ->get();

    // Supaya hasil gabungan konsisten, kita perlu menyesuaikan struktur data
// Sesuaikan $penjadwalan
$penjadwalan = $penjadwalan->map(function($item) {
    return (object) [
        'id' => $item->id,
        'mahasiswa_id' => $item->mahasiswa_id,
        'mata_kuliah' => $item->mata_kuliah,
        'dosen' => $item->dosen,
        'nama_ruangan' => $item->nama_ruangan,
        'hari' => $item->hari,
        'statuspeminjaman' => $item->statuspeminjaman,
        'jam_mulai' => $item->jam_mulai,
        'jam_selesai' => $item->jam_selesai,
        'source' => 'penjadwalan', // ⬅️ tambahkan ini
    ];
});

$peminjaman = $peminjaman->map(function($item) {
    return (object) [
        'id' => $item->id,
        'mahasiswa_id' => $item->mahasiswa_id,
        'mata_kuliah' => $item->mata_kuliah,
        'dosen' => $item->dosen,
        'nama_ruangan' => $item->nama_ruangan,
        'hari' => $item->hari,
        'statuspeminjaman' => $item->statuspeminjaman,
        'jam_mulai' => $item->jam_mulai,
        'jam_selesai' => $item->jam_selesai,
        'source' => 'pengajuan', // ⬅️ tambahkan ini
    ];
});
    // Untuk penjadwalan, tambahkan field tanggal null agar seragam
    $jadwal = $penjadwalan->merge($peminjaman);

    return $jadwal->isEmpty()
        ? response()->json(null)
        : response()->json($jadwal);
    }
public function batal($id)
{
    $user = auth()->user();

    // Pastikan user terautentikasi dan adalah mahasiswa
    if (!$user || $user->role !== 'mahasiswa') {
        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    // Ambil pengajuan
    $pengajuan = PengajuanPeminjamanRuangan::find($id);

    if (!$pengajuan) {
        return response()->json(['message' => 'Pengajuan tidak ditemukan.'], 404);
    }

    // Cek apakah pengajuan ini milik mahasiswa yang login
    if ($pengajuan->mahasiswa_id !== $user->id) {
        return response()->json(['message' => 'Pengajuan ini bukan milik Anda.'], 403);
    }

    // Pastikan pengajuan masih berstatus pending
    if (
        $pengajuan->status !== 'pending' ||
        $pengajuan->statuspeminjaman !== 'pending' ||
        $pengajuan->statusuploadvidio !== 'pending'
    ) {
        return response()->json(['message' => 'Pengajuan sudah diproses dan tidak dapat dibatalkan.'], 400);
    }

    // Hapus pengajuan
    $pengajuan->delete();

    return response()->json(['message' => 'Pengajuan berhasil dibatalkan.']);
}
public function batalPinjam($id)
{
    $user = auth()->user();

    // Pastikan user terautentikasi dan adalah mahasiswa
    if (!$user || $user->role !== 'mahasiswa') {
        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    // Ambil pengajuan
    $pengajuan = PengajuanPeminjamanRuangan::find($id);

    if (!$pengajuan) {
        return response()->json(['message' => 'Peminjam tidak ditemukan.'], 404);
    }

    // Cek apakah pengajuan ini milik mahasiswa yang login
    if ($pengajuan->mahasiswa_id !== $user->id) {
        return response()->json(['message' => 'Peminjam ini bukan milik Anda.'], 403);
    }

    // Pastikan pengajuan masih berstatus pending
    if (
        $pengajuan->status !== 'diterima' ||
        $pengajuan->statuspeminjaman !== 'pending' ||
        $pengajuan->statusuploadvidio !== 'pending'
    ) {
        return response()->json(['message' => 'Peminjam sudah diproses dan tidak dapat dibatalkan.'], 400);
    }

    // Hapus pengajuan
    $pengajuan->delete();

    return response()->json(['message' => 'Peminjam berhasil dibatalkan.']);
}
    public function getBorrowersToday($ruangan_id)
    {
        $today = now()->format('Y-m-d');
        $data = PengajuanPeminjamanRuangan::with(['mahasiswa', 'dosen'])
            ->where('ruangan_id', $ruangan_id)
            ->where('tanggal', $today)
            ->where('status', 'pending')
            ->get();

        return response()->json($data);
    }

    // Ambil data peminjaman status diterima untuk hari ini
    public function getAcceptedBorrowersToday($ruangan_id)
    {
        $today = now()->format('Y-m-d');
        $data = PengajuanPeminjamanRuangan::with(['mahasiswa', 'dosen'])
            ->where('ruangan_id', $ruangan_id)
            ->where('tanggal', $today)
            ->where('status', 'diterima')
            ->get();

        return response()->json($data);
    }
public function getOtherPendingBorrowers($ruangan_id)
{
    $today = now()->format('Y-m-d');
    $data = PengajuanPeminjamanRuangan::with(['mahasiswa', 'dosen'])
        ->where('ruangan_id', $ruangan_id)
        ->where('tanggal', '!=', $today)
        ->where('status', 'pending')
        ->get();

    return response()->json($data);
}

public function getOtherAcceptedBorrowers($ruangan_id)
{
    $today = now()->format('Y-m-d');
    $data = PengajuanPeminjamanRuangan::with(['mahasiswa', 'dosen'])
        ->where('ruangan_id', $ruangan_id)
        ->where('tanggal', '!=', $today)
        ->where('status', 'diterima')
        ->get();

    return response()->json($data);
}

    public function terima($id) // Menyetujui pengajuan tanpa mengubah status ruangan.
{
    $peminjaman = PengajuanPeminjamanRuangan::findOrFail($id);
    $peminjaman->status = 'diterima';
    $peminjaman->save();

    return response()->json(['message' => 'Pengajuan peminjaman berhasil diterima.']);
}

    public function notifadmingktpeminjaman(Request $request)
    {
        // Ambil semua pengajuan yang statusnya 'diterima'
    $data = PengajuanPeminjamanRuangan::with('mahasiswa','matakuliah','ruangan','mahasiswa.jurusan','mahasiswa.prodi','mahasiswa.kelas','dosen','dosen.prodi')
            ->get();

        return response()->json($data);
    }
public function batalkanpengelola($id)
{
    $pengajuan = PengajuanPeminjamanRuangan::findOrFail($id);

    $pengajuan->update([
        'status' => 'dibatalkanpengelola',
        'statuspeminjaman' => 'dibatalkanpengelola',
        'statusuploadvidio' => 'dibatalkanpengelola',
    ]);

    return response()->json([
        'message' => 'Pengajuan berhasil dibatalkan.',
        'data' => $pengajuan,
    ], 200);
}
public function batalkanOtomatis()
{
    $now = now();

    $pengajuan = PengajuanPeminjamanRuangan::where('status', 'diterima')
        ->where('statuspeminjaman', 'pending')
        ->where('statusuploadvidio', 'pending')
        ->whereRaw("STR_TO_DATE(CONCAT(tanggal, ' ', jamselesai), '%Y-%m-%d %H:%i:%s') < ?", [$now])
        ->get();

    foreach ($pengajuan as $item) {
        $item->status = 'dibatalkanpengelola';
        $item->statuspeminjaman = 'dibatalkanpengelola';
        $item->statusuploadvidio = 'dibatalkanpengelola';
        $item->save();
    }

    return response()->json(['message' => 'Pengajuan expired berhasil dibatalkan', 'data' => $pengajuan]);
}

}