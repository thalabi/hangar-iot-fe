import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'jsonHighlight', standalone: true })
export class JsonHighlightPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(value: any): SafeHtml {
        if (!value) return '';
        const json = JSON.stringify(value, null, 2);

        // Regex to find JSON tokens and wrap them in Tailwind v4 classes
        const highlighted = json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let cls = 'text-gray-500'; // Default (numbers/delimiters)
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'text-blue-600 font-medium'; // Keys
                    } else {
                        cls = 'text-green-600'; // Strings
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'text-orange-500'; // Booleans
                } else if (/null/.test(match)) {
                    cls = 'text-purple-500'; // Null
                }
                return `<span class="${cls}">${match}</span>`;
            }
        );

        return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    }
}
