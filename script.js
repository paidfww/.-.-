/**
 * script.js
 * Функционал: Тақырып ауыстыру, Анимациялар (Intersection Observer),
 * Groq API арқылы чат және Сұраныс санауышы.
 */

// --------------------------------------------------------------
// 1. Айнымалылар мен DOM элементтеріне сілтемелер
// --------------------------------------------------------------

// Тақырып ауыстыру үшін
const themeToggleBtn = document.getElementById('theme-toggle');
const bodyElement = document.body;

// Карточкалар анимациясы үшін (Intersection Observer)
const cards = document.querySelectorAll('.card');

// Чат элементтері
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading-indicator');

// Санауыш элементі
const counterSpan = document.getElementById('request-counter');

// API параметрлері (Groq)
// !!! НАЗАР АУДАРЫҢЫЗ: Мұнда өзіңіздің Groq API кілтіңізді жазыңыз !!!
const GROQ_API_KEY = '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'; // <- ӨЗГЕРТІҢІЗ
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Модель ретінде Llama 3 70B пайдаланамыз (тегін және өте қуатты)
const MODEL_NAME = 'llama3-70b-8192'; 

// Сұраныс санауышының мәні
let requestCount = 0;

// --------------------------------------------------------------
// 2. Қараңғы тақырыпты ауыстыру функциясы
// --------------------------------------------------------------
/**
 * Тақырыпты ашық/қараңғы арасында ауыстырады.
 * Батырма мәтінін де өзгертеді.
 */
function toggleTheme() {
    bodyElement.classList.toggle('dark-theme');
    
    // Батырма мәтінін жаңарту
    if (bodyElement.classList.contains('dark-theme')) {
        themeToggleBtn.innerHTML = '☀️ Ашық тақырып';
        localStorage.setItem('theme', 'dark'); // Қалауын сақтау
    } else {
        themeToggleBtn.innerHTML = '🌙 Қараңғы тақырып';
        localStorage.setItem('theme', 'light');
    }
}

// Пайдаланушының бұрынғы таңдауын тексеру
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    bodyElement.classList.add('dark-theme');
    themeToggleBtn.innerHTML = '☀️ Ашық тақырып';
}

// Батырмаға тыңдаушы қосу
themeToggleBtn.addEventListener('click', toggleTheme);

// --------------------------------------------------------------
// 3. Карточкалар анимациясы (Intersection Observer API)
// --------------------------------------------------------------
/**
 * Карточкалар экранға көрінген кезде оларға 'visible' классын қосады.
 * Бұл CSS арқылы плавный fade-in/up анимациясын іске қосады.
 */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Егер элемент көрінсе
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Көрінгеннен кейін бақылауды тоқтату (өнімділік үшін)
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1, // 10% көрінсе жеткілікті
    rootMargin: '0px 0px -50px 0px' // Аздап экранға жақындағанда іске қосылады
});

// Барлық карточкаларды бақылауға алу
cards.forEach(card => {
    observer.observe(card);
});

// --------------------------------------------------------------
// 4. Санауышты жаңарту функциясы
// --------------------------------------------------------------
/**
 * Сұраныс санын 1-ге арттырып, интерфейстегі мәтінді жаңартады.
 */
function incrementRequestCounter() {
    requestCount++;
    counterSpan.textContent = `Жіберілген сұраныс: ${requestCount}`;
}

// --------------------------------------------------------------
// 5. Чатқа хабарлама қосу функциясы
// --------------------------------------------------------------
/**
 * Чат тарихы DIV-іне жаңа хабарлама қосады.
 * @param {string} text - Хабарлама мәтіні.
 * @param {string} sender - 'user' немесе 'bot'.
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
    
    // Автоматты түрде төменге жылжыту
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// --------------------------------------------------------------
// 6. Groq API-ге сұраныс жіберу функциясы
// --------------------------------------------------------------
/**
 * Пайдаланушы енгізген мәтінді алып, Groq API-ге жібереді.
 * Жауапты күтіп, нәтижені чатқа шығарады.
 * @param {string} userMessage - Пайдаланушының сұрағы.
 */
async function sendMessageToAI(userMessage) {
    // Егер API кілті енгізілмесе, ескерту
    if (GROQ_API_KEY === 'gsk_ВАШ_КЛЮЧ_ЗДЕСЬ') {
        appendMessage("❌ Қате: API кілті табылмады. script.js файлындағы GROQ_API_KEY мәнін жаңартыңыз.", 'bot');
        return;
    }

    // Жүктеу индикаторын көрсету
    loadingIndicator.style.display = 'flex';
    sendBtn.disabled = true;
    userInput.disabled = true;

    try {
        // API-ге сұраныс дайындау
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
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        // Жауапты тексеру
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP қатесі: ${response.status}`);
        }

        const data = await response.json();
        
        // ЖИ жауабын алу
        const botReply = data.choices[0].message.content;
        
        // Жауапты чатқа шығару
        appendMessage(botReply, 'bot');
        
        // Санауышты арттыру (сәтті сұраныс болғанда ғана)
        incrementRequestCounter();

    } catch (error) {
        console.error('API қатесі:', error);
        appendMessage(`⚠️ Қате орын алды: ${error.message}. API кілтіңізді және интернет байланысын тексеріңіз.`, 'bot');
    } finally {
        // Жүктеу индикаторын жасыру және форманы қалпына келтіру
        loadingIndicator.style.display = 'none';
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// --------------------------------------------------------------
// 7. Хабарламаны жіберу логикасы (Оқиға өңдеуші)
// --------------------------------------------------------------
/**
 * Пайдаланушы сұрағын өңдеп, ЖИ-ге жібереді.
 */
function handleSendMessage() {
    const message = userInput.value.trim();
    
    // Бос хабарламаны жібермеу
    if (message === '') return;
    
    // Пайдаланушы хабарламасын чатқа қосу
    appendMessage(message, 'user');
    
    // Енгізу өрісін тазалау
    userInput.value = '';
    
    // ЖИ-ге сұраныс жіберу
    sendMessageToAI(message);
}

// Батырманы басқанда жіберу
sendBtn.addEventListener('click', handleSendMessage);

// Enter пернесін басқанда жіберу (Shift+Enter емес)
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Жаңа жол қосуды болдырмау
        handleSendMessage();
    }
});

// Бет жүктелген кезде фокус енгізу өрісінде болсын
window.addEventListener('load', () => {
    userInput.focus();
    
    // Егер API кілті өзгертілмесе, ескерту
    if (GROQ_API_KEY === 'gsk_ВАШ_КЛЮЧ_ЗДЕСЬ') {
        console.warn('Ескерту: Groq API кілті енгізілмеген!');
    }
});
