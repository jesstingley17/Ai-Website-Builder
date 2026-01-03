import { NextResponse } from "next/server";
import AIOrchestrator from '@/lib/ai-orchestrator';
import EnhancedPrompts from '@/data/EnhancedPrompts';

/**
 * Enhanced AI Orchestration Endpoint
 * Routes tasks to optimal AI models based on requirements
 */
export async function POST(req) {
    try {
        const {
            prompt,
            taskType = 'auto',
            requiresVision = false,
            requiresPlanning = false,
            requiresSpeed = false,
            requiresAssets = false,
            image = null,
            context = null,
            stream = false
        } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Route to appropriate AI model
        const result = await AIOrchestrator.routeTask(prompt, {
            taskType,
            requiresVision,
            requiresPlanning,
            requiresSpeed,
            requiresAssets,
            image,
            context,
            systemPrompt: EnhancedPrompts.CODE_GEN_PROMPT
        });

        return NextResponse.json({
            success: true,
            result: result.content,
            model: result.model,
            usage: result.usage,
            metadata: result.metadata
        });

    } catch (error) {
        console.error("Error in AI orchestration:", error);
        return NextResponse.json(
            { 
                error: error.message || "Failed to process request",
                details: error.toString()
            },
            { status: 500 }
        );
    }
}

