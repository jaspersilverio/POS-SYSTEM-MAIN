<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    /**
     * @return array{user: User, token: string}
     * @throws ValidationException
     */
    public function login(string $username, string $password): array
    {
        $user = $this->userRepository->findByUsername($username);

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'username' => ['This account is inactive.'],
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('pos-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    public function me(User $user): User
    {
        return $user;
    }
}
