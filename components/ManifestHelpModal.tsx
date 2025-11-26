
import React from 'react';
import { CloseIcon, FileIcon, ClipboardListIcon } from './icons';

interface ManifestHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ManifestHelpModal: React.FC<ManifestHelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="absolute top-4 right-4">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <ClipboardListIcon className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-lg leading-6 font-bold text-gray-900">
                                How Manifest Matching Works
                            </h3>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600">
                            <p>
                                By default, the system automatically finds files with similar names. 
                                However, when you upload a <strong>Manifest JSON</strong>, you take control of the row order and exactly which items are displayed.
                            </p>

                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">The Matching Rule:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>The system looks for files where the <strong>filename (without extension)</strong> exactly matches the <strong>key</strong> in your JSON.</li>
                                    <li>It ignores file extensions (e.g., <code>.glb</code>, <code>.png</code>, <code>.jpg</code>).</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-800 mb-2">Example:</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-green-50 rounded border border-green-100">
                                        <p className="font-bold text-green-800 text-xs uppercase mb-1">JSON Entry</p>
                                        <code className="text-xs bg-white px-1 py-0.5 rounded border">"chair_01"</code>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded border border-blue-100">
                                        <p className="font-bold text-blue-800 text-xs uppercase mb-1">Matches Files</p>
                                        <div className="flex flex-col gap-1">
                                            <code className="text-xs">chair_01.glb</code>
                                            <code className="text-xs">chair_01.png</code>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800 text-xs">
                                <strong>Tip:</strong> If your JSON contains <code>"red_car"</code> but your file is named <code>"red_car_v2.glb"</code>, it will <strong>NOT</strong> match. They must be identical.
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
