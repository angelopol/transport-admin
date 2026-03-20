<?php

namespace App\Helpers;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

class AuditLogger
{
    /**
     * Log a critical action in the system securely.
     *
     * @param string $action A brief description of the performed action.
     * @param array|null $details Additional payload data for traceabilty.
     * @return void
     */
    public static function log(string $action, ?array $details = null): void
    {
        try {
            AuditLog::create([
                'user_id' => auth()->id(), // Works if user is authenticated via web/sanctum
                'action' => $action,
                'details' => $details,
                'ip_address' => request()->ip(),
            ]);
        } catch (\Exception $e) {
            // Fail gracefully but log to Laravel's standard discord/file log 
            Log::error("Fallo al registrar auditoría: {$action} - " . $e->getMessage());
        }
    }
}
