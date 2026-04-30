<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class VenezuelanDocument implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Expresión regular estricta para Cédulas y RIF venezolanos
        // Cédulas: V-12345678, E-8456123
        // RIFs: J-12345678-9, V-12345678-9
        $pattern = '/^[VEJPGvejpg]-\d{7,9}(?:-\d)?$/';

        if (!preg_match($pattern, $value)) {
            $fail('El campo :attribute no tiene un formato válido de Cédula o RIF (Ej. V-12345678 o J-12345678-9).');
        }
    }
}
