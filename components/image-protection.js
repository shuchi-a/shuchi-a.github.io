// image-protection.js - Protect base64 and other images from easy copying

// Configuration options
const imageProtectionOptions = {
    // Disable right-click on images
    disableRightClick: true,

    // Add watermark to images
    addWatermark: true,
    watermarkText: '© 2025 Shuchi',
    watermarkOpacity: 0.3,

    // Prevent drag-and-drop of images
    preventDragDrop: true,

    // Disable ability to select images
    preventSelection: true,

    // Add canvas-based fingerprint
    addCanvasFingerprint: true,

    // Show warning when taking screenshots
    detectScreenshots: true,

    // Track image views with unique identifiers
    trackImageViews: true,

    // Block developer tools (basic prevention)
    blockDevTools: true
};

// Initialize all protection measures
function initializeImageProtection() {
    const protectedImages = document.querySelectorAll('.protected-image-container img');

    protectedImages.forEach(img => {
        // Add data attributes for tracking
        if (imageProtectionOptions.trackImageViews) {
            addTrackingIdentifier(img);
        }

        // Convert to canvas with watermark if needed
        if (imageProtectionOptions.addWatermark || imageProtectionOptions.addCanvasFingerprint) {
            convertToProtectedCanvas(img);
        }
    });

    // Add global event listeners
    addProtectionEventListeners();

    // Block developer tools if enabled
    if (imageProtectionOptions.blockDevTools) {
        setupDevToolsBlocker();
    }
}

// Add a unique tracking identifier to the image
function addTrackingIdentifier(imgElement) {
    // Create a unique ID based on timestamp and random number
    const uniqueId = `img_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    imgElement.setAttribute('data-tracking-id', uniqueId);

    // You could log the view to your server
    logImageView(uniqueId, imgElement.src);
}

// Log when an image is viewed
function logImageView(trackingId, imageSrc) {
    // Extract image identifier (or hash) but not the full base64 data
    let imageIdentifier = '';
    if (imageSrc.startsWith('data:image')) {
        // For base64, just get a short hash-like string instead of the full data
        imageIdentifier = imageSrc.substring(0, 40) + '...';
    } else {
        imageIdentifier = imageSrc;
    }

    // Send to server
    try {
        fetch('/api/log-image-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trackingId,
                imageIdentifier,
                timestamp: Date.now(),
                page: window.location.href,
                userAgent: navigator.userAgent,
                screenSize: `${window.innerWidth}x${window.innerHeight}`
            }),
            keepalive: true
        });
    } catch (e) {
        // Silent fail - don't disrupt user experience
    }
}

// Convert image to canvas with watermark and/or fingerprinting
function convertToProtectedCanvas(imgElement) {
    // Wait for image to load fully
    if (!imgElement.complete) {
        imgElement.onload = () => convertImageToCanvas(imgElement);
    } else {
        convertImageToCanvas(imgElement);
    }
}

// Actual conversion function
function convertImageToCanvas(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Match canvas size to image
    canvas.width = imgElement.naturalWidth || imgElement.width;
    canvas.height = imgElement.naturalHeight || imgElement.height;

    // Draw the image on canvas
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    // Add visible watermark if enabled
    if (imageProtectionOptions.addWatermark) {
        addWatermarkToCanvas(ctx, canvas.width, canvas.height);
    }

    // Add hidden fingerprint (not visible to user but traceable)
    if (imageProtectionOptions.addCanvasFingerprint) {
        addHiddenFingerprint(ctx, canvas.width, canvas.height);
    }

    // Replace original image with canvas
    canvas.className = imgElement.className;
    canvas.id = imgElement.id;
    canvas.alt = imgElement.alt;
    canvas.title = imgElement.title;

    // Copy over any data attributes
    for (const attr of imgElement.attributes) {
        if (attr.name.startsWith('data-')) {
            canvas.setAttribute(attr.name, attr.value);
        }
    }

    // Replace the image with our protected canvas
    imgElement.parentNode.replaceChild(canvas, imgElement);

    // Prevent canvas from being saved easily
    canvas.addEventListener('contextmenu', e => e.preventDefault());
}

// Add visible watermark to canvas
function addWatermarkToCanvas(ctx, width, height) {
    const text = imageProtectionOptions.watermarkText;

    // Set watermark style
    ctx.globalAlpha = imageProtectionOptions.watermarkOpacity;
    ctx.font = `${Math.max(16, Math.floor(width / 20))}px Arial`;
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;

    // Calculate position and rotation
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 6); // Rotate -30 degrees

    // Draw text multiple times as a pattern
    const textWidth = ctx.measureText(text).width;
    const repeatX = Math.ceil(1.5 * width / textWidth);
    const repeatY = Math.ceil(height / 30);
    const startX = -width;
    const startY = -height / 2;

    for (let y = 0; y < repeatY; y++) {
        for (let x = 0; x < repeatX; x++) {
            const xPos = startX + (x * textWidth * 1.5);
            const yPos = startY + (y * 30);

            // Draw with shadow effect for better visibility on any background
            ctx.fillText(text, xPos, yPos);
            ctx.strokeText(text, xPos, yPos);
        }
    }

    ctx.restore();
    ctx.globalAlpha = 1.0;
}

// Add invisible tracking fingerprint to image
function addHiddenFingerprint(ctx, width, height) {
    // Generate a unique identifier for this image view
    const fingerprintId = `f${Date.now()}${Math.floor(Math.random() * 1000000)}`;

    // Encode into binary
    const binaryId = fingerprintId.split('').map(char =>
        char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');

    // Steganography: subtly modify pixels in a pattern that's invisible to the eye
    // but can be detected with the right software
    const data = ctx.getImageData(0, 0, width, height);
    const pixels = data.data;

    // Only modify a small subset of pixels in a pattern
    for (let i = 0; i < binaryId.length; i++) {
        const bit = binaryId[i];
        // Calculate position (spread out fingerprint across image)
        const pos = (width * height / binaryId.length * i * 4) & 0xFFFFFFFC;

        if (pos + 3 < pixels.length) {
            // Least significant bit modification
            if (bit === '1') {
                pixels[pos + 3] |= 1; // Set last bit of alpha channel
            } else {
                pixels[pos + 3] &= 0xFE; // Clear last bit of alpha channel
            }
        }
    }

    ctx.putImageData(data, 0, 0);

    // Store the fingerprint ID for potential server verification
    return fingerprintId;
}

// Set up all the event listeners for protection
function addProtectionEventListeners() {
    // Disable right-click on images
    if (imageProtectionOptions.disableRightClick) {
        document.addEventListener('contextmenu', function (e) {
            const targetElement = e.target;
            // Check if the target is an image or canvas in our protected container
            if (targetElement.tagName === 'IMG' ||
                (targetElement.tagName === 'CANVAS' &&
                    targetElement.closest('.protected-image-container'))) {
                e.preventDefault();
                showCopyWarning();
                return false;
            }
        });
    }

    // Prevent drag and drop of images
    if (imageProtectionOptions.preventDragDrop) {
        document.addEventListener('dragstart', function (e) {
            if (e.target.tagName === 'IMG' ||
                (e.target.tagName === 'CANVAS' &&
                    e.target.closest('.protected-image-container'))) {
                e.preventDefault();
                return false;
            }
        });
    }

    // Prevent selection of images
    if (imageProtectionOptions.preventSelection) {
        const style = document.createElement('style');
        style.textContent = `
            .protected-image-container img, 
            .protected-image-container canvas {
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                pointer-events: none;
            }
            
            .protected-image-container {
                position: relative;
                pointer-events: auto;
                cursor: default;
            }
        `;
        document.head.appendChild(style);
    }

    // Add keyboard event listeners to detect screenshot attempts
    if (imageProtectionOptions.detectScreenshots) {
        // Connect to our screenshot detector if it exists
        if (typeof window.ScreenshotDetector !== 'undefined') {
            // The detector is loaded separately
            console.log('Screenshot detection active');
        } else {
            // Basic keyboard shortcut detection
            document.addEventListener('keydown', function (e) {
                // Detect common screenshot shortcuts
                // Windows: Alt+PrtScn, PrtScn, Win+Shift+S
                // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
                const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

                if ((isMac && e.metaKey && e.shiftKey &&
                    (e.key === '3' || e.key === '4' || e.key === '5')) ||
                    (!isMac && (e.key === 'PrintScreen' ||
                        (e.altKey && e.key === 'PrintScreen')))) {

                    showScreenshotWarning();
                    logScreenshotAttempt();
                }
            });
        }
    }
}

// Show copy warning message
function showCopyWarning() {
    const warning = document.createElement('div');
    warning.className = 'copy-warning';
    warning.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 16px;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;

    warning.textContent = 'This image is protected. Unauthorized copying is prohibited.';
    document.body.appendChild(warning);

    // Remove after 2 seconds
    setTimeout(() => {
        warning.style.opacity = '0';
        warning.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(warning);
        }, 500);
    }, 2000);
}

// Show warning when screenshot is detected
function showScreenshotWarning() {
    const warning = document.createElement('div');
    warning.className = 'screenshot-warning';
    warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: rgba(220, 53, 69, 0.9);
        color: white;
        padding: 10px;
        text-align: center;
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 16px;
        font-weight: bold;
    `;

    warning.textContent = 'Screenshot detected! Images on this site are protected by copyright.';
    document.body.appendChild(warning);

    // Remove after 3 seconds
    setTimeout(() => {
        warning.style.opacity = '0';
        warning.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(warning);
        }, 500);
    }, 3000);
}

// Log screenshot attempt to server
function logScreenshotAttempt() {
    try {
        fetch('/api/log-screenshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: Date.now(),
                page: window.location.href,
                userAgent: navigator.userAgent,
                visibleImages: getVisibleImageInfo()
            }),
            keepalive: true
        });
    } catch (e) {
        // Silent fail
    }
}

// Get information about currently visible images
function getVisibleImageInfo() {
    const visibleImages = [];
    document.querySelectorAll('.protected-image-container img, .protected-image-container canvas').forEach(img => {
        const rect = img.getBoundingClientRect();
        if (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        ) {
            visibleImages.push({
                id: img.id || 'unknown',
                trackingId: img.getAttribute('data-tracking-id') || 'unknown',
                visible: true,
                position: {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                }
            });
        }
    });

    return visibleImages;
}

// Set up basic dev tools blocker
function setupDevToolsBlocker() {
    // Method 1: Detect when dev tools opens by window size changes
    let devToolsDetectionInterval;

    // Check for devtools based on window dimensions
    const checkDevTools = () => {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
            // Dev tools likely open
            handleDevToolsOpen();
        }
    };

    // Start checking periodically
    devToolsDetectionInterval = setInterval(checkDevTools, 1000);

    // Method 2: Debug mode detection
    // This relies on the fact that the console.log function behaves differently when dev tools is open
    const consoleCheck = () => {
        const startTime = performance.now();
        console.log('%c', `
            background: red;
            color: white;
            padding: 8px 120px;
            line-height: 200px;
        `);
        const endTime = performance.now();

        if (endTime - startTime > 100) {
            // Dev tools likely open (console.log is much slower with dev tools open)
            handleDevToolsOpen();
        }
    };

    // Run console check occasionally
    setInterval(consoleCheck, 2000);
}

// Handle when dev tools is detected as open
function handleDevToolsOpen() {
    console.clear();
    console.log('%cThis website has security monitoring enabled', 'color: red; font-size: 24px; font-weight: bold;');
    console.log('%cAttempts to copy protected content may be logged', 'color: black; font-size: 16px;');

    // Optionally log this event to server
    try {
        fetch('/api/log-devtools-open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                timestamp: Date.now(),
                page: window.location.href,
                userAgent: navigator.userAgent
            }),
            keepalive: true
        });
    } catch (e) {
        // Silent fail
    }
}

// Initialize protection when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeImageProtection();
});

// Export functions for use in other modules
export {
    imageProtectionOptions,
    initializeImageProtection,
    showCopyWarning,
    showScreenshotWarning
};