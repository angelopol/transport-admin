<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display a listing of the audit logs.
     */
    public function index(Request $request): Response
    {
        // Only allow admins or maybe owners? Based on requirements: "Vista Admin/AuditLogs: Historial de Trazabilidad."
        // We will just fetch the logs. Route middleware will handle access control.
        $logs = AuditLog::with('user:id,name,email,role')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
        ]);
    }
}
