<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;

class Penduduk extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'penduduks';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'nik',
        'kk',
        'nama',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'agama',
        'status_perkawinan',
        'pekerjaan',
        'pendidikan_terakhir',
        'kewarganegaraan',
        'alamat',
        'rt',
        'rw',
        'dusun',
        'kelurahan',
        'kecamatan',
        'kabupaten',
        'provinsi',
        'status_tinggal',
        'tanggal_pindah',
        'tanggal_meninggal',
        'catatan'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'id',
                'nik',
                'kk',
                'nama',
                'tempat_lahir',
                'tanggal_lahir',
                'jenis_kelamin',
                'agama',
                'status_perkawinan',
                'pekerjaan',
                'pendidikan_terakhir',
                'kewarganegaraan',
                'alamat',
                'rt',
                'rw',
                'dusun',
                'kelurahan',
                'kecamatan',
                'kabupaten',
                'provinsi',
                'status_tinggal',
                'tanggal_pindah',
                'tanggal_meninggal',
                'catatan'
            ])
            ->logOnlyDirty();
    }
}
