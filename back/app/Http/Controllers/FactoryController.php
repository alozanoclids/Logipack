<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Factory;
use Illuminate\Http\JsonResponse;
use App\Models\Consecutive;
use Illuminate\Support\Carbon;

class FactoryController extends Controller
{
    // Obtener todas las fábricas
    public function getFactories(): JsonResponse
    {
        $factories = Factory::with('manufacturings')->get();
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
            'employees' => 'required',
            'status' => 'required|boolean',
            'prefix' => 'required|string',
        ]);

        $factory = Factory::create($request->all());

        // Obtener fecha actual
        $now = Carbon::now();
        $month = $now->format('m');
        $year = $now->format('Y');
        $prefix = $request->prefix;

        // Buscar el último consecutive con este prefijo, mes y año
        $last = Consecutive::where('prefix', $prefix)
            ->where('month', $month)
            ->where('year', $year)
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = $last
            ? (int) $last->consecutive + 1
            : 1;

        $consecutiveFormatted = str_pad($nextNumber, 7, '0', STR_PAD_LEFT);

        // Crear el nuevo consecutive
        Consecutive::create([
            'prefix' => $prefix,
            'month' => $month,
            'year' => $year,
            'consecutive' => $consecutiveFormatted,
        ]);

        return response()->json([
            'message' => 'Fábrica creada exitosamente con consecutive',
            'factory' => $factory,
            'consecutive' => $prefix . '-' . $month . '-' . $year . '-' . $consecutiveFormatted
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
            'prefix' => 'sometimes|string',
        ]);

        // Verifica si se envió un nuevo prefijo
        if ($request->has('prefix') && $request->prefix !== $factory->prefix) {
            $oldPrefix = $factory->prefix;
            $newPrefix = $request->prefix;

            // Actualiza todos los consecutives que tengan el prefijo anterior
            \App\Models\Consecutive::where('prefix', $oldPrefix)->update([
                'prefix' => $newPrefix
            ]);
        }

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