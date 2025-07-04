<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Matakuliah extends Model
{
    use HasFactory;

    protected $table = 'matakuliahs';

    protected $fillable = [
        'kodematakuliah',
        'namamatakuliah',
        'kurikulum_id',
        'tahunajaran_id',
        'prodi_id',
        'adminjurusan_id',
        'sks_total',
        'tipe',
        'semester',
    ];

    public function kurikulum()
    {
        return $this->belongsTo(Kurikulum::class, 'kurikulum_id', 'id');
    }
        public function tahunajaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahunajaran_id', 'id');
    }

    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id', 'id');
    }
    public function adminjurusan()
    {
    return $this->belongsTo(User::class, 'adminjurusan_id')->where('role', 'admin_jurusan');
    }
    public function peminjamanSelesai()
    {
        return $this->hasMany(peminjamanselesaisesuaijdwal::class, 'kodematakuliah', 'kodematakuliah');
    }
    public function pengajuanpeminjaman()
    {
        return $this->hasMany(PengajuanPeminjamanRuangan::class, 'kodematakuliah', 'kodematakuliah');
    }

}