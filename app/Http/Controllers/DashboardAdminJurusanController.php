<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Dosen;
use App\Models\kelas;
use App\Models\Prodi;
use App\Models\Matakuliah;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use App\Models\PenjadwalanRuangan;

class DashboardAdminJurusanController extends Controller
{
    public function countByAdminJurusan(Request $request)
    {
        $user = auth()->user();

        $count = Prodi::where('adminjurusan_id', $user->id)->count();

        return response()->json([
            'jumlah_prodi' => $count,
        ]);
    }
    public function countAktif(Request $request)
    {
        $user = auth()->user();

        $tahunAktif = TahunAjaran::where('is_aktif', 1)->first();

        if (!$tahunAktif) {
            return response()->json(['jumlah_matakuliah' => 0]);
        }

        $jumlah = Matakuliah::where('tahunajaran_id', $tahunAktif->id)
            ->where('adminjurusan_id', $user->id)
            ->count();

        return response()->json(['jumlah_matakuliah' => $jumlah]);
    }
    public function countkelasByAdminJurusan(Request $request)
    {
        $user = auth()->user();
        $jumlah = kelas::where('adminjurusan_id', $user->id)->count();

        return response()->json(['jumlah_kelas' => $jumlah]);
    }
    public function countdosenByAdminJurusan(Request $request)
    {
        $user = auth()->user();
        $jumlah = Dosen::where('adminjurusan_id', $user->id)->count();

        return response()->json(['jumlah_dosen' => $jumlah]);
    }
    public function dataPendingPeminjaman()
    {
        $user = auth()->user();
        $tahunAktif = TahunAjaran::where('is_aktif', 1)->first();

        if (!$tahunAktif) {
            return response()->json([], 200);
        }
        $hariIni = Carbon::now()->locale('id')->translatedFormat('l');

        $jamSekarang = Carbon::now()->format('H:i:s');
        $data = PenjadwalanRuangan::with(['ruangan', 'kelas', 'dosen', 'mahasiswa', 'prodi'])
            ->where('statuspeminjaman', 'belumdipinjam')
            ->where('adminjurusan_id', $user->id)
            ->where('tahunajaran_id', $tahunAktif->id)
            ->where('hari', $hariIni)
            ->whereTime('jammulai', '<=', $jamSekarang)
            ->whereTime('jamselesai', '>=', $jamSekarang)
            ->orderBy('jammulai')
            ->get();

        return response()->json($data);
    }
}
