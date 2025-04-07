<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Adaptation;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AdaptationController extends Controller
{
    public function newAdaptation(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'client_id'           => 'required|exists:clients,id',
                'order_number'        => 'required|string',
                'delivery_date'       => 'required|date',
                'article_code'        => 'required|json',
                'lot'                 => 'required|string',
                'health_registration' => 'required|string',
                'quantity_to_produce' => 'required|integer',
                'attachment'          => 'nullable|file',
                'master'              => 'nullable|json',
                'bom'                 => 'nullable|json',
                'ingredients'         => 'nullable|json',
            ]);

            // Si hay un archivo adjunto, guardarlo
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $filePath = $file->store('attachments', 'public'); // Guarda en storage/app/public/attachments
                $validatedData['attachment'] = $filePath;
            }

            $adaptation = Adaptation::create($validatedData);

            return response()->json([
                'message'    => 'Adaptation saved successfully',
                'adaptation' => $adaptation
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'error'   => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error saving adaptation',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getAdaptation(Request $request)
    {
        try {
            $adaptations = Adaptation::all();

            return response()->json([
                'adaptations' => $adaptations
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error retrieving adaptations',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getAdaptationById($id)
    {
        try {
            $adaptation = Adaptation::findOrFail($id);

            return response()->json([
                'adaptation' => $adaptation
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Adaptation not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error retrieving adaptation',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function updateAdaptation(Request $request, $id)
    {
        try {
            $adaptation = Adaptation::findOrFail($id);

            $validatedData = $request->validate([
                'client_id'           => 'required|exists:clients,id',
                'order_number'        => 'required|string',
                'delivery_date'       => 'required|date',
                'article_code'        => 'required|json',
                'lot'                 => 'required|string',
                'health_registration' => 'required|string',
                'quantity_to_produce' => 'required|integer',
                'attachment'          => 'nullable|file',
                'master'              => 'nullable|json',
                'bom'                 => 'nullable|json',
                'ingredients'         => 'nullable|json',
            ]);

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $filePath = $file->store('attachments', 'public');
                $validatedData['attachment'] = $filePath;
            }

            $adaptation->update($validatedData);

            return response()->json([
                'message'    => 'Adaptation updated successfully',
                'adaptation' => $adaptation
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Adaptation not found'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'error'   => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error updating adaptation',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteAdaptation($id)
    {
        try {
            $adaptation = Adaptation::findOrFail($id);
            $adaptation->delete();

            return response()->json([
                'message' => 'Adaptation deleted successfully'
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Adaptation not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => 'Error deleting adaptation',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}