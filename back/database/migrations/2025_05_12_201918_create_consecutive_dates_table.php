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
            $table->string('prefix');
            $table->string('year');
            $table->string('month');
            $table->string('consecutive');
            $table->string('date');
            $table->string('user');
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('adaptation_id');
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