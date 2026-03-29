document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initTrueAIChatbot, 200); // Wait for script.js to bind, then we nuke and replace
});

function initTrueAIChatbot() {
    console.log("Initializing True AI Chatbot...");

    // Replace Form to destroy old listeners
    const oldForm = document.getElementById('chatForm');
    if (!oldForm) return;
    const newForm = oldForm.cloneNode(true);
    oldForm.parentNode.replaceChild(newForm, oldForm);
    
    // Replace Quick Replies to destroy old listeners
    const oldQR = document.getElementById('chatQuickReplies');
    if (oldQR) {
        const newQR = oldQR.cloneNode(true);
        oldQR.parentNode.replaceChild(newQR, oldQR);
    }

    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatVoiceBtn = document.getElementById('chatVoiceBtn');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const quickReplyBtns = document.querySelectorAll('.quick-reply-btn');
    
    // API KEY PLACEHOLDER FOR THE USER TO FILL IN!
    // TODO: User must put their Google Gemini API Key here for the bot to work!
    const GEMINI_API_KEY = "PUT_YOUR_GEMINI_API_KEY_HERE";

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        // Clean markdown basic formatting outputted by LLM (bold to html)
        const htmlText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
        msgDiv.innerHTML = `<div class="msg-content">${htmlText}</div>`;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function showTyping() {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message bot typing-msg`;
        msgDiv.innerHTML = `<div class="msg-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return msgDiv;
    }

    function speakText(text) {
        if ('speechSynthesis' in window) {
            // strip markdown
            const plainText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/#/g, '');
            const utterance = new SpeechSynthesisUtterance(plainText);
            utterance.lang = 'en-IN';
            window.speechSynthesis.speak(utterance);
        }
    }

    async function fetchGeminiReply(userText, typingIndicator, isVoice = false) {
        if (GEMINI_API_KEY === "PUT_YOUR_GEMINI_API_KEY_HERE" || !GEMINI_API_KEY) {
            typingIndicator.remove();
            addMessage("[Demo Mode Setup] To enable the true AI, please edit `js/chatbot.js` and replace `PUT_YOUR_GEMINI_API_KEY_HERE` with your actual Google Gemini API key.", 'bot');
            return;
        }

        try {
            // Build system prompt context 
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
                        maxOutputTokens: 200,
                    }
                })
            });

            const data = await response.json();
            typingIndicator.remove();
            
            if (data.candidates && data.candidates.length > 0) {
                const replyText = data.candidates[0].content.parts[0].text;
                addMessage(replyText, 'bot');
                if (isVoice) speakText(replyText);
            } else if (data.error) {
                addMessage("API Error: " + data.error.message, 'bot');
            } else {
                addMessage("Sorry, I could not generate a response right now.", 'bot');
            }

        } catch (err) {
            typingIndicator.remove();
            addMessage("Network Error: Could not reach the AI servers.", 'bot');
            console.error("Gemini Error:", err);
        }
    }

    function handleUserInput(text, isVoice = false) {
        if(!text) return;
        addMessage(text, 'user');
        chatInput.value = '';
        const typingIndicator = showTyping();
        fetchGeminiReply(text, typingIndicator, isVoice);
    }

    // Voice Recognition Setup
    let recognition = null;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';
        
        recognition.onstart = function() {
            if(chatVoiceBtn) chatVoiceBtn.classList.add('listening');
            chatInput.placeholder = "Listening...";
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            handleUserInput(transcript, true);
        };
        
        recognition.onerror = function(event) {
            console.error("Speech Recognition Error", event.error);
            if(chatVoiceBtn) chatVoiceBtn.classList.remove('listening');
            chatInput.placeholder = "Type...";
        };
        
        recognition.onend = function() {
            if(chatVoiceBtn) chatVoiceBtn.classList.remove('listening');
            chatInput.placeholder = "Type...";
        };
    }

    if (chatVoiceBtn) {
        chatVoiceBtn.addEventListener('click', () => {
            if (recognition) {
                if (chatVoiceBtn.classList.contains('listening')) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            } else {
                alert("Voice recognition is not supported in this browser.");
            }
        });
    }

    // Bind event tracking
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            handleUserInput(text, false);
        });
    }

    // Re-bind quick replies
    const newQuickReplies = document.querySelectorAll('.quick-reply-btn');
    newQuickReplies.forEach(btn => {
        btn.addEventListener('click', () => {
            handleUserInput(btn.innerText);
        });
    });
}
