<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function getPermisos()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return response()->json([
            'roles' => $roles,
            'permissions' => $permissions
        ]);
    }

    public function updateRolePermissions(Request $request)
    {
        $roleId = $request->input('roleId');
        $permissionId = $request->input('permissionIds'); // Aquí se recibe un único ID

        // Verificar si la relación ya existe en la tabla role_permission
        $existing = RolePermission::where('role_id', $roleId)
            ->where('permission_id', $permissionId)
            ->first();

        if ($existing) {
            // Si ya existe, se elimina (toggle off)
            $existing->delete();
            return response()->json(['message' => 'Permiso eliminado']);
        } else {
            // Si no existe, se crea la relación (toggle on)
            RolePermission::create([
                'role_id' => $roleId,
                'permission_id' => $permissionId
            ]);
            return response()->json(['message' => 'Permiso asignado']);
        }
    }

    public function getPermissionsByRoleName($roleName)
    {
        // Buscamos el rol por nombre y cargamos sus permisos
        $role = Role::with('permissions')->where('name', $roleName)->first();

        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }
        
        // Extraemos los nombres de los permisos
        $permissions = $role->permissions->pluck('name');

        return response()->json(['permissions' => $permissions]);
    }

    public function createPermission()
    {
        $validate = request()->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'status' => 'required|boolean',
        ]);        
        
        $permission = Permission::create([
            'name' => $validate['name'],
            'description' => $validate['description'],
            'status' => $validate['status'],
        ]);

        return response()->json($permission);
    }

    public function updatePermissions(Request $request)
    {
        $permissionIds = $request->input('permissionIds'); // Aquí se recibe un array de IDs

        // Verificar si la relación ya existe en la tabla role_permission
        $existing = Permission::find($permissionIds)->get();

        // Eliminar las relaciones existentes
        foreach ($existing as $relation) {
            $relation->delete();
        }

        // Crear las nuevas relaciones
        foreach ($permissionIds as $permissionId) {
            RolePermission::create([
                'permission_id' => $permissionId
            ]);
        }

        return response()->json(['message' => 'Permisos actualizados']);
    }

    public function deletePermission($id): JsonResponse
    {
        $permission = Permission::find($id);
        if (!$permission) {
            return response()->json(['message' => 'Fábrica no encontrada'], 404);
        }

        $permission->delete();

        return response()->json(['message' => 'Fábrica eliminada correctamente']);
    }
}