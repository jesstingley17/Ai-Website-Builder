"use client";

import React from 'react';
import { Code, Sparkles, Zap, Image as ImageIcon, Database } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Tooltip } from '@/components/ui/tooltip';

function Header() {
    const pathname = usePathname();
    const isWorkspace = pathname?.includes('/workspace');

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-gray-900/60">
            <div className="container-responsive">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-sm opacity-50"></div>
                            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                                <Code className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold text-white sm:text-xl">
                                AI Website Builder
                            </h1>
                            <p className="hidden text-xs text-gray-400 sm:block">
                                More Powerful Than Lovable.dev
                            </p>
                        </div>
                    </div>

                    {/* Status Badge and Features */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {!isWorkspace && (
                            <div className="hidden items-center gap-2 sm:flex">
                                <Tooltip text="Real-time Streaming Responses" position="bottom">
                                    <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400 border border-blue-500/20 cursor-help">
                                        <Zap className="h-3 w-3" />
                                        <span className="hidden lg:inline">Streaming</span>
                                    </div>
                                </Tooltip>
                                <Tooltip text="AI Vision Analysis" position="bottom">
                                    <div className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-400 border border-purple-500/20 cursor-help">
                                        <ImageIcon className="h-3 w-3" />
                                        <span className="hidden lg:inline">Vision</span>
                                    </div>
                                </Tooltip>
                                <Tooltip text="Automatic Backend Provisioning" position="bottom">
                                    <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400 border border-green-500/20 cursor-help">
                                        <Database className="h-3 w-3" />
                                        <span className="hidden lg:inline">Auto Backend</span>
                                    </div>
                                </Tooltip>
                            </div>
                        )}
                        <Tooltip text="AI System Ready" position="bottom">
                            <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-400 border border-green-500/20 cursor-help">
                                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                                <Sparkles className="h-4 w-4" />
                                <span className="hidden sm:inline">AI Ready</span>
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;