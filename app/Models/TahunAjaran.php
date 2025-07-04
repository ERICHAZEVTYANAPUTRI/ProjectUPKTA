<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TahunAjaran extends Model
{
    use HasFactory;

    protected $table = 'tahunajarans';

    protected $fillable = [
        'tahun',
        'semester',
        'is_aktif',
        'adminjurusan_id',
    ];
    public function penjadwalans()
    {
    return $this->hasMany(PenjadwalanRuangan::class, 'tahunajaran_id', 'id');
    }
    public function adminjurusan()
    {
    return $this->belongsTo(User::class, 'adminjurusan_id')->where('role', 'admin_jurusan');
    }
    public function peminjamanSelesai()
    {
        return $this->hasMany(peminjamanselesaisesuaijdwal::class, 'tahunajaran_id', 'id');
    }
}