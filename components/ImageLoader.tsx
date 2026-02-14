
import React, { useState } from 'react';

interface ImageLoaderProps {
    src: string;
    alt: string;
    className?: string;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ src, alt, className = '' }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className="relative w-full h-full">
            {/* Skeleton loader */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 skeleton-pulse rounded-inherit" />
            )}

            {/* Actual image */}
            <img
                src={src}
                alt={alt}
                className={`${className} transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                onLoad={() => setIsLoaded(true)}
                onError={() => {
                    setHasError(true);
                    setIsLoaded(true);
                }}
            />

            {/* Error fallback */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-inherit">
                    <span className="text-xs text-white/30 font-bold">Image unavailable</span>
                </div>
            )}
        </div>
    );
};

export default ImageLoader;
