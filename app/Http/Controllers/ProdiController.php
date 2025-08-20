<?php

namespace App\Http\Controllers;

use App\Models\Prodi;
use App\Models\Jurusan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Unique;
use Illuminate\Support\Facades\Validator;

class ProdiController extends Controller
{
    public function index()
    {
        $dosens = Prodi::with('adminjurusan')->get();
        return response()->json(data: $dosens);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin_jurusan') {
            return response()->json(['message' => 'Akses ditolak. Hanya admin jurusan yang bisa menambah prodi.'], 403);
        }

        $jurusan = Jurusan::where('namajurusan', $user->jurusan)
            ->where('kodejurusan', $user->kodejurusan)
            ->first();

        if (!$jurusan) {
            return response()->json(['message' => 'Jurusan tidak ditemukan di tabel jurusans'], 404);
        }

        $request->validate([
            'namaprodi' => [
                'required',
                Rule::unique('prodis')->where(function ($query) use ($user) {
                    return $query->where('adminjurusan_id', $user->id);
                }),
            ],
            'kodeprodi' => 'required|unique:prodis,kodeprodi',
        ]);

        $prodi = Prodi::create([
            'kodeprodi' => $request->kodeprodi,
            'namaprodi' => $request->namaprodi,
            'adminjurusan_id' => $user->id,
            'id_jurusan' => $jurusan->id,
        ]);

        return response()->json([
            'message' => 'Prodi berhasil ditambahkan.',
            'prodi' => $prodi
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin_jurusan') {
            return response()->json(['message' => 'Akses ditolak. Hanya admin jurusan yang bisa mengubah prodi.'], 403);
        }

        $prodi = Prodi::find($id);
        if (!$prodi) {
            return response()->json(['message' => 'Data prodi tidak ditemukan.'], 404);
        }

        $request->validate([
            'namaprodi' => [
                'required',
                Rule::unique('prodis')->ignore($id)->where(function ($query) use ($user) {
                    return $query->where('adminjurusan_id', $user->id);
                }),
            ],
            'kodeprodi' => [
                'required',
                Rule::unique('prodis', 'kodeprodi')->ignore($id),
            ],
        ]);

        $jurusan = Jurusan::where('namajurusan', $user->jurusan)
            ->where('kodejurusan', $user->kodejurusan)
            ->first();

        if (!$jurusan) {
            return response()->json(['message' => 'Jurusan tidak ditemukan.'], 404);
        }

        $prodi->update([
            'kodeprodi' => $request->kodeprodi,
            'namaprodi' => $request->namaprodi,
            'adminjurusan_id' => $user->id,
            'id_jurusan' => $jurusan->id,
        ]);

        return response()->json([
            'message' => 'Prodi berhasil diperbarui.',
            'prodi' => $prodi,
        ]);
    }

    public function getByJurusan($id_jurusan)
    {
        $prodis = Prodi::where('id_jurusan', $id_jurusan)->get();

        if ($prodis->isEmpty()) {
            return response()->json(['message' => 'Tidak ada prodi untuk jurusan ini'], 404);
        }

        return response()->json($prodis);
    }
    public function show($id)
    {
        $prodi = Prodi::find($id);
        if (!$prodi) {
            return response()->json(['message' => 'Prodi tidak ditemukan'], 404);
        }
        return response()->json($prodi);
    }

    public function destroy($id)
    {
        $prodi = Prodi::find($id);

        if (!$prodi) {
            return response()->json([
                'message' => 'Prodi tidak ditemukan'
            ], 404);
        }

        try {
            $prodi->delete();

            return response()->json([
                'message' => 'Prodi berhasil dihapus'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus data prodi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
