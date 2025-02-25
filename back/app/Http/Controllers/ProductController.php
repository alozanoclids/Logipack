<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Products;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // Método para obtener todos los registros de product y devolverlos en formato JSON
    public function getproduct(): JsonResponse
    {
        // Se obtiene la colección de todos los products desde la base de datos
        $product = Products::all();

        // Se devuelve la colección de products en formato JSON
        return response()->json($product);
    }

    // Método para crear un nuevo product
    public function newproduct(Request $request): JsonResponse
    {
        // Se valida que el campo 'name' sea obligatorio, de tipo string y con máximo 255 caracteres
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Se crea un nuevo registro en la tabla product  
        // - Si no, se guarda un array vacío codificado a JSON.
        $product = Products::create([
            'name' => $request->name,
        ]);

        // Se devuelve una respuesta JSON con un mensaje de éxito y el objeto product creado, usando el código HTTP 201 (Creado)
        return response()->json([
            'message' => 'Línea creada exitosamente',
            'product' => $product
        ], 201);
    }

    // Método para obtener un product específico por su ID
    public function productId($id): JsonResponse
    {
        // Se busca el product por el ID proporcionado
        $product = Products::find($id);

        // Si no se encuentra, se devuelve un mensaje de error con código 404 (No Encontrado)
        if (!$product) {
            return response()->json(['message' => 'product no encontrada'], 404);
        }

        // Si se encuentra, se devuelve el product en formato JSON
        return response()->json($product);
    }

    // Método para actualizar un product existente
    public function updateproduct(Request $request, $id): JsonResponse
    {
        // Se busca el product por el ID proporcionado
        $product = Products::find($id);

        // Si el product no existe, se retorna un mensaje de error con código 404
        if (!$product) {
            return response()->json(['message' => 'product no encontrada'], 404);
        }

        // Se valida que, si se envía, el campo 'name' sea de tipo string y tenga un máximo de 255 caracteres
        $request->validate([
            'name' => 'sometimes|string|max:255',
        ]);

        // Se actualiza el product con todos los datos enviados en la solicitud
        $product->update($request->all());

        // Se devuelve una respuesta JSON con un mensaje de éxito y el product actualizado
        return response()->json([
            'message' => 'product actualizada correctamente',
            'product' => $product
        ]);
    }

    // Método para eliminar un product por su ID
    public function deleteproduct($id): JsonResponse
    {
        // Se busca el product por el ID proporcionado
        $product = Products::find($id);

        // Si no se encuentra, se devuelve un mensaje de error con código 404
        if (!$product) {
            return response()->json(['message' => 'product no encontrada'], 404);
        }

        // Se elimina el product de la base de datos
        $product->delete();

        // Se devuelve una respuesta JSON con un mensaje indicando que la eliminación fue exitosa
        return response()->json(['message' => 'product eliminada correctamente']);
    }
}