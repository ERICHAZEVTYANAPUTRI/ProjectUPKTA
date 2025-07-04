<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\RuanganGKT;
use Illuminate\Http\Request;
use App\Models\PenjadwalanRuangan;
use Illuminate\Support\Facades\DB;
use App\Models\PengajuanPeminjamanRuangan;

class DashboardPengelolaController extends Controller
{
public function countUserAktif()
{
    $count = User::whereIn('role', ['mahasiswa', 'admin_jurusan'])->count();

    return response()->json([
        'count' => $count,
        'message' => "$count user pengguna ditemukan.",
    ]);
}
public function countRuanganKosong()
{
    $totalRuangan = RuanganGKT::count();
    $kosong = RuanganGKT::where('statusruangan', 'kosong')->count();

    return response()->json([
        'total' => $totalRuangan,
        'kosong' => $kosong,
        'message' => "$kosong ruangan kosong dari $totalRuangan ruangan."
    ]);
}
    public function countKelasBelumJadwal()
    {
        // Hitung jumlah baris dengan ruangan_id null
        $count = PenjadwalanRuangan::whereNull('ruangan_id')->count();

        return response()->json([
            'count' => $count,
            'message' => "$count jadwal belum memiliki ruangan."
        ]);
    }

public function statistik()
{
    $startHour = 7;
    $currentHour = Carbon::now()->hour; // Jam sekarang
    $hasil = [];

    $totalRuangan = RuanganGKT::count();

for ($jam = 6; $jam <= 16; $jam++) {
    if ($jam < $startHour) {
        // Dummy data sebelum jam 7
        $hasil[] = [
            'jam' => $jam,
            'dipinjam' => 0,
            'diperbaiki' => 0,
            'kosong' => 0,
        ];
    } elseif ($jam <= $currentHour) {
        // Data real-time sampai jam sekarang
        $start = Carbon::today()->setTime($jam, 0, 0);
        $end = Carbon::today()->setTime($jam + 1, 0, 0);

        $dipinjam = RuanganGKT::where('statusruangan', 'dipinjam')
            ->whereBetween('updated_at', [$start, $end])
            ->count();

        $diperbaiki = RuanganGKT::where('statusruangan', 'diperbaiki')
            ->whereBetween('updated_at', [$start, $end])
            ->count();

        $kosong = max($totalRuangan - $dipinjam - $diperbaiki, 0);

        $hasil[] = [
            'jam' => $jam,
            'dipinjam' => $dipinjam,
            'diperbaiki' => $diperbaiki,
            'kosong' => $kosong,
        ];
    } else {
        // Data masa depan = null → supaya garis putus
        $hasil[] = [
            'jam' => $jam,
            'dipinjam' => null,
            'diperbaiki' => null,
            'kosong' => null,
        ];
    }
}
    return response()->json($hasil);
}
public function persentase()
{
    $data = RuanganGKT::select('statusruangan')
        ->selectRaw('COUNT(*) as jumlah')
        ->groupBy('statusruangan')
        ->get();

    // Normalisasi data untuk frontend (isi 0 jika tidak ada status tertentu)
    $result = [
        'dipinjam' => 0,
        'kosong' => 0,
        'diperbaiki' => 0,
    ];

    foreach ($data as $item) {
        $status = strtolower($item->statusruangan);
        if (isset($result[$status])) {
            $result[$status] = $item->jumlah;
        }
    }

    return response()->json($result);
}

public function DashboardpendingPengelola()
{
    // Ambil dari pengajuan_peminjaman_ruangans
    $pengajuan = DB::table('pengajuan_peminjaman_ruangans')
        ->join('users', 'pengajuan_peminjaman_ruangans.mahasiswa_id', '=', 'users.id')
        ->select(
            'pengajuan_peminjaman_ruangans.id',
            'users.nama_lengkap',
            'users.nim',
            'users.foto',
            'pengajuan_peminjaman_ruangans.keperluan',
            'pengajuan_peminjaman_ruangans.jammulai',
            'pengajuan_peminjaman_ruangans.jamselesai'
        )
        ->where('pengajuan_peminjaman_ruangans.statuspeminjaman', 'pengajuanpengembalian')
        ->get();

    // Ambil dari penjadwalan_ruangans
    $penjadwalan = DB::table('penjadwalan_ruangans')
        ->join('users', 'penjadwalan_ruangans.mahasiswa_id', '=', 'users.id')
        ->select(
            'penjadwalan_ruangans.id',
            'users.nama_lengkap',
            'users.nim',
            'users.foto',
            DB::raw("CONCAT('Kuliah: ', penjadwalan_ruangans.kodematakuliah) as keperluan"),
            'penjadwalan_ruangans.jammulai',
            'penjadwalan_ruangans.jamselesai'
        )
        ->where('penjadwalan_ruangans.statuspeminjaman', 'pengajuanpengembalian')
        ->get();

    // Gabungkan hasil
    $result = $pengajuan->merge($penjadwalan);

    return response()->json([
        'data' => $result
    ]);
}
}