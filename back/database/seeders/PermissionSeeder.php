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
            ['name' => 'gestionar_roles', 'description' => 'Gestionar Roles'],
            ['name' => 'ver_reportes', 'description' => 'Ver Reportes'],
            ['name' => 'crear_permiso', 'description' => 'Crear Permisos'],
        ];

        foreach ($permissions as $perm) {
            Permission::updateOrCreate(
                ['name' => $perm['name']],
                ['description' => $perm['description']]
            );
        }

        // Asignar permisos a los roles
        $roles = [
            'admin' => ['crear_usuarios', 'gestionar_roles', 'ver_reportes', 'crear_permiso'],
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