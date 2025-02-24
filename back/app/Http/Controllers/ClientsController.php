<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Clients;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientsController extends Controller
{
    // Obtener todas las fábricas
    public function getClients(): JsonResponse
    {
        $Clients = Clients::all();
        return response()->json($Clients);
    }

    public function newClients(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'line_types' => 'nullable|array' // Validamos que sea un array si se envía
        ]);

        // Guardamos correctamente el name y el JSON
        $Clients = Clients::create([
            'name' => $request->name,
            'line_types' => $request->has('line_types') ? json_encode($request->line_types) : json_encode([])
        ]);

        return response()->json([
            'message' => 'Línea creada exitosamente',
            'Clients' => $Clients
        ], 201);
    }


    // Obtener una fábrica por ID
    public function ClientsId($id): JsonResponse
    {
        $Clients = Clients::find($id);
        if (!$Clients) {
            return response()->json(['message' => 'Fábrica no encontrada'], 404);
        }
        return response()->json($Clients);
    }

    // Actualizar una fábrica
    public function updateClients(Request $request, $id): JsonResponse
    {
        $Clients = Clients::find($id);
        if (!$Clients) {
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

        $Clients->update($request->all());

        return response()->json([
            'message' => 'Fábrica actualizada correctamente',
            'Clients' => $Clients
        ]);
    }

    // Eliminar una fábrica
    public function deleteClients($id): JsonResponse
    {
        $Clients = Clients::find($id);
        if (!$Clients) {
            return response()->json(['message' => 'Fábrica no encontrada'], 404);
        }

        $Clients->delete();

        return response()->json(['message' => 'Fábrica eliminada correctamente']);
    }
}