<?php

namespace App\Http\Controllers;

use App\Models\Jurusan;
use App\Models\MataKuliah;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MataKuliahController extends Controller
{
public function index()
{
    $matakuliahs = Matakuliah::with(['TahunAjaran','kurikulum', 'prodi','adminjurusan'])->get();
    return response()->json($matakuliahs);
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
        'kodematakuliah' => 'required|string|max:255',
        'namamatakuliah' => 'required|string|max:255',
        'prodi_id' => 'required|exists:prodis,id',
        'tahunajaran_id' => 'required|exists:tahunajarans,id',
        'kurikulum_id' => 'required|exists:kurikulums,id',
        'tipe' => 'required|in:teori,praktikum',
        'semester' => 'required|string|max:255',
        'sks_total' => 'required|string|max:255',
    ]);
    // Simpan
    $matakuliah = Matakuliah::create([
        'kodematakuliah' => $request->kodematakuliah,
        'namamatakuliah' => $request->namamatakuliah,
        'semester' => $request->semester,
        'prodi_id' => $request->prodi_id,
        'tahunajaran_id' => $request->tahunajaran_id,
        'kurikulum_id' => $request->kurikulum_id,
        'sks_total' => $request->sks_total ?? 0,
        'tipe' => $request->tipe,
        'adminjurusan_id' => $user->id,
    ]);

    return response()->json([
        'message' => 'matakuliah berhasil ditambahkan.',
        'data' => $matakuliah,
    ], 201);
}

public function update(Request $request, $id)
{
    $user = auth()->user();

    if (!$user || $user->role !== 'admin_jurusan') {
        return response()->json(['message' => 'Akses ditolak. Hanya admin jurusan yang bisa mengubah matakuliah.'], 403);
    }

    $matakuliah = Matakuliah::where('id', $id)->where('adminjurusan_id', $user->id)->first();

    if (!$matakuliah) {
        return response()->json(['message' => 'Matakuliah tidak ditemukan.'], 404);
    }

    // Validasi input dasar
    $request->validate([
        'kodematakuliah' => 'required|string|max:255',
        'namamatakuliah' => 'required|string|max:255',
        'prodi_id' => 'required|exists:prodis,id',
        'tahunajaran_id' => 'required|exists:tahunajarans,id',
        'kurikulum_id' => 'required|exists:kurikulums,id',
        'tipe' => 'required|in:teori,praktikum',
        'semester' => 'required|string|max:255',
        'sks_total' => 'required|integer',
    ]);

    // Update data
    $matakuliah->update([
        'kodematakuliah' => $request->kodematakuliah,
        'namamatakuliah' => $request->namamatakuliah,
        'semester' => $request->semester,
        'prodi_id' => $request->prodi_id,
        'tahunajaran_id' => $request->tahunajaran_id,
        'kurikulum_id' => $request->kurikulum_id,
        'sks_total' => $request->sks_total ?? 0,
        'tipe' => $request->tipe,
    ]);

    return response()->json([
        'message' => 'Matakuliah berhasil diperbarui.',
        'data' => $matakuliah,
    ], 200);
}
public function show($id)
{
    $matakuliah = MataKuliah::with([ 'TahunAjaran','kurikulum', 'prodi','adminjurusan'])->findOrFail($id);
    
    return response()->json($matakuliah);
}
    public function destroy($id)
    {
        $matakuliah = Matakuliah::find($id);

        if (!$matakuliah) {
            return response()->json([
                'message' => 'Mata kuliah tidak ditemukan'
            ], 404);
        }

        try {
            $matakuliah->delete();

            return response()->json([
                'message' => 'Mata kuliah berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function updateTahunAjaran(Request $request, $id)
{
    $request->validate([
        'tahunajaran_id' => 'required|exists:tahunajarans,id',
    ]);

    $matakuliah = Matakuliah::findOrFail($id);
    $matakuliah->tahunajaran_id = $request->tahunajaran_id;
    $matakuliah->save();

    return response()->json([
        'message' => 'Tahun ajaran berhasil diperbarui.',
        'data' => $matakuliah,
    ]);
}

}