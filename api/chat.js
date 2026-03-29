// Vercel Serverless Function (Node.js) 
// Securely proxies requests to Google Gemini 
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "API Key Not Configured on Server" });
    }

    try {
        const { userText } = req.body;
        
        if (!userText) {
            return res.status(400).json({ error: "Missing user message" });
        }

        const sysPrompt = "You are FinAI, an expert Indian financial advisor. Be concise, practical, and heavily use formatting like bullet points or bold text. Format strictly in Markdown. Reply in mostly 2-3 sentences max unless a detailed list is requested. Context: The user is using an app called FinSense.";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: sysPrompt + "\n\nUser Question: " + userText }] }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 250,
                }
            })
        });

        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        res.status(200).json(data);

    } catch (error) {
        console.error("Serverless API Error:", error);
        res.status(500).json({ error: "Failed to communicate with AI servers." });
    }
}
