<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\peminjamanselesaisesuaijdwal;

class PeminjamanselesaisesuaijdwalController extends Controller
{
    public function index()
    {
        $peminjamanselesai = peminjamanselesaisesuaijdwal::with([
        'mahasiswa','mahasiswa.jurusan','mahasiswa.prodi', 'matakuliah','matakuliah.tahunajaran','matakuliah.kurikulum','prodi','tahunajaran','adminjurusan','dosen','ruangan','kelas','dosen.prodi'

    ])->orderBy('created_at', 'desc')->get(); // pakai get() kalau tidak perlu pagination untuk API


        return response()->json($peminjamanselesai);
    }
        public function show($id)
{
    $jadwal = peminjamanselesaisesuaijdwal::with([
        'mahasiswa','mahasiswa.jurusan','mahasiswa.prodi', 'matakuliah','matakuliah.tahunajaran','matakuliah.kurikulum','prodi','tahunajaran','adminjurusan','dosen','ruangan','kelas','dosen.prodi'
    ])->find($id);

    if (!$jadwal) {
        return response()->json(['message' => 'Data tidak ditemukan'], 404);
    }

return response()->json([
    'data' => $jadwal
]);
}

        public function PengembalianDiterima(Request $request)
    {
        // Validasi jika diperlukan
        $data = $request->validate([
            'mahasiswa_id' => 'required|integer',
            'adminjurusan_id' => 'required|integer',
            'prodi_id' => 'required|integer',
            'kelas_id' => 'required|integer',
            'dosen_id' => 'required|integer',
            'tahunajaran_id' => 'required|integer',
            'hari' => 'required|string',
            'jammulai' => 'required|string',
            'jamselesai' => 'required|string',
            'ruangan_id' => 'required|integer',
            'kodematakuliah' => 'required|string',
            'kebutuhankelas' => 'nullable|string',
            'statusuploadvidio' => 'required|string',
            'statusjadwal' => 'required|string',
            'statusdigunakan' => 'required|string',
            'statusterkirim' => 'required|string',
            'statuspeminjaman' => 'required|string',
        'waktu_pengembalian' => 'required|string',  // ambil string dulu
        ]);
        $data['waktu_pengembalian'] = Carbon::parse($data['waktu_pengembalian'])->format('Y-m-d H:i:s');

        // Simpan data baru ke tabel peminjamanselesaisesuaijdwal
        $peminjaman = peminjamanselesaisesuaijdwal::create($data);

        return response()->json([
            'message' => 'Data peminjaman selesai berhasil disimpan',
            'data' => $peminjaman,
        ], 201);
    }

}