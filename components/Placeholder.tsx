import React from 'react';
import { FileIcon } from './icons';

interface PlaceholderProps {
  text: string;
  aspectRatioClass?: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({ text, aspectRatioClass = 'aspect-square' }) => {
  return (
    <div className={`${aspectRatioClass} w-full bg-black/5 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4`}>
      <FileIcon className="h-10 w-10 text-gray-400 mb-2" />
      <span className="text-xs text-gray-500 text-center font-medium">{text}</span>
    </div>
  );
};