<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Clients;
use Illuminate\Support\Facades\Http;

class FetchClientData extends Command
{
    protected $signature = 'fetch:clients'; // Nombre del comando

    protected $description = 'Obtiene clientes de la API externa y los guarda en la base de datos';

    public function handle()
    {
        $this->info('Obteniendo datos de clientes...');

        // Consumir el API externo
        $response = Http::get('http://129.146.151.238/whatsapp_api/clientes.php?lista_clientes');

        if ($response->successful()) {
            $data = $response->json();
            $count = 0;

            foreach ($data as $client) {
                // Verificar si el cliente ya existe
                $existingClient = Clients::where('code', $client['codigo_cliente'])->first();

                if (!$existingClient) {
                    // Guardar en la base de datos
                    Clients::create([
                        'name' => $client['descripcion_cliente'],
                        'code' => $client['codigo_cliente'],
                    ]);
                    $count++;
                }
            }

            $this->info("Se han agregado $count clientes nuevos.");
        } else {
            $this->error('Error al obtener datos de la API.');
        }
    }
}