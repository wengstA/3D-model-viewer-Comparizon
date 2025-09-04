import React from 'react';
import type { ComparisonItem } from '../types';
import { Placeholder } from './Placeholder';
import { SpinnerIcon } from './icons';

// Fix: Correctly typed the 'model-viewer' custom element for JSX.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Fix: Updated the type definition for the 'model-viewer' custom element to use a more robust
      // type, which resolves the "Property 'model-viewer' does not exist" TypeScript error.
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string | null;
        alt?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
      };
    }
  }
}

interface ComparisonViewProps {
  items: ComparisonItem[];
  isLoading: boolean;
  v1DirName: string | null;
  v2DirName: string | null;
}

const is3DModel = (filePath: string | null): boolean => {
    if (!filePath) return false;
    const supportedExtensions = ['.glb', '.gltf'];
    const lowercased = filePath.toLowerCase();
    return supportedExtensions.some(ext => lowercased.endsWith(ext));
};

const RenderableAsset: React.FC<{ 
    url: string | null, 
    path: string | null, 
    altText: string, 
    placeholderText: string,
    aspectRatioClass?: string;
}> = ({ url, path, altText, placeholderText, aspectRatioClass = 'aspect-square' }) => {
    if (!url) {
        return <Placeholder text={placeholderText} aspectRatioClass={aspectRatioClass} />;
    }

    const wrapperClassNames = `w-full rounded-md ${aspectRatioClass} bg-black/5 backdrop-blur-sm border border-gray-200 overflow-hidden`;
    const innerClassNames = `w-full h-full`;

    if (is3DModel(path)) {
        return (
            <div className={wrapperClassNames}>
                <model-viewer
                    src={url}
                    alt={altText}
                    camera-controls
                    auto-rotate
                    className={innerClassNames}
                />
            </div>
        );
    }

    return (
        <div className={wrapperClassNames}>
            <img src={url} alt={altText} className={`${innerClassNames} object-contain`} />
        </div>
    );
};


interface ComparisonCardProps {
    item: ComparisonItem;
    v1DirName: string | null;
    v2DirName: string | null;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ item, v1DirName, v2DirName }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-mono text-cyan-600 break-all" title={item.key}>{item.key}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
                <div className="flex flex-col md:col-span-1">
                    <h4 className="font-semibold text-center mb-2 text-gray-800">Input Image</h4>
                    <RenderableAsset
                        url={item.inputUrl}
                        path={item.inputPath}
                        altText="Input"
                        placeholderText="No Input Image"
                    />
                </div>
                <div className="flex flex-col md:col-span-2">
                    <h4 className="font-semibold text-center mb-2 text-gray-800">
                        {v1DirName ? `${v1DirName} Render` : 'Version 1 Render'}
                    </h4>
                    <RenderableAsset
                        url={item.v1Url}
                        path={item.v1Path}
                        altText="Version 1"
                        placeholderText="No Version 1 File"
                        aspectRatioClass="aspect-[4/5]"
                    />
                </div>
                 <div className="flex flex-col md:col-span-2">
                    <h4 className="font-semibold text-center mb-2 text-gray-800">
                        {v2DirName ? `${v2DirName} Render` : 'Version 2 Render'}
                    </h4>
                    <RenderableAsset
                        url={item.v2Url}
                        path={item.v2Path}
                        altText="Version 2"
                        placeholderText="No Version 2 File"
                        aspectRatioClass="aspect-[4/5]"
                    />
                </div>
            </div>
        </div>
    );
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({ items, isLoading, v1DirName, v2DirName }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-10 mt-8 bg-white rounded-lg shadow">
                <SpinnerIcon className="animate-spin h-8 w-8 text-sky-600" />
                <p className="mt-4 text-lg text-gray-700">Processing files...</p>
            </div>
        );
    }
    
    if (items.length === 0) {
        return (
             <div className="text-center p-10 mt-8 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900">Ready to Compare</h3>
                <p className="mt-2 text-gray-600">Upload at least one directory to begin comparison.</p>
            </div>
        );
    }

  return (
    <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Comparison Results</h2>
        <div className="space-y-6">
            {items.map(item => (
                <ComparisonCard 
                    key={item.key} 
                    item={item} 
                    v1DirName={v1DirName}
                    v2DirName={v2DirName}
                />
            ))}
        </div>
    </div>
  );
};