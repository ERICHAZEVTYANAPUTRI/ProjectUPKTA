<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Jurusan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Prodi>
 */
class ProdiFactory extends Factory
{
    protected $model = Prodi::class;

    public function definition(): array
    {
        return [
            'kodeprodi' => $this->faker->unique()->regexify('[A-Z]{3}[0-9]{3}'),
            'namaprodi' => $this->faker->words(2, true),
            'id_jurusan' => Jurusan::factory(), // Ini akan otomatis buat jurusan baru
            'adminjurusan_id' => User::factory()->create(['role' => 'admin_jurusan'])->id,
        ];
    }
}