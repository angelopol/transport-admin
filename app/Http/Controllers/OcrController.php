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
            'reference_image' => ['required', 'image', 'max:10240'],
        ]);

        $image = $request->file('reference_image');
        $imageBase64 = base64_encode(file_get_contents($image->getRealPath()));
        $mimeType = $image->getMimeType();

        $apiKey = trim((string) env('GEMINI_API_KEY'));
        $model  = env('GEMINI_MODEL', 'gemini-3.1-flash-lite');

        if (!$apiKey) {
            Log::error('OCR: GEMINI_API_KEY no configurada');
            return response()->json(['error' => 'API Key not configured'], 500);
        }

        $prompt = "Eres un asistente que lee comprobantes de Pago Móvil o transferencias bancarias venezolanas. "
            . "Lo NORMAL es que la imagen sea una FOTO tomada con otro teléfono a la pantalla de un dispositivo (con reflejos, brillo, inclinación, manos o bordes visibles); eso es completamente válido y esperado. "
            . "SIEMPRE intenta extraer el número de referencia (también llamado número de operación, comprobante o recibo), aunque la calidad sea baja o tengas dudas. "
            . "Devuelve un objeto JSON con: "
            . "'reference' (solo los dígitos del número de referencia que logres leer; cadena vacía si no encuentras ninguno) y "
            . "'is_receipt' (boolean). "
            . "Sé MUY permisivo con 'is_receipt': márcalo true si ves CUALQUIER indicio de una operación bancaria (montos, números de referencia/operación, nombres de bancos, fechas, datos de transferencia, una pantalla de app bancaria, etc.), aunque la foto sea borrosa, esté inclinada o tenga reflejos. "
            . "Marca 'is_receipt' como false ÚNICAMENTE si la imagen es OBVIAMENTE algo no relacionado (por ejemplo: un animal, un paisaje, una selfie, comida, o una imagen totalmente ajena a un pago). Ante la duda, usa true.";

        try {
            $response = Http::timeout(30)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $imageBase64,
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                    'responseSchema' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'reference'  => ['type' => 'STRING'],
                            'is_receipt' => ['type' => 'BOOLEAN'],
                        ],
                        'required' => ['reference', 'is_receipt'],
                    ],
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $rawText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

                // The structured-output response is a JSON string; decode defensively.
                $parsed = json_decode(trim($rawText), true);

                $referenceRaw = is_array($parsed) ? ($parsed['reference'] ?? '') : $rawText;
                $isReceipt    = is_array($parsed) ? (bool) ($parsed['is_receipt'] ?? true) : true;

                // Keep only the longest run of digits as the reference number.
                preg_match('/[0-9]{4,}/', (string) $referenceRaw, $matches);
                $referenceNumber = $matches[0] ?? '';

                Log::info("OCR ok (model={$model}): raw='{$rawText}' reference='{$referenceNumber}' is_receipt=" . ($isReceipt ? '1' : '0'));

                // Always return 200: extract whatever we found and warn if it looks off,
                // instead of blocking the user. The operator can still correct it manually.
                $warning = null;
                if (!$isReceipt) {
                    $warning = 'La imagen no parece un comprobante bancario válido. Verifica la referencia antes de guardar.';
                } elseif ($referenceNumber === '') {
                    $warning = 'No se pudo leer el número de referencia automáticamente. Ingrésalo manualmente.';
                }

                return response()->json([
                    'reference' => $referenceNumber,
                    'valid'     => $isReceipt,
                    'warning'   => $warning,
                    'detail'    => $rawText, // respuesta cruda del modelo, para diagnóstico en UI
                ]);
            }

            // Non-2xx from Google. Logs the EXACT status + body so a key restriction
            // (HTTP 403 "Requests from referer/IP are blocked") or a regional block
            // ("User location is not supported for the API use") is visible verbatim.
            $googleMsg = $response->json('error.message') ?? $response->body();
            Log::error("Gemini API Error (model={$model}, status={$response->status()}): " . $response->body());
            return response()->json([
                'error'  => 'Failed to extract reference',
                'detail' => "HTTP {$response->status()}: {$googleMsg}",
            ], 500);
        } catch (\Exception $e) {
            // Network/timeout/DNS failures reaching Google land here.
            Log::error('OCR Exception: ' . $e->getMessage());
            return response()->json([
                'error'  => 'Server error extracting reference',
                'detail' => $e->getMessage(),
            ], 500);
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
