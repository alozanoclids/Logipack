<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Clients;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ClientsController extends Controller
{
    public function getClientData()
    {
        $response = Http::get('http://129.146.151.238/whatsapp_api/clientes.php?lista_clientes');
        if ($response->successful()) {
            return response()->json($response->json(), 200);
        }
        return response()->json(['error' => 'Failed to fetch data'], 500);
    }

    public function getClientDataApi()
    {
        // Consumir el API externo
        $response = Http::get('http://129.146.151.238/whatsapp_api/clientes.php?lista_clientes');

        if ($response->successful()) {
            $data = $response->json(); // Obtener los datos de la API externa

            $clientsArray = [];

            foreach ($data as $client) {
                // Verificar si el cliente ya existe en la base de datos
                $existingClient = Clients::where('code', $client['codigo_cliente'])->first();

                if (!$existingClient) {
                    // Guardar los datos en la base de datos solo si no existen
                    Clients::create([
                        'name' => $client['descripcion_cliente'],
                        'code' => $client['codigo_cliente'],
                    ]);
                }

                // Agregar al array de respuesta
                $clientsArray[] = [
                    'codigo_cliente' => $client['codigo_cliente'],
                    'descripcion_cliente' => $client['descripcion_cliente'],
                ];
            }

            return response()->json([
                'message' => 'Clients saved successfully',
                'data' => $clientsArray
            ], 200);
        }

        return response()->json(['error' => 'Failed to fetch data'], 500);
    }

    // Obtener todos los Clientes
    public function getClients(): JsonResponse
    {
        $clients = Clients::all();

        if ($clients->isEmpty()) {
            // Llamar a la API para obtener datos y guardarlos
            $this->getClientDataApi();
            // Volver a obtener los clientes después de la inserción
            $clients = Clients::all();
        }

        return response()->json($clients);
    }


    public function newClients(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255', // Ahora es obligatorio
            'email' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'job_position' => 'required|string|max:255',
            'responsible_person' => 'nullable|array'
        ]);

        // Crear el cliente correctamente
        $Clients = Clients::create([
            'name' => $request->name,
            'code' => $request->code,
            'email' => $request->email,
            'phone' => $request->phone,
            'job_position' => $request->job_position,
            'responsible_person' => json_encode($request->responsible_person ?? [])
        ]);

        return response()->json([
            'message' => 'Cliente creado exitosamente',
            'Clients' => $Clients
        ], 201);
    }

    // Obtener una Cliente por ID
    public function ClientsId($id): JsonResponse
    {
        $Clients = Clients::find($id);
        if (!$Clients) {
            return response()->json(['message' => 'Cliente no encontrada'], 404);
        }
        return response()->json($Clients);
    }

    // Actualizar una Cliente
    public function updateClients(Request $request, $id): JsonResponse
    {
        $Clients = Clients::find($id);
        if (!$Clients) {
            return response()->json(['message' => 'Cliente no encontrada'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => '',
            'email' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'job_position' => 'required|string|max:255',
            'responsible_person' => 'nullable|array'
        ]);

        $Clients->update($request->all());

        return response()->json([
            'message' => 'Cliente actualizada correctamente',
            'Clients' => $Clients
        ]);
    }

    // Eliminar una Cliente
    public function deleteClients($id): JsonResponse
    {
        $Clients = Clients::find($id);
        if (!$Clients) {
            return response()->json(['message' => 'Cliente no encontrada'], 404);
        }

        $Clients->delete();

        return response()->json(['message' => 'Cliente eliminada correctamente']);
    }
}