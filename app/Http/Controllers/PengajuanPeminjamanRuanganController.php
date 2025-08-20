<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Dosen;
use App\Models\Prodi;
use App\Models\Jurusan;
use App\Models\Matakuliah;
use App\Models\RuanganGKT;
use Illuminate\Http\Request;
use App\Models\PengajuanKegiatan;
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
            ->where('status', 'pending')
            ->where('statuspeminjaman', 'pending')
            ->where('statusuploadvidio', 'pending')
            ->get();

        return response()->json($data);
    }

    public function index()
    {
        $data = PengajuanPeminjamanRuangan::with('mahasiswa', 'matakuliah', 'ruangan', 'mahasiswa.jurusan', 'mahasiswa.prodi', 'mahasiswa.kelas', 'dosen', 'dosen.prodi')
            ->get();
        return response()->json($data);
    }

    public function mulaiPinjam($id)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'mahasiswa') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $peminjaman = PengajuanPeminjamanRuangan::find($id);
        if (!$peminjaman) {
            return response()->json(['message' => 'Pengajuan tidak ditemukan.'], 404);
        }

        if ($peminjaman->mahasiswa_id !== $user->id) {
            return response()->json(['message' => 'Pengajuan ini bukan milik Anda.'], 403);
        }

        if ($peminjaman->status !== 'diterima' || $peminjaman->statuspeminjaman !== 'pending') {
            return response()->json(['message' => 'Pengajuan belum siap dipinjam atau sudah dipinjam.'], 400);
        }

        $now = now();

        $hariSekarang = strtolower($now->locale('id')->isoFormat('dddd'));
        $hariJadwal = strtolower($peminjaman->hari);
        if ($hariSekarang !== $hariJadwal) {
            return response()->json(['message' => 'Hari ini bukan jadwal peminjaman ruangan Anda.'], 400);
        }

        $tanggalSekarang = $now->toDateString();
        if ($tanggalSekarang !== $peminjaman->tanggal) {
            return response()->json(['message' => 'Hari ini bukan tanggal peminjaman ruangan Anda.'], 400);
        }

        try {
            $jamMulai = Carbon::createFromFormat('H:i:s', $peminjaman->jammulai);
        } catch (\Exception $e) {
            $jamMulai = Carbon::createFromFormat('H:i', $peminjaman->jammulai);
        }

        try {
            $jamSelesai = Carbon::createFromFormat('H:i:s', $peminjaman->jamselesai);
        } catch (\Exception $e) {
            $jamSelesai = Carbon::createFromFormat('H:i', $peminjaman->jamselesai);
        }

        $startTime = Carbon::parse($peminjaman->tanggal . ' ' . $jamMulai->format('H:i:s'));
        $endTime = Carbon::parse($peminjaman->tanggal . ' ' . $jamSelesai->format('H:i:s'));

        if ($now->lt($startTime) || $now->gt($endTime)) {
            return response()->json([
                'message' => "Peminjaman hanya dapat dilakukan antara pukul {$jamMulai->format('H:i')} dan {$jamSelesai->format('H:i')}."
            ], 400);
        }

        $ruangan = RuanganGKT::find($peminjaman->ruangan_id);
        if ($ruangan && in_array($ruangan->statusruangan, ['dipinjam', 'diperbaiki'])) {
            return response()->json([
                'message' => 'Ruangan sedang ' . $ruangan->statusruangan . ', tidak bisa dipinjam.'
            ], 400);
        }

        $peminjaman->statuspeminjaman = 'dipinjam';
        $peminjaman->save();

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
    public function store(Request $request)
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
    public function userPengajuan()
    {
        $userId = Auth::id();

        $data = PengajuanPeminjamanRuangan::with('mahasiswa', 'matakuliah', 'ruangan', 'mahasiswa.jurusan', 'mahasiswa.prodi', 'mahasiswa.kelas', 'dosen', 'dosen.prodi')
            ->where('mahasiswa_id', $userId)
            ->get();

        return response()->json($data);
    }
    public function semuaPengajuan()
    {
        $pengajuan = PengajuanPeminjamanRuangan::with('mahasiswa', 'matakuliah', 'ruangan', 'mahasiswa.jurusan', 'mahasiswa.prodi', 'mahasiswa.kelas', 'dosen', 'dosen.prodi')->get();

        return response()->json($pengajuan);
    }
    public function tolakVideoPengembalianTidakSesuaiJadwal($id)
    {
        $jadwal = PengajuanPeminjamanRuangan::find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

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

        $jadwal->statuspeminjaman = 'selesai';
        $jadwal->status = 'selesai';
        $jadwal->save();

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
    public function show($id)
    {
        $jadwal = PengajuanPeminjamanRuangan::with([
            'mahasiswa',
            'matakuliah',
            'matakuliah.tahunajaran',
            'matakuliah.kurikulum',
            'ruangan',
            'mahasiswa.jurusan',
            'mahasiswa.prodi',
            'mahasiswa.kelas',
            'dosen',
            'dosen.prodi'
        ])->find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json([
            'data' => $jadwal
        ]);
    }

    public function PengajuanPeminjamanMahasiwa(Request $request)
    {
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

        $ruangan = RuanganGKT::find($request->ruangan_id);
        if ($ruangan && in_array($ruangan->statusruangan, ['dipinjam', 'diperbaiki'])) {
            return response()->json([
                'message' => 'Ruangan sedang ' . $ruangan->statusruangan . ', tidak dapat dipinjam.'
            ], 400);
        }

        $jammulai = Carbon::parse($request->jammulai)->format('H:i:s');
        $jamselesai = Carbon::parse($request->jamselesai)->format('H:i:s');

        $jadwalBentrok = PenjadwalanRuangan::where('ruangan_id', $request->ruangan_id)
            ->where('hari', $request->hari)
            ->whereHas('tahunajaran', function ($query) {
                $query->where('is_aktif', 1);
            })
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
        $pengajuanKegiatanBentrok = PengajuanKegiatan::where('ruangan_id', $request->ruangan_id)
            ->where('tanggal', $request->tanggal)
            ->where(function ($query) use ($jammulai, $jamselesai) {
                $query->where('jammulai', '<', $jamselesai)
                    ->where('jamselesai', '>', $jammulai);
            })
            ->exists();

        if ($pengajuanKegiatanBentrok) {
            return response()->json([
                'message' => 'Tanggal/Hari dan jam yang anda ajukan sudah ada pengajuan kegiatan kemahasiswaan, mohon pilih ruangan lain.'
            ], 400);
        }

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

        $jurusan = Jurusan::find($user->jurusanmahasiswa_id);

        if (!$jurusan) {
            return response()->json(['message' => 'Jurusan tidak ditemukan.'], 404);
        }

        $matakuliahs = Matakuliah::whereHas('adminjurusan', function ($query) use ($jurusan) {
            $query->where('kodejurusan', $jurusan->kodejurusan)
                ->where('jurusan', $jurusan->namajurusan);
        })->with(['adminjurusan', 'tahun_ajaran', 'kurikulum', 'prodi'])->get();

        return response()->json($matakuliahs);
    }
    public function getFilteredDosen(Request $request)
    {
        $mahasiswa = auth()->user();
        $jurusan = Jurusan::find($mahasiswa->jurusanmahasiswa_id);

        $kodejurusan = $jurusan->kodejurusan;
        $namajurusan = $jurusan->namajurusan;

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

        $matakuliah = Matakuliah::with(['adminjurusan', 'tahunajaran'])
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

        $penjadwalan = $penjadwalan->map(function ($item) {
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
                'source' => 'penjadwalan',
            ];
        });

        $peminjaman = $peminjaman->map(function ($item) {
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
                'source' => 'pengajuan',
            ];
        });
        $jadwal = $penjadwalan->merge($peminjaman);

        return $jadwal->isEmpty()
            ? response()->json(null)
            : response()->json($jadwal);
    }
    public function batal($id)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'mahasiswa') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $pengajuan = PengajuanPeminjamanRuangan::find($id);

        if (!$pengajuan) {
            return response()->json(['message' => 'Pengajuan tidak ditemukan.'], 404);
        }

        if ($pengajuan->mahasiswa_id !== $user->id) {
            return response()->json(['message' => 'Pengajuan ini bukan milik Anda.'], 403);
        }

        if (
            $pengajuan->status !== 'pending' ||
            $pengajuan->statuspeminjaman !== 'pending' ||
            $pengajuan->statusuploadvidio !== 'pending'
        ) {
            return response()->json(['message' => 'Pengajuan sudah diproses dan tidak dapat dibatalkan.'], 400);
        }

        $pengajuan->delete();

        return response()->json(['message' => 'Pengajuan berhasil dibatalkan.']);
    }
    public function batalPinjam($id)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'mahasiswa') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $pengajuan = PengajuanPeminjamanRuangan::find($id);

        if (!$pengajuan) {
            return response()->json(['message' => 'Peminjam tidak ditemukan.'], 404);
        }

        if ($pengajuan->mahasiswa_id !== $user->id) {
            return response()->json(['message' => 'Peminjam ini bukan milik Anda.'], 403);
        }

        if (
            $pengajuan->status !== 'diterima' ||
            $pengajuan->statuspeminjaman !== 'pending' ||
            $pengajuan->statusuploadvidio !== 'pending'
        ) {
            return response()->json(['message' => 'Peminjam sudah diproses dan tidak dapat dibatalkan.'], 400);
        }

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
    public function terima($id)
    {
        $peminjaman = PengajuanPeminjamanRuangan::findOrFail($id);

        $tanggal = $peminjaman->tanggal;
        $jamMulai = $peminjaman->jammulai;
        $jamSelesai = $peminjaman->jamselesai;
        $ruanganId = $peminjaman->ruangan_id;
        $hari = $peminjaman->hari;

        $start = Carbon::parse("$tanggal $jamMulai");
        $end = Carbon::parse("$tanggal $jamSelesai");

        $bentrokPeminjaman = PengajuanPeminjamanRuangan::where('id', '!=', $id)
            ->where('ruangan_id', $ruanganId)
            ->where('tanggal', $tanggal)
            ->where('status', 'diterima')
            ->where(function ($query) use ($start, $end) {
                $query->whereTime('jammulai', '<', $end->format('H:i:s'))
                    ->whereTime('jamselesai', '>', $start->format('H:i:s'));
            })
            ->exists();

        if ($bentrokPeminjaman) {
            return response()->json([
                'message' => 'Pengajuan ditolak: Bentrok dengan pengajuan peminjaman yang sudah diterima.'
            ], 409);
        }

        $bentrokJadwalRutin = PenjadwalanRuangan::where('ruangan_id', $ruanganId)
            ->where('hari', $hari)
            ->whereHas('tahunajaran', function ($query) {
                $query->where('is_aktif', 1);
            })
            ->where(function ($query) use ($jamMulai, $jamSelesai) {
                $query->whereTime('jammulai', '<', $jamSelesai)
                    ->whereTime('jamselesai', '>', $jamMulai);
            })
            ->exists();

        if ($bentrokJadwalRutin) {
            return response()->json([
                'message' => 'Pengajuan ditolak: Bentrok dengan jadwal rutin kelas.'
            ], 409);
        }

        $bentrokKegiatan = PengajuanKegiatan::where('ruangan_id', $ruanganId)
            ->where('tanggal', $tanggal)
            ->whereIn('status', ['diterima'])
            ->where(function ($query) use ($jamMulai, $jamSelesai) {
                $query->whereTime('jammulai', '<', $jamSelesai)
                    ->whereTime('jamselesai', '>', $jamMulai);
            })
            ->exists();

        if ($bentrokKegiatan) {
            return response()->json([
                'message' => 'Pengajuan ditolak: Bentrok dengan pengajuan kegiatan yang sudah diterima.'
            ], 409);
        }

        $peminjaman->status = 'diterima';
        $peminjaman->save();

        return response()->json([
            'message' => 'Pengajuan peminjaman berhasil diterima.'
        ]);
    }
    public function notifadmingktpeminjaman(Request $request)
    {
        $data = PengajuanPeminjamanRuangan::with('mahasiswa', 'matakuliah', 'ruangan', 'mahasiswa.jurusan', 'mahasiswa.prodi', 'mahasiswa.kelas', 'dosen', 'dosen.prodi')
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
