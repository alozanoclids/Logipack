<?php

namespace App\Http\Controllers;

use App\Models\Consecutive;
use Illuminate\Http\JsonResponse;

class ConsecutiveController extends Controller
{
    /**
     * Obtener todos los consecutivos.
     */
    public function getAll(): JsonResponse
    {
        $consecutives = Consecutive::all();

        return response()->json([
            'consecutives' => $consecutives
        ]);
    }
}