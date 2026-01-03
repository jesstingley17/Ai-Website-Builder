import { NextResponse } from "next/server";
import { GenAiCode } from '@/configs/AiModel';

export async function POST(req){
    try {
        const {prompt}=await req.json();
        
        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const result=await GenAiCode.sendMessage(prompt);
        const resp=result.response.text();
        
        try {
            const parsed = JSON.parse(resp);
            return NextResponse.json(parsed);
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            console.error("Raw response:", resp);
            return NextResponse.json(
                { error: "Failed to parse AI response", details: parseError.message },
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