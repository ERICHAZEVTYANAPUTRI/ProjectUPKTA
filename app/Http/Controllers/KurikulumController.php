<?php

namespace App\Http\Controllers;

use App\Models\Jurusan;
use App\Models\Kurikulum;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KurikulumController extends Controller
{
    public function index()
    {
    $kurikulums = Kurikulum::with('prodi','adminjurusan')->get();
        return response()->json($kurikulums);
    }
public function store(Request $request)
{
    $user = auth()->user();

    if (!$user || $user->role !== 'admin_jurusan') {
        return response()->json(['message' => 'Akses ditolak. Hanya admin jurusan yang bisa menambah kurikulum.'], 403);
    }

    $jurusan = Jurusan::where('kodejurusan', $user->kodejurusan)->first();

    if (!$jurusan) {
        return response()->json(['message' => 'Jurusan tidak ditemukan.'], 404);
    }

    // Validasi input dasar
    $request->validate([
        'nama' => 'required|string|max:255',
        'prodi_id' => 'required|exists:prodis,id',
        'tahun_mulai' => 'required|digits:4|integer|min:2000',
        'tahun_selesai' => 'nullable|digits:4|integer|min:2000',
        'total_sks' => 'nullable|integer|min:0',
        'deskripsi' => 'nullable|string',
        'is_aktif' => 'boolean',
    ]);
$isAktif = filter_var($request->is_aktif ?? true, FILTER_VALIDATE_BOOLEAN);

    // Pengecekan kombinasi unik: nama + prodi + is_aktif untuk admin jurusan
    $exists = Kurikulum::where('adminjurusan_id', $user->id)
        ->where('nama', $request->nama)
        ->where('prodi_id', $request->prodi_id)
        ->where('is_aktif', $isAktif)
        ->exists();

    if ($exists) {
        return response()->json([
            'message' => 'Kurikulum dengan nama, prodi, dan status aktif yang sama sudah ada.',
        ], 422);
    }

    // Simpan
    $kurikulum = Kurikulum::create([
        'nama' => $request->nama,
        'prodi_id' => $request->prodi_id,
        'tahun_mulai' => $request->tahun_mulai,
        'tahun_selesai' => $request->tahun_selesai,
        'total_sks' => $request->total_sks ?? 0,
        'deskripsi' => $request->deskripsi,
        'adminjurusan_id' => $user->id,
        'is_aktif' => $request->is_aktif ?? true,
    ]);

    return response()->json([
        'message' => 'Kurikulum berhasil ditambahkan.',
        'data' => $kurikulum,
    ], 201);
}

public function show($id)
{
    $kurikulum = Kurikulum::findOrFail($id);
    return response()->json($kurikulum);
}

public function update(Request $request, $id)
{
    $user = auth()->user();

    $kurikulum = Kurikulum::find($id);

    if (!$kurikulum) {
        return response()->json(['message' => 'Kurikulum tidak ditemukan'], 404);
    }

    // Hanya admin_jurusan yang boleh update
    if (!$user || $user->role !== 'admin_jurusan' || $kurikulum->adminjurusan_id !== $user->id) {
        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    // Validasi dasar
    $request->validate([
        'nama' => 'required|string|max:255',
        'prodi_id' => 'required|exists:prodis,id',
        'tahun_mulai' => 'required|digits:4|integer|min:2000',
        'tahun_selesai' => 'nullable|digits:4|integer|min:2000',
        'total_sks' => 'nullable|integer|min:0',
        'deskripsi' => 'nullable|string',
        'is_aktif' => 'boolean',
    ]);

    // Konversi is_aktif ke boolean aman
    $isAktif = filter_var($request->is_aktif ?? true, FILTER_VALIDATE_BOOLEAN);

    // Cek apakah sudah ada kurikulum lain dengan kombinasi yang sama
    $exists = Kurikulum::where('adminjurusan_id', $user->id)
        ->where('id', '!=', $kurikulum->id) // Hindari diri sendiri
        ->where('nama', $request->nama)
        ->where('prodi_id', $request->prodi_id)
        ->where('is_aktif', $isAktif)
        ->exists();

    if ($exists) {
        return response()->json([
            'message' => 'Kurikulum dengan nama, prodi, dan status aktif yang sama sudah ada.',
        ], 422);
    }

    // Update data
    $kurikulum->nama = $request->nama;
    $kurikulum->prodi_id = $request->prodi_id;
    $kurikulum->tahun_mulai = $request->tahun_mulai;
    $kurikulum->tahun_selesai = $request->tahun_selesai;
    $kurikulum->total_sks = $request->total_sks ?? 0;
    $kurikulum->deskripsi = $request->deskripsi;
    $kurikulum->save();

    return response()->json(['message' => 'Kurikulum berhasil diperbarui']);
}
    public function destroy($id)
    {
        $kurikulum = Kurikulum::find($id);

        if (!$kurikulum) {
            return response()->json([
                'message' => 'Kurikulum tidak ditemukan'
            ], 404);
        }

        try {
            $kurikulum->delete();

            return response()->json([
                'message' => 'Kurikulum berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function toggleStatus(Request $request, $id)
{
    $Kurikulum = Kurikulum::findOrFail($id);
    $Kurikulum->is_aktif = $request->is_aktif;
    $Kurikulum->save();

    return response()->json(['message' => 'Status updated successfully.']);
}


}