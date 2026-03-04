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

        // Parse user input dates as local time (America/Caracas) and convert to UTC for database queries
        $start = \Carbon\Carbon::parse($startDate, 'America/Caracas')->startOfDay()->setTimezone('UTC');
        $end = \Carbon\Carbon::parse($endDate, 'America/Caracas')->endOfDay()->setTimezone('UTC');
        $diffInDays = $start->diffInDays($end) + 1;

        if ($request->filled('compare_start_date') && $request->filled('compare_end_date')) {
            $previousStart = \Carbon\Carbon::parse($request->input('compare_start_date'), 'America/Caracas')->startOfDay()->setTimezone('UTC');
            $previousEnd = \Carbon\Carbon::parse($request->input('compare_end_date'), 'America/Caracas')->endOfDay()->setTimezone('UTC');
            $compareTitle = \Carbon\Carbon::parse($request->input('compare_start_date'), 'America/Caracas')->format('Y-m-d') . ' al ' . \Carbon\Carbon::parse($request->input('compare_end_date'), 'America/Caracas')->format('Y-m-d');
        } else {
            $previousStart = $start->copy()->subDays($diffInDays);
            $previousEnd = $end->copy()->subDays($diffInDays);
            $compareTitle = 'periodo anterior';
        }

        // Aggregate data for current period (use collection processing for correct America/Caracas timezone)
        $manualEntries = DB::table('manual_revenue_entries')
            ->whereBetween('registered_at', [$start, $end])
            ->get();

        $telemetryEntries = DB::table('telemetry_events')
            ->whereBetween('event_timestamp', [$start, $end])
            ->get();

        $mergedIncomeByDay = [];

        foreach ($manualEntries as $item) {
            $date = \Carbon\Carbon::parse($item->registered_at)->timezone('America/Caracas')->format('Y-m-d');
            if (!isset($mergedIncomeByDay[$date])) {
                $mergedIncomeByDay[$date] = ['date' => $date, 'total' => 0, 'passengers' => 0];
            }
            $mergedIncomeByDay[$date]['total'] += $item->amount;
            $mergedIncomeByDay[$date]['passengers'] += 1;
        }

        foreach ($telemetryEntries as $item) {
            $date = \Carbon\Carbon::parse($item->event_timestamp)->timezone('America/Caracas')->format('Y-m-d');
            if (!isset($mergedIncomeByDay[$date])) {
                $mergedIncomeByDay[$date] = ['date' => $date, 'total' => 0, 'passengers' => 0];
            }
            $mergedIncomeByDay[$date]['passengers'] += $item->passenger_count;
        }

        // Sort by date key after merging
        ksort($mergedIncomeByDay);
        // Reset keys for frontend array
        $mergedIncomeByDay = array_values($mergedIncomeByDay);

        $passengerTypes = DB::table('manual_revenue_entries')
            ->selectRaw('user_type as passenger_type, COUNT(*) as count, SUM(amount) as total')
            ->whereBetween('registered_at', [$start, $end])
            ->groupBy('user_type')
            ->get();

        $telemetryPassengers = DB::table('telemetry_events')
            ->whereBetween('event_timestamp', [$start, $end])
            ->sum('passenger_count') ?: 0;

        if ($telemetryPassengers > 0) {
            $passengerTypes->push((object) [
                'passenger_type' => 'telemetría',
                'count' => $telemetryPassengers,
                'total' => 0 // Telemetry doesn't record money, only faces
            ]);
        }

        $paymentMethods = DB::table('manual_revenue_entries')
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->whereBetween('registered_at', [$start, $end])
            ->groupBy('payment_method')
            ->get();

        $currentTotalIncome = $manualEntries->sum('amount');
        $currentTotalPassengers = $manualEntries->count() + $telemetryEntries->sum('passenger_count');

        // Aggregate data for previous period
        $previousTotalIncome = DB::table('manual_revenue_entries')
            ->whereBetween('registered_at', [$previousStart, $previousEnd])
            ->sum('amount');

        $previousTotalPassengers = DB::table('manual_revenue_entries')
            ->whereBetween('registered_at', [$previousStart, $previousEnd])
            ->count();

        $previousTelemetryPassengers = DB::table('telemetry_events')
            ->whereBetween('event_timestamp', [$previousStart, $previousEnd])
            ->sum('passenger_count') ?: 0;

        $previousTotalPassengers += $previousTelemetryPassengers;

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
                'income_by_day' => $mergedIncomeByDay,
                'by_passenger_type' => $passengerTypes,
                'by_payment_method' => $paymentMethods,
            ]
        ]);
    }

    /**
     * Display the calendar view with daily income summaries.
     */
    public function calendar(Request $request): Response
    {
        $monthParam = $request->input('month', now()->timezone('America/Caracas')->format('Y-m'));

        try {
            // Parse explicitly in Caracas timezone so the 1st day doesn't slip back to previous month in UTC
            $currentMonthLocal = \Carbon\Carbon::createFromFormat('Y-m', $monthParam, 'America/Caracas')->startOfMonth();
        } catch (\Exception $e) {
            $currentMonthLocal = now()->timezone('America/Caracas')->startOfMonth();
        }

        // In the calendar, the month boundaries must also respect local timezone shifts
        $startLocal = $currentMonthLocal->copy()->startOfDay();
        $endLocal = $currentMonthLocal->copy()->endOfMonth()->endOfDay();

        $start = $startLocal->copy()->setTimezone('UTC');
        $end = $endLocal->copy()->setTimezone('UTC');

        // Fetch raw data to process timezones in PHP
        $manualEntries = DB::table('manual_revenue_entries')
            ->select('registered_at', 'amount')
            ->whereBetween('registered_at', [$start, $end])
            ->get();

        $telemetryEntries = DB::table('telemetry_events')
            ->select('event_timestamp', 'passenger_count')
            ->whereBetween('event_timestamp', [$start, $end])
            ->get();

        // Convert the collection to a keyed array [ 'YYYY-MM-DD' => [ 'income' => x, 'passengers' => y ] ]
        $daysMap = [];

        foreach ($manualEntries as $item) {
            $date = \Carbon\Carbon::parse($item->registered_at)->timezone('America/Caracas')->format('Y-m-d');
            if (!isset($daysMap[$date])) {
                $daysMap[$date] = [
                    'income' => 0,
                    'passengers' => 0,
                ];
            }
            $daysMap[$date]['income'] += $item->amount;
            $daysMap[$date]['passengers'] += 1;
        }

        foreach ($telemetryEntries as $item) {
            $date = \Carbon\Carbon::parse($item->event_timestamp)->timezone('America/Caracas')->format('Y-m-d');
            if (!isset($daysMap[$date])) {
                $daysMap[$date] = [
                    'income' => 0,
                    'passengers' => 0,
                ];
            }
            $daysMap[$date]['passengers'] += $item->passenger_count;
        }

        return Inertia::render('Reports/Calendar', [
            'currentMonth' => $currentMonthLocal->format('Y-m'),
            'daysMap' => $daysMap,
        ]);
    }
}
