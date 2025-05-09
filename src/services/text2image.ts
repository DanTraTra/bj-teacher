// Use wrangler's built-in types for Ai
// npm install --save-dev @cloudflare/workers-types
// Make sure your tsconfig.json includes "compilerOptions": { "types": ["@cloudflare/workers-types"] }

// Define Env interface for bindings (like AI)
export interface Env {
    AI: Ai; // This uses the type defined in @cloudflare/workers-types
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        try {
            const url = new URL(request.url);
            // Get prompt from query param, default if not provided
            const prompt = url.searchParams.get('prompt') || 'abstract geometric pattern'; // Default prompt

            if (!prompt) {
                return new Response('Missing prompt query parameter', {status: 400});
            }

            console.log(`Generating image for prompt: "${prompt}"`);

            const inputs = {
                prompt: prompt,
                // You might add other parameters like negative_prompt, num_steps etc. if supported
            };

            // Make sure the model identifier is correct for your Cloudflare account/plan
            const responseBytes = await env.AI.run(
                "@cf/bytedance/stable-diffusion-xl-lightning",
                // Or try: "@cf/stabilityai/stable-diffusion-xl-base-1.0"
                // Or others available in the Cloudflare AI catalog
                inputs
            );

            console.log(`Image generated successfully for prompt: "${prompt}"`);

            // --- CORS Headers ---
            const headers = new Headers();
            headers.set('Content-Type', 'image/jpeg'); // Use jpeg or png based on model output
            // Allow requests from any origin (for development).
            // For production, restrict this to your actual frontend domain.
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Allow GET requests
            headers.set('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers if needed

            // Handle potential OPTIONS preflight requests for CORS
            if (request.method === 'OPTIONS') {
                return new Response(null, {headers});
            }

            return new Response(responseBytes, {
                headers: headers,
            });

        } catch (error) {
            console.error('Error generating image:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            // Also need CORS headers on error responses for the browser to read them
            const errorHeaders = new Headers();
            errorHeaders.set('Access-Control-Allow-Origin', '*');
            errorHeaders.set('Content-Type', 'application/json');

            return new Response(JSON.stringify({error: 'Failed to generate image', details: errorMessage}), {
                status: 500,
                headers: errorHeaders,
            });
        }
    },
} satisfies ExportedHandler<Env>;