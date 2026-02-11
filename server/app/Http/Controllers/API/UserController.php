<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index(): JsonResponse
    {
        $users = $this->userService->list();
        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email',
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,cashier',
            'status' => 'nullable|in:active,inactive',
        ]);

        $data = $request->only('name', 'email', 'username', 'password', 'role', 'status');
        $data['status'] = $data['status'] ?? 'active';

        $user = $this->userService->store($data);
        return response()->json($user, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $id,
            'username' => 'sometimes|string|max:255|unique:users,username,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|in:admin,cashier',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $data = $request->only('name', 'email', 'username', 'password', 'role', 'status');
        $user = $this->userService->update($id, $data);
        return response()->json($user);
    }
}
