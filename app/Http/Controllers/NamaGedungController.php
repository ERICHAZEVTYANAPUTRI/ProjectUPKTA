<?php

namespace App\Http\Controllers;

use App\Models\NamaGedung;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class NamaGedungController extends Controller
{
    public function index()
    {
        $gedungs = NamaGedung::all();
        return response()->json($gedungs);
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'gambar' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);
        $imagePath = $request->file('gambar')->store('gedungs', 'public');
        $gedung = NamaGedung::create([
            'name' => $request->input('name'),
            'gambar' => $imagePath,
        ]);

        return response()->json($gedung, 201);
    }
public function show($gedungId)
{
    $gedung = NamaGedung::find($gedungId);
    if (!$gedung) {
        return response()->json(['error' => 'Gedung not found'], 404);
    }
    return response()->json($gedung);
}
    public function update(Request $request, $id)
    {
        $gedung = NamaGedung::find($id);
        if (!$gedung) {
            return response()->json(['message' => 'Gedung tidak ditemukan'], 404);
        }

        // Validasi data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Update nama gedung
        $gedung->name = $validated['name'];

        // Jika ada file gambar, upload dan update path
        if ($request->hasFile('gambar')) {
            // Hapus file lama jika ada
            if ($gedung->gambar && Storage::disk('public')->exists($gedung->gambar)) {
                Storage::disk('public')->delete($gedung->gambar);
            }

            $path = $request->file('gambar')->store('gedungs', 'public');
            $gedung->gambar = $path;
        }

        $gedung->save();

        return response()->json([
            'message' => 'Gedung berhasil diperbarui',
            'gedung' => $gedung
        ]);
    }

    // Delete gedung
    public function destroy($id)
    {
        $gedung = NamaGedung::find($id);
        if (!$gedung) {
            return response()->json(['message' => 'Gedung tidak ditemukan'], 404);
        }

        // Hapus gambar jika ada
        if ($gedung->gambar && Storage::disk('public')->exists($gedung->gambar)) {
            Storage::disk('public')->delete($gedung->gambar);
        }

        $gedung->delete();

        return response()->json(['message' => 'Gedung berhasil dihapus']);
    }
    public function jmllantaidanruangan()
    {
        // Ambil data gedung beserta jumlah ruangan dan lantai tertinggi
        $gedungs = DB::table('gedungs')
            ->leftJoin('ruangan_g_k_t_s', 'gedungs.id', '=', 'ruangan_g_k_t_s.gedung')
            ->select(
                'gedungs.id',
                'gedungs.name',
                'gedungs.gambar',
                DB::raw('COUNT(ruangan_g_k_t_s.id) as jumlah_ruangan'),
                DB::raw('MAX(CAST(ruangan_g_k_t_s.lantai AS UNSIGNED)) as lantai_tertinggi')
            )
            ->groupBy('gedungs.id', 'gedungs.name', 'gedungs.gambar')
            ->get();

        return response()->json($gedungs);
    }

}