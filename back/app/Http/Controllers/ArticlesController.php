<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Bom;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class ArticlesController extends Controller
{

    public function getArticlesByCoddiv($code)
    {
        try {
            // Llamada a la API con interpolación correcta de la variable
            $response = Http::get("http://129.146.161.23/BackEnd_Orion/lista_articulos.php?coddiv=" . urlencode($code));

            // Verifica si la respuesta es exitosa
            if ($response->successful()) {
                $data = $response->json();

                // Validar que la API devolvió datos en formato esperado
                if (!is_array($data) || empty($data)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No se encontraron artículos para este código.',
                        'data' => []
                    ], 404);
                }

                // Devolver los artículos en formato JSON
                return response()->json([
                    'success' => true,
                    'data' => $data
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al obtener artículos. Código HTTP: ' . $response->status()
                ], $response->status());
            }
        } catch (\Exception $e) {
            // Manejo de errores si la API no responde o hay otro problema
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error inesperado al obtener los artículos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllBoms()
    {
        try {
            $boms = Bom::all();

            return response()->json(['boms' => $boms], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener los BOMs', 'details' => $e->getMessage()], 500);
        }
    }

    public function newArticle(Request $request)
    {
        try {
            // Validamos la entrada
            $validatedData = $request->validate([
                'client_id' => 'required|exists:clients,id',
                'base_quantity' => 'nullable|numeric',
                'details' => 'required|json',
            ]);

            // Creamos el BOM
            $bom = Bom::create([
                'client_id' => $validatedData['client_id'],
                'base_quantity' => $validatedData['base_quantity'] ?? 0,
                'details' => $validatedData['details'],
            ]);

            return response()->json(['message' => 'BOM guardado exitosamente', 'bom' => $bom], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al guardar el BOM', 'details' => $e->getMessage()], 500);
        }
    }

    public function getArticleById($id)
    {
        try {
            $bom = Bom::find($id);

            if (!$bom) {
                return response()->json(['message' => 'BOM no encontrado'], 404);
            }

            return response()->json(['bom' => $bom], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener el BOM', 'details' => $e->getMessage()], 500);
        }
    }

    public function updateArticle(Request $request, $id)
    {
        try {
            $bom = Bom::find($id);

            if (!$bom) {
                return response()->json(['message' => 'BOM no encontrado'], 404);
            }

            $validatedData = $request->validate([
                'client_id' => 'required|exists:clients,id',
                'base_quantity' => 'nullable|numeric',
                'details' => 'required|json',
            ]);

            $bom->client_id = $validatedData['client_id'];
            $bom->base_quantity = $validatedData['base_quantity'] ?? 0;
            $bom->details = $validatedData['details'];
            $bom->save();

            return response()->json(['message' => 'BOM actualizado exitosamente', 'bom' => $bom], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al actualizar el BOM', 'details' => $e->getMessage()], 500);
        }
    }

    public function deleteArticle($id)
    {
        try {
            $bom = Bom::find($id);

            if (!$bom) {
                return response()->json(['message' => 'BOM no encontrado'], 404);
            }

            $bom->delete();

            return response()->json(['message' => 'BOM eliminado exitosamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar el BOM', 'details' => $e->getMessage()], 500);
        }
    }
}