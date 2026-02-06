/* JAVASCRIPT LOGIC */
const paragraphs = [
    "The quick brown fox jumps over the lazy dog. This classic sentence contains every letter of the English alphabet, making it perfect for typing practice and testing fonts.",
    "Programming is the art of telling another human what one wants the computer to do. Clean code always looks like it was written by someone who cares.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. The only way to do great work is to love what you do.",
    "In the world of web development, JavaScript is the engine that drives interactivity. Learning vanilla JS builds a strong foundation for any modern framework.",
    "Technology is best when it brings people together. The advance of technology is based on making it fit in so that you don't even notice it."
];

// Selectors
const display = document.getElementById('text-display');
const timerEl = document.getElementById('timer');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const errorEl = document.getElementById('errors');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const comboEl = document.getElementById('combo');
const progressBar = document.getElementById('progress');

// Hidden input for capturing keystrokes
const input = document.createElement('input');
input.type = 'text';
input.className = 'hidden-input';
document.body.appendChild(input);

// Variables
let timer = 60;
let interval = null;
let isStarting = false;
let charIndex = 0;
let errors = 0;
let totalTyped = 0;
let combo = 0;
let maxCombo = 0;

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

/**
 * Initializes a new test by selecting a random paragraph
 */
function loadParagraph() {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    display.innerHTML = "";
    
    // Wrap each character in a span for individual styling
    paragraphs[randomIndex].split("").forEach(char => {
        let span = document.createElement('span');
        span.classList.add('char');
        span.innerText = char;
        display.appendChild(span);
    });
    
    // Set first character as current
    display.querySelectorAll('.char')[0].classList.add('current');
}

/**
 * Starts the countdown timer
 */
function startTimer() {
    if (timer > 0) {
        timer--;
        timerEl.innerText = timer;
        calculateStats();
    } else {
        endTest();
    }
}

/**
 * Core Typing Logic
 */
function handleTyping(e) {
    const characters = display.querySelectorAll('.char');
    const typedChar = input.value.split("")[charIndex];

    // Start timer on first keystroke
    if (!isStarting) {
        isStarting = true;
        interval = setInterval(startTimer, 1000);
    }

    if (typedChar == null) {
        // Handle Backspace
        if (charIndex > 0) {
            charIndex--;
            if (characters[charIndex].classList.contains('incorrect')) {
                errors--;
            } else {
                combo = 0;
            }
            characters[charIndex].classList.remove('correct', 'incorrect');
        }
    } else {
        // Check if correct
        if (characters[charIndex].innerText === typedChar) {
            characters[charIndex].classList.add('correct');
            playSound(800, 0.05);
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            if (combo % 10 === 0 && combo > 0) showComboEffect();
        } else {
            errors++;
            playSound(200, 0.1);
            combo = 0;
            characters[charIndex].classList.add('incorrect');
        }
        charIndex++;
        totalTyped++;
    }

    // Highlight current character
    characters.forEach(span => span.classList.remove('current'));
    if (charIndex < characters.length) {
        characters[charIndex].classList.add('current');
    } else {
        endTest(); // Finished paragraph early
    }

    progressBar.style.width = `${(charIndex / characters.length) * 100}%`;
    calculateStats();
}

function showComboEffect() {
    const indicator = document.createElement('div');
    indicator.className = 'combo-indicator';
    indicator.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> ${combo} Streak!`;
    display.parentElement.style.position = 'relative';
    display.parentElement.appendChild(indicator);
    playSound(1200, 0.15, 'square');
    setTimeout(() => indicator.remove(), 1000);
}

/**
 * Calculate WPM and Accuracy
 * WPM = (Correct Characters / 5) / (Time Spent in Minutes)
 */
function calculateStats() {
    errorEl.innerText = errors;
    comboEl.innerText = combo;

    let timeSpent = 60 - timer;
    if (timeSpent <= 0) timeSpent = 1; 
    
    let correctChars = charIndex - errors;
    let wpm = Math.round((correctChars / 5) / (timeSpent / 60));
    wpmEl.innerText = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

    // Accuracy
    if (charIndex > 0) {
        let acc = Math.round(((charIndex - errors) / charIndex) * 100);
        accuracyEl.innerText = `${acc}%`;
    }
}

/**
 * Stop the test
 */
function endTest() {
    clearInterval(interval);
    display.classList.remove('active');
    startBtn.disabled = false;
    playSound(600, 0.3, 'triangle');
    showResultModal();
}

/**
 * Reset everything to initial state
 */
function resetTest() {
    clearInterval(interval);
    timer = 60;
    charIndex = 0;
    errors = 0;
    totalTyped = 0;
    isStarting = false;
    combo = 0;
    maxCombo = 0;
    
    input.value = "";
    display.classList.remove('active');
    timerEl.innerText = timer;
    wpmEl.innerText = 0;
    accuracyEl.innerText = "100%";
    errorEl.innerText = 0;
    comboEl.innerText = 0;
    progressBar.style.width = '0%';
    startBtn.disabled = false;
    
    loadParagraph();
}

function showResultModal() {
    document.getElementById('modal-wpm').innerText = wpmEl.innerText + ' WPM';
    document.getElementById('modal-accuracy').innerText = accuracyEl.innerText;
    document.getElementById('modal-streak').innerText = maxCombo;
    document.getElementById('modal-errors').innerText = errors;
    document.getElementById('result-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('result-modal').classList.remove('show');
    resetTest();
}

// Event Listeners
startBtn.addEventListener('click', () => {
    display.classList.add('active');
    input.focus();
    startBtn.disabled = true;
});

restartBtn.addEventListener('click', resetTest);

input.addEventListener('input', handleTyping);

input.addEventListener('copy', e => e.preventDefault());
input.addEventListener('paste', e => e.preventDefault());

// Focus input when clicking on display
display.addEventListener('click', () => {
    if (!startBtn.disabled) return;
    input.focus();
});

// Keep focus on hidden input during test
document.addEventListener('click', (e) => {
    if (isStarting && e.target !== input) {
        input.focus();
    }
});

window.onload = loadParagraph;

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const savedTheme = localStorage.getItem('theme') || 'light';

if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update SVG icon
    const icon = themeIcon;
    if (newTheme === 'dark') {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    } else {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    }
});

// Welcome Screen
const welcomeScreen = document.getElementById('welcome-screen');
const mainApp = document.getElementById('main-app');
const startWelcome = document.getElementById('start-welcome');

startWelcome.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    mainApp.style.display = 'block';
});

// Navigation
document.getElementById('nav-home').addEventListener('click', (e) => {
    e.preventDefault();
    mainApp.style.display = 'none';
    welcomeScreen.style.display = 'flex';
});

document.getElementById('nav-about').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('about-modal').classList.add('show');
});

function closeAboutModal() {
    document.getElementById('about-modal').classList.remove('show');
}
