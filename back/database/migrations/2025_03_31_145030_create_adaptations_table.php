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
        Schema::create('adaptations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');
            $table->string('order_number');
            $table->date('delivery_date');
            $table->json('article_code');
            $table->string('lot');
            $table->string('health_registration');
            $table->integer('quantity_to_produce');
            $table->string('attachment')->nullable();
            $table->json('master')->nullable();
            $table->json('bom')->nullable();
            $table->json('ingredients')->nullable();
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adaptations');
    }
};