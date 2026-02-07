import { Gamepad2 } from "lucide-react";

export const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative w-16 h-16">
                {/* Rotating dashed circle */}
                <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                        border: '3px dashed',
                        borderColor: 'hsl(0, 85%, 50%)',
                        animationDuration: '2s'
                    }}
                />
                {/* Game icon in center */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Gamepad2 className="w-7 h-7 text-primary" />
                </div>
            </div>
            <p className="text-lg font-display flame-text tracking-wider">Loading...</p>
        </div>
    );
};
