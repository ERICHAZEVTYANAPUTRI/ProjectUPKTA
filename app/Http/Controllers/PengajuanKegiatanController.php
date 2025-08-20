<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\RuanganGKT;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\PengajuanKegiatan;
use App\Models\PenjadwalanRuangan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\PengajuanPeminjamanRuangan;

class PengajuanKegiatanController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mahasiswa_id'   => 'required|exists:users,id',
            'ruangan_id'     => 'required|exists:ruangan_g_k_t_s,id',
            'tanggal'        => 'required|date',
            'jammulai'       => 'required|date_format:H:i',
            'jamselesai'     => 'required|date_format:H:i|after:jammulai',
            'jenis_kegiatan' => 'required|array',
            'jenis_kegiatan.*' => 'string|max:100',
            'keperluan'      => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $ruangan = RuanganGKT::find($request->ruangan_id);
        if ($ruangan && in_array($ruangan->statusruangan, ['dipinjam', 'diperbaiki'])) {
            return response()->json([
                'message' => 'Ruangan sedang ' . $ruangan->statusruangan . ', tidak dapat dipinjam atau digunakan.'
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

        $pengajuanPeminjamanBentrok = PengajuanPeminjamanRuangan::where('ruangan_id', $request->ruangan_id)
            ->where('tanggal', $request->tanggal)
            ->whereIn('status', ['pending', 'diterima'])
            ->where(function ($query) use ($jammulai, $jamselesai) {
                $query->where('jammulai', '<', $jamselesai)
                    ->where('jamselesai', '>', $jammulai);
            })
            ->exists();

        if ($pengajuanPeminjamanBentrok) {
            return response()->json([
                'message' => 'Tanggal/Hari dan jam yang anda ajukan sudah ada yang mengajukan terlebih dahulu silahkan pilih ruangan lain untuk menghindari bentrok ruangan.'
            ], 400);
        }

        $pengajuan = PengajuanKegiatan::create([
            'mahasiswa_id'   => $request->mahasiswa_id,
            'ruangan_id'     => $request->ruangan_id,
            'tanggal'        => $request->tanggal,
            'jammulai'       => $request->jammulai,
            'jamselesai'     => $request->jamselesai,
            'jenis_kegiatan' => json_encode($request->jenis_kegiatan),
            'keperluan'      => $request->keperluan,
            'status'         => 'pending',
        ]);

        return response()->json([
            'message' => 'Pengajuan kegiatan berhasil',
            'data' => $pengajuan
        ], 201);
    }

    public function indexmahasiswahistory()
    {
        $user = auth()->user();

        $data = PengajuanKegiatan::with(['mahasiswa', 'ruangan'])
            ->where('mahasiswa_id', $user->id)
            ->latest()
            ->get();

        return response()->json(['data' => $data]);
    }

    public function index()
    {
        $data = PengajuanKegiatan::with(['mahasiswa', 'ruangan'])->latest()->get();
        return response()->json(['data' => $data]);
    }

    public function show($id)
    {
        $pengajuan = PengajuanKegiatan::with(['mahasiswa', 'ruangan', 'mahasiswa.kelas', 'mahasiswa.jurusan', 'mahasiswa.prodi'])->find($id);
        if (!$pengajuan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }
        return response()->json(['data' => $pengajuan]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,diterima,ditolak',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validasi gagal', 'errors' => $validator->errors()], 422);
        }

        $pengajuan = PengajuanKegiatan::find($id);
        if (!$pengajuan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }
        $pengajuan->status = $request->status;
        $pengajuan->save();

        return response()->json(['message' => 'Status diperbarui', 'data' => $pengajuan]);
    }
    public function tolakkegiatan($id)
    {
        $peminjaman = PengajuanKegiatan::findOrFail($id);
        $peminjaman->delete();

        return response()->json(['message' => 'Pengajuan berhasil dihapus karena ditolak.']);
    }
    public function terimakegiatan($id)
    {
        $peminjaman = PengajuanKegiatan::findOrFail($id);

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
    public function batalkankegiatanpengelola($id)
    {
        $pengajuan = PengajuanKegiatan::findOrFail($id);

        $pengajuan->update([
            'status' => 'dibatalkanpengelola',
            'statusuploadvidio' => 'dibatalkanpengelola',
        ]);

        return response()->json([
            'message' => 'Pengajuan berhasil dibatalkan.',
            'data' => $pengajuan,
        ], 200);
    }
    public function batalkankegiatanOtomatis()
    {
        $now = now();

        $pengajuan = PengajuanKegiatan::where('status', 'diterima')
            ->whereRaw("STR_TO_DATE(CONCAT(tanggal, ' ', jamselesai), '%Y-%m-%d %H:%i:%s') < ?", [$now])
            ->get();

        foreach ($pengajuan as $item) {
            $item->status = 'dibatalkanpengelola';
            $item->statusuploadvidio = 'dibatalkanpengelola';
            $item->save();
        }

        return response()->json(['message' => 'Pengajuan expired berhasil dibatalkan', 'data' => $pengajuan]);
    }
    public function tolakvidiokegiatanpengembalian($id)
    {
        $jadwal = PengajuanKegiatan::find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

        $jadwal->status = 'dipinjam';
        $jadwal->statusuploadvidio = 'pending';
        $jadwal->save();

        return response()->json([
            'message' => 'Video pengembalian berhasil ditolak dan status diperbarui.',
            'jadwal' => $jadwal,
        ]);
    }
    public function terimavidiokegiatanpengembalian($id)
    {
        $jadwal = PengajuanKegiatan::find($id);

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
        }

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
    public function batalPengajuanKegiatan($id)
    {
        $pengajuan = PengajuanKegiatan::find($id);

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Pengajuan tidak ditemukan'
            ], 404);
        }

        try {
            $pengajuan->delete();

            return response()->json([
                'message' => 'Pengajuan berhasil dibatalkan'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membatalkan pengajuan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function pinjamJadwalKegiatan($id)
    {
        $pengajuan = PengajuanKegiatan::with('ruangan')->find($id);

        if (!$pengajuan) {
            return response()->json([
                'message' => 'Data pengajuan tidak ditemukan.',
            ], 404);
        }

        if ($pengajuan->status !== 'diterima') {
            return response()->json([
                'message' => 'Pengajuan belum diterima.',
            ], 403);
        }

        $statusRuangan = $pengajuan->ruangan->statusruangan ?? null;
        if ($statusRuangan === 'dipinjam' || $statusRuangan === 'diperbaiki') {
            return response()->json([
                'message' => 'Ruangan sedang dipinjam atau dalam perbaikan.',
            ], 403);
        }

        $pengajuan->status = 'dipinjam';
        $pengajuan->save();

        $ruangan = $pengajuan->ruangan;
        if ($ruangan) {
            $ruangan->statusruangan = 'dipinjam';
            $ruangan->save();
        }

        return response()->json([
            'message' => 'Jadwal berhasil dipinjam.',
            'data' => $pengajuan,
        ]);
    }

    public function kembalikanruangankegiatan(Request $request, $id)
    {
        $request->validate([
            'link_drive' => 'required|url|max:255',
        ]);

        $pengajuan = PengajuanKegiatan::findOrFail($id);
        $pengajuan->statusuploadvidio = $request->link_drive;
        $pengajuan->status = 'prosespengembalian';
        $pengajuan->save();

        return response()->json(['message' => 'Pengembalian berhasil diproses.']);
    }
}
