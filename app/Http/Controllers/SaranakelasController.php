<?php

namespace App\Http\Controllers;

use App\Models\saranakelas;
use Illuminate\Http\Request;

class SaranakelasController extends Controller
{
    public function index()
    {
        $data = saranakelas::all();
        return response()->json($data);
    }
        public function destroy($id)
{
    try {
        $data = saranakelas::findOrFail($id);
        $data->delete();

        return response()->json(['message' => 'Sarana kelas deleted successfully.'], 200);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Failed to delete Sarana kelas.'], 500);
    }
}
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:100',
        ]);
        

        $data = new saranakelas();
        $data->nama = $request->nama;
        $data->save();

        return response()->json(['message' => 'Jurusan berhasil ditambahkan'], 201);
    }
public function update(Request $request, $id)
{
    $request->validate([
        'nama' => 'required|string|max:100',
    ]);

    $data = saranakelas::findOrFail($id);
    $data->nama = $request->nama;
    $data->save();

    return response()->json(['message' => 'Sarana Kelas berhasil diperbarui'], 200);
}
}