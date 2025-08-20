<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RuanganGKT extends Model
{
    use HasFactory;

    protected $table = 'ruangan_g_k_t_s';

    protected $fillable = [
        'gambar',
        'name',
        'gedung',
        'lantai',
        'kapasitas',
        'jeniskelas',
        'modelkelas',
        'saranakelas',
        'statusruangan',
    ];
    public function penjadwalanruangan()
    {
        return $this->hasMany(PenjadwalanRuangan::class, 'ruangan_id', 'id');
    }
}
