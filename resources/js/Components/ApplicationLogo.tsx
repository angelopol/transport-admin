import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#0c4a6e" />
                </linearGradient>
            </defs>
            {/* Shield Base */}
            <path
                d="M50 5 L90 25 V55 C90 75 50 95 50 95 C50 95 10 75 10 55 V25 L50 5 Z"
                fill="url(#logoGradient)"
            />
            {/* Bus/Pulse Graphic */}
            <circle cx="50" cy="50" r="28" fill="white" fillOpacity="0.15" />
            <path
                d="M38 42 H62 C64 42 65 43 65 45 V60 C65 61 64 62 62 62 H60 V64 H56 V62 H44 V64 H40 V62 H38 C36 62 35 61 35 60 V45 C35 43 36 42 38 42 Z"
                fill="white"
            />
            <rect x="38" y="46" width="24" height="8" fill="#0c4a6e" fillOpacity="0.8" />
            <circle cx="43" cy="58" r="2" fill="#0c4a6e" />
            <circle cx="57" cy="58" r="2" fill="#0c4a6e" />
        </svg>
    );
}
