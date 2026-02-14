
import React from 'react';

const VelenciaLogo: React.FC<{ className?: string }> = ({ className = "h-8" }) => (
    <svg
        viewBox="0 0 400 120"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="VELENCIA"
    >
        {/* Stylized V/Leaf Icon Group */}
        <g transform="translate(160, 20) scale(0.6)">
            <path d="M50 0 L100 0 L75 40 Z" fill="currentColor" opacity="0.9" />
            <path d="M50 0 L0 0 L25 40 Z" fill="currentColor" opacity="0.9" />
            <path d="M25 40 L75 40 L50 80 Z" fill="currentColor" opacity="1" />
            <path d="M50 80 L75 40 L100 80 Z" fill="currentColor" opacity="0.7" />
            <path d="M50 80 L25 40 L0 80 Z" fill="currentColor" opacity="0.7" />
        </g>

        {/* Text: VELENCIA */}
        <text
            x="200"
            y="85"
            textAnchor="middle"
            fontFamily="Serif"
            fontSize="48"
            fontWeight="300"
            letterSpacing="0.4em"
            fill="currentColor"
        >
            VELENCIA
        </text>

        {/* Subtext: INTERIOR (optional, keeping it fashion relevant or omitting) */}
        {/* Omitting "INTERIOR" for now as per fashion context unless requested */}
    </svg>
);

export default VelenciaLogo;
