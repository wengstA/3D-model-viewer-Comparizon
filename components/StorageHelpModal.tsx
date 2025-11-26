
import React from 'react';
import { CloseIcon, DatabaseIcon, UploadCloudIcon, DownloadIcon } from './icons';

interface StorageHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StorageHelpModal: React.FC<StorageHelpModalProps> = ({ isOpen, onClose }) => {
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
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <DatabaseIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-lg leading-6 font-bold text-gray-900">
                                Saving & Restoring Your Work
                            </h3>
                        </div>

                        <div className="space-y-5 text-sm text-gray-600">
                            <p>
                                The tool allows you to save your progress and pick it up later. This is great for sharing results or switching devices.
                            </p>

                            <div className="grid gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                                        <DownloadIcon className="w-5 h-5 text-gray-500" />
                                        <span>Export Results (Save)</span>
                                    </div>
                                    <p className="mb-2">Downloads a lightweight <code>.json</code> file containing:</p>
                                    <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
                                        <li>All your <strong>Votes</strong> (including multi-category votes).</li>
                                        <li>Any <strong>Tags</strong> you added to items.</li>
                                        <li>Your custom <strong>Voting Categories</strong> (e.g. if you added "Lighting").</li>
                                    </ul>
                                    <p className="mt-2 text-xs italic text-gray-400">Note: It does NOT save the actual 3D models or images.</p>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2 font-semibold text-gray-800">
                                        <UploadCloudIcon className="w-5 h-5 text-gray-500" />
                                        <span>Import Results (Restore)</span>
                                    </div>
                                    <p className="mb-2">Upload your saved <code>.json</code> file to restore your work.</p>
                                    <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500">
                                        <li>Automatically matches data to files by <strong>filename</strong>.</li>
                                        <li><strong>Intelligent Merge:</strong> If the file has voting categories you don't have (e.g., a colleague added "Geometry"), they will be automatically added to your workspace.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
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
