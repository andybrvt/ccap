import * as React from 'react';

// Utility function to convert URLs to clickable links

export function renderTextWithLinks(text: string): React.ReactElement {
    if (!text) {
        return React.createElement('span', null, text);
    }

    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const parts = text.split(urlRegex);

    const elements = parts.map((part, index) => {
        const isUrl = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/.test(part);

        if (isUrl) {
            let href = part;
            if (part.startsWith('www.')) {
                href = `https://${part}`;
            } else if (part.includes('@') && !part.startsWith('http')) {
                href = `mailto:${part}`;
            }

            return React.createElement('a', {
                key: index,
                href: href,
                target: part.includes('@') ? '_self' : '_blank',
                rel: part.includes('@') ? undefined : 'noopener noreferrer',
                className: 'text-blue-600 hover:text-blue-800 underline break-all'
            }, part);
        }

        return React.createElement('span', { key: index }, part);
    });

    return React.createElement('span', null, elements);
}