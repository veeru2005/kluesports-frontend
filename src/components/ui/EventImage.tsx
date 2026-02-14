import { useState, useEffect } from "react";

interface EventImageProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * Smart event image component that detects the image aspect ratio:
 * - Square images (1:1 like 1080x1080): Displayed with object-contain + blurred
 *   background on top/bottom gaps
 * - Poster/tall images (like A4, 3:4, etc): Displayed normally with object-cover
 *   filling the entire container
 */
export const EventImage = ({ src, alt, className = "" }: EventImageProps) => {
    const [isSquare, setIsSquare] = useState<boolean | null>(null);

    useEffect(() => {
        if (!src) return;

        const img = new Image();
        img.onload = () => {
            const ratio = img.naturalWidth / img.naturalHeight;
            // Consider it "square" if the aspect ratio is close to 1:1
            // (within 15% tolerance to account for near-square images)
            setIsSquare(ratio > 0.85 && ratio < 1.15);
        };
        img.onerror = () => {
            setIsSquare(false);
        };
        img.src = src;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    // While loading, show a minimal placeholder
    if (isSquare === null) {
        return (
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-cover ${className}`}
            />
        );
    }

    if (isSquare) {
        return (
            <>
                {/* Blurred background for top/bottom gaps */}
                <img
                    src={src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60"
                />
                {/* Actual image - contained to maintain 1:1 aspect ratio */}
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-contain relative z-[1] ${className}`}
                />
            </>
        );
    }

    // Poster/tall image - fill the container normally
    return (
        <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${className}`}
        />
    );
};
