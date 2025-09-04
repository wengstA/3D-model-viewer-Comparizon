import React, { useState, useRef, useEffect } from 'react';
import type { Viewer } from '../types';
import { UploadIcon, CloseIcon } from './icons';

interface ViewerCardProps {
  viewer: Viewer;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Viewer>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragging: boolean;
}

export const ViewerCard: React.FC<ViewerCardProps> = ({
  viewer,
  onRemove,
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}) => {
  const [title, setTitle] = useState(viewer.title);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(viewer.title);
  }, [viewer.title]);

  const handleTitleUpdate = () => {
    if (title.trim() && title !== viewer.title) {
        onUpdate(viewer.id, { title });
    } else {
        // Reset to original title if input is empty
        setTitle(viewer.title);
    }
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur(); // Triggers onBlur which saves the title
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const firstFile = event.target.files[0] as any;
      const dirName = firstFile.webkitRelativePath ? firstFile.webkitRelativePath.split('/')[0] : 'Selected Files';
      onUpdate(viewer.id, { files: event.target.files, directoryName: dirName });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const buttonText = viewer.directoryName
    ? viewer.directoryName
    : (viewer.files && viewer.files.length > 0 ? `${viewer.files.length} files selected` : 'Select Directory');

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, viewer.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, viewer.id)}
      onDragEnd={onDragEnd}
      className={`relative flex-shrink-0 w-80 bg-white rounded-xl p-6 flex flex-col items-center justify-center text-center border border-gray-200 transition-all duration-300 hover:border-sky-500 hover:shadow-lg cursor-grab ${isDragging ? 'opacity-50 border-sky-500 shadow-xl' : 'opacity-100'}`}
    >
      <button
        onClick={() => onRemove(viewer.id)}
        className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
        aria-label="Remove Viewer"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
      
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleUpdate}
        onKeyDown={handleTitleKeyDown}
        className="text-lg font-semibold text-gray-800 bg-gray-100 border-2 border-transparent focus:border-sky-500 focus:bg-white focus:ring-0 rounded-lg text-center w-full mb-4 p-2 transition-all duration-200"
        placeholder="Viewer Title"
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        // @ts-ignore
        webkitdirectory="true"
        mozdirectory="true"
        directory="true"
        multiple
      />

      <button
        onClick={handleButtonClick}
        className="relative group w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-sky-500 transition-colors duration-300"
      >
        <UploadIcon className="h-10 w-10 text-gray-400 group-hover:text-sky-500 transition-colors" />
        <span 
            className="mt-2 text-sm font-semibold text-gray-700 group-hover:text-sky-600 w-full truncate px-2"
            title={buttonText}
        >
          {buttonText}
        </span>
        <span className="mt-1 text-xs text-gray-500">
            {viewer.files && viewer.files.length > 0 ? "Click to re-select" : "Your browser will ask for permission"}
        </span>
      </button>
    </div>
  );
};