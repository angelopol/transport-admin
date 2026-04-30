<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OcrController extends Controller
{
    public function extractReference(Request $request)
    {
        $request->validate([
            'reference_image' => ['required', 'image', 'max:5120'],
        ]);

        $image = $request->file('reference_image');
        $imageBase64 = base64_encode(file_get_contents($image->getRealPath()));
        $mimeType = $image->getMimeType();

        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json(['error' => 'API Key not configured'], 500);
        }

        try {
            $response = Http::timeout(5)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => "Eres un experto auditor bancario. Tu tarea es extraer el número de referencia (también llamado número de operación o recibo) de una imagen de transferencia de Pago Móvil. PRECAUCIÓN ESTRICTA: Si la imagen provista NO es un comprobante bancario válido (ej. una foto de un animal, paisaje, recibo de compra, selfie, o basura), DEBES devolver exactamente la palabra 'FRAUDE'. Si es un comprobante válido, devuelve ÚNICAMENTE los números de la referencia. Si no encuentras el número, devuelve un texto vacío."
                            ],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $imageBase64,
                                ]
                            ]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $extractedText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

                // Clean up any extra text
                $extractedText = trim($extractedText);
                
                if (strtoupper(trim($extractedText)) === 'FRAUDE') {
                    return response()->json(['error' => 'FRAUDE_DETECTADO'], 422);
                }

                preg_match('/[0-9]{4,}/', $extractedText, $matches);
                $referenceNumber = $matches[0] ?? '';

                return response()->json(['reference' => $referenceNumber]);
            }

            Log::error('Gemini API Error: ' . $response->body());
            return response()->json(['error' => 'Failed to extract reference'], 500);
        } catch (\Exception $e) {
            Log::error('OCR Exception: ' . $e->getMessage());
            return response()->json(['error' => 'Server error extracting reference'], 500);
        }
    }

    /**
     * Placeholder function to verify a payment reference with a bank's API.
     * Currently returns true as the bank API is not yet integrated.
     */
    public function verifyPaymentReference(Request $request)
    {
        $request->validate([
            'reference_number' => ['required', 'string'],
            // 'bank_account_id' => ['required', 'exists:bank_accounts,id'],
        ]);

        // TODO: Integrate actual Bank API verification logic here

        return response()->json([
            'verified' => true,
            'message' => 'Payment reference verification simulated successfully.',
        ]);
    }
}
