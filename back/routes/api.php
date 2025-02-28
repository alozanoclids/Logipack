<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientsController;
use App\Http\Controllers\FactoryController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Ingredient;
use App\Http\Controllers\ManufacturingController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RolesController;

Route::controller(AuthController::class)->group(function () {
    Route::post('login', 'login');
    Route::post('register', 'register');
    Route::post('logout', 'logout');
    Route::post('refresh', 'refresh');
    Route::get('/user/{email}', 'getUserByEmail');
    Route::post('/upload-image/{email}', 'uploadImage');
    Route::post('/users', 'create');
    Route::get('/role', 'role');
    Route::get('/usersAll', 'getUsers');
    Route::delete('/delete/{id}', 'getUserDelete');
    Route::put('/update/{id}', 'getUserUpdate');
    Route::get('/date/{id}', 'getuserById');
});

//Rutas Ingredients
Route::controller(Ingredient::class)->group(function () {
    Route::get('ingredients/list', 'index');
    Route::get('ingredients/{id}', 'show');
    Route::post('ingredients/create', 'store');
    Route::put('ingredients/{id}/update', 'update');
    Route::put('ingredients/{id}/toggle-status',  'toggleStatus');
    Route::delete('ingredients/{id}/delete', 'destroy'); // Ruta para eliminar

});

//Rutas Permissions
Route::controller(PermissionController::class)->group(function () {
    Route::post('/newPermission', 'createPermission');
    Route::get('/permissions', 'getPermisos');
    Route::post('/permissionsUpdate', 'updateRolePermissions');
    Route::get('/role-permissions/{roleName}', 'getPermissionsByRoleName');
    Route::delete('/deletePermission/{id}', 'deletePermission'); // Eliminar una lineas
    Route::get('/PermissionId/{id}', 'permissionId'); // Obtener una fábrica específica
    Route::put('/updatePermission/{id}', 'updatePermission'); // Actualizar una fábrica
});

//Rutas Roles
Route::controller(RolesController::class)->group(function () {
    Route::get('/getRole', 'getRole'); // Obtener todas las lineas
    Route::post('/newRole', 'newRole'); // Crear una nueva lineas
    Route::get('/RoleId/{id}', 'RoleId'); // Obtener una lineas específica
    Route::put('/updateRole/{id}', 'updateRole'); // Actualizar una lineas
    Route::delete('/deleteRole/{id}', 'deleteRole'); // Eliminar una lineas
});

//Rutas Factories
Route::controller(FactoryController::class)->group(function () {
    Route::get('/getFactories', 'getFactories'); // Obtener todas las fábricas
    Route::post('/newFactory', 'newFactory'); // Crear una nueva fábrica
    Route::get('/factoryId/{id}', 'factoryId'); // Obtener una fábrica específica
    Route::put('/updateFactory/{id}', 'updateFactory'); // Actualizar una fábrica
    Route::delete('/deleteFactory/{id}', 'deleteFactory'); // Eliminar una fábrica
});
//Rutas Lineas
Route::controller(ManufacturingController::class)->group(function () {
    Route::get('/getManu', 'getManu'); // Obtener todas las lineas
    Route::post('/newManu', 'newManu'); // Crear una nueva lineas
    Route::get('/ManuId/{id}', 'ManuId'); // Obtener una lineas específica
    Route::put('/updateManu/{id}', 'updateManu'); // Actualizar una lineas
    Route::delete('/deleteManu/{id}', 'deleteManu'); // Eliminar una lineas
});

//Rutas Clientes
Route::controller(ClientsController::class)->group(function () {
    Route::get('/clients/sync', 'getClientDataApi');
    Route::get('/getClients', 'getClients'); // Obtener todas las lineas
    Route::post('/newClients', 'newClients'); // Crear una nueva lineas
    Route::get('/ClientsId/{id}', 'ClientsId'); // Obtener una lineas específica
    Route::put('/updateClients/{id}', 'updateClients'); // Actualizar una lineas
    Route::delete('/deleteClients/{id}', 'deleteClients'); // Eliminar una lineas
});

//Rutas Productos
Route::controller(ProductController::class)->group(function () {
    Route::get('/getProduct', 'getProduct'); // Obtener todas las lineas
    Route::post('/newProduct', 'newProduct'); // Crear una nueva lineas
    Route::get('/ProductId/{id}', 'ProductId'); // Obtener una lineas específica
    Route::get('/ProductName/{name}', 'ProductName'); // Obtener una lineas específica
    Route::put('/updateProduct/{id}', 'updateProduct'); // Actualizar una lineas
    Route::delete('/deleteProduct/{id}', 'deleteProduct'); // Eliminar una lineas
});