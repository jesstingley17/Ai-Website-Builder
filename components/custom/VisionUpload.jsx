"use client";

import React, { useState } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import axios from 'axios';

/**
 * Vision Upload Component
 * Allows users to upload images for AI vision analysis
 */
function VisionUpload({ onAnalysisComplete, onError }) {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [prompt, setPrompt] = useState('');

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setImage(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                onError?.('Please select a valid image file');
            }
        }
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const analyzeImage = async () => {
        if (!image) {
            onError?.('Please select an image first');
            return;
        }

        setAnalyzing(true);
        try {
            const base64Image = await convertToBase64(image);
            
            const response = await axios.post('/api/vision-analysis', {
                prompt: prompt || 'Analyze this image and provide implementation guidance for recreating this design',
                image: base64Image
            });

            if (response.data.success) {
                onAnalysisComplete?.(response.data.analysis, response.data);
            } else {
                onError?.(response.data.error || 'Failed to analyze image');
            }
        } catch (error) {
            console.error('Vision analysis error:', error);
            onError?.(error.response?.data?.error || error.message || 'Failed to analyze image');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <div className="flex items-center gap-2 text-gray-300">
                <ImageIcon className="h-5 w-5" />
                <h3 className="font-semibold">Vision Analysis</h3>
            </div>

            {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                    />
                </label>
            ) : (
                <div className="relative">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-contain rounded-lg bg-gray-900"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors"
                    >
                        <X className="h-4 w-4 text-white" />
                    </button>
                </div>
            )}

            {preview && (
                <>
                    <textarea
                        placeholder="Describe what you want to analyze or build from this image..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
                    />
                    <button
                        onClick={analyzeImage}
                        disabled={analyzing}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                            <>
                                <ImageIcon className="h-4 w-4" />
                                <span>Analyze with AI Vision</span>
                            </>
                        )}
                    </button>
                </>
            )}
        </div>
    );
}

export default VisionUpload;

