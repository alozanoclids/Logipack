<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Adaptation;
use App\Models\Maestra;
use App\Models\AdaptationDate;
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
                'number_order' => 'required|string',
                'factory_id' => 'required|exists:factories,id',
            ]);

            $articleAttachments = [];

            // 🧩 Archivo plano general
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $filename = 'general_' . now()->format('Ymd_His') . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('attachments', $filename, 'public');
                $articleAttachments['general'] = $path;
            }

            // 🔥 Archivos por artículo
            foreach ($request->files as $key => $file) {
                if (Str::startsWith($key, 'attachment_')) {
                    $codart = Str::after($key, 'attachment_');

                    if (!$file instanceof LaravelUploadedFile && $file instanceof SymfonyUploadedFile) {
                        $file = LaravelUploadedFile::createFromBase($file);
                    }

                    $safeCodart = preg_replace('/[^A-Za-z0-9_\-\.]/', '_', $codart);
                    $filename = $safeCodart . '_' . now()->format('Ymd_His') . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('attachments', $filename, 'public');
                    $articleAttachments[$codart] = $path;
                }
            }

            if (!empty($articleAttachments)) {
                $validatedData['attachment'] = json_encode($articleAttachments);
            }

            // 💾 Crear Adaptation
            $adaptation = Adaptation::create($validatedData);

            // 🧠 Obtener duración desde master (si aplica)
            $masterDuration = null;
            if (!empty($validatedData['master'])) {
                $masterData = json_decode($validatedData['master'], true);
                if (isset($masterData['id'])) {
                    $master = Maestra::find($masterData['id']);
                    if ($master) {
                        $masterDuration = $master->duration;
                    }
                }
            }

            // 🔁 Guardar en adaptation_dates
            $articleCodes = json_decode($validatedData['article_code'], true);
            foreach ($articleCodes as $article) {
                AdaptationDate::create([
                    'client_id'           => $validatedData['client_id'],
                    'factory_id'          => $validatedData['factory_id'],
                    'codart'              => $article['codart'],
                    'number_order'        => $article['number_order'],
                    'orderNumber'         => $article['orderNumber'],
                    'deliveryDate'        => $article['deliveryDate'],
                    'quantityToProduce'   => $article['quantityToProduce'],
                    'lot'                 => $article['lot'],
                    'healthRegistration'  => $article['healthRegistration'],
                    'master'              => $validatedData['master'],
                    'bom'                 => $validatedData['bom'],
                    'ingredients'         => $validatedData['ingredients'],
                    'adaptation_id'       => $adaptation->id,
                    'duration'            => $masterDuration,
                ]);
            }

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
                'factory_id'   => 'required|exists:factories,id',
                'article_code' => 'required|json',
                'number_order' => 'required|string',
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

                    if ($file instanceof SymfonyUploadedFile && !$file instanceof LaravelUploadedFile) {
                        $file = LaravelUploadedFile::createFromBase($file);
                    }

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

                if ($file instanceof SymfonyUploadedFile && !$file instanceof LaravelUploadedFile) {
                    $file = LaravelUploadedFile::createFromBase($file);
                }

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

            // 🔄 Decodificar JSON a array si existen
            $validatedData['master'] = isset($validatedData['master']) ? json_decode($validatedData['master'], true) : null;
            $validatedData['bom'] = isset($validatedData['bom']) ? json_decode($validatedData['bom'], true) : null;
            $validatedData['ingredients'] = isset($validatedData['ingredients']) ? json_decode($validatedData['ingredients'], true) : null;

            $masterDuration = null;
            if (!empty($validatedData['master']) && isset($validatedData['master']['id'])) {
                $master = Maestra::find($validatedData['master']['id']);
                if ($master) {
                    $masterDuration = $master->duration;
                }
            }

            $adaptation->update($validatedData);
            $articleCodes = json_decode($validatedData['article_code'], true);
            foreach ($articleCodes as $article) {
                AdaptationDate::updateOrCreate(
                    [
                        'adaptation_id' => $adaptation->id,
                        'codart'        => $article['codart'],
                    ],
                    [
                        'client_id'           => $validatedData['client_id'],
                        'factory_id'          => $validatedData['factory_id'],
                        'number_order'        => $validatedData['number_order'],
                        'orderNumber'         => $article['orderNumber'],
                        'deliveryDate'        => $article['deliveryDate'],
                        'quantityToProduce'   => $article['quantityToProduce'],
                        'lot'                 => $article['lot'],
                        'healthRegistration'  => $article['healthRegistration'],
                        'master'              => $validatedData['master'],
                        'bom'                 => $validatedData['bom'],
                        'ingredients'         => $validatedData['ingredients'],
                        'duration'            => $masterDuration,
                    ]
                );
            }

            return response()->json([
                'message'    => 'Adaptation updated successfully',
                'adaptation' => $adaptation
            ], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Adaptation not found'], 404);
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
            AdaptationDate::where('adaptation_id', $adaptation->id)->delete();
            $adaptation->delete();
            return response()->json([
                'message' => 'Adaptation and related dates deleted successfully'
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