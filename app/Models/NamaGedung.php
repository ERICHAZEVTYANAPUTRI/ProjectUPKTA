<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NamaGedung extends Model
{
    use HasFactory;

    protected $table = 'gedungs';

    protected $fillable = [
        'gambar',
        'name',
    ];
}
