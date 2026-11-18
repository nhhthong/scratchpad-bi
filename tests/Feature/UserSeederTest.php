<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_three_verified_admin_accounts_with_the_test_password(): void
    {
        $this->seed(UserSeeder::class);

        $this->assertSame(['admin1', 'admin2', 'admin3'], User::orderBy('id')->pluck('name')->all());

        foreach (User::all() as $user) {
            $this->assertTrue(Hash::check('12345678', $user->password));
            $this->assertNotNull($user->email_verified_at);
        }
    }

    public function test_it_can_run_twice_without_duplicates(): void
    {
        $this->seed(UserSeeder::class);
        $this->seed(UserSeeder::class);

        $this->assertSame(3, User::count());
    }

    public function test_seeded_users_can_log_in(): void
    {
        $this->seed(UserSeeder::class);

        $this->post(route('login.store'), ['email' => 'admin2@example.com', 'password' => '12345678'])
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticated();
    }

    public function test_it_is_blocked_in_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');

        $this->seed(UserSeeder::class);

        $this->assertSame(0, User::count());
    }
}
