<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_locale_is_japanese(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('locale', 'ja'));
    }

    public function test_guest_can_switch_locale_and_it_is_kept_in_the_session(): void
    {
        $this->post(route('locale.update'), ['locale' => 'en'])->assertRedirect();

        $this->get(route('login'))
            ->assertInertia(fn ($page) => $page->where('locale', 'en'));
    }

    public function test_user_locale_is_saved_and_used_after_login(): void
    {
        $user = User::factory()->create();
        $this->assertSame('ja', $user->fresh()->locale);

        $this->actingAs($user)->post(route('locale.update'), ['locale' => 'en']);

        $this->assertSame('en', $user->fresh()->locale);

        $this->actingAs($user->fresh())->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page->where('locale', 'en'));
    }

    public function test_unsupported_locale_is_rejected(): void
    {
        $this->post(route('locale.update'), ['locale' => 'fr'])
            ->assertSessionHasErrors('locale');
    }

    public function test_failed_login_message_is_translated_to_japanese(): void
    {
        $user = User::factory()->create();

        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'wrong'])
            ->assertSessionHasErrors('email');

        $this->assertSame(trans('auth.failed', [], 'ja'), session('errors')->first('email'));
    }
}
