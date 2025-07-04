<?php

namespace App\Http\Controllers;

use App\Models\Jurusan;
use Illuminate\Http\Request;

class JurusanController extends Controller
{
    public function index()
    {
        $Jurusans = Jurusan::all();
        return response()->json($Jurusans);
    }

    public function store(Request $request)
    {
        $request->validate([
            'namajurusan' => 'required|string|max:100|unique:jurusans,namajurusan',
        ], [
            'namajurusan.unique' => 'Nama jurusan sudah terdaftar.',
        ]);
        

        $jurusan = new Jurusan();
        $jurusan->namajurusan = $request->namajurusan;
        $jurusan->save();

        return response()->json(['message' => 'Jurusan berhasil ditambahkan'], 201);
    }

    public function show($kodejurusanganjil)
    {
        $jurusanganjil = Jurusan::where('kodejurusanganjil', $kodejurusanganjil)->first();
    
        if (!$jurusanganjil) {
            return response()->json(['message' => 'Jurusan not found'], 404);
        }
    
        return response()->json($jurusanganjil);
    }
}