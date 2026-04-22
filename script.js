// ============================================================
// ЖИ API интеграциясы және интерактивті функционал
// ============================================================

// ---------- API КОНФИГУРАЦИЯСЫ ----------
// Groq API кілті (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)
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama3-70b-8192';

// ---------- DOM ЭЛЕМЕНТТЕРІ ----------
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;
const cards = document.querySelectorAll('.card');
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');
const counterSpan = document.getElementById('request-counter');
const apiWarning = document.getElementById('api-warning');

// ---------- АЙНЫМАЛЫЛАР ----------
let requestCount = 0;

// ---------- API КІЛТІН ТЕКСЕРУ ----------
function checkAPIKey() {
    if (GROQ_API_KEY === 'gsk_your_api_key_here') {
        apiWarning.style.display = 'block';
        console.error('❌ API кілті енгізілмеген! script.js файлын өзгертіңіз.');
        return false;
    } else {
        apiWarning.style.display = 'none';
        console.log('✅ API кілті табылды, жұмыс істеуге дайын!');
        return true;
    }
}

// ---------- 1. ТАҚЫРЫП АУЫСТЫРУ ----------
/**
 * Қараңғы/ашық тақырыпты ауыстырады және localStorage-та сақтайды
 */
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

// Сақталған тақырыпты жүктеу
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    bodyElement.classList.add('dark-theme');
    themeToggleBtn.innerHTML = '☀️ Ашық режим';
}

themeToggleBtn.addEventListener('click', toggleTheme);

// ---------- 2. КАРТОЧКАЛАР АНИМАЦИЯСЫ ----------
/**
 * Intersection Observer API арқылы карточкалардың пайда болу анимациясы
 */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

cards.forEach(card => observer.observe(card));

// ---------- 3. САНАУЫШ ----------
/**
 * Сұраныс санауышын 1-ге арттырады
 */
function incrementCounter() {
    requestCount++;
    counterSpan.textContent = `📊 Сұраныс саны: ${requestCount}`;
}

// ---------- 4. ЧАТ ФУНКЦИЯЛАРЫ ----------
/**
 * Чатқа жаңа хабарлама қосады
 * @param {string} text - Хабарлама мәтіні
 * @param {string} sender - 'user' немесе 'bot'
 */
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

/**
 * Groq API-ге сұраныс жібереді
 * @param {string} userMessage - Пайдаланушы сұрағы
 */
async function sendToAI(userMessage) {
    if (!checkAPIKey()) {
        appendMessage('❌ API кілті жоқ. script.js файлын өзгертіңіз.', 'bot');
        return;
    }

    loadingIndicator.style.display = 'flex';
    sendBtn.disabled = true;
    userInput.disabled = true;

    try {
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
                        content: 'Сіз пайдалы бағдарламалау көмекшісісіз. Қысқа, нақты және қазақ тілінде жауап беріңіз.'
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `Қате ${response.status}`);
        }

        const data = await response.json();
        const botReply = data.choices[0].message.content;
        
        appendMessage(botReply, 'bot');
        incrementCounter();

    } catch (error) {
        console.error('API қатесі:', error);
        appendMessage(`⚠️ Қате: ${error.message}`, 'bot');
    } finally {
        loadingIndicator.style.display = 'none';
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

/**
 * Хабарламаны жіберуді өңдейді
 */
function handleSendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;
    
    appendMessage(message, 'user');
    userInput.value = '';
    sendToAI(message);
}

// Оқиға тыңдаушылары
sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
    }
});

// ---------- 5. БАСТАПҚЫ ЖҮКТЕУ ----------
window.addEventListener('load', () => {
    checkAPIKey();
    userInput.focus();
    console.log('✅ Жоба сәтті жүктелді! API кілті белсенді.');
});
