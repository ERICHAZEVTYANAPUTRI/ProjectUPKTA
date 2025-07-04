<?php

namespace App\Http\Controllers;

use App\Models\SmesterGenap;
use Illuminate\Http\Request;

class SmesterGenapController extends Controller
{
    public function index()
    {
        $smestergenaps = SmesterGenap::all();
        return response()->json($smestergenaps);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kodejurusangenap' => 'required|string|max:10|unique:smester_genaps,kodejurusangenap',
            'namajurusangenap' => 'required|string|max:100|unique:smester_genaps,namajurusangenap',
        ], [
            'kodejurusangenap.unique' => 'Kode jurusan sudah digunakan.',
            'namajurusangenap.unique' => 'Nama jurusan sudah terdaftar.',
        ]);
        

        $jurusangenap = new SmesterGenap();
        $jurusangenap->kodejurusangenap = $request->kodejurusangenap;
        $jurusangenap->namajurusangenap = $request->namajurusangenap;
        $jurusangenap->save();

        return response()->json(['message' => 'Jurusan berhasil ditambahkan'], 201);
    }

    public function show($kodejurusangenap)
    {
        $jurusangenap = SmesterGenap::where('kodejurusangenap', $kodejurusangenap)->first();
    
        if (!$jurusangenap) {
            return response()->json(['message' => 'Jurusan not found'], 404);
        }
    
        return response()->json($jurusangenap);
    }}