<?php

namespace App\Models;

use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    // UUID primary key setup
    public $incrementing = false;
    protected $keyType = 'string';

    protected $attributes = [
        'guard_name' => 'web',
    ];

    protected static function boot()
    {
        parent::boot();

        // Automatically set UUID before creating
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }
}
