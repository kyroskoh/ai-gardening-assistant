
import React, { useState, useCallback } from 'react';
import { diagnosePlantProblem } from '../services/geminiService';
import type { Diagnosis } from '../types';
import { UploadCloudIcon } from './icons';

const PlantDoctor: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            resetState();
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetState = () => {
        setDiagnoses([]);
        setError('');
    };

    const handleDiagnose = useCallback(async () => {
        if (!imageFile) return;

        setIsLoading(true);
        resetState();

        try {
            const result = await diagnosePlantProblem(imageFile);
            setDiagnoses(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

    const getConfidenceColor = (confidence: 'High' | 'Medium' | 'Low') => {
        switch (confidence) {
            case 'High': return 'bg-red-500';
            case 'Medium': return 'bg-yellow-500';
            case 'Low': return 'bg-green-500';
        }
    }
    
    return (
        <div className="w-full h-full flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-primary">Plant Doctor</h2>
            <p className="text-base-content/80 -mt-2 mb-2">Upload a photo of a plant that seems unwell, and I'll try to diagnose the issue.</p>
            <div className="relative border-2 border-dashed border-base-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload photo of sick plant"
                    disabled={isLoading}
                />
                <div className="flex flex-col items-center pointer-events-none">
                    <UploadCloudIcon />
                    <p className="mt-2 text-sm text-base-content">
                        {imageFile ? imageFile.name : 'Click to upload a photo'}
                    </p>
                    <p className="text-xs text-gray-500">A clear, well-lit photo works best</p>
                </div>
            </div>

            {imagePreview && (
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <img src={imagePreview} alt="Plant preview" className="rounded-lg object-cover w-full h-auto shadow-lg" />
                    </div>
                    <div className="w-full md:w-2/3">
                        <button
                            onClick={handleDiagnose}
                            disabled={isLoading || !imageFile}
                            className="w-full bg-primary text-primary-content font-bold py-3 px-4 rounded-lg hover:bg-primary-focus disabled:bg-base-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Diagnosing...' : 'Diagnose Plant Problem'}
                        </button>
                    </div>
                </div>
            )}
            
            {error && <div role="alert" className="bg-red-500/20 text-red-400 p-3 rounded-lg text-center">{error}</div>}

            {isLoading && <LoadingSkeleton />}

            {!isLoading && diagnoses.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-xl font-bold">Possible Issues Found:</h3>
                    {diagnoses.map((diag, index) => (
                        <div key={index} className="bg-base-300/50 p-4 rounded-lg">
                            <h4 className="text-lg font-bold text-primary flex items-center gap-3">
                                {diag.issue}
                                <span className={`text-xs text-white px-2 py-0.5 rounded-full ${getConfidenceColor(diag.confidence)}`}>
                                    {diag.confidence} Confidence
                                </span>
                            </h4>
                            <p className="text-sm italic my-2">{diag.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
                                <div>
                                    <h5 className="font-semibold mb-1 text-green-400">Organic Treatments</h5>
                                    <ul className="list-disc list-inside space-y-1">
                                        {diag.treatment.organic.map((step, i) => <li key={i}>{step}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold mb-1 text-orange-400">Chemical Treatments</h5>
                                    <ul className="list-disc list-inside space-y-1">
                                        {diag.treatment.chemical.map((step, i) => <li key={i}>{step}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {!isLoading && imageFile && diagnoses.length === 0 && !error && (
                <div className="text-center py-10 px-4 bg-base-300/50 rounded-lg">
                    <p className="text-lg">No specific issues were identified.</p>
                    <p className="text-base-content/70">The plant appears to be healthy, or the issue isn't recognizable from the photo.</p>
                </div>
            )}
        </div>
    );
};

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-base-300 rounded-md w-1/3"></div>
        <div className="h-32 bg-base-300 rounded-lg w-full"></div>
        <div className="h-32 bg-base-300 rounded-lg w-full"></div>
    </div>
);

export default PlantDoctor;
