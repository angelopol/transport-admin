<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Users/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:' . User::class,
            'role' => 'required|string|in:admin,owner',
            'phone' => ['nullable', 'string', 'regex:/^(0414|0424|0412|0416|0426|0422|02[0-9]{2})[0-9]{7}$/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'phone.regex' => 'El formato del teléfono es inválido. Debe ser un número venezolano válido (ej. 04141234567).',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('users.index')->with('message', 'Usuario creado exitosamente');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('Users/Edit', [
            'user' => $user,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:' . User::class . ',email,' . $user->id,
            'role' => 'required|string|in:admin,owner',
            'phone' => ['nullable', 'string', 'regex:/^(0414|0424|0412|0416|0426|0422|02[0-9]{2})[0-9]{7}$/'],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ], [
            'phone.regex' => 'El formato del teléfono es inválido. Debe ser un número venezolano válido (ej. 04141234567).',
        ]);

        $passwordChanged = $request->filled('password');

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'phone' => $validated['phone'],
        ]);

        if ($passwordChanged) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        if ($passwordChanged) {
            $currentUserWasLoggedOut = $this->revokeUserSessions($request, $user);

            if ($currentUserWasLoggedOut) {
                return redirect()->route('login')->with('status', 'Tu contraseña fue actualizada desde gestión de usuarios. Inicia sesión nuevamente.');
            }

            return redirect()->route('users.edit', $user)->with('message', 'Usuario actualizado exitosamente y sus sesiones activas fueron cerradas.');
        }

        return redirect()->route('users.index')->with('message', 'Usuario actualizado exitosamente');
    }

    /**
     * Close every active session for the given user.
     */
    public function logoutSessions(Request $request, User $user): RedirectResponse
    {
        $currentUserWasLoggedOut = $this->revokeUserSessions($request, $user);

        if ($currentUserWasLoggedOut) {
            return redirect()->route('login')->with('status', 'Tu sesión fue cerrada en todos los dispositivos.');
        }

        return redirect()->route('users.edit', $user)->with('message', 'Todas las sesiones activas del usuario fueron cerradas.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes eliminar tu propia cuenta.']);
        }

        $user->delete();

        return redirect()->route('users.index')->with('message', 'Usuario eliminado exitosamente');
    }

    private function revokeUserSessions(Request $request, User $user): bool
    {
        if (config('session.driver') === 'database') {
            DB::connection(config('session.connection'))
                ->table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->delete();
        }

        $user->forceFill([
            'remember_token' => Str::random(60),
        ])->save();

        if ((int) $request->user()->id !== (int) $user->id) {
            return false;
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return true;
    }
}
