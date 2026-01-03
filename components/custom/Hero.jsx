"use client"
import Lookup from '@/data/Lookup';
import { MessagesContext } from '@/context/MessagesContext';
import { ArrowRight, Link, Sparkles, Send, Wand2, Loader2, Github, X } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@/components/ui/tooltip';

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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
            {/* Modern animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                <div className="absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(circle_500px_at_50%_300px,#3b82f625,transparent)] animate-pulse"></div>
                <div className="absolute right-0 top-1/4 h-[400px] w-[800px] bg-[radial-gradient(circle_300px_at_50%_50%,#8b5cf625,transparent)] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="container-responsive py-8 sm:py-12 lg:py-16 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-12">
                    {/* Hero Header */}
                    <div className="text-center space-y-4 sm:space-y-6 animate-fade-in">
                        <div className="inline-flex items-center justify-center gap-2 bg-blue-500/10 rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-4 sm:mb-6 border border-blue-500/30 animate-scale-in">
                            <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
                            <span className="text-blue-400 text-sm sm:text-lg font-semibold tracking-wide">
                                NEXT-GEN AI DEVELOPMENT
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text leading-tight px-4">
                            Code the <br className="md:hidden" />Impossible
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4 leading-relaxed">
                            Transform your wildest ideas into production-ready code with AI-powered assistance
                        </p>
                    </div>

                    {/* GitHub Repository Section */}
                    {useGithub && repoInfo && (
                        <div className="w-full max-w-3xl mx-auto glass-dark rounded-2xl p-4 sm:p-5 mb-6 animate-slide-up">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex-shrink-0 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                        <Github className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <a 
                                            href={repoInfo.repo.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-emerald-400 hover:text-emerald-300 font-medium text-sm sm:text-base truncate block"
                                        >
                                            {repoInfo.repo.owner}/{repoInfo.repo.repo}
                                        </a>
                                        <p className="text-emerald-400/70 text-xs mt-1">
                                            {repoInfo.fileCount} files loaded
                                        </p>
                                    </div>
                                </div>
                                <Tooltip text="Remove repository" position="top">
                                    <button
                                        onClick={clearGithubRepo}
                                        className="flex-shrink-0 text-emerald-400/70 hover:text-emerald-400 transition-colors p-1 hover:bg-emerald-500/10 rounded-lg"
                                        aria-label="Remove repository"
                                    >
                                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    )}

                    {/* Modified Input Section */}
                    <div className="w-full max-w-3xl mx-auto card-modern border-2 border-blue-500/40 shadow-[0_0_40px_5px_rgba(59,130,246,0.15)] animate-slide-up">
                        <div className="p-1 sm:p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
                            <div className="bg-gray-900/80 p-4 sm:p-6 rounded-xl">
                                {/* GitHub Repo Input */}
                                <div className="mb-4 sm:mb-6">
                                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                        <Github className="h-4 w-4 text-blue-400/70" />
                                        <label className="text-xs sm:text-sm text-blue-400/70 font-medium">
                                            Use GitHub Repository (optional)
                                        </label>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="github.com/owner/repo or owner/repo"
                                            value={githubRepo}
                                            onChange={(e) => setGithubRepo(e.target.value)}
                                            className="input-modern flex-1 text-sm sm:text-base"
                                            onKeyPress={(e) => e.key === 'Enter' && fetchGithubRepo()}
                                            disabled={isLoadingRepo || isEnhancing}
                                        />
                                        <Tooltip text={isLoadingRepo ? "Loading repository..." : "Load GitHub repository"} position="top">
                                            <button
                                                onClick={fetchGithubRepo}
                                                disabled={isLoadingRepo || !githubRepo.trim() || isEnhancing}
                                                className={`flex-shrink-0 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {isLoadingRepo ? (
                                                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-blue-400" />
                                                ) : (
                                                    <Github className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                                                )}
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <textarea
                                        placeholder="DESCRIBE YOUR VISION..."
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        className="input-modern flex-1 h-32 sm:h-40 resize-none text-base sm:text-lg"
                                        disabled={isEnhancing}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                e.preventDefault();
                                                handleGenerate();
                                            }
                                        }}
                                    />
                                    <div className="flex flex-row sm:flex-col gap-2">
                                        {userInput && (
                                            <>
                                                <Tooltip text={isEnhancing ? "Enhancing prompt..." : "Enhance your prompt with AI"} position="left">
                                                    <button
                                                        onClick={enhancePrompt}
                                                        disabled={isEnhancing}
                                                        className={`btn-modern flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl px-4 py-3 sm:px-4 sm:py-4 transition-all duration-200 flex-1 sm:flex-none ${isEnhancing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                        aria-label="Enhance prompt"
                                                    >
                                                        {isEnhancing ? (
                                                            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                                                        ) : (
                                                            <Wand2 className="h-5 w-5 sm:h-6 sm:w-6" />
                                                        )}
                                                    </button>
                                                </Tooltip>
                                                <Tooltip text={isEnhancing || isLoadingRepo ? "Please wait..." : "Generate your website"} position="left">
                                                    <button
                                                        onClick={handleGenerate}
                                                        disabled={isEnhancing || isLoadingRepo}
                                                        className={`btn-modern flex items-center justify-center rounded-xl px-4 py-3 sm:px-4 sm:py-4 transition-all duration-200 flex-1 sm:flex-none ${isEnhancing || isLoadingRepo ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                        aria-label="Generate website"
                                                    >
                                                        <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                                                    </button>
                                                </Tooltip>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Tooltip text="Share or link to this page" position="top">
                                        <Link className="h-6 w-6 text-blue-400/80 hover:text-blue-400 transition-colors duration-200 cursor-help" />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Holographic Suggestions Grid */}
                    <div className="w-full max-w-5xl mx-auto px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {Lookup?.SUGGSTIONS.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => onSuggestionClick(suggestion)}
                                    className="group relative p-4 sm:p-6 card-modern text-left transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_20px_2px_rgba(59,130,246,0.2)] animate-fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_50%,#3b82f620)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                                    <span className="relative text-blue-400/80 group-hover:text-blue-400 font-medium text-sm sm:text-base tracking-wide transition-colors duration-300">
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