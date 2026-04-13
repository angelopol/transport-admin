import L from 'leaflet';

const busSvg = `
<svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="14" y="8" width="36" height="40" rx="10" fill="#2563EB"/>
  <rect x="18" y="14" width="28" height="12" rx="4" fill="#DBEAFE"/>
  <rect x="18" y="29" width="10" height="10" rx="2.5" fill="#BFDBFE"/>
  <rect x="36" y="29" width="10" height="10" rx="2.5" fill="#BFDBFE"/>
  <path d="M20 8V4M44 8V4" stroke="#1D4ED8" stroke-width="4" stroke-linecap="round"/>
  <circle cx="23" cy="50" r="5" fill="#0F172A"/>
  <circle cx="41" cy="50" r="5" fill="#0F172A"/>
  <circle cx="23" cy="50" r="2" fill="#E2E8F0"/>
  <circle cx="41" cy="50" r="2" fill="#E2E8F0"/>
</svg>`;

export const createTransportUnitIcon = (plate: string) =>
    L.divIcon({
        className: 'transport-unit-marker',
        html: `
            <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-6px);">
                <div style="width:48px;height:48px;border-radius:9999px;background:linear-gradient(135deg,#1d4ed8,#4f46e5);border:3px solid #ffffff;box-shadow:0 10px 25px rgba(15,23,42,0.28);display:flex;align-items:center;justify-content:center;">
                    ${busSvg}
                </div>
                <div style="margin-top:6px;padding:3px 8px;border-radius:9999px;background:#0f172a;color:#ffffff;font-size:11px;font-weight:700;line-height:1;letter-spacing:0.03em;box-shadow:0 6px 18px rgba(15,23,42,0.2);white-space:nowrap;">
                    ${plate}
                </div>
            </div>
        `,
        iconSize: [56, 68],
        iconAnchor: [28, 58],
        popupAnchor: [0, -52],
    });
