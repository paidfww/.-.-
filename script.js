// ============================================================
// ЖИ API интеграциясы - ЖАҢА НҰСҚА (2026)
// ============================================================

// ---------- API КОНФИГУРАЦИЯСЫ ----------
const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// ЖАҢА МОДЕЛЬ: llama-3.1-8b-instant (жылдам әрі тегін)
const MODEL_NAME = 'llama-3.1-8b-instant';

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

// ---------- ТАҚЫРЫП АУЫСТЫРУ ----------
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

// ---------- КАРТОЧКАЛАР АНИМАЦИЯСЫ ----------
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

cards.forEach(card => observer.observe(card));

// ---------- САНАУЫШ ----------
function incrementCounter() {
    requestCount++;
    counterSpan.textContent = `📊 Сұраныс саны: ${requestCount}`;
}

// ---------- ХАБАРЛАМА ҚОСУ ----------
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

// ---------- API-ГЕ СҰРАНЫС ЖІБЕРУ ----------
async function sendToAI(userMessage) {
    loadingIndicator.style.display = 'flex';
    sendBtn.disabled = true;
    userInput.disabled = true;

    try {
        console.log('🔄 API-ге сұраныс жіберілуде...');
        console.log('📋 Қолданылатын модель:', MODEL_NAME);
        
        const requestBody = {
            model: MODEL_NAME,
            messages: [
                {
                    role: 'system',
                    content: 'Сіз пайдалы көмекшісіз. Қысқа, нақты және қазақ тілінде жауап беріңіз.'
                },
                { 
                    role: 'user', 
                    content: userMessage 
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        };
        
        console.log('📤 Сұраныс:', requestBody);

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📡 Жауап статусы:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API қате жауабы:', errorText);
            
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error?.message || errorMessage;
            } catch (e) {
                errorMessage = errorText || errorMessage;
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ API жауабы:', data);
        
        const botReply = data.choices[0].message.content;
        
        appendMessage(botReply, 'bot');
        incrementCounter();

    } catch (error) {
        console.error('❌ Қате:', error);
        
        // Егер модель табылмаса, балама модельді ұсыну
        if (error.message.includes('model')) {
            appendMessage('⚠️ Модель табылмады. Балама модель қолданып көріңіз: "llama-3.1-8b-instant" немесе "mixtral-8x7b-32768"', 'bot');
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

// ---------- ХАБАРЛАМАНЫ ЖІБЕРУ ----------
function handleSendMessage() {
    const message = userInput.value.trim();
    if (message === '') {
        return;
    }
    
    appendMessage(message, 'user');
    userInput.value = '';
    sendToAI(message);
}

// ---------- ОҚИҒА ТЫҢДАУШЫЛАРЫ ----------
sendBtn.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
    }
});

// ---------- БАСТАПҚЫ ЖҮКТЕУ ----------
window.addEventListener('load', async () => {
    console.log('='.repeat(50));
    console.log('✅ Жоба жүктелді!');
    console.log('🔑 API кілті:', GROQ_API_KEY.substring(0, 15) + '...');
    console.log('🤖 Модель:', MODEL_NAME);
    console.log('='.repeat(50));
    
    userInput.focus();
    
    // Қолжетімді модельдерді көрсету
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('📋 ҚОЛЖЕТІМДІ МОДЕЛЬДЕР:');
            data.data.forEach(model => {
                console.log(`   - ${model.id} (${model.owned_by})`);
            });
        }
    } catch (error) {
        console.error('❌ Модельдер тізімін алу мүмкін болмады:', error);
    }
    
    console.log('='.repeat(50));
    console.log('💡 Чат дайын! Сұрағыңызды жазыңыз.');
});

// ---------- ҚОСЫМША: МОДЕЛЬДІ ТЕКСЕРУ ФУНКЦИЯСЫ ----------
// Консольдан шақыруға болады: testModel('llama-3.1-8b-instant')
window.testModel = async function(modelName) {
    console.log(`🔄 ${modelName} моделін тексеру...`);
    
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: 'user', content: 'Сәлем' }],
                max_tokens: 10
            })
        });
        
        if (response.ok) {
            console.log(`✅ ${modelName} - ЖҰМЫС ІСТЕЙДІ!`);
            return true;
        } else {
            const error = await response.text();
            console.log(`❌ ${modelName} - ЖҰМЫС ІСТЕМЕЙДІ:`, error);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${modelName} - ҚАТЕ:`, error);
        return false;
    }
};
