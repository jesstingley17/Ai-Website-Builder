import { NextResponse } from "next/server";
import AIOrchestrator from '@/lib/ai-orchestrator';
import EnhancedPrompts from '@/data/EnhancedPrompts';

/**
 * Enhanced Chat Endpoint
 * Uses intelligent routing for better conversational responses
 */
export async function POST(req) {
    try {
        const { prompt, requiresPlanning = false } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Use Claude for planning/chat, Gemini for quick responses
        let result;
        
        if (requiresPlanning || AIOrchestrator.isPlanningTask(prompt)) {
            result = await AIOrchestrator.planWithClaude(prompt, {
                systemPrompt: EnhancedPrompts.CHAT_PROMPT
            });
        } else {
            result = await AIOrchestrator.codeWithGemini(prompt, {
                systemPrompt: EnhancedPrompts.CHAT_PROMPT,
                responseMimeType: "text/plain"
            });
        }

        return NextResponse.json({
            result: result.content,
            model: result.model,
            metadata: result.metadata
        });
    } catch(e) {
        console.error("Error in ai-chat route:", e);
        return NextResponse.json({
            error: e.message || "Failed to generate response",
            details: e.toString()
        }, { status: 500 });
    }
}