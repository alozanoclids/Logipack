<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('maestras', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->text('descripcion');
            $table->boolean('requiere_bom')->default(false);
            $table->json('type_product')->nullable();
            $table->json('type_stage')->nullable();
            $table->enum('status', ['En creación', 'Revisión', 'Aprobada', 'Obsoleta'])->default('En creación');
            $table->boolean('aprobado')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maestras');
    }
};