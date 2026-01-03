import { NextResponse } from "next/server";
import AIOrchestrator from '@/lib/ai-orchestrator';
import EnhancedPrompts from '@/data/EnhancedPrompts';

/**
 * Vision Analysis Endpoint
 * Uses GPT-4o to analyze images and provide implementation guidance
 */
export async function POST(req) {
    try {
        const { prompt, image, task = 'analyze' } = await req.json();

        if (!image && !prompt) {
            return NextResponse.json(
                { error: "Either image or prompt is required" },
                { status: 400 }
            );
        }

        // Use GPT-4o for vision analysis
        const result = await AIOrchestrator.analyzeVision(
            prompt || EnhancedPrompts.VISION_ANALYSIS_PROMPT,
            {
                image,
                task,
                systemPrompt: EnhancedPrompts.VISION_ANALYSIS_PROMPT
            }
        );

        return NextResponse.json({
            success: true,
            analysis: result.content,
            model: result.model,
            usage: result.usage,
            metadata: result.metadata
        });

    } catch (error) {
        console.error("Error in vision analysis:", error);
        return NextResponse.json(
            { 
                error: error.message || "Failed to analyze image",
                details: error.toString()
            },
            { status: 500 }
        );
    }
}

