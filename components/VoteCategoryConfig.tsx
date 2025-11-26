import React, { useState } from 'react';
import { CloseIcon, PlusIcon, TrashIcon } from './icons';

interface VoteCategoryConfigProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    onCategoriesChange: (newCategories: string[]) => void;
}

export const VoteCategoryConfig: React.FC<VoteCategoryConfigProps> = ({ 
    isOpen, 
    onClose, 
    categories, 
    onCategoriesChange 
}) => {
    const [newCategory, setNewCategory] = useState('');

    if (!isOpen) return null;

    const handleAdd = () => {
        const trimmed = newCategory.trim();
        if (trimmed && !categories.includes(trimmed)) {
            onCategoriesChange([...categories, trimmed]);
            setNewCategory('');
        }
    };

    const handleRemove = (cat: string) => {
        if (window.confirm(`Are you sure you want to remove the "${cat}" category? Existing votes for this category will be preserved in export but hidden in the view.`)) {
             onCategoriesChange(categories.filter(c => c !== cat));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
                
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                    <div className="absolute top-4 right-4">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                             <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Configure Vote Dimensions
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Define the criteria used for evaluating assets (e.g., Geometry, Texture).
                        </p>

                        <div className="mb-4 flex gap-2">
                             <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Add new dimension..."
                                className="flex-1 shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                            <button
                                onClick={handleAdd}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md max-h-64 overflow-y-auto">
                            {categories.map(cat => (
                                <li key={cat} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                    <span className="text-gray-800 text-sm font-medium">{cat}</span>
                                    <button 
                                        onClick={() => handleRemove(cat)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Remove Category"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
