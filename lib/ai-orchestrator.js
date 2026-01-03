/**
 * Advanced AI Orchestrator - Multi-Model System
 * Routes tasks to optimal AI models based on requirements
 * More powerful than lovable.dev with intelligent model selection
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize AI clients with lazy loading for optional dependencies
const geminiClient = process.env.NEXT_PUBLIC_GEMINI_API_KEY 
    ? new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
    : null;

// Lazy load Anthropic client
async function getAnthropicClient() {
    if (!process.env.ANTHROPIC_API_KEY) return null;
    try {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    } catch (e) {
        console.warn('Anthropic SDK not available:', e);
        return null;
    }
}

// Lazy load OpenAI client
async function getOpenAIClient() {
    if (!process.env.OPENAI_API_KEY) return null;
    try {
        const OpenAI = (await import('openai')).default;
        return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } catch (e) {
        console.warn('OpenAI SDK not available:', e);
        return null;
    }
}

/**
 * AI Model Types
 */
export const AI_MODELS = {
    CLAUDE_OPUS: 'claude-opus-4.5',      // High-reasoning Planner
    GEMINI_FLASH: 'gemini-2.5-flash',    // Low-latency Coder
    GPT4O: 'gpt-4o',                     // Vision/Legacy
    DALL_E_3: 'dall-e-3',                // Asset Generation
    GEMINI_PRO: 'gemini-pro'             // Fallback
};

/**
 * Task Router - Intelligently selects the best model for each task
 */
export class AIOrchestrator {
    /**
     * Route task to appropriate AI model
     */
    static async routeTask(task, options = {}) {
        const {
            taskType = 'auto',
            requiresVision = false,
            requiresPlanning = false,
            requiresSpeed = false,
            requiresAssets = false
        } = options;

        // Auto-detect task type
        if (taskType === 'auto') {
            if (requiresAssets || task.includes('image') || task.includes('asset')) {
                return this.generateAsset(task, options);
            }
            if (requiresVision || options.image) {
                return this.analyzeVision(task, options);
            }
            if (requiresPlanning || this.isPlanningTask(task)) {
                return this.planWithClaude(task, options);
            }
            if (requiresSpeed || this.isQuickEditTask(task)) {
                return this.codeWithGemini(task, options);
            }
            // Default: Use Claude for complex planning, then Gemini for execution
            return this.planAndCode(task, options);
        }

        // Explicit routing
        switch (taskType) {
            case 'planning':
                return this.planWithClaude(task, options);
            case 'coding':
                return this.codeWithGemini(task, options);
            case 'vision':
                return this.analyzeVision(task, options);
            case 'asset':
                return this.generateAsset(task, options);
            default:
                return this.codeWithGemini(task, options);
        }
    }

    /**
     * High-reasoning planning with Claude Opus 4.5 (or Sonnet as fallback)
     */
    static async planWithClaude(task, options = {}) {
        const anthropicClient = await getAnthropicClient();
        
        if (!anthropicClient) {
            console.warn('Anthropic API not configured, falling back to Gemini');
            return this.codeWithGemini(task, options);
        }

        try {
            const model = 'claude-3-5-sonnet-20241022'; // Using Sonnet as Opus 4.5 may not be available
            
            const response = await anthropicClient.messages.create({
                model,
                max_tokens: 4096,
                temperature: 0.7,
                messages: [{
                    role: 'user',
                    content: this.buildPlanningPrompt(task, options)
                }]
            });

            return {
                model: AI_MODELS.CLAUDE_OPUS,
                content: response.content[0].text,
                usage: response.usage,
                metadata: { model: response.model }
            };
        } catch (error) {
            console.error('Claude planning error:', error);
            return this.codeWithGemini(task, options);
        }
    }

    /**
     * Low-latency coding with Gemini 2.5 Flash
     */
    static async codeWithGemini(task, options = {}) {
        if (!geminiClient) {
            throw new Error('Gemini API key not configured');
        }

        try {
            const model = geminiClient.getGenerativeModel({
                model: "gemini-2.0-flash-exp",
            });

            const generationConfig = {
                temperature: options.temperature || 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: options.maxTokens || 8192,
                responseMimeType: options.responseMimeType || "application/json",
            };

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: this.buildCodingPrompt(task, options) }] }],
                generationConfig
            });

            const response = await result.response;
            return {
                model: AI_MODELS.GEMINI_FLASH,
                content: response.text(),
                usage: response.usageMetadata,
                metadata: { model: 'gemini-2.0-flash-exp' }
            };
        } catch (error) {
            console.error('Gemini coding error:', error);
            throw error;
        }
    }

    /**
     * Vision analysis with GPT-4o
     */
    static async analyzeVision(task, options = {}) {
        const openaiClient = await getOpenAIClient();
        
        if (!openaiClient) {
            console.warn('OpenAI API not configured, falling back to Gemini');
            return this.codeWithGemini(task, options);
        }

        try {
            const messages = [{
                role: 'user',
                content: [
                    { type: 'text', text: this.buildVisionPrompt(task, options) }
                ]
            }];

            // Add image if provided
            if (options.image) {
                messages[0].content.push({
                    type: 'image_url',
                    image_url: { url: options.image }
                });
            }

            const response = await openaiClient.chat.completions.create({
                model: 'gpt-4o',
                messages,
                max_tokens: 4096,
                temperature: 0.7
            });

            return {
                model: AI_MODELS.GPT4O,
                content: response.choices[0].message.content,
                usage: response.usage,
                metadata: { model: response.model }
            };
        } catch (error) {
            console.error('GPT-4o vision error:', error);
            return this.codeWithGemini(task, options);
        }
    }

    /**
     * Asset generation with DALL-E 3
     */
    static async generateAsset(task, options = {}) {
        const openaiClient = await getOpenAIClient();
        
        if (!openaiClient) {
            throw new Error('OpenAI API not configured for asset generation');
        }

        try {
            const response = await openaiClient.images.generate({
                model: 'dall-e-3',
                prompt: this.buildAssetPrompt(task, options),
                n: 1,
                size: options.size || '1024x1024',
                quality: options.quality || 'standard',
                style: options.style || 'natural'
            });

            return {
                model: AI_MODELS.DALL_E_3,
                content: response.data[0].url,
                usage: response.data[0],
                metadata: { 
                    model: 'dall-e-3',
                    revised_prompt: response.data[0].revised_prompt
                }
            };
        } catch (error) {
            console.error('DALL-E 3 asset generation error:', error);
            throw error;
        }
    }

    /**
     * Combined planning and coding workflow
     */
    static async planAndCode(task, options = {}) {
        // Step 1: Plan with Claude
        const plan = await this.planWithClaude(task, { ...options, taskType: 'planning' });
        
        // Step 2: Execute with Gemini
        const code = await this.codeWithGemini(
            `Based on this plan: ${plan.content}\n\nOriginal task: ${task}`,
            { ...options, taskType: 'coding' }
        );

        return {
            plan,
            code,
            model: 'multi-model',
            content: code.content
        };
    }

    /**
     * Helper: Check if task requires planning
     */
    static isPlanningTask(task) {
        const planningKeywords = ['plan', 'design', 'architecture', 'structure', 'strategy', 'approach'];
        return planningKeywords.some(keyword => 
            task.toLowerCase().includes(keyword)
        );
    }

    /**
     * Helper: Check if task is a quick edit
     */
    static isQuickEditTask(task) {
        const quickEditKeywords = ['change', 'update', 'modify', 'edit', 'fix', 'adjust', 'tweak'];
        return quickEditKeywords.some(keyword => 
            task.toLowerCase().includes(keyword)
        );
    }

    /**
     * Build planning prompt
     */
    static buildPlanningPrompt(task, options) {
        return `You are an expert full-stack developer using React, Tailwind, and modern web technologies. 

Your task: ${task}

Analyze the requirements and create a detailed plan including:
1. Component architecture
2. Data flow and state management
3. Styling approach
4. Key features and interactions
5. Implementation steps

Be thorough and consider best practices, accessibility, and mobile responsiveness.`;
    }

    /**
     * Build coding prompt
     */
    static buildCodingPrompt(task, options) {
        return `You are an expert full-stack developer using React, Tailwind CSS, and modern web technologies. Prefer shadcn/ui components when appropriate. Always build mobile-responsive layouts. If requirements are ambiguous, make reasonable assumptions based on best practices.

Task: ${task}

Generate production-ready code following these guidelines:
- Use React best practices
- Use Tailwind CSS for styling
- Make it fully responsive
- Include proper error handling
- Add comments for complex logic
- Use semantic HTML
- Ensure accessibility

${options.context ? `\nContext: ${options.context}` : ''}

${options.systemPrompt || ''}`;
    }

    /**
     * Build vision analysis prompt
     */
    static buildVisionPrompt(task, options) {
        return `You are an expert web developer. Analyze the provided image/screenshot and:

1. Identify the UI components and layout structure
2. Describe the design patterns and styling approach
3. Suggest the technology stack
4. Provide implementation guidance

Task: ${task}

Be specific about colors, spacing, typography, and interactive elements.`;
    }

    /**
     * Build asset generation prompt
     */
    static buildAssetPrompt(task, options) {
        return `Create a high-quality, professional ${options.assetType || 'image'} for a web application. 

Requirements: ${task}

Style: Modern, clean, web-appropriate. Avoid text in images. Use appropriate colors and composition.`;
    }
}

export default AIOrchestrator;

