import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'jsonHighlight',
    standalone: true
})
export class JsonHighlightPipe implements PipeTransform {

    private sanitizer = inject(DomSanitizer);
    private datePipe = inject(DatePipe);

    private isoRegex =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/;

    transform(value: any): SafeHtml {
        if (!value) return '';

        const processed = this.convertDates(value);
        const json = JSON.stringify(processed, null, 2);

        const highlighted = json.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let cls = 'text-gray-500';

                if (/^"/.test(match)) {
                    cls = /:$/.test(match)
                        ? 'text-blue-600 font-medium'
                        : 'text-green-600';
                } else if (/true|false/.test(match)) {
                    cls = 'text-orange-500';
                } else if (/null/.test(match)) {
                    cls = 'text-purple-500';
                }

                return `<span class="${cls}">${match}</span>`;
            }
        );

        return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    }

    private convertDates(obj: any): any {
        if (obj == null) return obj;

        // Real Date object
        if (obj instanceof Date) {
            return this.formatWithRelative(obj);
        }

        // ISO string
        if (typeof obj === 'string' && this.isoRegex.test(obj)) {
            const date = new Date(obj);
            return this.formatWithRelative(date);
        }

        // Epoch millis
        if (typeof obj === 'number' && obj > 1000000000000) {
            const date = new Date(obj);
            return this.formatWithRelative(date);
        }

        if (Array.isArray(obj)) {
            return obj.map(v => this.convertDates(v));
        }

        if (typeof obj === 'object') {
            const copy: any = {};
            for (const key of Object.keys(obj)) {
                copy[key] = this.convertDates(obj[key]);
            }
            return copy;
        }

        return obj;
    }

    private formatWithRelative(date: Date): string {
        const formatted = this.datePipe.transform(date, 'short') ?? date.toString();
        const relative = this.getRelativeTime(date);

        return `${formatted} (${relative})`;
    }

    private getRelativeTime(date: Date): string {
        const now = new Date().getTime();
        const diff = now - date.getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;

        return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`;
    }


}
