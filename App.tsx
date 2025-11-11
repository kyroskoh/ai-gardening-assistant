
import React, { useState } from 'react';
import PlantIdentifier from './components/PlantIdentifier';
import GardenChat from './components/GardenChat';
import { LeafIcon, MessageSquareIcon } from './components/icons';

enum AppTab {
  IDENTIFIER = 'identifier',
  CHAT = 'chat',
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.IDENTIFIER);

  const renderTabContent = () => {
    switch (activeTab) {
      case AppTab.IDENTIFIER:
        return <PlantIdentifier />;
      case AppTab.CHAT:
        return <GardenChat />;
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
      className={`flex-1 flex justify-center items-center gap-2 px-4 py-3 font-semibold transition-all duration-300 ease-in-out ${
        activeTab === tab
          ? 'bg-primary text-primary-content'
          : 'bg-base-200 hover:bg-base-300'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-sans">
      <header className="bg-base-200 text-center p-4 shadow-md">
        <h1 className="text-3xl font-bold text-primary">AI Gardening Assistant</h1>
        <p className="text-base-content mt-1">Identify plants and get expert gardening advice</p>
      </header>
      
      <main className="flex-grow p-2 sm:p-4 md:p-6 flex flex-col">
        <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col bg-base-200 rounded-lg shadow-xl overflow-hidden">
          <div className="flex border-b border-base-300">
            <TabButton tab={AppTab.IDENTIFIER} label="Plant Identifier" icon={<LeafIcon />} />
            <TabButton tab={AppTab.CHAT} label="Garden Chat" icon={<MessageSquareIcon />} />
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
