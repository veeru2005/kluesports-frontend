
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'contact us.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const lottieData = JSON.parse(rawData);

    let modifications = 0;

    function traverse(obj) {
        if (!obj || typeof obj !== 'object') return;

        // Check if this object looks like a color property
        // Lottie colors are often in 'k' property of a 'c' (color) shape property, or just arrays[4]
        // Often structure: { ty: 'fl' (fill) or 'st' (stroke), c: { k: [r, g, b, a] } }

        if (obj.k && Array.isArray(obj.k) && obj.k.length === 4) {
            const [r, g, b, a] = obj.k;

            // Check if values are numbers 0-1
            if (typeof r === 'number' && r <= 1 && b <= 1) {
                // Heuristic for Blue-ish color: Blue is significantly higher than Red and Green
                // And Blue > 0.4 (not black/dark grey)
                const isBlueDominant = (b > r + 0.1) && (b > g); // Simple dominant check

                if (isBlueDominant) {
                    console.log(`Swapping Blue Color: [${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)}]`);
                    // Simple RGB Swap: Make it Red Dominant by swapping R and B?
                    // Blue [0.2, 0.3, 0.8] -> Red [0.8, 0.3, 0.2]

                    obj.k[0] = b; // Set Red to what Blue was
                    obj.k[2] = r; // Set Blue to what Red was

                    // Keep Green as is, or adjust if needed.
                    // Special case: Light Blue [0.5, 0.6, 1] -> [1, 0.6, 0.5] (Salmon/Pink). Perfect.
                    // Deep Blue [0.2, 0.3, 0.8] -> [0.8, 0.3, 0.2] (Deep Red). Perfect.

                    modifications++;
                }
            }
        }

        // Recursive traversal
        Object.keys(obj).forEach(key => {
            traverse(obj[key]);
        });
    }

    traverse(lottieData);

    console.log(`Total colors modified: ${modifications}`);

    if (modifications > 0) {
        fs.writeFileSync(filePath, JSON.stringify(lottieData));
        console.log('Successfully updated Lottie JSON.');
    } else {
        console.log('No blue colors found or modified.');
    }

} catch (error) {
    console.error('Error processing Lottie JSON:', error);
}
