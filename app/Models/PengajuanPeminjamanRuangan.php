<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengajuanPeminjamanRuangan extends Model
{
    use HasFactory;

    protected $table = 'pengajuan_peminjaman_ruangans';

    protected $fillable = [
        'mahasiswa_id',
        'ruangan_id',
        'dosen_id',
        'kodematakuliah',
        'hari',
        'tanggal',
        'jammulai',
        'jamselesai',
        'keperluan',
        'status',
        'statuspeminjaman',
        'statusuploadvidio',
    ];

    // Relasi ke mahasiswa (user)
    public function mahasiswa()
    {
        return $this->belongsTo(User::class, 'mahasiswa_id','id');
    }
    public function dosen()
    {
        return $this->belongsTo(Dosen::class, 'dosen_id','id');
    }

    // Relasi ke ruangan
    public function ruangan()
    {
        return $this->belongsTo(RuanganGKT::class, 'ruangan_id','id');
    }

    // Relasi ke matakuliah
    public function matakuliah()
    {
        return $this->belongsTo(MataKuliah::class, 'kodematakuliah', 'kodematakuliah');
    }
}