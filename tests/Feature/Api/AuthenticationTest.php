<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test successful login with valid credentials
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        // Create a test user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Attempt login
        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        // Assert response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'username',
                        'roles',
                        'permissions',
                    ],
                    'token',
                ],
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Login successful',
            ]);

        // Assert token is created
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => User::class,
        ]);
    }

    /**
     * Test login fails with invalid credentials
     */
    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        // Create a test user
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Attempt login with wrong password
        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        // Assert response
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'The provided credentials are incorrect.',
            ]);
    }

    /**
     * Test login validation errors for missing fields
     */
    public function test_login_validation_fails_when_fields_are_missing(): void
    {
        // Attempt login without email and password
        $response = $this->postJson('/api/v1/login', []);

        // Assert response
        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => [
                    'email',
                    'password',
                ],
            ])
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed',
            ]);
    }

    /**
     * Test login validation fails with invalid email format
     */
    public function test_login_validation_fails_with_invalid_email(): void
    {
        // Attempt login with invalid email
        $response = $this->postJson('/api/v1/login', [
            'email' => 'not-an-email',
            'password' => 'password123',
        ]);

        // Assert response
        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => [
                    'email',
                ],
            ])
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test login with non-existent user
     */
    public function test_login_fails_with_non_existent_user(): void
    {
        // Attempt login with non-existent email
        $response = $this->postJson('/api/v1/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        // Assert response
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'The provided credentials are incorrect.',
            ]);
    }

    /**
     * Test successful logout
     */
    public function test_authenticated_user_can_logout(): void
    {
        // Create and authenticate user
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Create a token
        $token = $user->createToken('test-token')->plainTextToken;

        // Verify token exists
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);

        // Attempt logout
        $response = $this->postJson('/api/v1/logout');

        // Assert response
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logout successful',
            ]);
    }

    /**
     * Test logout fails without authentication
     */
    public function test_logout_fails_without_authentication(): void
    {
        // Attempt logout without authentication
        $response = $this->postJson('/api/v1/logout');

        // Assert response
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test logout with invalid token
     */
    public function test_logout_fails_with_invalid_token(): void
    {
        // Attempt logout with invalid token
        $response = $this->postJson('/api/v1/logout', [], [
            'Authorization' => 'Bearer invalid-token',
        ]);

        // Assert response
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test get authenticated user info
     */
    public function test_authenticated_user_can_get_their_info(): void
    {
        // Create and authenticate user
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        Sanctum::actingAs($user);

        // Get user info
        $response = $this->getJson('/api/v1/me');

        // Assert response
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'username',
                        'roles',
                        'permissions',
                    ],
                ],
            ])
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'name' => 'Test User',
                        'email' => 'test@example.com',
                    ],
                ],
            ]);
    }

    /**
     * Test get user info fails without authentication
     */
    public function test_get_user_info_fails_without_authentication(): void
    {
        // Attempt to get user info without authentication
        $response = $this->getJson('/api/v1/me');

        // Assert response
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    /**
     * Test old tokens are deleted when user logs in again
     */
    public function test_old_tokens_are_deleted_on_new_login(): void
    {
        // Create user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Create an old token
        $oldToken = $user->createToken('old-token');
        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $oldToken->accessToken->id,
        ]);

        // Login again
        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        // Assert old token is deleted
        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $oldToken->accessToken->id,
        ]);

        // Assert new token exists
        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
        ]);

        $response->assertStatus(200);
    }

    /**
     * Test 404 error for non-existent API endpoint
     */
    public function test_non_existent_api_endpoint_returns_404(): void
    {
        // Access non-existent endpoint
        $response = $this->getJson('/api/v1/nonexistent');

        // Assert response
        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Resource not found.',
            ]);
    }

    /**
     * Test user receives roles and permissions in login response
     */
    public function test_login_response_includes_roles_and_permissions(): void
    {
        // Create user
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Login
        $response = $this->postJson('/api/v1/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        // Assert roles and permissions are included
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'user' => [
                        'roles',
                        'permissions',
                    ],
                ],
            ]);
    }

    /**
     * Test API returns JSON for all routes
     */
    public function test_api_always_returns_json(): void
    {
        // Test without Accept header
        $response = $this->post('/api/v1/login', []);

        // Should still return JSON
        $response->assertHeader('Content-Type', 'application/json');
    }
}
