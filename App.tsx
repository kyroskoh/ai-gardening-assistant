
import React, { useState } from 'react';
import PlantIdentifier from './components/PlantIdentifier';
import GardenChat from './components/GardenChat';
import MyGarden from './components/MyGarden';
import PlantDoctor from './components/PlantDoctor';
import { LeafIcon, MessageSquareIcon, BookOpenIcon, StethoscopeIcon } from './components/icons';

enum AppTab {
  IDENTIFIER = 'identifier',
  CHAT = 'chat',
  MY_GARDEN = 'my_garden',
  DOCTOR = 'doctor',
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.IDENTIFIER);

  const renderTabContent = () => {
    switch (activeTab) {
      case AppTab.IDENTIFIER:
        return <PlantIdentifier />;
      case AppTab.CHAT:
        return <GardenChat />;
      case AppTab.MY_GARDEN:
        return <MyGarden />;
      case AppTab.DOCTOR:
        return <PlantDoctor />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{
    tab: AppTab;
    label: string;
    icon: React.ReactNode;
  }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex flex-col sm:flex-row justify-center items-center gap-2 px-2 sm:px-4 py-3 font-semibold text-xs sm:text-base transition-all duration-300 ease-in-out ${
        activeTab === tab
          ? 'bg-primary text-primary-content'
          : 'bg-base-200 hover:bg-base-300'
      }`}
      aria-pressed={activeTab === tab}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-sans">
      <header className="bg-base-200 text-center p-4 shadow-md sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-primary">AI Gardening Assistant</h1>
        <p className="text-base-content mt-1">Your all-in-one plant care companion</p>
      </header>
      
      <main className="flex-grow p-2 sm:p-4 md:p-6 flex flex-col">
        <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col bg-base-200 rounded-lg shadow-xl overflow-hidden">
          <div className="flex border-b border-base-300">
            <TabButton tab={AppTab.IDENTIFIER} label="Identifier" icon={<LeafIcon />} />
            <TabButton tab={AppTab.DOCTOR} label="Plant Doctor" icon={<StethoscopeIcon />} />
            <TabButton tab={AppTab.MY_GARDEN} label="My Garden" icon={<BookOpenIcon />} />
            <TabButton tab={AppTab.CHAT} label="Chat" icon={<MessageSquareIcon />} />
          </div>
          <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </main>

      <footer className="text-center p-4 text-sm text-gray-500">
        <p>Powered by Gemini</p>
      </footer>
    </div>
  );
};

export default App;
