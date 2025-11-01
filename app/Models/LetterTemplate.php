<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class LetterTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'letter_templates';

    // UUID primary key setup
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'letter_category_id',
        'name',
        'code',
        'fields',
        'template_html',
        'signature_type',
        'status',
    ];

    protected $casts = [
        'fields' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        // Automatically set UUID and slug before creating
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // Relationship: each template belongs to one category
    public function category()
    {
        return $this->belongsTo(LetterCategory::class, 'letter_category_id');
    }
}
