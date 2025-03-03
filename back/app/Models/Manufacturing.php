<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Manufacturing extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'line_types' => 'array', // Decodificar automáticamente JSON en array
    ];

    // Relación muchos a uno: Una línea de manufactura pertenece a una fábrica
    public function factory()
    {
        return $this->belongsTo(Factory::class);
    }
}