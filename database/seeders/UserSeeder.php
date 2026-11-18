<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Local test accounts: admin1..admin3 / 12345678. Never run this in production.
 */
class UserSeeder extends Seeder
{
    private const COUNT = 3;

    private const PASSWORD = '12345678';

    public function run(): void
    {
        if (app()->isProduction()) {
            $this->command?->error('UserSeeder creates accounts with a known password and is blocked in production.');

            return;
        }

        foreach (range(1, self::COUNT) as $id) {
            $user = User::firstOrNew(['email' => "admin{$id}@example.com"]);

            $user->forceFill([
                'name' => "admin{$id}",
                'password' => self::PASSWORD, // hashed by the User model cast
                'email_verified_at' => now(),
            ])->save();
        }
    }
}
