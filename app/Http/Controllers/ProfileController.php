<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        if ($user->isOwner() && $request->hasFile('company_logo')) {
            if ($user->company_logo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->company_logo_path);
            }
            $user->company_logo_path = $request->file('company_logo')->store('logos', 'public');
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    public function updateCompany(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->isOwner()) {
            abort(403);
        }

        $validated = $request->validate([
            'company_name' => ['nullable', 'string', 'max:150'],
            'rif' => ['nullable', 'string', new \App\Rules\VenezuelanDocument()],
            'company_logo' => ['nullable', 'image', 'max:2048'],
        ]);

        $user->company_name = $validated['company_name'] ?? null;
        $user->rif = $validated['rif'] ?? null;

        if ($request->hasFile('company_logo')) {
            if ($user->company_logo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->company_logo_path);
            }
            $user->company_logo_path = $request->file('company_logo')->store('logos', 'public');
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
