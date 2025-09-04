import React, { useState } from 'react';
import type { FileSet } from './types';
import { FileUpload } from './components/FileUpload';
import { ComparisonView } from './components/ComparisonView';
import { useFileProcessor } from './hooks/useFileProcessor';

const App: React.FC = () => {
  const [v1Files, setV1Files] = useState<FileSet>(null);
  const [v2Files, setV2Files] = useState<FileSet>(null);
  const [inputFiles, setInputFiles] = useState<FileSet>(null);
  
  const [v1DirName, setV1DirName] = useState<string | null>(null);
  const [v2DirName, setV2DirName] = useState<string | null>(null);
  const [inputDirName, setInputDirName] = useState<string | null>(null);

  const { comparisonData, isLoading } = useFileProcessor(v1Files, v2Files, inputFiles);

  const getDirName = (files: FileList): string | null => {
    if (files && files.length > 0) {
      const firstFile = files[0] as any;
      if (firstFile.webkitRelativePath) {
        return firstFile.webkitRelativePath.split('/')[0];
      }
    }
    return null;
  };

  const handleV1FilesSelected = (files: FileList) => {
    setV1Files(files);
    setV1DirName(getDirName(files));
  };

  const handleV2FilesSelected = (files: FileList) => {
    setV2Files(files);
    setV2DirName(getDirName(files));
  };

  const handleInputFilesSelected = (files: FileList) => {
    setInputFiles(files);
    setInputDirName(getDirName(files));
  };


  return (
    <div className="min-h-screen bg-[#f7f7f7] text-gray-900 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            3D Model Comparison Tool
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-600">
            Visually compare two versions of renders against input images. Upload your directories to get started.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FileUpload
            title="Input Images"
            description="The original reference images."
            onFilesSelected={handleInputFilesSelected}
            fileCount={inputFiles?.length || 0}
            directoryName={inputDirName}
          />
          <FileUpload
            title="Version 1 Renders"
            description="The first set of model outputs."
            onFilesSelected={handleV1FilesSelected}
            fileCount={v1Files?.length || 0}
            directoryName={v1DirName}
          />
          <FileUpload
            title="Version 2 Renders"
            description="The second set of model outputs."
            onFilesSelected={handleV2FilesSelected}
            fileCount={v2Files?.length || 0}
            directoryName={v2DirName}
          />
        </div>

        <div className="max-w-6xl mx-auto">
             <ComparisonView 
                items={comparisonData} 
                isLoading={isLoading} 
                v1DirName={v1DirName}
                v2DirName={v2DirName}
              />
        </div>

      </main>
    </div>
  );
};

export default App;