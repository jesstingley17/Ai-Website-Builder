import ChatView from '@/components/custom/ChatView';
import CodeView from '@/components/custom/CodeView';
import Header from '@/components/custom/Header';
import React from 'react';

const Workspace = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
            {/* Modern animated background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                <div className="absolute left-1/2 top-0 h-[600px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(circle_500px_at_50%_300px,#3b82f625,transparent)] animate-pulse"></div>
            </div>

            {/* Header */}
            <Header />

            {/* Content */}
            <div className='relative z-10 p-4 sm:p-6 lg:p-8 pt-4'>
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-[1920px] mx-auto'>
                    <div className='lg:col-span-1'>
                        <ChatView />
                    </div>
                    <div className='lg:col-span-3'>
                        <CodeView />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;