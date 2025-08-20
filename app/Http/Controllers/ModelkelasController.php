<?php

namespace App\Http\Controllers;

use App\Models\modelkelas;
use Illuminate\Http\Request;

class ModelkelasController extends Controller
{
    public function index()
    {
        $data = modelkelas::all();
        return response()->json($data);
    }
    public function destroy($id)
    {
        try {
            $data = modelkelas::findOrFail($id);
            $data->delete();

            return response()->json(['message' => 'model kelas deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete model kelas.'], 500);
        }
    }
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:100',
        ]);


        $data = new modelkelas();
        $data->nama = $request->nama;
        $data->save();

        return response()->json(['message' => 'Jurusan berhasil ditambahkan'], 201);
    }
    public function update(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:100',
        ]);

        $data = modelkelas::findOrFail($id);
        $data->nama = $request->nama;
        $data->save();

        return response()->json(['message' => 'model Kelas berhasil diperbarui'], 200);
    }
}
