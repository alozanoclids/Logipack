<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdaptationDate extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function Adaptation()
    {
        return $this->belongsTo(Adaptation::class);
    }
    
    public function client()
    {
        return $this->belongsTo(Clients::class);
    }
}