// footer.js - Social media footer component with scraper protection

// Social media data with obfuscated links
const socialMedia = [
    {
        name: 'BlueSky',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzAwOTZmZiIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTJTMTguNjI3IDAgMTIgMHptLTIgMTdINi4wMThjLTEuMTEgMC0xLjUzMy0xLjQyNC0uNjM1LTIuMTI3bDYuNzU4LTUuMzA3YS43NS43NSAwIDAgMSAuODkyLS4wMDRsNC4xMDIgMy4wOTVMMTAgMTd6bTEwLTMuNTM1TDE1LjM2NiA5Ljk5YS43NS43NSAwIDAgMC0uODkyLjAwNGwtMy4wMTQgMi4zNDUgNS40MDQtNC4wMTVjLjlhLjcwNC43MDQgMCAwIDAgLjA5Ni0xLjA4OUwxNC43NzUgNUgyMHYzLjIyMWMwIC40MS0uMi43OTUtLjU0IDEuMDI5TDIwIDEzLjQ2NXoiLz48L3N2Zz4=',
        // Split URL into parts to prevent easy scraping
        parts: ['https://', 'bsky.app', '/profile/', 'shuchia'],
        // Additional security: encode username (can be decoded at runtime)
        encodedUsername: btoa('username')
    },
    {
        name: 'LinkedIn',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzAwNzZiMiIgZD0iTTIwLjQ0NyAyMC40NTJoLTMuNTU0di01LjU2OWMwLTEuMzI4LS4wMjctMy4wMzctMS44NTItMy4wMzctMS44NTMgMC0yLjEzNiAxLjQ0NS0yLjEzNiAyLjkzOXY1LjY2N0g5LjM1MVY5aDMuNDE0djEuNTYxaC4wNDZjLjQ3Ny0uOSAxLjYzNy0xLjg1IDMuMzctMS44NSAzLjYwMSAwIDQuMjY3IDIuMzcgNC4yNjcgNS40NTV2Ni4yODZ6TTUuMzM3IDcuNDMzYTIuMDYyIDIuMDYyIDAgMCAxLTIuMDYzLTIuMDY1IDIuMDY0IDIuMDY0IDAgMSAxIDIuMDYzIDIuMDY1em0xLjc4MiAxMy4wMTlIMy41NTVWOWgzLjU2NHYxMS40NTJ6TTIyLjIyNSAwSDEuNzc1Qy43OTYgMCAwIC43NzQgMCAxLjcyOXYyMC41NDJDMCAyMy4yMjcuNzk2IDI0IDEuNzc1IDI0aDIwLjQ1QzIzLjIwNCAyNCAyNCAyMy4yMjcgMjQgMjIuMjcxVjEuNzI5QzI0IC43NzQgMjMuMjA0IDAgMjIuMjI1IDB6Ii8+PC9zdmc+',
        parts: ['https://', 'linkedin.com', '/in/', 'shuchi-a'],
        encodedUsername: btoa('username')
    },
    {
        name: 'Instagram',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGxpbmVhckdyYWRpZW50IGlkPSJpbnN0YV9ncmFkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjE1MiIgeTE9IjE5LjUiIHgyPSIxNTIiIHkyPSIyNDQuNSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCguMTI1IDAgMCAtLjEyNSAtNiAzNCkiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2ZmZDYwMCIvPjxzdG9wIG9mZnNldD0iLjEiIHN0b3AtY29sb3I9IiNmZjY3MDIiLz48c3RvcCBvZmZzZXQ9Ii41IiBzdG9wLWNvbG9yPSIjZmYwMGIyIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNTE1OWU1Ii8+PC9saW5lYXJHcmFkaWVudD48cGF0aCBmaWxsPSJ1cmwoI2luc3RhX2dyYWQpIiBkPSJNMTIgMEM4Ljc0IDAgOC4zMzMuMDE1IDcuMDUzLjA3MiA1Ljc3NS4xMzIgNC45MDUuMzMzIDQuMTQuNjNjLS43OC4zMDYtMS40NTkuNzE3LTIuMTI2IDEuMzg0UzEuMTM2IDMuMzYuODMgNC4xNGMtLjI5Ny43NjUtLjQ5OSAxLjYzNS0uNTU4IDIuOTEzQy4yMTQgOC4zMzMuMiA4Ljc0IDAgMTJjMCAzLjI2LjAxNCAzLjY2Ny4wNzIgNC45NDcuMDYgMS4yNzcuMjYxIDIuMTQ4LjU1OCAyLjkxMy4zMDYuNzguNzE3IDEuNDU4IDEuMzg0IDIuMTI2LjY2Ny42NjcgMS4zNDYgMS4wNzggMi4xMjYgMS4zODQuNzY1LjI5NiAxLjYzNi40OTggMi45MTMuNTU3QzguMzMzIDIzLjk4OCA4Ljc0IDI0IDEyIDI0czMuNjY3LS4wMTUgNC45NDctLjA3MmMxLjI3Ny0uMDYgMi4xNDgtLjI2MiAyLjkxMy0uNTU4Ljc4LS4zMDYgMS40NTktLjcxOCAyLjEyNi0xLjM4NC42NjctLjY2OCAxLjA3OC0xLjM0NyAxLjM4NC0yLjEyNi4yOTYtLjc2NS40OTgtMS42MzYuNTU3LTIuOTEzLjA2LTEuMjguMDcyLTEuNjg3LjA3Mi00Ljk0NyAwLTMuMjYtLjAxNS0zLjY2Ny0uMDcyLTQuOTQ3LS4wNi0xLjI3Ny0uMjYyLTIuMTQ5LS41NTgtMi45MTMtLjMwNi0uNzgtLjcxOC0xLjQ1OS0xLjM4NC0yLjEyNkMyMS4zMTkgMS4zNDcgMjAuNjQuOTM2IDE5Ljg2LjYzYy0uNzY1LS4yOTctMS42MzYtLjQ5OS0yLjkxMy0uNTU4QzE1LjY2Ny4wMTQgMTUuMjYgMCAxMiAwem0wIDIuMTZjMy4yMDMgMCAzLjU4NS4wMTYgNC44NS4wNzEgMS4xNy4wNTUgMS44MDUuMjQ5IDIuMjI3LjQxNS41NjIuMjE3Ljk2LjQ3NyAxLjM4Mi44OTYuNDE5LjQyLjY3OS44MTkuODk2IDEuMzgxLjE2NC40MjIuMzYgMS4wNTcuNDEzIDIuMjI3LjA1NyAxLjI2Ni4wNyAxLjY0Ni4wNyA0Ljg1IDAgMy4yMDQtLjAxNSAzLjU4NS0uMDc0IDQuODUtLjA2MSAxLjE3LS4yNTYgMS44MDUtLjQyMSAyLjIyNy0uMjI0LjU2Mi0uNDc5Ljk2LS44OTkgMS4zODItLjQxOS40MTktLjgyNC42NzktMS4zOC44OTYtLjQyLjE2NC0xLjA2NS4zNi0yLjIzNS40MTMtMS4yNzQuMDU3LTEuNjQ5LjA3LTQuODU5LjA3LTMuMjExIDAtMy41ODYtLjAxNS00Ljg1OS0uMDc0LTEuMTcxLS4wNjEtMS44MTYtLjI1Ni0yLjIzNi0uNDIxLS41NjktLjIyNC0uOTYtLjQ3OS0xLjM3OS0uODk5LS40MjEtLjQxOS0uNjktLjgyNC0uOS0xLjM4LS4xNjUtLjQyLS4zNTktMS4wNjUtLjQyLTIuMjM1LS4wNDUtMS4yNi0uMDYxLTEuNjQ5LS4wNjEtNC44NDQgMC0zLjE5Ni4wMTYtMy41ODYuMDYxLTQuODYxLjA2MS0xLjE3LjI1NS0xLjgxNC40Mi0yLjIzNC4yMS0uNTcuNDc5LS45Ni45LTEuMzgxLjQxOS0uNDE5LjgxLS42OSAxLjM3OS0uODk4LjQyLS4xNjYgMS4wNTEtLjM2MSAyLjIyMS0uNDIxIDEuMjc1LS4wNDUgMS42NS0uMDYgNC44NTktLjA2em0wIDMuNjc4YTYuMTYyIDYuMTYyIDAgMSAwIDAgMTIuMzI0IDYuMTYyIDYuMTYyIDAgMSAwIDAtMTIuMzI0ek0xMiAxNmEzLjk5OSAzLjk5OSAwIDEgMSAwLTguMDA0QTQuMDAyIDQuMDAyIDAgMCAxIDEyIDE2em03LjgzMi05LjM1YTEuNDQgMS40NCAwIDEgMSAwLTIuODggMS40NCAxLjQ0IDAgMCAxIDAgMi44OHoiLz48L3N2Zz4=',
        parts: ['http://', 'instagram.com', '/', 'shuchi__/'],
        encodedUsername: btoa('username')
    },
    {
        name: 'GitHub',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzE4MTcxNyIgZD0iTTEyIDBDNS4zNzMgMCAwIDUuMzczIDAgMTJjMCA1LjMwMyAzLjQzOCA5LjggOC4yMDcgMTEuMzg3LjYuMTEzLjc5My0uMjU4Ljc5My0uNTc3IDAtLjI4NS0uMDEzLTEuMjI0LS4wMTMtMi4yMjctMy4zMzkuNzI0LTQuMDQzLTEuNi00LjA0My0xLjYtLjU0Ni0xLjM4NC0xLjMzMy0xLjc1NS0xLjMzMy0xLjc1NS0xLjA5LS43NDMuMDgzLS43MjkuMDgzLS43MjkgMS4yMDUuMDg0IDEuODQgMS4yMzcgMS44NCAxLjIzNyAxLjA3IDEuODM0IDIuODA4IDEuMzA0IDMuNDkuOTk3LjEwOC0uNzc2LjQxOC0xLjMwNS43NjItMS42MDQtMi42NjUtLjMwNS01LjQ2Ny0xLjMzNC01LjQ2Ny01LjkzMSAwLTEuMzExLjQ2OS0yLjM4MSAxLjIzNi0zLjIyMS0uMTI0LS4zMDMtLjUzNS0xLjUyNC4xMTctMy4xNzYgMCAwIDEuMDA4LS4zMjIgMy4zMDEgMS4yMy45NTgtLjI2NiAxLjk4My0uMzk5IDMuMDAzLS40MDQgMS4wMjAuMDA1IDIuMDQ3LjEzOCAzLjAwNi40MDQgMi4yOTEtMS41NTIgMy4yOTctMS4yMyAzLjI5Ny0xLjIzLjY1MyAxLjY1My4yNDIgMi44NzMuMTE4IDMuMTc2Ljc3LjQ0IDEuMjM1IDEuNTExIDEuMjM1IDMuMjIxIDAgNC42MDktMi44MDcgNS42MjQtNS40NzkgNS45MjEuNDMuMzcyLjgyMyAxLjEwMi44MjMgMi4yMjIgMCAxLjYwNi0uMDE1IDIuODk4LS4wMTUgMy4yOTEgMCAuMzIuMjA5LjY5NC43OTUuNTc3QzIwLjU2NSAyMS43OTYgMjQgMTcuMyAyNCAxMmMwLTYuNjI3LTUuMzczLTEyLTEyLTEyeiIvPjwvc3ZnPg==',
        parts: ['http://', 'github.com', '/', 'shuchi-a'],
        encodedUsername: btoa('username')
    }
];

// Additional security measures
const securityOptions = {
    // Add noise to confuse scrapers (random delay before navigation)
    addRandomDelay: true,
    // Log access attempts
    logAccess: true,
    // Use encoded usernames rather than plaintext
    useEncodedUsernames: true,
    // Add honeypot links that real users won't click but scrapers might
    addHoneypotLinks: true
};

// Function to assemble the URL when clicked, preventing scraping
function createSocialIcon(social) {
    const img = document.createElement('img');
    img.src = social.icon;
    img.alt = social.name;
    img.title = social.name;
    img.className = 'social-icon';
    img.setAttribute('loading', 'lazy'); // For performance

    // Add click event instead of using an anchor tag
    img.addEventListener('click', function () {
        if (securityOptions.logAccess) {
            // Log this click (could send to analytics or your server)
            logSocialClick(social.name);
        }

        // Assemble the URL only at click time
        let parts = [...social.parts]; // Clone array to avoid modifying original

        // Replace username part with decoded version if needed
        if (securityOptions.useEncodedUsernames) {
            const usernameIndex = parts.length - 1;
            // If this part contains "username", replace it with the decoded value
            if (parts[usernameIndex].includes('username')) {
                parts[usernameIndex] = atob(social.encodedUsername);
            }
        }

        const fullUrl = parts.join('');

        // Add random delay to confuse timing-based scrapers
        if (securityOptions.addRandomDelay) {
            const delay = Math.floor(Math.random() * 300);
            setTimeout(() => {
                window.open(fullUrl, '_blank');
            }, delay);
        } else {
            window.open(fullUrl, '_blank');
        }
    });

    return img;
}

// Function to log social media access
function logSocialClick(socialName) {
    // You could send this to your server or analytics
    console.log(`Social icon clicked: ${socialName} at ${new Date().toISOString()}`);

    // Optional: send to server
    try {
        fetch('/api/log-social-click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                social: socialName,
                timestamp: Date.now(),
                page: window.location.href,
                referrer: document.referrer
            }),
            keepalive: true // Ensures delivery even if navigating away
        });
    } catch (e) {
        // Silent fail - don't disrupt user experience
    }
}

// Add honeypot links that real users won't see but scrapers might find
function addHoneypotLinks() {
    if (!securityOptions.addHoneypotLinks) return;

    const container = document.createElement('div');
    container.style.opacity = '0';
    container.style.position = 'absolute';
    container.style.pointerEvents = 'none';
    container.style.height = '0';
    container.style.overflow = 'hidden';
    container.setAttribute('aria-hidden', 'true');

    // Add fake links that scrapers might follow
    const honeypotSocials = [
        { name: 'Twitter', url: '/honeypot/twitter' },
        { name: 'Facebook', url: '/honeypot/facebook' }
    ];

    honeypotSocials.forEach(social => {
        const link = document.createElement('a');
        link.href = social.url;
        link.textContent = social.name;
        container.appendChild(link);
    });

    // Add to document but hidden from users
    document.body.appendChild(container);
}

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Add all social icons to the footer
    const socialLinksContainer = document.getElementById('social-links');

    if (socialLinksContainer) {
        socialMedia.forEach(social => {
            socialLinksContainer.appendChild(createSocialIcon(social));
        });
    }

    // Add honeypot links for scrapers
    addHoneypotLinks();
});

// Exports for other modules
export { socialMedia, securityOptions };