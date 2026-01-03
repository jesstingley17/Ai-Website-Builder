import { NextResponse } from "next/server";
import SupabaseProvisioner from '@/lib/supabase-provisioner';

/**
 * Supabase Backend Provisioning Endpoint
 * Automatically creates database schema based on requirements
 */
export async function POST(req) {
    try {
        const { 
            requirements, 
            supabaseUrl, 
            supabaseKey 
        } = await req.json();

        if (!requirements) {
            return NextResponse.json(
                { error: "Requirements are required" },
                { status: 400 }
            );
        }

        // Use environment variables if not provided
        const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = supabaseKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            return NextResponse.json(
                { 
                    error: "Supabase credentials not configured",
                    note: "Provide supabaseUrl and supabaseKey, or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
                },
                { status: 400 }
            );
        }

        const provisioner = new SupabaseProvisioner(url, key);
        const result = await provisioner.provisionFromRequirements(requirements);
        const clientConfig = provisioner.generateClientConfig();

        return NextResponse.json({
            success: true,
            ...result,
            clientConfig
        });

    } catch (error) {
        console.error("Error in Supabase provisioning:", error);
        return NextResponse.json(
            { 
                error: error.message || "Failed to provision Supabase",
                details: error.toString()
            },
            { status: 500 }
        );
    }
}

