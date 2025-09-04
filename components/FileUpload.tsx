import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  title: string;
  description: string;
  onFilesSelected: (files: FileList) => void;
  fileCount: number;
  directoryName: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ title, description, onFilesSelected, fileCount, directoryName }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const buttonText = directoryName 
    ? directoryName 
    : (fileCount > 0 ? `${fileCount} files selected` : 'Select Directory');

  return (
    <div className="bg-white rounded-xl p-6 flex flex-col items-center justify-center text-center border border-gray-200 transition-all duration-300 hover:border-sky-500 hover:shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">{description}</p>
      
      <input
        type="file"
        ref={inputRef}
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
            {fileCount > 0 ? "Click to re-select" : "Your browser will ask for permission"}
        </span>
      </button>
      
    </div>
  );
};