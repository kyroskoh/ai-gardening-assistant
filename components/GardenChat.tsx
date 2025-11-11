import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { MessageAuthor } from '../types';
import { createChat } from '../services/geminiService';
import { SendIcon, UserIcon, BotIcon } from './icons';
import type { Chat } from '@google/genai';

const GardenChat: React.FC = () => {
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setChatSession(createChat());
        setChatHistory([
            {
                author: MessageAuthor.BOT,
                text: "Hello! I'm Ivy, your AI gardening assistant. Ask me anything about plants!"
            }
        ]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [chatHistory]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !chatSession) return;

        const userMessage: ChatMessage = { author: MessageAuthor.USER, text: userInput };
        setChatHistory(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            // FIX: The sendMessage method expects an object with a `message` property.
            const result = await chatSession.sendMessage({ message: userInput });
            const botMessage: ChatMessage = { author: MessageAuthor.BOT, text: result.text };
            setChatHistory(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { 
                author: MessageAuthor.BOT, 
                text: "Sorry, I seem to be having trouble. Please try again in a moment."
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'}`}>
                        {msg.author === MessageAuthor.BOT && <BotIcon />}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${msg.author === MessageAuthor.USER ? 'bg-primary text-primary-content' : 'bg-base-300'}`}>
                           <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        {msg.author === MessageAuthor.USER && <UserIcon />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <BotIcon />
                        <div className="px-4 py-3 rounded-xl bg-base-300">
                           <div className="flex items-center space-x-1">
                               <div className="w-2 h-2 bg-base-content rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                               <div className="w-2 h-2 bg-base-content rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                               <div className="w-2 h-2 bg-base-content rounded-full animate-bounce"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask about your garden..."
                    className="flex-grow bg-base-300 border-base-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none transition"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !userInput.trim()}
                    className="bg-primary text-primary-content p-3 rounded-lg hover:bg-primary-focus disabled:bg-base-300 disabled:cursor-not-allowed transition-colors"
                >
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

export default GardenChat;