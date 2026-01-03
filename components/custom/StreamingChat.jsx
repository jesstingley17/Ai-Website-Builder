"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap } from 'lucide-react';

/**
 * Streaming Chat Component
 * Handles Server-Sent Events (SSE) for real-time AI responses
 */
function StreamingChat({ onComplete, onError, initialPrompt = '' }) {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [streaming, setStreaming] = useState(false);
    const [streamedContent, setStreamedContent] = useState('');
    const [progress, setProgress] = useState(0);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const startStreaming = async () => {
        if (!prompt.trim() || streaming) return;

        setStreaming(true);
        setStreamedContent('');
        setProgress(0);

        try {
            const response = await fetch('/api/ai-stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    taskType: 'auto',
                    requiresSpeed: true
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to start streaming');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.type === 'chunk') {
                                setStreamedContent(prev => prev + data.content);
                                setProgress(data.progress || 0);
                            } else if (data.type === 'complete') {
                                setStreaming(false);
                                setProgress(100);
                                onComplete?.(streamedContent + data.content, data);
                            } else if (data.type === 'error') {
                                throw new Error(data.error);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Streaming error:', error);
            setStreaming(false);
            onError?.(error.message || 'Failed to stream response');
        }
    };

    return (
        <div className="space-y-4">
            {/* Streaming Content Display */}
            {streamedContent && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                        <Zap className="h-4 w-4" />
                        <span>Streaming response...</span>
                        {progress > 0 && (
                            <span className="ml-auto">{Math.round(progress)}%</span>
                        )}
                    </div>
                    <div className="text-gray-100 whitespace-pre-wrap">
                        {streamedContent}
                        {streaming && (
                            <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
                        )}
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {streaming && progress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Input Section */}
            <div className="flex gap-2">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            startStreaming();
                        }
                    }}
                    placeholder="Type your message... (Cmd/Ctrl + Enter to send)"
                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
                    disabled={streaming}
                />
                <button
                    onClick={startStreaming}
                    disabled={streaming || !prompt.trim()}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                    {streaming ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Send className="h-5 w-5" />
                            <span>Send</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default StreamingChat;

