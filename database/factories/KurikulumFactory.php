<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Kurikulum;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kurikulum>
 */
class KurikulumFactory extends Factory
{
    protected $model = Kurikulum::class;

    public function definition(): array
    {
        return [
            'nama' => 'Kurikulum ' . $this->faker->year,
            'prodi_id' => Prodi::factory(),
            'tahun_mulai' => $this->faker->year,
            'tahun_selesai' => $this->faker->year,
            'total_sks' => 144,
            'is_aktif' => true,
            'deskripsi' => $this->faker->sentence,
            'adminjurusan_id' => User::factory()->create(['role' => 'admin_jurusan'])->id,
        ];
    }
}