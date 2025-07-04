<?php

namespace Database\Factories;

use App\Models\RuanganGKT;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RuanganGKT>
 */
class RuanganGKTFactory extends Factory
{
    protected $model = RuanganGKT::class;

    public function definition(): array
    {
        return [
            'gambar' => 'default.jpg',
            'name' => $this->faker->unique()->word(),
            'gedung' => $this->faker->randomElement(['Gedung A', 'Gedung B']),
            'lantai' => $this->faker->numberBetween(1, 5),
            'kapasitas' => $this->faker->numberBetween(20, 100),
            'jeniskelas' => $this->faker->word(),
            'modelkelas' => $this->faker->word(),
            'saranakelas' => $this->faker->word(),
            'statusruangan' => 'kosong',
        ];
    }
}