<?php

namespace Database\Factories;

use App\Models\Jurusan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Jurusan>
 */
class JurusanFactory extends Factory
{
    protected $model = Jurusan::class;

    public function definition(): array
    {
        return [
            'namajurusan' => $this->faker->words(2, true), // ✅ diperbaiki
            'kodejurusan' => $this->faker->unique()->numerify('1980##########'),
        ];
    }
}