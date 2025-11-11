
import React, { useState, useEffect, useMemo } from 'react';
import type { GardenPlant } from '../types';
import { DropletIcon, PlusCircleIcon } from './icons';

const MyGarden: React.FC = () => {
    const [myGarden, setMyGarden] = useState<GardenPlant[]>([]);
    const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);

    useEffect(() => {
        try {
            const savedGarden = JSON.parse(localStorage.getItem('myGarden') || '[]');
            setMyGarden(savedGarden);
        } catch (e) {
            console.error("Failed to load garden from storage", e);
        }
    }, []);
    
    const saveGarden = (updatedGarden: GardenPlant[]) => {
        localStorage.setItem('myGarden', JSON.stringify(updatedGarden));
        setMyGarden(updatedGarden);
    };
    
    const handleSelectPlant = (plant: GardenPlant) => {
        setSelectedPlant(plant);
    };

    const handleUpdatePlant = (updatedPlant: GardenPlant) => {
        const updatedGarden = myGarden.map(p => p.id === updatedPlant.id ? updatedPlant : p);
        saveGarden(updatedGarden);
        setSelectedPlant(updatedPlant);
    }
    
    const handleRemovePlant = (plantId: number) => {
        if(window.confirm("Are you sure you want to remove this plant from your garden?")) {
            const updatedGarden = myGarden.filter(p => p.id !== plantId);
            saveGarden(updatedGarden);
            setSelectedPlant(null);
        }
    };

    if (selectedPlant) {
        return <PlantDetailView plant={selectedPlant} onBack={() => setSelectedPlant(null)} onUpdate={handleUpdatePlant} onRemove={handleRemovePlant} />;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary mb-4">My Garden</h2>
            {myGarden.length === 0 ? (
                <div className="text-center py-10 px-4 bg-base-300/50 rounded-lg">
                    <p className="text-lg">Your garden is empty.</p>
                    <p className="text-base-content/70">Use the 'Identifier' tab to find a plant and add it here!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {myGarden.map(plant => (
                        <button key={plant.id} onClick={() => handleSelectPlant(plant)} className="bg-base-200 rounded-lg shadow hover:shadow-primary/50 transition-shadow text-left group">
                            <img src={plant.image} alt={plant.name} className="w-full h-32 object-cover rounded-t-lg" />
                            <div className="p-3">
                                <h3 className="font-bold text-base truncate group-hover:text-primary">{plant.name}</h3>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface PlantDetailProps {
    plant: GardenPlant;
    onBack: () => void;
    onUpdate: (plant: GardenPlant) => void;
    onRemove: (plantId: number) => void;
}

const PlantDetailView: React.FC<PlantDetailProps> = ({ plant, onBack, onUpdate, onRemove }) => {
    const [notes, setNotes] = useState(plant.notes);

    const handleLog = (type: 'watering' | 'fertilizing') => {
        const today = new Date().toISOString();
        const log = type === 'watering' ? plant.wateringLog : plant.fertilizingLog;
        const updatedPlant = { ...plant, [`${type}Log`]: [...log, today] };
        onUpdate(updatedPlant);
    };

    const handleSaveNotes = () => {
        onUpdate({ ...plant, notes });
    };

    const getReminder = (type: 'watering' | 'fertilizing'): { text: string; color: string } => {
        const instruction = plant.careInstructions.find(inst => inst.topic.toLowerCase().includes(type));
        const log = type === 'watering' ? plant.wateringLog : plant.fertilizingLog;
        
        if (!instruction?.frequencyDays) return { text: 'No schedule available', color: 'text-gray-400' };
        
        const lastLog = log.length > 0 ? new Date(log[log.length-1]) : null;
        if (!lastLog) return { text: `Ready for first ${type}!`, color: 'text-blue-400' };

        const nextDueDate = new Date(lastLog);
        nextDueDate.setDate(nextDueDate.getDate() + instruction.frequencyDays.max);

        const today = new Date();
        today.setHours(0,0,0,0);
        
        const diffDays = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day(s)`, color: 'text-red-400 font-bold' };
        if (diffDays === 0) return { text: 'Due today!', color: 'text-secondary font-bold' };
        return { text: `Due in ${diffDays} day(s)`, color: 'text-base-content' };
    };

    const wateringReminder = useMemo(() => getReminder('watering'), [plant]);
    const fertilizingReminder = useMemo(() => getReminder('fertilizing'), [plant]);

    return (
        <div className="animate-fade-in">
             <button onClick={onBack} className="text-primary mb-4">&larr; Back to Garden</button>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                    <img src={plant.image} alt={plant.name} className="rounded-lg shadow-lg w-full" />
                    <h2 className="text-3xl font-bold text-primary mt-4">{plant.name}</h2>
                    <p className="italic mt-1">{plant.summary}</p>
                </div>
                <div className="md:w-2/3 space-y-4">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Care Log & Reminders</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-base-300 p-3 rounded-lg">
                                <p className="font-bold flex items-center gap-2"><DropletIcon/> Watering</p>
                                <p className={`text-sm ${wateringReminder.color}`}>{wateringReminder.text}</p>
                                <p className="text-xs text-gray-400">Last: {plant.wateringLog.length > 0 ? new Date(plant.wateringLog[plant.wateringLog.length-1]).toLocaleDateString() : 'Never'}</p>
                                <button onClick={() => handleLog('watering')} className="w-full mt-2 bg-blue-500/80 text-white text-sm py-1 rounded hover:bg-blue-500">Log Watering</button>
                            </div>
                            <div className="bg-base-300 p-3 rounded-lg">
                                <p className="font-bold flex items-center gap-2"><PlusCircleIcon/> Fertilizing</p>
                                <p className={`text-sm ${fertilizingReminder.color}`}>{fertilizingReminder.text}</p>
                                <p className="text-xs text-gray-400">Last: {plant.fertilizingLog.length > 0 ? new Date(plant.fertilizingLog[plant.fertilizingLog.length-1]).toLocaleDateString() : 'Never'}</p>
                                <button onClick={() => handleLog('fertilizing')} className="w-full mt-2 bg-green-600/80 text-white text-sm py-1 rounded hover:bg-green-600">Log Fertilizing</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-2">My Notes</h3>
                        <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          onBlur={handleSaveNotes}
                          rows={4}
                          placeholder="Add notes about your plant's progress..."
                          className="w-full bg-base-300 p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                        ></textarea>
                    </div>
                     <div>
                        <h3 className="text-xl font-semibold mb-2">Care Guide</h3>
                        <div className="text-sm space-y-1">
                            {plant.careInstructions.map(inst => <p key={inst.topic}><strong>{inst.topic}:</strong> {inst.details}</p>)}
                        </div>
                    </div>
                    <button onClick={() => onRemove(plant.id)} className="text-red-500 hover:text-red-400 text-sm">Remove from My Garden</button>
                </div>
            </div>
        </div>
    );
};


export default MyGarden;
