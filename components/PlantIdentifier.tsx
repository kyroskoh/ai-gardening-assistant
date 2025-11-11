
import React, { useState, useCallback } from 'react';
import { analyzePlantName, getCareInstructions } from '../services/geminiService';
import type { PlantCareGuide, StructuredCareInstruction, GardenPlant } from '../types';
import { UploadCloudIcon, SunIcon, DropletIcon, SpadeIcon, ThermometerIcon, WindIcon, PlusCircleIcon, CheckCircleIcon } from './icons';

const PlantIdentifier: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [careGuide, setCareGuide] = useState<PlantCareGuide | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isAddedToGarden, setIsAddedToGarden] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            resetState();
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetState = () => {
        setCareGuide(null);
        setError('');
        setIsAddedToGarden(false);
    };
    
    const handleIdentify = useCallback(async () => {
        if (!imageFile) return;

        setIsLoading(true);
        resetState();

        try {
            const identifiedName = await analyzePlantName(imageFile);
            const guide = await getCareInstructions(identifiedName);
            setCareGuide(guide);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

    const handleAddToGarden = () => {
        if (!careGuide || !imagePreview) return;

        const newPlant: GardenPlant = {
            id: Date.now(),
            name: careGuide.plantName,
            image: imagePreview,
            summary: careGuide.summary,
            careInstructions: careGuide.instructions,
            wateringLog: [],
            fertilizingLog: [],
            notes: '',
        };

        try {
            const existingGarden: GardenPlant[] = JSON.parse(localStorage.getItem('myGarden') || '[]');
            existingGarden.push(newPlant);
            localStorage.setItem('myGarden', JSON.stringify(existingGarden));
            setIsAddedToGarden(true);
        } catch (e) {
            setError("Could not save plant to your garden. Your browser's storage might be full or disabled.");
        }
    };

    const getIconForTopic = (topic: string) => {
        const lowerTopic = topic.toLowerCase();
        if (lowerTopic.includes('sun')) return <SunIcon />;
        if (lowerTopic.includes('water')) return <DropletIcon />;
        if (lowerTopic.includes('soil')) return <SpadeIcon />;
        if (lowerTopic.includes('temp')) return <ThermometerIcon />;
        if (lowerTopic.includes('humid')) return <WindIcon />;
        if (lowerTopic.includes('fertili')) return <PlusCircleIcon />;
        return <LeafIcon/>;
    };
    
    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="relative border-2 border-dashed border-base-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload plant photo"
                    disabled={isLoading}
                />
                <div className="flex flex-col items-center pointer-events-none">
                    <UploadCloudIcon />
                    <p className="mt-2 text-sm text-base-content">
                        {imageFile ? imageFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">Use your camera or upload a file</p>
                </div>
            </div>

            {imagePreview && (
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <img src={imagePreview} alt="Plant preview" className="rounded-lg object-cover w-full h-auto shadow-lg" />
                    </div>
                    <div className="w-full md:w-2/3">
                        <button
                            onClick={handleIdentify}
                            disabled={isLoading || !imageFile}
                            className="w-full bg-primary text-primary-content font-bold py-3 px-4 rounded-lg hover:bg-primary-focus disabled:bg-base-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Analyzing...' : 'Identify Plant & Get Care Guide'}
                        </button>
                    </div>
                </div>
            )}
            
            {error && <div role="alert" className="bg-red-500/20 text-red-400 p-3 rounded-lg text-center">{error}</div>}

            {isLoading && <LoadingSkeleton />}

            {!isLoading && careGuide && (
                <div className="bg-base-300/50 p-4 rounded-lg animate-fade-in">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-primary mb-2">{careGuide.plantName}</h2>
                            <p className="italic text-base-content mb-4">{careGuide.summary}</p>
                        </div>
                        <button
                            onClick={handleAddToGarden}
                            disabled={isAddedToGarden}
                            className="flex items-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary-focus disabled:bg-base-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                            {isAddedToGarden ? <><CheckCircleIcon/> Added</> : <><PlusCircleIcon/> Add to Garden</>}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {careGuide.instructions.map((inst, index) => (
                            <div key={index} className="bg-base-200 p-4 rounded-lg shadow">
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    {getIconForTopic(inst.topic)}
                                    {inst.topic}
                                </h3>
                                <p className="text-sm">{inst.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-base-300 rounded-md w-1/2"></div>
        <div className="h-6 bg-base-300 rounded-md w-3/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-24 bg-base-300 rounded-lg"></div>
            <div className="h-24 bg-base-300 rounded-lg"></div>
            <div className="h-24 bg-base-300 rounded-lg"></div>
            <div className="h-24 bg-base-300 rounded-lg"></div>
            <div className="h-24 bg-base-300 rounded-lg"></div>
            <div className="h-24 bg-base-300 rounded-lg"></div>
        </div>
    </div>
);

// Minimal LeafIcon for getIconForTopic fallback
const LeafIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M11 20A7 7 0 0 1 4 13V8a5 5 0 0 1 10 0v5a7 7 0 0 1-7 7Zm8-16a5 5 0 0 0-10 0v5a7 7 0 0 0 14 0V8a5 5 0 0 0-4-5Z"/></svg>
);

export default PlantIdentifier;
