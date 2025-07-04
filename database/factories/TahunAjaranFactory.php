<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\TahunAjaran;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TahunAjaran>
 */
class TahunAjaranFactory extends Factory
{
    protected $model = TahunAjaran::class;

    public function definition(): array
    {
        return [
            'tahun' => $this->faker->randomElement(['2023/2024', '2024/2025']),
            'semester' => $this->faker->randomElement(['ganjil', 'genap']),
            'is_aktif' => true,
            'adminjurusan_id' => User::factory()->create(['role' => 'admin_jurusan'])->id,
        ];
    }
}