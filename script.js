// ============================================================
// ЖИ API интеграциясы - ЖАҢА МОДЕЛЬ
// Файл нұсқасы: 2.0
// ============================================================

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama-3.1-8b-instant'; // ЖАҢА МОДЕЛЬ!!!

console.log('='.repeat(60));
console.log('🔄 SCRIPT.JS v2.0 ЖҮКТЕЛДІ');
console.log('🤖 МОДЕЛЬ:', MODEL_NAME);
console.log('='.repeat(60));

const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;
const cards = document.querySelectorAll('.card');
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const counterSpan = document.getElementById('request-counter');

let requestCount = 0;

function toggleTheme() {
    bodyElement.classList.toggle('dark-theme');
    if (bodyElement.classList.contains('dark-theme')) {
        themeToggleBtn.innerHTML = '☀️ Ашық режим';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggleBtn.innerHTML = '🌙 Қараңғы режим';
        localStorage.setItem('theme', 'light');
    }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    bodyElement.classList.add('dark-theme');
    themeToggleBtn.innerHTML = '☀️ Ашық режим';
}
themeToggleBtn.addEventListener('click', toggleTheme);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
cards.forEach(card => observer.observe(card));

function incrementCounter() {
    requestCount++;
    counterSpan.textContent = `📊 Сұраныс саны: ${requestCount}`;
}

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    const senderSpan = document.createElement('div');
    senderSpan.classList.add('message-sender');
    senderSpan.textContent = sender === 'user' ? '👤 Сіз' : '🤖 Ассистент';
    const textDiv = document.createElement('div');
    textDiv.classList.add('message-text');
    textDiv.textContent = text;
    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(textDiv);
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function sendToAI(userMessage) {
    loadingIndicator.style.display = 'flex';
    sendBtn.disabled = true;
    userInput.disabled = true;

    try {
        console.log('🔄 API-ге сұраныс жіберілуде...');
        console.log('📋 Модель:', MODEL_NAME);
        
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: 'Сіз пайдалы көмекшісіз. Қысқа және нақты жауап беріңіз.'
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        console.log('📡 Статус:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API қатесі:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Жауап алынды!');
        
        const botReply = data.choices[0].message.content;
        appendMessage(botReply, 'bot');
        incrementCounter();

    } catch (error) {
        console.error('❌ Қате:', error);
        
        // Егер бұл модель жұмыс істемесе, баламасын қолдану
        if (error.message.includes('decommissioned') || error.message.includes('model')) {
            console.log('⚠️ Балама модель қолданылады...');
            await tryAlternativeModel(userMessage);
        } else {
            appendMessage(`⚠️ Қате: ${error.message}`, 'bot');
        }
    } finally {
        loadingIndicator.style.display = 'none';
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// Балама модельдермен жұмыс істеу
async function tryAlternativeModel(userMessage) {
    const alternativeModels = ['mixtral-8x7b-32768', 'gemma2-9b-it', 'llama-3.2-3b-preview'];
    
    for (const model of alternativeModels) {
        try {
            console.log(`🔄 Балама модель: ${model}`);
            
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: 'Сіз пайдалы көмекшісіз.' },
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (response.ok) {
                const data = await response.json();
                const botReply = data.choices[0].message.content;
                appendMessage(botReply, 'bot');
                incrementCounter();
                console.log(`✅ ${model} моделі жұмыс істеді!`);
                return;
            }
        } catch (error) {
            console.log(`❌ ${model} жұмыс істемеді:`, error);
        }
    }
    
    appendMessage('❌ Барлық модельдер жұмыс істемеді. Интернет байланысын тексеріңіз.', 'bot');
}

function handleSendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    appendMessage(message, 'user');
    userInput.value = '';
    sendToAI(message);
}

sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
    }
});

window.addEventListener('load', () => {
    console.log('✅ Жоба жүктелді! v2.0');
    console.log('🤖 Негізгі модель:', MODEL_NAME);
    userInput.focus();
});
