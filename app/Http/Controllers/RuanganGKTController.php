<?php

namespace App\Http\Controllers;

use App\Models\RuanganGKT;
use Illuminate\Http\Request;
use App\Models\PenjadwalanRuangan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use App\Models\PengajuanPeminjamanRuangan;

class RuanganGKTController extends Controller
{
    public function index($gedungId)
    {
        $ruangans = RuanganGKT::where('gedung', $gedungId)->get();
        return response()->json($ruangans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|array',
            'name.*' => 'required|string|max:255',
            'gambar' => 'required|array',
            'gambar.*' => 'image',
            'lantai' => 'required|array',
            'lantai.*' => 'required|string',
            'kapasitas' => 'required|array',
            'kapasitas.*' => 'required|integer',

            'jeniskelas' => 'required|array',
            'jeniskelas.*' => 'required|array',
            'jeniskelas.*.*' => 'required|string',

            'modelkelas' => 'required|array',
            'modelkelas.*' => 'required|array',
            'modelkelas.*.*' => 'required|string',

            'saranakelas' => 'required|array',
            'saranakelas.*' => 'required|array',
            'saranakelas.*.*' => 'required|string',

            'gedung' => 'required|array',
            'gedung.*' => 'required|exists:gedungs,id',
        ]);
        $rooms = [];
        foreach ($validated['name'] as $index => $name) {
            $gambarPath = $request->file('gambar')[$index]->store('ruangan_images', 'public');
            $ruangan = RuanganGKT::create([
                'name' => $validated['name'][$index],
                'gambar' => $gambarPath,
                'lantai' => $validated['lantai'][$index],
                'kapasitas' => $validated['kapasitas'][$index],
                'jeniskelas' => is_array($validated['jeniskelas'][$index]) ? json_encode($validated['jeniskelas'][$index]) : $validated['jeniskelas'][$index],
                'modelkelas' => is_array($validated['modelkelas'][$index]) ? json_encode($validated['modelkelas'][$index]) : $validated['modelkelas'][$index],
                'saranakelas' => is_array($validated['saranakelas'][$index]) ? json_encode($validated['saranakelas'][$index]) : $validated['saranakelas'][$index],
                'gedung' => $validated['gedung'][$index],
            ]);

            $rooms[] = $ruangan;
        }

        return response()->json($rooms, 201);
    }

    public function updateStatusDiperbaiki(Request $request, $id)
    {
        $validatedData = $request->validate([
            'statusruangan' => 'required|string|in:dipinjam,diperbaiki,kosong',  // Pastikan status ruangan valid
        ]);

        $ruangan = RuanganGKT::find($id);

        if (!$ruangan) {
            return response()->json(['message' => 'Ruangan tidak ditemukan'], 404);
        }

        $ruangan->statusruangan = $validatedData['statusruangan'];

        $ruangan->save();

        return response()->json(['message' => 'Status ruangan berhasil diperbarui']);
    }

    public function updateRuangan(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'lantai' => 'required|string',
            'kapasitas' => 'required|integer',
            'jeniskelas' => 'required|array',
            'jeniskelas.*' => 'required|string',
            'modelkelas' => 'required|array',
            'modelkelas.*' => 'required|string',
            'saranakelas' => 'required|array',
            'saranakelas.*' => 'required|string',
        ]);

        $ruangan = RuanganGKT::findOrFail($id);

        $ruangan->update([
            'name' => $validated['name'],
            'lantai' => $validated['lantai'],
            'kapasitas' => $validated['kapasitas'],
            'jeniskelas' => is_array($validated['jeniskelas']) ?  json_encode($validated['jeniskelas']) : $validated['jeniskelas'],
            'modelkelas' => is_array($validated['modelkelas']) ?  json_encode($validated['modelkelas']) : $validated['modelkelas'],
            'saranakelas' => is_array($validated['saranakelas']) ?  json_encode($validated['saranakelas']) : $validated['saranakelas'],
        ]);

        return response()->json([
            'message' => 'Ruangan berhasil diperbarui',
            'data' => $ruangan,
        ], 200);
    }
    public function getRuanganByGedung($gedungId)
    {
        $ruangan = RuanganGKT::where('gedung', $gedungId)->get();
        return response()->json($ruangan);
    }
    public function show($ruanganId)
    {
        $ruangan = RuanganGKT::find($ruanganId);
        if (!$ruangan) {
            return response()->json(['error' => 'ruangan not found'], 404);
        }
        return response()->json($ruangan);
    }
    public function destroy($id)
    {
        try {
            $room = RuanganGKT::findOrFail($id);

            $room->delete();

            return response()->json([
                'message' => 'Ruangan berhasil dihapus',
            ], 200);
        } catch (\Exception $e) {

            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus ruangan',
            ], 500);
        }
    }

    public function updateGambar(Request $request, $id)
    {
        $ruangan = RuanganGKT::findOrFail($id);

        if ($request->hasFile('gambar')) {
            $file = $request->file('gambar');
            $path = $file->store('foto_ruangan', 'public');

            if ($ruangan->gambar && Storage::disk('public')->exists($ruangan->gambar)) {
                Storage::disk('public')->delete($ruangan->gambar);
            }

            $ruangan->gambar = $path;
            $ruangan->save();
        }

        return response()->json(['message' => 'Gambar berhasil diupdate', 'gambar' => $ruangan->gambar]);
    }

    public function getDetailWithPeminjaman($roomId)
    {
        $jadwals = PenjadwalanRuangan::with(['mahasiswa', 'dosen', 'prodi', 'kelas'])
            ->where('ruangan_id', $roomId)
            ->where('statusjadwal', 'aktif')
            ->whereIn('statuspeminjaman', ['dipinjam', 'prosespengembalian'])
            ->get();

        $peminjaman = PengajuanPeminjamanRuangan::with('mahasiswa')
            ->where('ruangan_id', $roomId)
            ->whereIn('statuspeminjaman', ['dipinjam', 'prosespengembalian'])
            ->get();

        return response()->json([
            'jadwals' => $jadwals,
            'peminjaman' => $peminjaman,
        ]);
    }
}
