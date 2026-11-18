<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class SessionExpiredTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('web')->post('/_expired', fn () => throw new TokenMismatchException);
    }

    public function test_guests_opening_the_root_url_end_up_on_the_login_page(): void
    {
        $this->followingRedirects()->get('/')->assertOk()->assertInertia(
            fn ($page) => $page->component('auth/Login'),
        );
    }

    public function test_expired_session_on_a_post_sends_guests_to_login(): void
    {
        $this->post('/_expired')->assertRedirect(route('login'));
    }

    public function test_expired_token_for_a_signed_in_user_goes_back_instead_of_login(): void
    {
        $this->actingAs(User::factory()->create())
            ->from('/dashboard')
            ->post('/_expired')
            ->assertRedirect('/dashboard');
    }

    public function test_json_requests_still_get_419(): void
    {
        $this->postJson('/_expired')->assertStatus(419);
    }
}
