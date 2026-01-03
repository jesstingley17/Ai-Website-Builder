"use client"
import Lookup from '@/data/Lookup';
import { MessagesContext } from '@/context/MessagesContext';
import { ArrowRight, Link, Sparkles, Send, Wand2, Loader2, Github, X, Image as ImageIcon, Zap, Database } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import VisionUpload from './VisionUpload';
import StreamingChat from './StreamingChat';

/**
 * Enhanced Hero Component
 * Includes vision upload, streaming chat, and advanced features
 */
function EnhancedHero() {
    const [userInput, setUserInput] = useState('');
    const [githubRepo, setGithubRepo] = useState('');
    const [useGithub, setUseGithub] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isLoadingRepo, setIsLoadingRepo] = useState(false);
    const [repoInfo, setRepoInfo] = useState(null);
    const [showVisionUpload, setShowVisionUpload] = useState(false);
    const [showStreamingChat, setShowStreamingChat] = useState(false);
    const [visionAnalysis, setVisionAnalysis] = useState(null);
    const { messages, setMessages } = useContext(MessagesContext);
    const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
    const router = useRouter();

    const onGenerate = async (input, githubContext = null, visionContext = null) => {
        let content = input;
        
        if (visionContext) {
            content = `Vision Analysis Context:\n${visionContext}\n\nUser request: ${input}`;
        }
        
        if (githubContext) {
            content = `Use this GitHub repository as a reference/base:\nRepository: ${githubContext.repo.url}\n\nRepository files context:\n${JSON.stringify(githubContext.files, null, 2)}\n\n${content}`;
        }
        
        const msg = {
            role: 'user',
            content: content
        }
        setMessages(msg);
        const workspaceID = await CreateWorkspace({
            messages: [msg]
        });
        router.push('/workspace/' + workspaceID);
    }

    const fetchGithubRepo = async () => {
        if (!githubRepo.trim()) return;
        
        setIsLoadingRepo(true);
        try {
            const response = await fetch('/api/github-repo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repoUrl: githubRepo })
            });
            
            const data = await response.json();
            if (data.success) {
                setRepoInfo(data);
                setUseGithub(true);
            } else {
                alert(data.error || 'Failed to fetch repository');
            }
        } catch (error) {
            console.error('GitHub fetch error:', error);
            alert('Failed to fetch repository');
        } finally {
            setIsLoadingRepo(false);
        }
    }

    const handleVisionAnalysis = (analysis, metadata) => {
        setVisionAnalysis(analysis);
        setShowVisionUpload(false);
        // Auto-populate input with vision context
        setUserInput(prev => prev + `\n\nBased on this vision analysis: ${analysis.substring(0, 200)}...`);
    }

    const handleStreamingComplete = (content, metadata) => {
        // Use streaming content to generate workspace
        onGenerate(content);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-8 w-8 text-purple-400" />
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            AI Website Builder
                        </h1>
                    </div>
                    <p className="text-xl text-gray-300">
                        More Powerful Than Lovable.dev
                    </p>
                    <p className="text-gray-400">
                        Multi-model AI • Vision Analysis • Streaming • Backend Provisioning
                    </p>
                </div>

                {/* Advanced Features Toggle */}
                <div className="flex gap-2 justify-center">
                    <button
                        onClick={() => {
                            setShowVisionUpload(!showVisionUpload);
                            setShowStreamingChat(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            showVisionUpload
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                                : 'bg-gray-800/50 text-gray-300 border border-gray-700 hover:bg-gray-800'
                        }`}
                    >
                        <ImageIcon className="h-4 w-4" />
                        <span>Vision Analysis</span>
                    </button>
                    <button
                        onClick={() => {
                            setShowStreamingChat(!showStreamingChat);
                            setShowVisionUpload(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            showStreamingChat
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                : 'bg-gray-800/50 text-gray-300 border border-gray-700 hover:bg-gray-800'
                        }`}
                    >
                        <Zap className="h-4 w-4" />
                        <span>Streaming Chat</span>
                    </button>
                </div>

                {/* Vision Upload Component */}
                {showVisionUpload && (
                    <VisionUpload
                        onAnalysisComplete={handleVisionAnalysis}
                        onError={(error) => alert(error)}
                    />
                )}

                {/* Streaming Chat Component */}
                {showStreamingChat && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                        <StreamingChat
                            onComplete={handleStreamingComplete}
                            onError={(error) => alert(error)}
                        />
                    </div>
                )}

                {/* Main Input Section */}
                {!showStreamingChat && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
                        {/* GitHub Integration */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Github className="h-4 w-4" />
                                <span>GitHub Repository (Optional)</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="https://github.com/username/repo"
                                    value={githubRepo}
                                    onChange={(e) => setGithubRepo(e.target.value)}
                                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <button
                                    onClick={fetchGithubRepo}
                                    disabled={isLoadingRepo}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isLoadingRepo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load'}
                                </button>
                            </div>
                            {repoInfo && (
                                <div className="flex items-center gap-2 text-sm text-green-400">
                                    <span>✓ Repository loaded: {repoInfo.repo?.name}</span>
                                    <button
                                        onClick={() => {
                                            setRepoInfo(null);
                                            setUseGithub(false);
                                            setGithubRepo('');
                                        }}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Main Input */}
                        <div className="space-y-2">
                            <textarea
                                placeholder="Describe your website or app idea... (e.g., 'Create a modern SaaS landing page with hero section, features, and pricing')"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-32"
                            />
                            
                            {/* Vision Analysis Context */}
                            {visionAnalysis && (
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-sm text-purple-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ImageIcon className="h-4 w-4" />
                                        <span className="font-semibold">Vision Analysis Available</span>
                                    </div>
                                    <p className="text-gray-300">{visionAnalysis.substring(0, 150)}...</p>
                                </div>
                            )}

                            <button
                                onClick={() => onGenerate(userInput, useGithub ? repoInfo : null, visionAnalysis)}
                                disabled={!userInput.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                            >
                                <Wand2 className="h-5 w-5" />
                                <span>Generate Website</span>
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                        <Sparkles className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-200 mb-1">Multi-Model AI</h3>
                        <p className="text-sm text-gray-400">Claude, Gemini, GPT-4o, DALL-E</p>
                    </div>
                    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                        <ImageIcon className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-200 mb-1">Vision Analysis</h3>
                        <p className="text-sm text-gray-400">Upload images for AI analysis</p>
                    </div>
                    <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
                        <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                        <h3 className="font-semibold text-gray-200 mb-1">Real-time Streaming</h3>
                        <p className="text-sm text-gray-400">See AI responses in real-time</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EnhancedHero;

