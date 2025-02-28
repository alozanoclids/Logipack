<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Factory;
use Illuminate\Http\JsonResponse;

class FactoryController extends Controller
{
    // Obtener todas las fábricas
    public function getFactories(): JsonResponse
    {
        $factories = Factory::all();
        return response()->json($factories);
    }

    // Crear una nueva fábrica
    public function newFactory(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'capacity' => 'required|string|min:1',
            'manager' => 'required|string|max:255',
            'employees' => 'required|string|min:1',
            'status' => 'required|boolean',
        ]);

        $factory = Factory::create($request->all());

        return response()->json([
            'message' => 'Fábrica creada exitosamente',
            'factory' => $factory
        ], 201);
    }

    // Obtener una fábrica por ID
    public function factoryId($id): JsonResponse
    {
        $factory = Factory::find($id);
        if (!$factory) {
            return response()->json(['message' => 'Fábrica no encontrada'], 404);
        }
        return response()->json($factory);
    }

    // Actualizar una fábrica
    public function updateFactory(Request $request, $id): JsonResponse
    {
        $factory = Factory::find($id);
        if (!$factory) {
            return response()->json(['message' => 'Fábrica no encontrada'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'capacity' => 'sometimes|string|min:1',
            'manager' => 'sometimes|string|max:255',
            'employees' => 'sometimes|string|min:0',
            'status' => 'sometimes|boolean',
        ]);

        $factory->update($request->all());

        return response()->json([
            'message' => 'Fábrica actualizada correctamente',
            'factory' => $factory
        ]);
    }

    // Eliminar una fábrica
    public function deleteFactory($id): JsonResponse
    {
        $factory = Factory::find($id);
        if (!$factory) {
            return response()->json(['message' => 'Fábrica no encontrada'], 404);
        }

        $factory->delete();

        return response()->json(['message' => 'Fábrica eliminada correctamente']);
    }
}