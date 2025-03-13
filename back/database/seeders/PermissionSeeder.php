<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;


class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['name' => 'crear_usuarios', 'description' => 'Crear Usuarios'],
            ['name' => 'gestionar_usuarios', 'description' => 'Gestionar Usuarios'],
            ['name' => 'gestionar_roles', 'description' => 'Gestionar Roles'],
            ['name' => 'gestionar_permisos', 'description' => 'Gestionar Permisos'],
            ['name' => 'ver_reportes', 'description' => 'Ver Reportes'],
            ['name' => 'crear_permiso', 'description' => 'Crear Permisos'],
            ['name' => 'crear_roles', 'description' => 'Crear Roles'],
            ['name' => 'crear_maestras', 'description' => 'Crear Maestras'],
            ['name' => 'crear_fases', 'description' => 'Crear Fases'],
            ['name' => 'crear_actividades', 'description' => 'Crear Actividades'],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(
                ['name' => $perm['name']],
                ['description' => $perm['description']]
            );
        }

        // Asignar permisos a los roles
        $roles = [
            'admin' => ['crear_usuarios', 'gestionar_roles', 'ver_reportes', 'crear_permiso', 'gestionar_permisos', 'crear_roles','gestionar_usuarios'
            , 'crear_maestras', 'crear_fases', 'crear_actividades'],
            'gerente' => ['gestionar_roles', 'ver_reportes'],
        ];

        foreach ($roles as $roleName => $permissionNames) {
            $role = Role::firstOrCreate(['name' => $roleName]);

            foreach ($permissionNames as $permissionName) {
                $permission = Permission::where('name', $permissionName)->first();
                if ($permission) {
                    $role->givePermissionTo($permission);
                }
            }
        }
    }
}