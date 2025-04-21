<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Machinery extends Model
{
    protected $guarded = [];

    public function factory()
    {
        return $this->belongsTo(Factory::class);
    }
}