import { useEffect } from 'react';
import { config } from '@/shared/config';

/** Sets the browser tab title to "<title> · <app name>" while the page is shown. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} · ${config.appName}`;
  }, [title]);
}
