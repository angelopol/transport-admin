<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Display the reports page.
     */
    public function index(Request $request): Response
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'compare_start_date' => 'nullable|date',
            'compare_end_date' => [
                'nullable',
                'date',
                'after_or_equal:compare_start_date',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->filled('start_date') && $request->filled('end_date') && $request->filled('compare_start_date')) {
                        $start = \Carbon\Carbon::parse($request->start_date)->startOfDay();
                        $end = \Carbon\Carbon::parse($request->end_date)->endOfDay();
                        $primaryDays = $start->diffInDays($end) + 1;

                        $compStart = \Carbon\Carbon::parse($request->compare_start_date)->startOfDay();
                        $compEnd = \Carbon\Carbon::parse($value)->endOfDay();
                        $compDays = $compStart->diffInDays($compEnd) + 1;

                        if ($primaryDays !== $compDays) {
                            $fail("El periodo de comparación debe ser de exactamente {$primaryDays} días para ser congruente.");
                        }
                    }
                },
            ],
        ]);

        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        $start = \Carbon\Carbon::parse($startDate)->startOfDay();
        $end = \Carbon\Carbon::parse($endDate)->endOfDay();
        $diffInDays = $start->diffInDays($end) + 1;

        if ($request->filled('compare_start_date') && $request->filled('compare_end_date')) {
            $previousStart = \Carbon\Carbon::parse($request->input('compare_start_date'))->startOfDay();
            $previousEnd = \Carbon\Carbon::parse($request->input('compare_end_date'))->endOfDay();
            $compareTitle = $previousStart->format('Y-m-d') . ' al ' . $previousEnd->format('Y-m-d');
        } else {
            $previousStart = $start->copy()->subDays($diffInDays);
            $previousEnd = $end->copy()->subDays($diffInDays);
            $compareTitle = 'periodo anterior';
        }

        // Aggregate data for current period
        $incomeByDay = DB::table('manual_revenue_entries')
            ->selectRaw('DATE(registered_at) as date, SUM(amount) as total')
            ->whereBetween('registered_at', [$start, $end])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $passengerTypes = DB::table('manual_revenue_entries')
            ->selectRaw('user_type as passenger_type, COUNT(*) as count, SUM(amount) as total')
            ->whereBetween('registered_at', [$start, $end])
            ->groupBy('user_type')
            ->get();

        $paymentMethods = DB::table('manual_revenue_entries')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->whereBetween('registered_at', [$start, $end])
            ->groupBy('payment_method')
            ->get();

        $currentTotalIncome = $incomeByDay->sum('total');
        $currentTotalPassengers = $passengerTypes->sum('count');

        // Aggregate data for previous period
        $previousTotalIncome = DB::table('manual_revenue_entries')
            ->whereBetween('registered_at', [$previousStart, $previousEnd])
            ->sum('amount');

        $previousTotalPassengers = DB::table('manual_revenue_entries')
            ->whereBetween('registered_at', [$previousStart, $previousEnd])
            ->count();

        // Calculate growth percentage
        $growthIncome = $previousTotalIncome > 0
            ? (($currentTotalIncome - $previousTotalIncome) / $previousTotalIncome) * 100
            : ($currentTotalIncome > 0 ? 100 : 0);

        $growthPassengers = $previousTotalPassengers > 0
            ? (($currentTotalPassengers - $previousTotalPassengers) / $previousTotalPassengers) * 100
            : ($currentTotalPassengers > 0 ? 100 : 0);

        return Inertia::render('Reports/Index', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'compare_start_date' => $request->input('compare_start_date'),
                'compare_end_date' => $request->input('compare_end_date'),
            ],
            'stats' => [
                'total_income' => $currentTotalIncome,
                'total_passengers' => $currentTotalPassengers,
                'growth_income' => round($growthIncome, 1),
                'growth_passengers' => round($growthPassengers, 1),
                'compare_title' => $compareTitle,
                'previous_income' => $previousTotalIncome,
                'previous_passengers' => $previousTotalPassengers,
                'income_by_day' => $incomeByDay,
                'by_passenger_type' => $passengerTypes,
                'by_payment_method' => $paymentMethods,
            ]
        ]);
    }
}
