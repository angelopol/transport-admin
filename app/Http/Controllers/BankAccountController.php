<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $bankAccounts = \App\Models\BankAccount::forUser($user)->paginate(15);

        return inertia('BankAccounts/Index', [
            'bankAccounts' => $bankAccounts,
        ]);
    }

    public function create()
    {
        return inertia('BankAccounts/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'account_type' => 'nullable|string|max:50',
            'owner_name' => 'required|string|max:100',
            'identification_document' => ['required', 'string', new \App\Rules\VenezuelanDocument],
            'phone_number' => ['nullable', 'string', 'regex:/^(0414|0424|0412|0416|0426|0422|02[0-9]{2})[0-9]{7}$/'],
            'is_mobile_payment_active' => 'boolean',
            'is_transfer_active' => 'boolean',
        ], [
            'identification_document.regex' => 'El formato de la Cédula o RIF es inválido. Ejemplos válidos: V-12345678, J-12345678-9, V12345678.',
            'phone_number.regex' => 'El formato del teléfono es inválido. Debe ser un número venezolano válido (ej. 04141234567).',
        ]);

        $validated['owner_id'] = $request->user()->id;

        \App\Models\BankAccount::create($validated);

        return redirect()->route('bank-accounts.index')->with('success', 'Cuenta bancaria creada exitosamente.');
    }

    public function edit(\App\Models\BankAccount $bankAccount, Request $request)
    {
        // Check permissions
        if (!$request->user()->isAdmin() && $bankAccount->owner_id !== $request->user()->id) {
            abort(403);
        }

        return inertia('BankAccounts/Edit', [
            'bankAccount' => $bankAccount,
        ]);
    }

    public function update(Request $request, \App\Models\BankAccount $bankAccount)
    {
        // Check permissions
        if (!$request->user()->isAdmin() && $bankAccount->owner_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'bank_name' => 'required|string|max:100',
            'account_number' => 'nullable|string|max:50',
            'account_type' => 'nullable|string|max:50',
            'owner_name' => 'required|string|max:100',
            'identification_document' => ['required', 'string', new \App\Rules\VenezuelanDocument],
            'phone_number' => ['nullable', 'string', 'regex:/^(0414|0424|0412|0416|0426|0422|02[0-9]{2})[0-9]{7}$/'],
            'is_mobile_payment_active' => 'boolean',
            'is_transfer_active' => 'boolean',
        ], [
            'identification_document.regex' => 'El formato de la Cédula o RIF es inválido. Ejemplos válidos: V-12345678, J-12345678-9, V12345678.',
            'phone_number.regex' => 'El formato del teléfono es inválido. Debe ser un número venezolano válido (ej. 04141234567).',
        ]);

        $bankAccount->update($validated);

        return redirect()->route('bank-accounts.index')->with('success', 'Cuenta bancaria actualizada exitosamente.');
    }

    public function destroy(Request $request, \App\Models\BankAccount $bankAccount)
    {
        // Check permissions
        if (!$request->user()->isAdmin() && $bankAccount->owner_id !== $request->user()->id) {
            abort(403);
        }

        // The bank account is soft deleted or cascade deleted.
        $bankAccount->delete();

        return redirect()->route('bank-accounts.index')->with('success', 'Cuenta bancaria eliminada.');
    }
}
