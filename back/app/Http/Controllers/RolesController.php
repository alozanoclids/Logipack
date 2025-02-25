<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RolesController extends Controller
{
    // Método para obtener todos los registros de Role y devolverlos en formato JSON
    public function getRole(): JsonResponse
    {
        // Se obtiene la colección de todos los roles desde la base de datos
        $Role = Role::all();

        // Se devuelve la colección de roles en formato JSON
        return response()->json($Role);
    }

    // Método para crear un nuevo Role
    public function newRole(Request $request): JsonResponse
    {
        // Se valida que el campo 'name' sea obligatorio, de tipo string y con máximo 255 caracteres
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Se crea un nuevo registro en la tabla Role  
        // - Si no, se guarda un array vacío codificado a JSON.
        $Role = Role::create([
            'name' => $request->name, 
        ]);

        // Se devuelve una respuesta JSON con un mensaje de éxito y el objeto Role creado, usando el código HTTP 201 (Creado)
        return response()->json([
            'message' => 'Línea creada exitosamente',
            'Role' => $Role
        ], 201);
    }

    // Método para obtener un Role específico por su ID
    public function RoleId($id): JsonResponse
    {
        // Se busca el Role por el ID proporcionado
        $Role = Role::find($id);

        // Si no se encuentra, se devuelve un mensaje de error con código 404 (No Encontrado)
        if (!$Role) {
            return response()->json(['message' => 'Role no encontrada'], 404);
        }

        // Si se encuentra, se devuelve el Role en formato JSON
        return response()->json($Role);
    }

    // Método para actualizar un Role existente
    public function updateRole(Request $request, $id): JsonResponse
    {
        // Se busca el Role por el ID proporcionado
        $Role = Role::find($id);

        // Si el Role no existe, se retorna un mensaje de error con código 404
        if (!$Role) {
            return response()->json(['message' => 'Role no encontrada'], 404);
        }

        // Se valida que, si se envía, el campo 'name' sea de tipo string y tenga un máximo de 255 caracteres
        $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        // Se actualiza el Role con todos los datos enviados en la solicitud
        $Role->update($request->all());

        // Se devuelve una respuesta JSON con un mensaje de éxito y el Role actualizado
        return response()->json([
            'message' => 'Role actualizada correctamente',
            'Role' => $Role
        ]);
    }

    // Método para eliminar un Role por su ID
    public function deleteRole($id): JsonResponse
    {
        // Se busca el Role por el ID proporcionado
        $Role = Role::find($id);

        // Si no se encuentra, se devuelve un mensaje de error con código 404
        if (!$Role) {
            return response()->json(['message' => 'Role no encontrada'], 404);
        }

        // Se elimina el Role de la base de datos
        $Role->delete();

        // Se devuelve una respuesta JSON con un mensaje indicando que la eliminación fue exitosa
        return response()->json(['message' => 'Role eliminada correctamente']);
    }
}