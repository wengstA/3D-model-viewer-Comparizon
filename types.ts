// FIX: Using a full import of React makes the JSX namespace available for augmentation.
import React from 'react';

// Fix: Add global types for model-viewer custom element to be recognized by TypeScript in JSX.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.HTMLAttributes<HTMLElement> & {
        src?: string | null;
        alt?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
      };
    }
  }
}

export interface Asset {
  url: string;
  path: string;
}

export interface Viewer {
  id: string;
  title: string;
  files: FileList | null;
  directoryName: string | null;
}

export interface ComparisonItem {
  key: string;
  assets: (Asset | null)[];
  vote?: string | null; // Can be a viewer ID or 'all_bad'
  tags?: string[];
}