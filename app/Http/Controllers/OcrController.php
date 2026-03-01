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
            $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => "Extrae única y exclusivamente el número de referencia (puede decir también número de operación, número de recibo, referencia, etc) de esta captura de pantalla de transferencia bancaria. Devuelve ÚNICAMENTE los números. Si no encuentras ningún número de referencia válido, devuelve un texto vacío."
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

                // Clean up any extra text to ensure we only have digits
                $extractedText = trim($extractedText);
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
