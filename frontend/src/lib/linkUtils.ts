import * as React from 'react';

// Utility function to convert URLs to clickable links.
// URLs render as a short labeled link (hostname), never the raw string.

function shortLabelForUrl(url: string): string {
    try {
        const withProtocol = url.startsWith('http') ? url : `https://${url}`;
        const host = new URL(withProtocol).hostname.replace(/^www\./, '');
        return host;
    } catch {
        return url.length > 30 ? `${url.slice(0, 27)}…` : url;
    }
}

export function renderTextWithLinks(text: string): React.ReactElement {
    if (!text) {
        return React.createElement('span', null, text);
    }

    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const parts = text.split(urlRegex);

    const elements = parts.map((part, index) => {
        const isUrl = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(part);

        if (isUrl) {
            const isEmail = part.includes('@') && !part.startsWith('http');
            let href = part;
            if (part.startsWith('www.')) {
                href = `https://${part}`;
            } else if (isEmail) {
                href = `mailto:${part}`;
            }

            const label = isEmail ? part : `${shortLabelForUrl(part)} →`;

            return React.createElement('a', {
                key: index,
                href: href,
                target: isEmail ? '_self' : '_blank',
                rel: isEmail ? undefined : 'noopener noreferrer',
                className: 'text-brand font-medium hover:underline break-words'
            }, label);
        }

        return React.createElement('span', { key: index }, part);
    });

    return React.createElement('span', null, elements);
}
