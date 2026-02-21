const sharp = require('sharp');

async function removeBackground(inputPath, outputPath) {
    // Read image data
    const { data, info } = await sharp(inputPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;

    // Create an array to keep track of visited pixels
    const visited = new Uint8Array(width * height);

    // Stack for flood fill
    const stack = [];

    // Function to push to stack
    const push = (x, y) => {
        if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = y * width + x;
            if (!visited[index]) {
                stack.push({ x, y });
                visited[index] = 1;
            }
        }
    };

    // Start flood fill from corners
    push(0, 0);
    push(width - 1, 0);
    push(0, height - 1);
    push(width - 1, height - 1);

    // Also from middle of edges
    push(Math.floor(width / 2), 0);
    push(Math.floor(width / 2), height - 1);
    push(0, Math.floor(height / 2));
    push(width - 1, Math.floor(height / 2));

    const threshold = 230; // Anything above this is considered white

    while (stack.length > 0) {
        const { x, y } = stack.pop();
        const baseIndex = (y * width + x) * 4;

        const r = data[baseIndex];
        const g = data[baseIndex + 1];
        const b = data[baseIndex + 2];

        // If it's a "white" background pixel
        if (r > threshold && g > threshold && b > threshold) {
            // Make it transparent
            data[baseIndex + 3] = 0;

            // Push neighbors
            push(x + 1, y);
            push(x - 1, y);
            push(x, y + 1);
            push(x, y - 1);
        }
    }

    // Write output
    await sharp(data, {
        raw: {
            width: width,
            height: height,
            channels: 4
        }
    })
        .toFile(outputPath);

    console.log("Done");
}

removeBackground(
    '/home/dave-r/Documents/Antigravity Files/Realtor Homepage/public/phone-dialer.png',
    '/home/dave-r/Documents/Antigravity Files/Realtor Homepage/public/phone-dialer.png'
).catch(console.error);
