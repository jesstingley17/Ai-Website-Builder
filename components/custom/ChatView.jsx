"use client"
import { MessagesContext } from '@/context/MessagesContext';
import { ArrowRight, Link, Loader2Icon, Send } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Tooltip } from '@/components/ui/tooltip';

function ChatView() {
    const { id } = useParams();
    const convex = useConvex();
    const { messages, setMessages } = useContext(MessagesContext);
    const [userInput, setUserInput] = useState();
    const [loading, setLoading] = useState(false);
    const UpdateMessages = useMutation(api.workspace.UpdateWorkspace);

    useEffect(() => {
        id && GetWorkSpaceData();
    }, [id])

    const GetWorkSpaceData = async () => {
        const result = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id
        });
        setMessages(result?.messages);
        console.log(result);
    }

    useEffect(() => {
        if (messages?.length > 0) {
            const role = messages[messages?.length - 1].role;
            if (role === 'user') {
                GetAiResponse();
            }
        }
    }, [messages])

    const GetAiResponse = async () => {
        setLoading(true);
        const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
        const result = await axios.post('/api/ai-chat', {
            prompt: PROMPT
        });

        const aiResp = {
            role: 'ai',
            content: result.data.result
        }
        setMessages(prev => [...prev, aiResp]);
        await UpdateMessages({
            messages: [...messages, aiResp],
            workspaceId: id
        })
        setLoading(false);
    }

    const onGenerate = (input) => {
        setMessages(prev => [...prev, {
            role: 'user',
            content: input
        }]);
        setUserInput('');
    }

    return (
        <div className="relative h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] flex flex-col glass-dark rounded-2xl overflow-hidden animate-fade-in">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-modern p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                    {Array.isArray(messages) && messages?.map((msg, index) => (
                        <div
                            key={index}
                            className={`card-modern p-3 sm:p-4 animate-slide-up ${
                                msg.role === 'user' 
                                    ? 'bg-blue-500/5 border-blue-500/20' 
                                    : 'bg-purple-500/5 border-purple-500/20'
                            }`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 p-2 rounded-lg ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-500/20 text-blue-400' 
                                        : 'bg-purple-500/20 text-purple-400'
                                }`}>
                                    <span className="text-xs sm:text-sm font-semibold">
                                        {msg.role === 'user' ? 'You' : 'AI'}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-auto min-w-0">
                                    <ReactMarkdown className="text-gray-100 text-sm sm:text-base leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:my-2 [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:my-2 [&>li]:mb-1 [&>code]:bg-gray-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-xs sm:[&>code]:text-sm [&>pre]:bg-gray-800 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-2 [&>h1]:text-xl sm:[&>h1]:text-2xl [&>h1]:mb-2 [&>h2]:text-lg sm:[&>h2]:text-xl [&>h2]:mb-2 [&>h3]:text-base sm:[&>h3]:text-lg [&>h3]:mb-2 [&>strong]:font-bold [&>a]:text-blue-400 [&>a]:underline [&>a]:hover:text-blue-300">
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="card-modern p-4 animate-pulse">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Loader2Icon className="animate-spin h-5 w-5 text-blue-400" />
                                <p className="font-medium text-sm sm:text-base">Generating response...</p>
                            </div>
                        </div>
                    )}
                    
                    {(!messages || messages.length === 0) && !loading && (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-sm sm:text-base">Start a conversation to begin building</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Section */}
            <div className="border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm p-3 sm:p-4">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 sm:p-4">
                    <div className="flex gap-2 sm:gap-3">
                        <textarea
                            placeholder="Type your message here..."
                            value={userInput}
                            onChange={(event) => setUserInput(event.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    e.preventDefault();
                                    onGenerate(userInput);
                                }
                            }}
                            className="input-modern flex-1 resize-none h-24 sm:h-28 text-sm sm:text-base"
                        />
                        {userInput && (
                            <Tooltip text="Send message (Cmd/Ctrl + Enter)" position="top">
                                <button
                                    onClick={() => onGenerate(userInput)}
                                    className="btn-modern flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200"
                                    aria-label="Send message"
                                >
                                    <Send className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </button>
                            </Tooltip>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">Press Cmd/Ctrl + Enter to send</p>
                        <Tooltip text="Share or link" position="top">
                            <Link className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-300 transition-colors duration-200 cursor-help" />
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatView;