// Vercel Serverless Function (Node.js) 
// Securely proxies requests to Google Gemini 
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: "OpenRouter API Key Not Configured on Server" });
    }

    try {
        const { userText } = req.body;
        
        if (!userText) {
            return res.status(400).json({ error: "Missing user message" });
        }

        const sysPrompt = "You are FinAI, an expert Indian financial advisor. Be concise, practical, and heavily use formatting like bullet points or bold text. Format strictly in Markdown. Reply in mostly 2-3 sentences max unless a detailed list is requested. Context: The user is using an app called FinSense.";

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://finsense.vercel.app", // Optional, for OpenRouter ranking
                "X-Title": "FinSense Suite",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    { "role": "system", "content": sysPrompt },
                    { "role": "user", "content": userText }
                ],
                "max_tokens": 250,
                "temperature": 0.7
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ error: data.error.message || data.error });
        }

        // Return a simplified response format for our frontend
        const reply = data.choices[0].message.content;
        res.status(200).json({ reply });

    } catch (error) {
        console.error("OpenRouter Serverless API Error:", error);
        res.status(500).json({ error: "Failed to communicate with AI servers via OpenRouter." });
    }
}
