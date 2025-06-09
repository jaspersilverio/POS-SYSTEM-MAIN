<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index()
    {
        $users = User::with('role')->get();
        return response()->json($users);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:55',
            'middle_name' => 'nullable|string|max:55',
            'last_name' => 'required|string|max:55',
            'suffix_name' => 'nullable|string|max:55',
            'age' => 'required|string',
            'gender' => 'required|in:female,male,others',
            'contact' => 'required|string|max:55',
            'address' => 'required|string|max:255',
            'role_id' => 'required|exists:tbl_roles,role_id',
            'email' => 'required|string|email|max:55|unique:tbl_users',
            'password' => 'required|string|min:6',
            'profile_image' => 'nullable|image|max:2048',
        ]);

        $userData = $request->except('profile_image');
        $userData['password'] = Hash::make($request->password);

        if ($request->hasFile('profile_image')) {
            $userData['profile_image'] = $request->file('profile_image')->store('profile_images', 'public');
        }

        $user = User::create($userData);
        return response()->json($user, 201);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::with('role')->findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'first_name' => 'required|string|max:55',
            'middle_name' => 'nullable|string|max:55',
            'last_name' => 'required|string|max:55',
            'suffix_name' => 'nullable|string|max:55',
            'age' => 'required|string',
            'gender' => 'required|in:female,male,others',
            'contact' => 'required|string|max:55',
            'address' => 'required|string|max:255',
            'role_id' => 'required|exists:tbl_roles,role_id',
            'email' => 'required|string|email|max:55|unique:tbl_users,email,' . $id . ',user_id',
            'password' => 'nullable|string|min:6',
            'profile_image' => 'nullable|image|max:2048',
        ]);

        $userData = $request->except('profile_image');

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('profile_image')) {
            $userData['profile_image'] = $request->file('profile_image')->store('profile_images', 'public');
        }

        $user->update($userData);
        return response()->json($user);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(null, 204);
    }
}
