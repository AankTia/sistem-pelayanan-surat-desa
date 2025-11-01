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
        Schema::create('letter_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->string('name');
            $table->string('code', 50)->unique();
            $table->json('fields');
            $table->text('template_html');
            $table->enum('signature_type', ['digital', 'manual'])->default('digital');
            $table->enum('status', ['active', 'inactive'])->default('active');

            $table->softDeletes();
            $table->timestamps();

            $table->uuid('letter_category_id');
            $table->foreign('letter_category_id')
                ->references('id')
                ->on('letter_categories')
                ->onDelete('cascade');

            $table->index('letter_category_id');
            $table->index('code');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letter_templates');
    }
};
