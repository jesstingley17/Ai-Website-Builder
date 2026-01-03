"use client"
import React, { use, useContext } from 'react';
import { useState } from 'react';
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackFileExplorer
} from "@codesandbox/sandpack-react";
import Lookup from '@/data/Lookup';
import { MessagesContext } from '@/context/MessagesContext';
import axios from 'axios';
import Prompt from '@/data/Prompt';
import { useEffect } from 'react';
import { UpdateFiles } from '@/convex/workspace';
import { useConvex, useMutation } from 'convex/react';
import { useParams } from 'next/navigation';
import { api } from '@/convex/_generated/api';
import { Loader2Icon, Download } from 'lucide-react';
import JSZip from 'jszip';
import { Tooltip } from '@/components/ui/tooltip';

function CodeView() {

    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('code');
    const [files,setFiles]=useState(Lookup?.DEFAULT_FILE);
    const {messages,setMessages}=useContext(MessagesContext);
    const UpdateFiles=useMutation(api.workspace.UpdateFiles);
    const convex=useConvex();
    const [loading,setLoading]=useState(false);

    useEffect(() => {
        id&&GetFiles();
    }, [id])

    const GetFiles=async()=>{
        const result=await convex.query(api.workspace.GetWorkspace,{
            workspaceId:id
        });
        // Preprocess and validate files before merging
        const processedFiles = preprocessFiles(result?.fileData || {});
        const mergedFiles = {...Lookup.DEFAULT_FILE, ...processedFiles};
        setFiles(mergedFiles);
    }

    // Add file preprocessing function
    const preprocessFiles = (files) => {
        const processed = {};
        Object.entries(files).forEach(([path, content]) => {
            // Ensure the file has proper content structure
            if (typeof content === 'string') {
                processed[path] = { code: content };
            } else if (content && typeof content === 'object') {
                if (!content.code && typeof content === 'object') {
                    processed[path] = { code: JSON.stringify(content, null, 2) };
                } else {
                    processed[path] = content;
                }
            }
        });
        return processed;
    }

    useEffect(() => {
            if (messages?.length > 0) {
                const role = messages[messages?.length - 1].role;
                if (role === 'user') {
                    GenerateAiCode();
                }
            }
        }, [messages])

    const GenerateAiCode=async()=>{
        setLoading(true);
        try {
            const PROMPT=JSON.stringify(messages)+" "+Prompt.CODE_GEN_PROMPT;
            const result=await axios.post('/api/gen-ai-code',{
                prompt:PROMPT
            });
            
            if (result.data?.error) {
                console.error("API Error:", result.data.error);
                alert(`Error generating code: ${result.data.error}${result.data.details ? '\n' + result.data.details : ''}`);
                setLoading(false);
                return;
            }

            if (!result.data?.files) {
                console.error("No files in response:", result.data);
                alert("Error: No files were generated. Please try again.");
                setLoading(false);
                return;
            }
            
            // Preprocess AI-generated files
            const processedAiFiles = preprocessFiles(result.data.files);
            const mergedFiles = {...Lookup.DEFAULT_FILE, ...processedAiFiles};
            setFiles(mergedFiles);

            await UpdateFiles({
                workspaceId:id,
                files:result.data.files
            });
        } catch (error) {
            console.error("Error generating code:", error);
            alert(`Error generating code: ${error.message || 'An unexpected error occurred'}. Please check the console for details.`);
        } finally {
            setLoading(false);
        }
    }
    
    const downloadFiles = async () => {
        try {
            // Create a new JSZip instance
            const zip = new JSZip();
            
            // Add each file to the zip
            Object.entries(files).forEach(([filename, content]) => {
                // Handle the file content based on its structure
                let fileContent;
                if (typeof content === 'string') {
                    fileContent = content;
                } else if (content && typeof content === 'object') {
                    if (content.code) {
                        fileContent = content.code;
                    } else {
                        // If it's an object without code property, stringify it
                        fileContent = JSON.stringify(content, null, 2);
                    }
                }

                // Only add the file if we have content
                if (fileContent) {
                    // Remove leading slash if present
                    const cleanFileName = filename.startsWith('/') ? filename.slice(1) : filename;
                    zip.file(cleanFileName, fileContent);
                }
            });

            // Add package.json with dependencies
            const packageJson = {
                name: "generated-project",
                version: "1.0.0",
                private: true,
                dependencies: Lookup.DEPENDANCY,
                scripts: {
                    "dev": "vite",
                    "build": "vite build",
                    "preview": "vite preview"
                }
            };
            zip.file("package.json", JSON.stringify(packageJson, null, 2));

            // Generate the zip file
            const blob = await zip.generateAsync({ type: "blob" });
            
            // Create download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'project-files.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading files:', error);
        }
    };

    return (
        <div className='relative h-[calc(100vh-5rem)] sm:h-[calc(100vh-6rem)] flex flex-col glass-dark rounded-2xl overflow-hidden animate-fade-in'>
            <div className='bg-gray-900/80 w-full p-3 sm:p-4 border-b border-gray-800/50'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4'>
                    <div className='flex items-center gap-2 bg-gray-800/50 p-1 rounded-full border border-gray-700/50'>
                        <Tooltip text="View and edit code" position="bottom">
                            <button 
                                onClick={() => setActiveTab('code')}
                                className={`text-xs sm:text-sm cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 ${
                                    activeTab == 'code' 
                                        ? 'text-blue-400 bg-blue-500/20 border border-blue-500/30 shadow-sm' 
                                        : 'text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Code
                            </button>
                        </Tooltip>
                        <Tooltip text="Preview your website" position="bottom">
                            <button 
                                onClick={() => setActiveTab('preview')}
                                className={`text-xs sm:text-sm cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-200 ${
                                    activeTab == 'preview' 
                                        ? 'text-blue-400 bg-blue-500/20 border border-blue-500/30 shadow-sm' 
                                        : 'text-gray-400 hover:text-gray-300'
                                }`}
                            >
                                Preview
                            </button>
                        </Tooltip>
                    </div>
                    
                    {/* Download Button */}
                    <Tooltip text="Download all project files as ZIP" position="bottom">
                        <button
                            onClick={downloadFiles}
                            className="btn-modern flex items-center gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl w-full sm:w-auto justify-center"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Download Files</span>
                            <span className="sm:hidden">Download</span>
                        </button>
                    </Tooltip>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <SandpackProvider 
                    files={files}
                    template="react" 
                    theme={'dark'}
                    customSetup={{
                        dependencies: {
                            ...Lookup.DEPENDANCY
                        },
                        entry: '/index.js'
                    }}
                    options={{
                        externalResources: ['https://cdn.tailwindcss.com'],
                        bundlerTimeoutSecs: 120,
                        recompileMode: "immediate",
                        recompileDelay: 300
                    }}
                >
                    <div className="relative h-full">
                        <SandpackLayout>
                            {activeTab=='code'?<>
                                <SandpackFileExplorer 
                                    style={{ height: '100%', minHeight: '400px' }} 
                                />
                                <SandpackCodeEditor 
                                    style={{ height: '100%', minHeight: '400px' }}
                                    showTabs
                                    showLineNumbers
                                    showInlineErrors
                                    wrapContent 
                                />
                            </>:
                            <>
                                <SandpackPreview 
                                    style={{ height: '100%', minHeight: '400px' }} 
                                    showNavigator={true}
                                    showOpenInCodeSandbox={false}
                                    showRefreshButton={true}
                                />
                            </>}
                        </SandpackLayout>
                    </div>
                </SandpackProvider>
            </div>

            {loading && (
                <div className='absolute inset-0 bg-gray-900/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 z-50 animate-fade-in'>
                    <Loader2Icon className='animate-spin h-12 w-12 sm:h-16 sm:w-16 text-blue-400'/>
                    <h2 className='text-white text-lg sm:text-xl font-semibold'>Generating files...</h2>
                    <p className='text-gray-400 text-sm sm:text-base'>This may take a moment</p>
                </div>
            )}
        </div>
    );
}

export default CodeView;