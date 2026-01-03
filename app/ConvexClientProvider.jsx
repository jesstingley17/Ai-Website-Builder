"use client";

import React from 'react';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const ConvexClientProvider = ({ children }) => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!convexUrl || convexUrl === "YOUR-API-KEY" || convexUrl.trim() === "") {
        throw new Error(
            "NEXT_PUBLIC_CONVEX_URL is not set or is invalid. " +
            "Please set this environment variable in your Vercel project settings with a valid Convex deployment URL (e.g., https://your-project.convex.cloud). " +
            "Get your Convex deployment URL by running 'npx convex deploy' locally."
        );
    }
    
    // Validate that it's an absolute URL
    try {
        new URL(convexUrl);
    } catch (e) {
        throw new Error(
            `NEXT_PUBLIC_CONVEX_URL must be a valid absolute URL. Current value: "${convexUrl}". ` +
            "Please set it to a valid Convex deployment URL (e.g., https://your-project.convex.cloud). " +
            "Get your Convex deployment URL by running 'npx convex deploy' locally."
        );
    }
    
    const convex = new ConvexReactClient(convexUrl);
    return (
        <ConvexProvider client={convex}>
            {children}
        </ConvexProvider>
    );
};

export default ConvexClientProvider;