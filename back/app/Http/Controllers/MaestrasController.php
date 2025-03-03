<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Maestra;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaestrasController extends Controller
{
    // Obtener todas las Maestras
    public function getMaestra(): JsonResponse
    {
        $Maestra = Maestra::all();
        return response()->json($Maestra);
    }

    public function newMaestra(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'code' => 'required|string|unique:maestras',
            'descripcion' => 'required|string',
            'requiere_bom' => 'boolean',
            'type_product' => 'array',
            'status' => 'required|in:En creación,Revisión,Aprobada,Obsoleta',
            'aprobado' => 'boolean',
        ]);

        // Creating the new Maestra record
        $Maestra = Maestra::create([
            'code' => $validatedData['code'],
            'descripcion' => $validatedData['descripcion'],
            'requiere_bom' => $validatedData['requiere_bom'],
            'type_product' => json_encode($validatedData['type_product']),
            'status' => $validatedData['status'],
            'aprobado' => $validatedData['aprobado'],
        ]);

        return response()->json([
            'message' => 'Línea creada exitosamente',
            'Maestra' => $Maestra
        ], 201);
    }

    // Obtener una Maestra por ID
    public function MaestraId($id): JsonResponse
    {
        $Maestra = Maestra::find($id);
        if (!$Maestra) {
            return response()->json(['message' => 'Maestra no encontrada'], 404);
        }
        return response()->json($Maestra);
    }

    // Actualizar una Maestra
    public function updateMaestra(Request $request, $id): JsonResponse
    {
        $Maestra = Maestra::find($id);
        if (!$Maestra) {
            return response()->json(['message' => 'Maestrafactura no encontrada'], 404);
        }

        $request->validate([
            'code' => 'required|string|unique:maestras',
            'descripcion' => 'required|string',
            'requiere_bom' => 'boolean',
            'type_product' => 'array',
            'status' => 'required|in:En creación,Revisión,Aprobada,Obsoleta',
            'aprobado' => 'boolean',
        ]);

        $Maestra->update($request->all());

        return response()->json([
            'message' => 'Maestrafactura actualizada correctamente',
            'Maestra' => $Maestra
        ]);
    }

    // Eliminar una Maestra
    public function deleteMaestra($id): JsonResponse
    {
        $Maestra = Maestra::find($id);
        if (!$Maestra) {
            return response()->json(['message' => 'Maestra no encontrada'], 404);
        }

        $Maestra->delete();

        return response()->json(['message' => 'Maestra eliminada correctamente']);
    }
}