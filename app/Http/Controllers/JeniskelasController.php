<?php

namespace App\Http\Controllers;

use App\Models\jeniskelas;
use Illuminate\Http\Request;

class JeniskelasController extends Controller
{
    public function index()
    {
        $data = jeniskelas::all();
        return response()->json($data);
    }
        public function destroy($id)
{
    try {
        $data = jeniskelas::findOrFail($id);
        $data->delete();

        return response()->json(['message' => 'jenis kelas deleted successfully.'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to delete jenis kelas.'], 500);
    }
}
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:100',
        ]);
        

        $data = new jeniskelas();
        $data->nama = $request->nama;
        $data->save();

        return response()->json(['message' => 'Jurusan berhasil ditambahkan'], 201);
    }
public function update(Request $request, $id)
{
    $request->validate([
        'nama' => 'required|string|max:100',
    ]);

    $data = JenisKelas::findOrFail($id);
    $data->nama = $request->nama;
    $data->save();

    return response()->json(['message' => 'Jenis Kelas berhasil diperbarui'], 200);
}

}