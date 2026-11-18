<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SalesScreensTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{0: string, 1: string}>
     */
    public static function screens(): array
    {
        return [
            'chains' => ['dashboard', 'sales/Chains'],
            'stores' => ['sales.stores', 'sales/Stores'],
            'products' => ['sales.products', 'sales/Products'],
        ];
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function routes(): array
    {
        return array_map(fn (array $screen) => [$screen[0]], self::screens());
    }

    #[DataProvider('routes')]
    public function test_guests_are_redirected_to_login(string $route): void
    {
        $this->get(route($route))->assertRedirect(route('login'));
    }

    #[DataProvider('screens')]
    public function test_authenticated_users_see_each_screen(string $route, string $component): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route($route))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component($component));
    }
}
