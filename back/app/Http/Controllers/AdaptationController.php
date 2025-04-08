<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Adaptation;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile as LaravelUploadedFile;
use Symfony\Component\HttpFoundation\File\UploadedFile as SymfonyUploadedFile;


class AdaptationController extends Controller
{
    public function newAdaptation(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'client_id'    => 'required|exists:clients,id',
                'article_code' => 'required|json',
                'attachment'   => 'nullable|file',
                'master'       => 'nullable|json',
                'bom'          => 'nullable|json',
                'ingredients'  => 'nullable|json',
            ]);

            $articleAttachments = [];

            // 🧩 Archivo plano general (cuando hay solo uno, sin codart)
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');

                // 🧼 Nombre: general_20250408_165432.pdf
                $filename = 'general_' . now()->format('Ymd_His') . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('attachments', $filename, 'public');

                // 🧠 Guardamos como si fuera parte del array (clave 'general')
                $articleAttachments['general'] = $path;
            }

            // 🔥 Archivos por artículo (attachment_10197-0053, etc)
            foreach ($request->files as $key => $file) {
                if (Str::startsWith($key, 'attachment_')) {
                    $codart = Str::after($key, 'attachment_');

                    if (!$file instanceof LaravelUploadedFile && $file instanceof SymfonyUploadedFile) {
                        $file = LaravelUploadedFile::createFromBase($file);
                    }

                    // 🧼 Sanitiza codart
                    $safeCodart = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $codart);

                    // 🧾 Nombre: codart_20250408_165432.ext
                    $filename = $safeCodart . '_' . now()->format('Ymd_His') . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('attachments', $filename, 'public');

                    $articleAttachments[$codart] = $path;
                }
            }

            // 🧷 Unificamos: plano o por artículo, siempre se guarda en attachment
            if (!empty($articleAttachments)) {
                $validatedData['attachment'] = json_encode($articleAttachments);
            }

            // 💾 Creamos la adaptación
            $adaptation = Adaptation::create($validatedData);

            return response()->json([
                'message'       => 'Adaptation saved successfully',
                'adaptation'    => $adaptation,
                'article_files' => $articleAttachments,
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
                'client_id'    => 'required|exists:clients,id',
                'article_code' => 'required|json',
                'attachment'   => 'nullable|file',
                'master'       => 'nullable|json',
                'bom'          => 'nullable|json',
                'ingredients'  => 'nullable|json',
            ]);

            $articleAttachments = [];

            $oldAttachments = json_decode($adaptation->attachment, true) ?? [];

            foreach ($request->files as $key => $file) {
                if (Str::startsWith($key, 'attachment_')) {
                    $codart = Str::after($key, 'attachment_');

                    // 🧽 Convertir archivo si viene como SymfonyUploadedFile
                    if ($file instanceof SymfonyUploadedFile && !$file instanceof LaravelUploadedFile) {
                        $file = LaravelUploadedFile::createFromBase($file);
                    }

                    // 🧨 Eliminar el viejo si existe
                    if (isset($oldAttachments[$codart])) {
                        Storage::disk('public')->delete($oldAttachments[$codart]);
                    }

                    $filename = $codart . '_' . now()->format('Ymd_His') . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('attachments', $filename, 'public');
                    $articleAttachments[$codart] = $path;
                }
            }

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');

                // Convertir si hace falta
                if ($file instanceof SymfonyUploadedFile && !$file instanceof LaravelUploadedFile) {
                    $file = LaravelUploadedFile::createFromBase($file);
                }

                // Eliminar viejo si es un archivo plano
                if (is_string($adaptation->attachment)) {
                    Storage::disk('public')->delete($adaptation->attachment);
                }

                $filename = 'plano_' . now()->format('Ymd_His') . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('attachments', $filename, 'public');
                $validatedData['attachment'] = $filePath;
            }

            if (!empty($articleAttachments)) {
                $validatedData['attachment'] = json_encode($articleAttachments);
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