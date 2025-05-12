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
        Schema::create('consecutive_dates', function (Blueprint $table) {
            $table->id();
            $table->string('prefix')->unique();
            $table->string('year')->unique();
            $table->string('month')->unique();
            $table->string('consecutive')->unique();
            $table->string('date')->unique();
            $table->string('user'); 
            $table->boolean('status')->default('active');
            $table->foreign('adaptation_id')->references('id')->on('adaptations')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consecutive_dates');
    }
};