import { NextResponse } from "next/server";
import AIOrchestrator from '@/lib/ai-orchestrator';

/**
 * Asset Generation Endpoint
 * Uses DALL-E 3 to generate images and assets
 */
export async function POST(req) {
    try {
        const { 
            prompt, 
            size = '1024x1024',
            quality = 'standard',
            style = 'natural',
            assetType = 'image'
        } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required for asset generation" },
                { status: 400 }
            );
        }

        // Use DALL-E 3 for asset generation
        const result = await AIOrchestrator.generateAsset(prompt, {
            size,
            quality,
            style,
            assetType
        });

        return NextResponse.json({
            success: true,
            imageUrl: result.content,
            revisedPrompt: result.metadata.revised_prompt,
            model: result.model,
            metadata: result.metadata
        });

    } catch (error) {
        console.error("Error in asset generation:", error);
        return NextResponse.json(
            { 
                error: error.message || "Failed to generate asset",
                details: error.toString()
            },
            { status: 500 }
        );
    }
}

