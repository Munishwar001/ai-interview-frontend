import { Injectable } from '@angular/core';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class FileActionsService {
  private readonly apiBaseUrl = environment.url.replace(/\/$/, '');

  private toAbsoluteUrl(fileUrl: string): string {
    if (/^(https?:|blob:|data:)/i.test(fileUrl)) {
      return fileUrl;
    }

    if (fileUrl.startsWith('/')) {
      return `${this.apiBaseUrl}${fileUrl}`;
    }

    return `${this.apiBaseUrl}/${fileUrl}`;
  }

  openInNewTab(fileUrl: string): void {
    const url = this.toAbsoluteUrl(fileUrl);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  downloadFromUrl(fileUrl: string, fileName?: string): void {
    const url = this.toAbsoluteUrl(fileUrl);
    console.log('Downloading from URL:', url);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    if (fileName) {
      anchor.download = fileName;
    }
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  printFromUrl(fileUrl: string): void {
    const url = this.toAbsoluteUrl(fileUrl);
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');

    if (!printWindow) {
      this.openInNewTab(url);
      return;
    }

    printWindow.document.write(`
      <html>
        <head><title>Print</title></head>
        <body style="margin:0">
          <iframe id="print-frame" src="${url}" style="border:0;width:100vw;height:100vh"></iframe>
          <script>
            const frame = document.getElementById('print-frame');
            frame.addEventListener('load', function () {
              setTimeout(function () {
                window.focus();
                window.print();
              }, 200);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
