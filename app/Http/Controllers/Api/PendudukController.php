<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penduduk;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PendudukController extends Controller
{
    /**
     * Display a listing of penduduk
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $statusTinggal = $request->input('status_tinggal');

        $query = Penduduk::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nik', 'like', "%{$search}%")
                  ->orWhere('kk', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%")
                  ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        if ($statusTinggal) {
            $query->where('status_tinggal', $statusTinggal);
        }

        $penduduks = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'penduduks' => $penduduks->items(),
                'pagination' => [
                    'current_page' => $penduduks->currentPage(),
                    'last_page' => $penduduks->lastPage(),
                    'per_page' => $penduduks->perPage(),
                    'total' => $penduduks->total(),
                ],
            ],
        ], 200);
    }

    /**
     * Store a newly created penduduk
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nik' => 'required|string|size:16|unique:penduduks,nik',
            'kk' => 'nullable|string|size:16',
            'nama' => 'required|string|max:100',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:Laki-laki,Perempuan',
            'agama' => 'required|in:Islam,Kristen,Katolik,Hindu,Buddha,Konghucu,Lainnya',
            'status_perkawinan' => 'required|in:Belum Kawin,Kawin,Cerai Hidup,Cerai Mati',
            'pekerjaan' => 'nullable|string|max:100',
            'pendidikan_terakhir' => 'nullable|string|max:50',
            'kewarganegaraan' => 'nullable|string|max:50',
            'alamat' => 'required|string',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'dusun' => 'nullable|string|max:100',
            'kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kabupaten' => 'nullable|string|max:100',
            'provinsi' => 'nullable|string|max:100',
            'status_tinggal' => 'nullable|in:Tetap,Sementara,Pindah,Meninggal',
            'tanggal_pindah' => 'nullable|date',
            'tanggal_meninggal' => 'nullable|date',
            'catatan' => 'nullable|string',
        ]);

        $validated['id'] = (string) Str::uuid();

        $penduduk = Penduduk::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Penduduk created successfully',
            'data' => [
                'penduduk' => $penduduk,
            ],
        ], 201);
    }

    /**
     * Display the specified penduduk
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $penduduk = Penduduk::find($id);

        if (!$penduduk) {
            return response()->json([
                'success' => false,
                'message' => 'Penduduk not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'penduduk' => $penduduk,
            ],
        ], 200);
    }

    /**
     * Update the specified penduduk
     *
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $penduduk = Penduduk::find($id);

        if (!$penduduk) {
            return response()->json([
                'success' => false,
                'message' => 'Penduduk not found',
            ], 404);
        }

        $validated = $request->validate([
            'nik' => [
                'required',
                'string',
                'size:16',
                Rule::unique('penduduks', 'nik')->ignore($penduduk->id)
            ],
            'kk' => 'nullable|string|size:16',
            'nama' => 'required|string|max:100',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:Laki-laki,Perempuan',
            'agama' => 'required|in:Islam,Kristen,Katolik,Hindu,Buddha,Konghucu,Lainnya',
            'status_perkawinan' => 'required|in:Belum Kawin,Kawin,Cerai Hidup,Cerai Mati',
            'pekerjaan' => 'nullable|string|max:100',
            'pendidikan_terakhir' => 'nullable|string|max:50',
            'kewarganegaraan' => 'nullable|string|max:50',
            'alamat' => 'required|string',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'dusun' => 'nullable|string|max:100',
            'kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kabupaten' => 'nullable|string|max:100',
            'provinsi' => 'nullable|string|max:100',
            'status_tinggal' => 'nullable|in:Tetap,Sementara,Pindah,Meninggal',
            'tanggal_pindah' => 'nullable|date',
            'tanggal_meninggal' => 'nullable|date',
            'catatan' => 'nullable|string',
        ]);

        $penduduk->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Penduduk updated successfully',
            'data' => [
                'penduduk' => $penduduk->fresh(),
            ],
        ], 200);
    }

    /**
     * Remove the specified penduduk
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $penduduk = Penduduk::find($id);

        if (!$penduduk) {
            return response()->json([
                'success' => false,
                'message' => 'Penduduk not found',
            ], 404);
        }

        $penduduk->delete();

        return response()->json([
            'success' => true,
            'message' => 'Penduduk deleted successfully',
        ], 200);
    }

    /**
     * Get statistics for penduduk
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics()
    {
        $total = Penduduk::count();
        $lakiLaki = Penduduk::where('jenis_kelamin', 'Laki-laki')->count();
        $perempuan = Penduduk::where('jenis_kelamin', 'Perempuan')->count();
        $tetap = Penduduk::where('status_tinggal', 'Tetap')->count();
        $sementara = Penduduk::where('status_tinggal', 'Sementara')->count();
        $pindah = Penduduk::where('status_tinggal', 'Pindah')->count();
        $meninggal = Penduduk::where('status_tinggal', 'Meninggal')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'jenis_kelamin' => [
                    'laki_laki' => $lakiLaki,
                    'perempuan' => $perempuan,
                ],
                'status_tinggal' => [
                    'tetap' => $tetap,
                    'sementara' => $sementara,
                    'pindah' => $pindah,
                    'meninggal' => $meninggal,
                ],
            ],
        ], 200);
    }
}
