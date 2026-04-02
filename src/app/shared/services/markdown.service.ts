import { Injectable } from '@angular/core';
import { marked } from 'marked';

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  /** Parse markdown string to HTML string */
  parse(text: string): string {
    return marked.parse(text ?? '') as string;
  }
}
