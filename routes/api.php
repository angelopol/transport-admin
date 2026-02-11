<?php

use App\Http\Controllers\Api\TelemetryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the bootstrap/app.php file and are
| prefixed with '/api'. Device authentication uses X-Device-Token header.
|
*/

// API v1 routes
Route::prefix('v1')->group(function () {
    // Device telemetry endpoints (no auth middleware, uses token header)
    Route::post('/sync', [TelemetryController::class, 'sync']);
    Route::get('/status', [TelemetryController::class, 'status']);

    // Authenticated endpoints (for web dashboard API calls)
    Route::post('/device/auth', [\App\Http\Controllers\Api\DeviceAuthController::class, 'authenticate']);
    Route::get('/drivers/excluded', [\App\Http\Controllers\Api\DriverController::class, 'getExcludedFaces']);
    Route::get('/collectors/excluded', [\App\Http\Controllers\Api\CollectorController::class, 'getExcludedFaces']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/events/{bus}', [TelemetryController::class, 'events']);
    });
});
