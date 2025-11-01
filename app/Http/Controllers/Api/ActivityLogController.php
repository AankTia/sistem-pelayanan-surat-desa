<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of activity logs
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $logName = $request->input('log_name');
        $event = $request->input('event');
        $causerId = $request->input('causer_id');
        $subjectType = $request->input('subject_type');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = Activity::with(['causer', 'subject']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('log_name', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%");
            });
        }

        if ($logName) {
            $query->where('log_name', $logName);
        }

        if ($event) {
            $query->where('event', $event);
        }

        if ($causerId) {
            $query->where('causer_id', $causerId);
        }

        if ($subjectType) {
            $query->where('subject_type', $subjectType);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $activities = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $transformedActivities = $activities->map(function ($activity) {
            return [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'event' => $activity->event,
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'subject' => $activity->subject ? [
                    'type' => $activity->subject_type,
                    'id' => $activity->subject_id,
                ] : null,
                'causer_type' => $activity->causer_type,
                'causer_id' => $activity->causer_id,
                'causer' => $activity->causer ? [
                    'type' => $activity->causer_type,
                    'id' => $activity->causer_id,
                    'name' => $activity->causer->name ?? 'Unknown',
                ] : null,
                'properties' => $activity->properties,
                'batch_uuid' => $activity->batch_uuid ?? null,
                'created_at' => $activity->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'activities' => $transformedActivities->values()->all(),
                'pagination' => [
                    'current_page' => $activities->currentPage(),
                    'last_page' => $activities->lastPage(),
                    'per_page' => $activities->perPage(),
                    'total' => $activities->total(),
                ],
            ],
        ], 200);
    }

    /**
     * Display the specified activity log
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $activity = Activity::with(['causer', 'subject'])->find($id);

        if (!$activity) {
            return response()->json([
                'success' => false,
                'message' => 'Activity log not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'activity' => [
                    'id' => $activity->id,
                    'log_name' => $activity->log_name,
                    'description' => $activity->description,
                    'event' => $activity->event,
                    'subject_type' => $activity->subject_type,
                    'subject_id' => $activity->subject_id,
                    'subject' => $activity->subject ? [
                        'type' => $activity->subject_type,
                        'id' => $activity->subject_id,
                    ] : null,
                    'causer_type' => $activity->causer_type,
                    'causer_id' => $activity->causer_id,
                    'causer' => $activity->causer ? [
                        'type' => $activity->causer_type,
                        'id' => $activity->causer_id,
                        'name' => $activity->causer->name ?? 'Unknown',
                    ] : null,
                    'properties' => $activity->properties,
                    'batch_uuid' => $activity->batch_uuid ?? null,
                    'created_at' => $activity->created_at,
                ],
            ],
        ], 200);
    }

    /**
     * Delete old activity logs
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cleanup(Request $request)
    {
        $days = $request->input('days', 30);

        $count = Activity::where('created_at', '<', now()->subDays($days))->delete();

        return response()->json([
            'success' => true,
            'message' => "Deleted {$count} activity log(s) older than {$days} days",
            'data' => [
                'deleted_count' => $count,
            ],
        ], 200);
    }

    /**
     * Get unique log names for filtering
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logNames()
    {
        $logNames = Activity::select('log_name')
            ->distinct()
            ->whereNotNull('log_name')
            ->orderBy('log_name')
            ->pluck('log_name');

        return response()->json([
            'success' => true,
            'data' => [
                'log_names' => $logNames,
            ],
        ], 200);
    }

    /**
     * Get unique events for filtering
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function events()
    {
        $events = Activity::select('event')
            ->distinct()
            ->whereNotNull('event')
            ->orderBy('event')
            ->pluck('event');

        return response()->json([
            'success' => true,
            'data' => [
                'events' => $events,
            ],
        ], 200);
    }
}
