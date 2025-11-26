
import React, { useState } from 'react';
import { 
  CloseIcon, 
  UploadCloudIcon, 
  ChartBarIcon, 
  ClipboardListIcon, 
  FileIcon, 
  TagIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  DownloadIcon
} from './icons';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Welcome to the Workspace",
    description: "A powerful tool to visually compare 3D models and images side-by-side. Perfect for reviewing iterations, regression testing, or selecting the best candidates from a batch.",
    icon: <ChartBarIcon className="w-16 h-16 text-sky-500" />,
  },
  {
    title: "1. Prepare Viewers",
    description: "Click 'Add Viewer' to create columns for each dataset you want to compare. You can rename them (e.g., 'Baseline', 'v2.0') and drag them to reorder.",
    icon: <PlusIcon className="w-16 h-16 text-sky-500" />,
  },
  {
    title: "2. Upload & Match",
    description: "Upload a folder of assets into each viewer. The system automatically aligns files by filename (e.g., 'chair.glb' matches 'chair.png').\n\nWant specific ordering? Use the 'Upload Manifest' button to provide a JSON list of filenames.",
    icon: <FileIcon className="w-16 h-16 text-sky-500" />,
  },
  {
    title: "3. Review & Tag",
    description: "Inspect items in the grid. Vote for the best version, mark 'All Bad', or add specific tags like 'Lighting Issue' to flag problems.",
    icon: <TagIcon className="w-16 h-16 text-sky-500" />,
  },
  {
    title: "4. Save Results",
    description: "Finished your review? Click 'Export Results' to download a JSON file of your votes and tags. You can import this back later to resume work.",
    icon: <DownloadIcon className="w-16 h-16 text-sky-500" />,
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex flex-col items-center text-center mt-6">
              <div className="flex items-center justify-center h-24 w-24 rounded-full bg-sky-50 mb-6">
                {steps[currentStep].icon}
              </div>
              <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4" id="modal-title">
                {steps[currentStep].title}
              </h3>
              <div className="mt-2 px-2">
                <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 bg-gray-50 flex flex-col gap-4">
            <div className="flex justify-center gap-2 mb-2">
                {steps.map((_, index) => (
                    <div 
                        key={index} 
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                            index === currentStep ? 'bg-sky-500 w-6' : 'bg-gray-300'
                        }`}
                    />
                ))}
            </div>
            
            <div className="flex justify-between items-center w-full">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className={`flex items-center text-gray-600 hover:text-sky-600 font-medium transition-colors ${currentStep === 0 ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                >
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Back
                </button>

                <button
                    onClick={handleNext}
                    className="flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all min-w-[120px]"
                >
                    {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                    {currentStep !== steps.length - 1 && <ChevronRightIcon className="w-5 h-5 ml-1" />}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
