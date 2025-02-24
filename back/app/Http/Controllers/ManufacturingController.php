<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Manufacturing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManufacturingController extends Controller
{
    // Obtener todas las fábricas
    public function getManu(): JsonResponse
    {
        $Manu = Manufacturing::all();
        return response()->json($Manu);
    }

    public function newManu(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'line_types' => 'nullable|array' // Validamos que sea un array si se envía
        ]);

        // Guardamos correctamente el name y el JSON
        $Manu = Manufacturing::create([
            'name' => $request->name,
            'line_types' => $request->has('line_types') ? json_encode($request->line_types) : json_encode([])
        ]);

        return response()->json([
            'message' => 'Línea creada exitosamente',
            'Manu' => $Manu
        ], 201);
    }


    // Obtener una fábrica por ID
    public function ManuId($id): JsonResponse
    {
        $Manu = Manufacturing::find($id);
        if (!$Manu) {
            return response()->json(['message' => 'Fábrica no encontrada'], 404);
        }
        return response()->json($Manu);
    }

    // Actualizar una fábrica
    public function updateManu(Request $request, $id): JsonResponse
    {
        $Manu = Manufacturing::find($id);
        if (!$Manu) {
            return response()->json(['message' => 'Fábrica no encontrada'], 404);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'capacity' => 'sometimes|integer|min:1',
            'manager' => 'sometimes|string|max:255',
            'employees' => 'sometimes|integer|min:0',
            'status' => 'sometimes|boolean',
        ]);

        $Manu->update($request->all());

        return response()->json([
            'message' => 'Fábrica actualizada correctamente',
            'Manu' => $Manu
        ]);
    }

    // Eliminar una fábrica
    public function deleteManu($id): JsonResponse
    {
        $Manu = Manufacturing::find($id);
        if (!$Manu) {
            return response()->json(['message' => 'Fábrica no encontrada'], 404);
        }

        $Manu->delete();

        return response()->json(['message' => 'Fábrica eliminada correctamente']);
    }
}