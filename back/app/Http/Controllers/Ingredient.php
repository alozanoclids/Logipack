<?php

namespace App\Http\Controllers;

use App\Models\Ingredients;
use Illuminate\Http\Request;

class Ingredient extends Controller
{ // Obtener todos los ingredientes activos
    public function index()
    {
        $ingredients = Ingredients::where('status', true)->get(); // Ahora usa la columna status
        return response()->json($ingredients);
    }

    // Obtener un ingrediente por ID
    public function show($id)
    {
        $ingredient = Ingredients::find($id);

        if (!$ingredient || !$ingredient->isActive()) {
            return response()->json(['error' => 'Ingrediente no encontrado o desactivado'], 404);
        }

        return response()->json($ingredient);
    }


    // Eliminar un ingrediente permanentemente
    public function destroy($id)
    {
        $ingredient = Ingredients::find($id);

        if (!$ingredient) {
            return response()->json(['error' => 'Ingrediente no encontrado'], 404);
        }

        $ingredient->delete(); // Elimina el ingrediente de la base de datos

        return response()->json(['message' => 'Ingrediente eliminado correctamente']);
    }

// Crear un nuevo ingrediente
public function store(Request $request)
{
    $request->validate([
        'data.nombre' => 'required|string',
        'data.proveedor' => 'required|string',
        'data.serial' => 'required|string',
        'data.tipo' => 'required|string',
        'data.concentracion' => 'required|string',
    ]);

    $ingredient = Ingredients::create([
        'data' => $request->input('data'), // Envía el objeto directamente
        'status' => true,
    ]);

    return response()->json($ingredient, 201);
}
    // Actualizar un ingrediente
    public function update(Request $request, $id)
    {
        $ingredient = Ingredients::find($id);
    
        if (!$ingredient) {
            return response()->json(['error' => 'Ingrediente no encontrado'], 404);
        }
    
        // Validar los campos que podrían venir en la petición
        $request->validate([
            'nombre' => 'string|nullable',
            'proveedor' => 'string|nullable',
            'serial' => 'string|nullable',
            // Agrega más validaciones si es necesario
        ]);
    
        // Obtener los datos actuales del campo JSON `data`
        $currentData = $ingredient->data ?? [];
    
        // Fusionar los datos actuales con los nuevos (sin eliminar valores previos)
        $updatedData = array_merge($currentData, $request->all());
    
        // Guardar el JSON actualizado en la base de datos
        $ingredient->update(['data' => $updatedData]);
    
        return response()->json($ingredient);
    }
    
    // Desactivar un ingrediente
    public function deactivate($id)
    {
        $ingredient = Ingredients::find($id);

        if (!$ingredient) {
            return response()->json(['error' => 'Ingrediente no encontrado'], 404);
        }

        $ingredient->update(['status' => false]); // Ahora se actualiza la columna status

        return response()->json(['message' => 'Ingrediente desactivado']);
    }
}