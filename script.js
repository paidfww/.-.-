// ============================================================
// ЖИ API интеграциясы - ЖАҢА МОДЕЛЬМЕН
// ============================================================

// ---------- API КОНФИГУРАЦИЯСЫ ----------
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// ЖАҢА МОДЕЛЬ: llama-3.3-70b-versatile (ең жаңа және тұрақты)
const MODEL_NAME = 'llama-3.3-70b-versatile';

// ---------- DOM ЭЛЕМЕНТТЕРІ ----------
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;
const cards = document.querySelectorAll('.card');
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const counterSpan = document.getElementById('request-counter');

// ---------- АЙНЫМАЛЫЛАР ----------
let requestCount = 0;

// ---------- 1. ТАҚЫРЫП АУЫСТЫРУ ----------
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

// ---------- 2. КАРТОЧКАЛАР АНИМАЦИЯСЫ ----------
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

cards.forEach(card => observer.observe(card));

// ---------- 3. САНАУЫШ ----------
function incrementCounter() {
    requestCount++;
    counterSpan.textContent = `📊 Сұраныс саны: ${requestCount}`;
}

// ---------- 4. ЧАТ ФУНКЦИЯЛАРЫ ----------
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
                        content: 'Сіз пайдалы бағдарламалау көмекшісісіз. Қысқа және нақты жауап беріңіз.'
                    },
                    { 
                        role: 'user', 
                        content: userMessage 
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        console.log('📡 Жауап статусы:', response.status);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('❌ API қатесі:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log('✅ API жауабы алынды');
        
        const botReply = data.choices[0].message.content;
        
        appendMessage(botReply, 'bot');
        incrementCounter();

    } catch (error) {
        console.error('❌ Толық қате:', error);
        appendMessage(`⚠️ Қате: ${error.message}`, 'bot');
    } finally {
        loadingIndicator.style.display = 'none';
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
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

// ---------- 5. БАСТАПҚЫ ЖҮКТЕУ ----------
window.addEventListener('load', () => {
    console.log('✅ Жоба жүктелді!');
    console.log('🔑 API кілті:', GROQ_API_KEY.substring(0, 10) + '...');
    console.log('🤖 Модель:', MODEL_NAME);
    userInput.focus();
    
    // Қолжетімді модельдерді тексеру
    fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
    })
    .then(res => res.json())
    .then(data => {
        console.log('📋 Қолжетімді модельдер:', data.data.map(m => m.id));
    })
    .catch(err => console.error('❌ API байланысы:', err));
});
