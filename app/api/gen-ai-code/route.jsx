import { NextResponse } from "next/server";
import AIOrchestrator from '@/lib/ai-orchestrator';
import EnhancedPrompts from '@/data/EnhancedPrompts';

/**
 * Enhanced Code Generation Endpoint
 * Uses intelligent AI orchestration for optimal code generation
 */
export async function POST(req){
    try {
        const { prompt, requiresPlanning = false, context = null } = await req.json();
        
        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Use orchestration for better results
        let result;
        
        if (requiresPlanning) {
            // Use plan-and-code workflow for complex tasks
            result = await AIOrchestrator.planAndCode(prompt, {
                context,
                systemPrompt: EnhancedPrompts.CODE_GEN_PROMPT,
                responseMimeType: "application/json"
            });
        } else {
            // Use fast Gemini for quick coding
            result = await AIOrchestrator.codeWithGemini(prompt, {
                context,
                systemPrompt: EnhancedPrompts.CODE_GEN_PROMPT,
                responseMimeType: "application/json"
            });
        }

        // Parse JSON response
        try {
            const parsed = JSON.parse(result.content);
            return NextResponse.json({
                ...parsed,
                model: result.model,
                metadata: result.metadata
            });
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            console.error("Raw response:", result.content);
            
            // Fallback: try to extract JSON from markdown code blocks
            const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/) || 
                            result.content.match(/```\s*([\s\S]*?)\s*```/);
            
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[1]);
                    return NextResponse.json({
                        ...parsed,
                        model: result.model,
                        metadata: result.metadata
                    });
                } catch (e) {
                    // If still fails, return error
                }
            }
            
            return NextResponse.json(
                { error: "Failed to parse AI response", details: parseError.message, raw: result.content },
                { status: 500 }
            );
        }
    } catch(e){
        console.error("Error in gen-ai-code route:", e);
        return NextResponse.json(
            { error: e.message || "Failed to generate code", details: e.toString() },
            { status: 500 }
        );
    }
}