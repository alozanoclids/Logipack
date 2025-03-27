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
            'descripcion' => 'required|string',
            'requiere_bom' => 'required|boolean',
            'type_product' => 'required|json',
            'type_stage' => 'required|json',
            'status_type' => 'required|string',
            'aprobado' => 'required|boolean',
        ]);

        // Generar código autoincremental manualmente
        $lastCode = Maestra::max('code') ?? 0;
        $validatedData['code'] = $lastCode + 1;

        // Crear la nueva Fase
        $Maestra = Maestra::create($validatedData);

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
            'descripcion' => 'required|string',
            'requiere_bom' => 'required|boolean',
            'type_product' => 'required|json',
            'type_stage' => 'required|json',
            'status_type' => 'required|string',
            'aprobado' => 'required|boolean',
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