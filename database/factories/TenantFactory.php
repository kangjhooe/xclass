<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Core\Tenant>
 */
class TenantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'npsn' => $this->faker->unique()->numerify('########'),
            'name' => $this->faker->company() . ' School',
            'type_tenant' => $this->faker->randomElement(['Sekolah Umum', 'Madrasah']),
            'jenjang' => $this->faker->randomElement(['SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'SMK', 'Lainnya']),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
            'city' => $this->faker->city(),
            'province' => $this->faker->state(),
            'postal_code' => $this->faker->postcode(),
            'website' => $this->faker->url(),
            'custom_domain' => null,
            'logo' => null,
            'is_active' => true,
            'subscription_plan' => $this->faker->randomElement(['basic', 'premium', 'enterprise']),
            'subscription_expires_at' => $this->faker->optional(0.7)->dateTimeBetween('now', '+1 year'),
            'settings' => null,
        ];
    }
}
