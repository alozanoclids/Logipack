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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Client's name
            $table->string('nit'); // Client's NIT
            $table->string('address'); // Client's address
            $table->unsignedBigInteger('manufacturing_id'); // Relationship with the 'manufacturings' table
            $table->foreign('manufacturing_id')->references('id')->on('manufacturings')->onDelete('cascade'); // Foreign key for manufacturings
            $table->json('lines'); // This will store the lines (you can adjust the data type depending on what you need) 
            $table->json('responsible_person'); // Responsible person's details stored as JSON

            $table->timestamps(); // Default timestamps
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};