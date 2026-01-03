import { NextResponse } from "next/server";
import AIOrchestrator from '@/lib/ai-orchestrator';
import EnhancedPrompts from '@/data/EnhancedPrompts';

/**
 * Streaming AI Response Endpoint
 * Uses Server-Sent Events (SSE) for real-time streaming
 */
export async function POST(req) {
    try {
        const {
            prompt,
            taskType = 'auto',
            requiresVision = false,
            requiresPlanning = false,
            requiresSpeed = false,
            image = null,
            context = null
        } = await req.json();

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Create a ReadableStream for SSE
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Send initial connection message
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
                    );

                    // Route task and stream response
                    const result = await AIOrchestrator.routeTask(prompt, {
                        taskType,
                        requiresVision,
                        requiresPlanning,
                        requiresSpeed,
                        image,
                        context,
                        systemPrompt: EnhancedPrompts.CODE_GEN_PROMPT
                    });

                    // Stream the response in chunks
                    const content = result.content;
                    const chunkSize = 50; // Characters per chunk

                    for (let i = 0; i < content.length; i += chunkSize) {
                        const chunk = content.slice(i, i + chunkSize);
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ 
                                type: 'chunk', 
                                content: chunk,
                                progress: Math.min(100, ((i + chunkSize) / content.length) * 100)
                            })}\n\n`)
                        );
                        
                        // Small delay for smooth streaming
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }

                    // Send completion message
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ 
                            type: 'complete',
                            model: result.model,
                            usage: result.usage,
                            metadata: result.metadata
                        })}\n\n`)
                    );

                    controller.close();
                } catch (error) {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ 
                            type: 'error', 
                            error: error.message 
                        })}\n\n`)
                    );
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error("Error in streaming endpoint:", error);
        return NextResponse.json(
            { 
                error: error.message || "Failed to stream response",
                details: error.toString()
            },
            { status: 500 }
        );
    }
}

