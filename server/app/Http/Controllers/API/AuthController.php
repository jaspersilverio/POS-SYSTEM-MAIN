<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        try {
            $result = $this->authService->login(
                $request->input('username'),
                $request->input('password')
            );
            return response()->json([
                'user' => $result['user'],
                'token' => $result['token'],
                'token_type' => 'Bearer',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Invalid credentials.', 'errors' => $e->errors()], 422);
        }
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->authService->me($request->user());
        return response()->json($user);
    }
}
