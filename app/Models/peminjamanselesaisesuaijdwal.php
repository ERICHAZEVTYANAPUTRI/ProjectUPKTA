<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class peminjamanselesaisesuaijdwal extends Model
{
    use HasFactory;

    // Nama tabel sesuai migrasi
    protected $table = 'peminjamanselesaisesuaijdwals';

    // Kolom yang boleh diisi massal
    protected $fillable = [
        'mahasiswa_id',
        'adminjurusan_id',
        'prodi_id',
        'kelas_id',
        'tahunajaran_id',
        'dosen_id',
        'hari',
        'jammulai',
        'jamselesai',
        'ruangan_id',
        'kodematakuliah',
        'kebutuhankelas',
        'statusuploadvidio',
        'statusjadwal',
        'statusterkirim',
        'statuspeminjaman',
        'statusdigunakan',
        'statustidakdigunakan',
        'statusdialihkan',
        'waktu_pengembalian',
    ];

    // Jika kamu mau otomatis cast waktu_pengembalian ke Carbon instance
    protected $dates = ['waktu_pengembalian'];

    // Relasi ke model User (Mahasiswa)
    public function mahasiswa()
    {
        return $this->belongsTo(User::class, 'mahasiswa_id');
    }

    // Relasi ke model User (Admin Jurusan)
    public function adminjurusan()
    {
        return $this->belongsTo(User::class, 'adminjurusan_id');
    }

    // Relasi ke model Prodi
    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id');
    }
    public function dosen()
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }
    public function ruangan()
    {
        return $this->belongsTo(RuanganGKT::class, 'ruangan_id');
    }
    public function kelas()
    {
        return $this->belongsTo(kelas::class, 'kelas_id');
    }


    // Relasi ke model TahunAjaran
    public function tahunajaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahunajaran_id');
    }

    // Relasi ke model Matakuliah
    public function matakuliah()
    {
        return $this->belongsTo(Matakuliah::class, 'kodematakuliah', 'kodematakuliah');
    }
}