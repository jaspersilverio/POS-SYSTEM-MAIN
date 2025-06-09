<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function loadRoles()
    {
        $roles = Role::all();
        return response()->json([
            'roles' => $roles,

        ], 200);
    }

    public function storeRole(Request $request)
    {
        $validated = $request->validate([
            'roleName' => ['required', 'min: 4', 'max: 50'],
            'roleDesc' => ['nullable', 'max:255'], // ALLOW description
        ]);

        Role::create([
            'role_name' => $validated['roleName'],
            'description' => $validated['roleDesc']
        ]);

        return response()->json([
            'message' => 'Role created successfully',

        ], 200);
    }

    public function updateRole(Request $request, $id)
    {
        $validated = $request->validate([
            'roleName' => ['required', 'min: 4', 'max: 50'],
            'roleDesc' => ['nullable', 'max:255'],
        ]);

        $role = Role::findOrFail($id);
        $role->update([
            'role_name' => $validated['roleName'],
            'description' => $validated['roleDesc']
        ]);

        return response()->json([
            'message' => 'Role updated successfully',
        ], 200);
    }

    // to delete role
    public function deleteRole($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully',
        ], 200);
    }
}
