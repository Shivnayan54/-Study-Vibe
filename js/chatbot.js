// Chatbot Configuration
const GEMINI_API_KEY = 'AIzaSyAVs7cQmI05AjKP3GC8r_NLRDtgCKGFH20';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createChatbotUI();
        this.attachEventListeners();
        this.showWelcomeMessage();
    }

    createChatbotUI() {
        const chatbotHTML = `
            <div class="chatbot-container">
                <button class="chatbot-button" id="chatbotToggle">
                    <svg class="chat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
                    </svg>
                    <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    <div class="chatbot-badge">!</div>
                </button>
                <div class="chatbot-window" id="chatbotWindow">
                    <div class="chatbot-header">
                        <div class="chatbot-avatar">🤖</div>
                        <div class="chatbot-info">
                            <h3>StudyVibe Assistant</h3>
                            <p>Online • Always ready to help</p>
                        </div>
                    </div>
                    <div class="chatbot-messages" id="chatbotMessages">
                        <!-- Messages will be added here -->
                    </div>
                    <div class="chatbot-input-area">
                        <input 
                            type="text" 
                            class="chatbot-input" 
                            id="chatbotInput" 
                            placeholder="Type your message..."
                            autocomplete="off"
                        />
                        <button class="chatbot-send-btn" id="chatbotSend">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('chatbotToggle');
        const sendBtn = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbotWindow');
        const button = document.getElementById('chatbotToggle');
        const badge = document.querySelector('.chatbot-badge');

        if (this.isOpen) {
            window.classList.add('active');
            button.classList.add('active');
            badge.style.display = 'none';
            document.getElementById('chatbotInput').focus();
        } else {
            window.classList.remove('active');
            button.classList.remove('active');
        }
    }

    showWelcomeMessage() {
        setTimeout(() => {
            this.addMessage('bot', `
                <div class="welcome-message">
                    <h4>👋 Welcome to StudyVibe!</h4>
                    <p>I'm here to help you find question papers, answer your study-related questions, and guide you through the portal.</p>
                </div>
            `, true);
            this.showQuickReplies();
        }, 500);
    }

    showQuickReplies() {
        const quickReplies = [
            'How do I find papers?',
            'What boards are available?',
            'How to download papers?',
            'Tell me about PYQS'
        ];

        const repliesHTML = `
            <div class="quick-replies">
                ${quickReplies.map(reply => 
                    `<button class="quick-reply-btn" onclick="chatbot.handleQuickReply('${reply}')">${reply}</button>`
                ).join('')}
            </div>
        `;

        const messagesDiv = document.getElementById('chatbotMessages');
        messagesDiv.insertAdjacentHTML('beforeend', repliesHTML);
        this.scrollToBottom();
    }

    handleQuickReply(reply) {
        // Remove quick reply buttons
        const quickReplies = document.querySelector('.quick-replies');
        if (quickReplies) quickReplies.remove();

        // Add as user message and get response
        this.addMessage('user', reply);
        this.getBotResponse(reply);
    }

    addMessage(sender, text, isHTML = false) {
        const messagesDiv = document.getElementById('chatbotMessages');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        const messageHTML = `
            <div class="message ${sender}">
                <div class="message-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
                <div class="message-content">
                    ${isHTML ? text : `<p>${text}</p>`}
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;

        messagesDiv.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const messagesDiv = document.getElementById('chatbotMessages');
        const typingHTML = `
            <div class="message bot typing-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        messagesDiv.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingMsg = document.querySelector('.typing-message');
        if (typingMsg) typingMsg.remove();
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();

        if (!message) return;

        this.addMessage('user', message);
        input.value = '';

        await this.getBotResponse(message);
    }

    async getBotResponse(userMessage) {
        this.showTypingIndicator();

        try {
            // Try to use Gemini AI API
            const response = await this.callGeminiAPI(userMessage);
            this.removeTypingIndicator();
            this.addMessage('bot', response);
        } catch (error) {
            console.error('Gemini API Error:', error);
            // Fallback to local responses
            this.removeTypingIndicator();
            const fallbackResponse = this.getFallbackResponse(userMessage);
            this.addMessage('bot', fallbackResponse);
        }
    }

    async callGeminiAPI(message) {
        const context = `You are a helpful assistant for StudyVibe, an educational portal that provides previous year question papers (PYQS) from Indian boards including CBSE, ICSE, UP Board, and Bihar Board. The portal offers papers for classes 9-12. Be concise, friendly, and helpful. Answer questions about the portal, how to find papers, and general study advice.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${context}\n\nUser question: ${message}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    getFallbackResponse(message) {
        const lowercaseMsg = message.toLowerCase();

        // Study and paper-related responses
        if (lowercaseMsg.includes('find') || lowercaseMsg.includes('search') || lowercaseMsg.includes('how')) {
            return "To find papers, you can:\n\n1. 📚 Use the Browse Papers page to filter by board, class, year, and subject\n2. 🔍 Use the Search page to search by keywords\n3. 📝 Visit the PYQS page for previous year question papers\n\nJust click on any paper to view or download it!";
        }

        if (lowercaseMsg.includes('board') || lowercaseMsg.includes('cbse') || lowercaseMsg.includes('icse')) {
            return "We support the following boards:\n\n📖 CBSE - Central Board of Secondary Education\n📘 ICSE - Indian Certificate of Secondary Education\n📗 UP Board - Uttar Pradesh Board\n📙 Bihar Board - Bihar School Examination Board\n\nAll papers are available for classes 9-12!";
        }

        if (lowercaseMsg.includes('download') || lowercaseMsg.includes('pdf')) {
            return "To download papers:\n\n1. Browse or search for your desired paper\n2. Click on the paper card\n3. View it in the PDF viewer\n4. Click the Download button\n\nNote: You may need to view a short advertisement to support our free service. Thank you for your understanding! 📥";
        }

        if (lowercaseMsg.includes('pyqs') || lowercaseMsg.includes('previous year')) {
            return "PYQS (Previous Year Question Papers) are essential for exam preparation! 📝\n\nThey help you:\n✅ Understand exam patterns\n✅ Practice with real questions\n✅ Improve time management\n✅ Identify important topics\n\nVisit our PYQS page to access years of past papers!";
        }

        if (lowercaseMsg.includes('class') || lowercaseMsg.includes('grade')) {
            return "We have question papers for:\n\n🎓 Class 9\n🎓 Class 10\n🎓 Class 11\n🎓 Class 12\n\nYou can filter by class when browsing papers. Good luck with your studies!";
        }

        if (lowercaseMsg.includes('subject')) {
            return "We offer papers for all major subjects including:\n\n📐 Mathematics\n🔬 Science (Physics, Chemistry, Biology)\n🌍 Social Studies\n📖 English\n🗣️ Hindi\n\nAnd many more! Use filters to find papers for your specific subject.";
        }

        if (lowercaseMsg.includes('free') || lowercaseMsg.includes('cost') || lowercaseMsg.includes('price')) {
            return "All our papers are 100% FREE to download! 🎉\n\nNo registration required, no hidden charges. We show brief advertisements to keep the service free for everyone. Thank you for supporting us!";
        }

        if (lowercaseMsg.includes('help') || lowercaseMsg.includes('support')) {
            return "I'm here to help! You can ask me about:\n\n• How to find and download papers\n• Available boards and classes\n• PYQS and exam preparation\n• Features of the portal\n• Any other study-related questions\n\nWhat would you like to know?";
        }

        if (lowercaseMsg.includes('thank') || lowercaseMsg.includes('thanks')) {
            return "You're welcome! 😊 Happy studying! Feel free to ask if you have any other questions.";
        }

        if (lowercaseMsg.includes('hi') || lowercaseMsg.includes('hello') || lowercaseMsg.includes('hey')) {
            return "Hello! 👋 Welcome to StudyVibe! I'm here to help you find question papers and answer your questions. What can I help you with today?";
        }

        // Default response
        return "I'm here to help you with StudyVibe! You can ask me about:\n\n• Finding and downloading papers 📚\n• Available boards and classes 🎓\n• PYQS and exam preparation 📝\n• Portal features and navigation 🔍\n\nWhat would you like to know?";
    }

    scrollToBottom() {
        const messagesDiv = document.getElementById('chatbotMessages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}

// Initialize chatbot when DOM is loaded
let chatbot;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        chatbot = new Chatbot();
    });
} else {
    chatbot = new Chatbot();
}

