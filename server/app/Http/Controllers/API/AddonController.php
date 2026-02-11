<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Addon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddonController extends Controller
{
    public function index(): JsonResponse
    {
        $addons = Addon::orderBy('name')->get();
        return response()->json($addons);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->has('addons') && is_string($request->input('addons'))) {
            $request->merge(['addons' => json_decode($request->input('addons'), true) ?? []]);
        }
        $request->validate([
            'addons' => 'required|array|min:1',
            'addons.*.name' => 'required|string|max:255',
            'addons.*.price' => 'required|numeric|min:0',
        ]);

        $addonsData = $request->input('addons');
        $created = [];

        foreach ($addonsData as $i => $row) {
            $imagePath = null;
            if ($request->hasFile('addon_image_' . $i)) {
                $file = $request->file('addon_image_' . $i);
                if ($file->isValid()) {
                    $imagePath = $file->store('addons', 'public');
                }
            }
            $addon = Addon::create([
                'name' => $row['name'],
                'price' => $row['price'],
                'image' => $imagePath,
            ]);
            $created[] = $addon;
        }

        return response()->json($created, 201);
    }
}
