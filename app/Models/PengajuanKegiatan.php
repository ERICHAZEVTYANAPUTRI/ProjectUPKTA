<?php

namespace App\Models;

use App\Models\User;
use App\Models\RuanganGKT;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PengajuanKegiatan extends Model
{
    use HasFactory;
    protected $casts = [
        'jenis_kegiatan' => 'array',
    ];

    protected $table = 'pengajuan_kegiatan';
    protected $fillable = [
        'mahasiswa_id',
        'ruangan_id',
        'tanggal',
        'jammulai',
        'jamselesai',
        'jenis_kegiatan',
        'keperluan',
        'status',
        'statusuploadvidio',
    ];
    public function mahasiswa()
    {
        return $this->belongsTo(User::class, 'mahasiswa_id');
    }
    public function ruangan()
    {
        return $this->belongsTo(RuanganGKT::class, 'ruangan_id');
    }
}
