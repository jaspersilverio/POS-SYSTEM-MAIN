<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function list(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->userRepository->getAll();
    }

    /**
     * @throws ValidationException
     */
    public function store(array $data): User
    {
        if ($this->userRepository->findByUsername($data['username'])) {
            throw ValidationException::withMessages(['username' => ['Username already taken.']]);
        }
        if (!empty($data['email']) && $this->userRepository->findByEmail($data['email'])) {
            throw ValidationException::withMessages(['email' => ['Email already in use.']]);
        }

        $data['password'] = Hash::make($data['password']);
        return $this->userRepository->create($data);
    }

    public function update(int $id, array $data): User
    {
        $user = $this->userRepository->findById($id);
        if (!$user) {
            throw ValidationException::withMessages(['user' => ['User not found.']]);
        }
        if (!empty($data['email'])) {
            $existing = $this->userRepository->findByEmail($data['email']);
            if ($existing && (int) $existing->id !== (int) $id) {
                throw ValidationException::withMessages(['email' => ['Email already in use.']]);
            }
        }

        if (isset($data['password']) && $data['password'] !== '') {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $this->userRepository->update($user, $data);
        return $user->fresh();
    }

    public function updateStatus(int $id, string $status): User
    {
        $user = $this->userRepository->findById($id);
        if (!$user) {
            throw ValidationException::withMessages(['user' => ['User not found.']]);
        }
        if (!in_array($status, ['active', 'inactive'], true)) {
            throw ValidationException::withMessages(['status' => ['Invalid status.']]);
        }
        $this->userRepository->update($user, ['status' => $status]);
        return $user->fresh();
    }

    public function resetPassword(int $id, string $password): User
    {
        $user = $this->userRepository->findById($id);
        if (!$user) {
            throw ValidationException::withMessages(['user' => ['User not found.']]);
        }
        $this->userRepository->update($user, ['password' => Hash::make($password)]);
        return $user->fresh();
    }
}
