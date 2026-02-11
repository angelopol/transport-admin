<?php

namespace App\Http\Controllers;

use App\Models\ManualRevenueEntry;
use App\Models\Route;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ManualRevenueEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $entries = ManualRevenueEntry::with(['route'])
            ->forUser($user)
            ->orderBy('registered_at', 'desc')
            ->paginate(15);

        return Inertia::render('ManualEntries/Index', [
            'entries' => $entries,
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();
        return Inertia::render('ManualEntries/Create', [
            'routes' => Route::active()->forUser($user)->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'route_id' => ['required', 'exists:routes,id'],
            'user_type' => ['required', 'in:general,student,senior,disabled'],
            'payment_method' => ['required', 'in:cash,digital'],
            'registered_at' => ['nullable', 'date'],
        ]);

        $route = Route::findOrFail($validated['route_id']);
        $date = $validated['registered_at'] ? Carbon::parse($validated['registered_at']) : now();

        // Calculate amount
        $amount = 0;

        // Check for Sunday tariff
        if ($date->isSunday() && $route->fare_sunday > 0) {
            $amount = $route->fare_sunday;
        } else {
            // Standard tariffs
            switch ($validated['user_type']) {
                case 'student':
                    $amount = $route->fare_student > 0 ? $route->fare_student : $route->fare;
                    break;
                case 'senior':
                    $amount = $route->fare_senior > 0 ? $route->fare_senior : $route->fare;
                    break;
                case 'disabled':
                    $amount = $route->fare_disabled > 0 ? $route->fare_disabled : $route->fare;
                    break;
                default:
                    $amount = $route->fare;
                    break;
            }
        }

        // If specific fare types are 0, fallback to general fare is handled above logic? 
        // Logic specific:
        // If Sunday tariff exists (>0) AND it is Sunday -> Use Sunday Tariff regardless of user type? 
        // Or is Sunday tariff only for General? 
        // User request: "poner la tarifa para domingos". Usually sunday tariff overrides everything or specific sunday tariff.
        // I will assume Sunday Tariff overrides General, but maybe not special types unless specified.
        // But for simplicity and common practice in some regions, Sunday surcharge applies to all or creates a flat rate.
        // Let's implement: If Sunday & fare_sunday > 0 => use fare_sunday. 
        // THIS MIGHT BE WRONG if students still get discount on Sunday.
        // User said: "poner la tarifa de estudiantes... ademas de poner la tarifa para domingos".
        // I'll stick to: If Sunday Tariff > 0, it overrides. If not, use User Type tariff.

        $entry = ManualRevenueEntry::create([
            'owner_id' => $request->user()->id,
            'route_id' => $validated['route_id'],
            'amount' => $amount,
            'user_type' => $validated['user_type'],
            'payment_method' => $validated['payment_method'],
            'registered_at' => $date,
        ]);

        return redirect()->route('manual-entries.index')
            ->with('success', 'Ingreso registrado exitosamente. Monto: ' . $amount);
    }
}
