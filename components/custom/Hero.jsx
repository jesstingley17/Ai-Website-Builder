"use client"
import Lookup from '@/data/Lookup';
import { MessagesContext } from '@/context/MessagesContext';
import { ArrowRight, Link, Sparkles, Send, Wand2, Loader2, Github, X } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';

function Hero() {
    const [userInput, setUserInput] = useState('');
    const [githubRepo, setGithubRepo] = useState('');
    const [useGithub, setUseGithub] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isLoadingRepo, setIsLoadingRepo] = useState(false);
    const [repoInfo, setRepoInfo] = useState(null);
    const { messages, setMessages } = useContext(MessagesContext);
    const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
    const router = useRouter();

    const onGenerate = async (input, githubContext = null) => {
        let content = input;
        if (githubContext) {
            content = `Use this GitHub repository as a reference/base:\nRepository: ${githubContext.repo.url}\n\nRepository files context:\n${JSON.stringify(githubContext.files, null, 2)}\n\nUser request: ${input}`;
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ repoUrl: githubRepo.trim() }),
            });

            const data = await response.json();
            if (data.error) {
                alert(`Error: ${data.error}`);
                return;
            }

            setRepoInfo(data);
            setUseGithub(true);
        } catch (error) {
            console.error('Error fetching GitHub repo:', error);
            alert('Failed to fetch repository. Please check the URL and try again.');
        } finally {
            setIsLoadingRepo(false);
        }
    };

    const handleGenerate = async () => {
        if (useGithub && repoInfo) {
            await onGenerate(userInput, repoInfo);
        } else {
            await onGenerate(userInput);
        }
    };

    const clearGithubRepo = () => {
        setGithubRepo('');
        setRepoInfo(null);
        setUseGithub(false);
    };

    const enhancePrompt = async () => {
        if (!userInput) return;
        
        setIsEnhancing(true);
        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userInput }),
            });

            const data = await response.json();
            if (data.enhancedPrompt) {
                setUserInput(data.enhancedPrompt);
            }
        } catch (error) {
            console.error('Error enhancing prompt:', error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const onSuggestionClick = (suggestion) => {
        setUserInput(suggestion);
    };

    return (
        <div className="min-h-screen bg-gray-950 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
                <div className="absolute left-1/2 top-0 h-[500px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(circle_400px_at_50%_300px,#3b82f625,transparent)]" />
            </div>

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-12">
                    {/* Hero Header */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center space-x-2 bg-electric-blue-500/20 rounded-full px-6 py-3 mb-6 border border-electric-blue-500/30">
                            <Sparkles className="h-6 w-6 text-electric-blue-400" />
                            <span className="text-electric-blue-400 text-lg font-semibold tracking-wide">
                                NEXT-GEN AI DEVELOPMENT
                            </span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-[linear-gradient(45deg,#60a5fa_30%,#ec4899)] leading-tight">
                            Code the <br className="md:hidden" />Impossible
                        </h1>
                        <p className="text-xl text-neon-cyan max-w-3xl mx-auto font-mono tracking-tight">
                            Transform your wildest ideas into production-ready code with Ai-powered assistance
                        </p>
                    </div>

                    {/* GitHub Repository Section */}
                    {useGithub && repoInfo && (
                        <div className="w-full max-w-3xl bg-emerald-900/20 backdrop-blur-2xl rounded-xl border-2 border-emerald-500/40 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Github className="h-5 w-5 text-emerald-400" />
                                    <div>
                                        <a 
                                            href={repoInfo.repo.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-emerald-400 hover:text-emerald-300 font-mono text-sm"
                                        >
                                            {repoInfo.repo.owner}/{repoInfo.repo.repo}
                                        </a>
                                        <p className="text-emerald-400/70 text-xs mt-1">
                                            {repoInfo.fileCount} files loaded
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={clearGithubRepo}
                                    className="text-emerald-400/70 hover:text-emerald-400 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Modified Input Section */}
                    <div className="w-full max-w-3xl bg-gray-900/40 backdrop-blur-2xl rounded-xl border-2 border-electric-blue-500/40 shadow-[0_0_40px_5px_rgba(59,130,246,0.15)]">
                        <div className="p-2 bg-gradient-to-r from-electric-blue-500/10 to-purple-500/10">
                            <div className="bg-gray-900/80 p-6 rounded-lg">
                                {/* GitHub Repo Input */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Github className="h-4 w-4 text-electric-blue-400/70" />
                                        <label className="text-sm text-electric-blue-400/70 font-mono">
                                            Use GitHub Repository (optional)
                                        </label>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="github.com/owner/repo or owner/repo"
                                            value={githubRepo}
                                            onChange={(e) => setGithubRepo(e.target.value)}
                                            className="flex-1 bg-gray-800/50 border border-electric-blue-500/30 rounded-lg px-4 py-2 text-gray-100 placeholder-electric-blue-500/50 focus:border-electric-blue-500 focus:ring-0 outline-none font-mono text-sm transition-all"
                                            onKeyPress={(e) => e.key === 'Enter' && fetchGithubRepo()}
                                            disabled={isLoadingRepo || isEnhancing}
                                        />
                                        <button
                                            onClick={fetchGithubRepo}
                                            disabled={isLoadingRepo || !githubRepo.trim() || isEnhancing}
                                            className={`px-4 py-2 bg-electric-blue-500/20 hover:bg-electric-blue-500/30 border border-electric-blue-500/40 rounded-lg transition-all ${isLoadingRepo || !githubRepo.trim() || isEnhancing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isLoadingRepo ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-electric-blue-400" />
                                            ) : (
                                                <Github className="h-4 w-4 text-electric-blue-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <textarea
                                        placeholder="DESCRIBE YOUR VISION..."
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        className="w-full bg-transparent border-2 border-electric-blue-500/30 rounded-lg p-5 text-gray-100 placeholder-electric-blue-500/60 focus:border-electric-blue-500 focus:ring-0 outline-none font-mono text-lg h-40 resize-none transition-all duration-300 hover:border-electric-blue-500/60"
                                        disabled={isEnhancing}
                                    />
                                    <div className="flex flex-col gap-2">
                                        {userInput && (
                                            <>
                                                <button
                                                    onClick={enhancePrompt}
                                                    disabled={isEnhancing}
                                                    className={`flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl px-4 py-4 transition-all duration-200 ${isEnhancing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    {isEnhancing ? (
                                                        <Loader2 className="h-8 w-8 animate-spin" />
                                                    ) : (
                                                        <Wand2 className="h-8 w-8" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleGenerate}
                                                    disabled={isEnhancing || isLoadingRepo}
                                                    className={`flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl px-4 py-4 transition-all duration-200 ${isEnhancing || isLoadingRepo ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    <Send className="h-8 w-8" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Link className="h-6 w-6 text-electric-blue-400/80 hover:text-electric-blue-400 transition-colors duration-200" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Holographic Suggestions Grid */}
                    <div className="w-full max-w-5xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Lookup?.SUGGSTIONS.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSuggestionClick(suggestion)}
                                    className="group relative p-6 bg-gray-900/50 hover:bg-gray-800/60 border-2 border-electric-blue-500/20 rounded-xl text-left transition-all duration-300 hover:border-electric-blue-500/40 hover:shadow-[0_0_20px_2px_rgba(59,130,246,0.2)]"
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_50%,#3b82f620)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                                    <span className="text-electric-blue-400/80 group-hover:text-electric-blue-400 font-mono text-sm tracking-wide transition-colors duration-300">
                                        {suggestion}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;