// ========== TIC TAC TOE GAME ==========
// Game State Variables
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;
let gameMode = null; // 'pvp' or 'ai'
let aiDifficulty = 'hard'; // 'easy', 'moderate', 'hard'
let scores = {
    X: 0,
    O: 0,
    draw: 0
};
let soundEnabled = true;
let isDarkMode = true;

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// ========== DOM ELEMENTS ==========
const modeSelection = document.getElementById('modeSelection');
const playerVsPlayerBtn = document.getElementById('playerVsPlayerBtn');
const playerVsAiBtn = document.getElementById('playerVsAiBtn');
const difficultySelection = document.getElementById('difficultySelection');
const easyBtn = document.getElementById('easyBtn');
const moderateBtn = document.getElementById('moderateBtn');
const hardBtn = document.getElementById('hardBtn');
const backToModeBtn = document.getElementById('backToModeBtn');
const gameInfo = document.getElementById('gameInfo');
const gameBoardElement = document.getElementById('gameBoard');
const gameCells = document.querySelectorAll('.cell');
const currentPlayerDisplay = document.getElementById('currentPlayerDisplay');
const turnIndicator = document.getElementById('turnIndicator');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreDraw = document.getElementById('scoreDraw');
const resetBtn = document.getElementById('resetBtn');
const changeModeBtn = document.getElementById('changeModeBtn');
const gameControls = document.getElementById('gameControls');
const additionalControls = document.getElementById('additionalControls');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const soundBtn = document.getElementById('soundBtn');
const themeBtn = document.getElementById('themeBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const confettiCanvas = document.getElementById('confetti-canvas');

// ========== EVENT LISTENERS ==========
playerVsPlayerBtn.addEventListener('click', () => startGame('pvp'));
playerVsAiBtn.addEventListener('click', showDifficultySelection);
easyBtn.addEventListener('click', () => startGameWithDifficulty('easy'));
moderateBtn.addEventListener('click', () => startGameWithDifficulty('moderate'));
hardBtn.addEventListener('click', () => startGameWithDifficulty('hard'));
backToModeBtn.addEventListener('click', backToModeSelection);
resetBtn.addEventListener('click', resetGame);
changeModeBtn.addEventListener('click', changeMode);
fullscreenBtn.addEventListener('click', toggleFullscreen);
soundBtn.addEventListener('click', toggleSound);
themeBtn.addEventListener('click', toggleTheme);
resetScoreBtn.addEventListener('click', resetScore);

gameCells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// ========== GAME FUNCTIONS ==========

// Show difficulty selection
function showDifficultySelection() {
    modeSelection.style.display = 'none';
    difficultySelection.style.display = 'block';
}

// Back to mode selection
function backToModeSelection() {
    difficultySelection.style.display = 'none';
    modeSelection.style.display = 'block';
}

// Start game with AI difficulty
function startGameWithDifficulty(difficulty) {
    aiDifficulty = difficulty;
    startGame('ai');
}

// Start game with selected mode
function startGame(mode) {
    gameMode = mode;
    gameActive = true;
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    
    // Update UI
    modeSelection.style.display = 'none';
    difficultySelection.style.display = 'none';
    gameInfo.style.display = 'block';
    gameBoardElement.style.display = 'grid';
    gameControls.style.display = 'grid';
    additionalControls.style.display = 'grid';
    
    // Clear board
    gameCells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled', 'winning', 'winner-glow');
    });
    
    updateTurnIndicator();
    playSound('start');
}

// Handle cell click
function handleCellClick(event) {
    const cell = event.target;
    const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
    
    // Check if cell is already taken or game is not active
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }
    
    // Make move
    makeMove(cellIndex, currentPlayer);
    
    // Check game status
    const result = checkGameStatus();
    
    if (result) {
        handleGameEnd(result);
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();
    
    // AI move if in AI mode and it's O's turn
    if (gameMode === 'ai' && currentPlayer === 'O' && gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

// Make a move on the board
function makeMove(index, player) {
    gameBoard[index] = player;
    const cell = gameCells[index];
    
    // Update cell
    if (player === 'X') {
        cell.innerHTML = '<i class="fas fa-times"></i>';
        cell.classList.add('x');
    } else {
        cell.innerHTML = '<i class="fas fa-circle"></i>';
        cell.classList.add('o');
    }
    
    cell.classList.add('disabled');
    playSound('move');
}

// Check game status (win/draw)
function checkGameStatus() {
    // Check for win
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return { type: 'win', player: gameBoard[a], cells: condition };
        }
    }
    
    // Check for draw
    if (!gameBoard.includes('')) {
        return { type: 'draw' };
    }
    
    return null;
}

// Handle game end
function handleGameEnd(result) {
    gameActive = false;
    
    if (result.type === 'win') {
        // Highlight winning cells
        result.cells.forEach(index => {
            gameCells[index].classList.add('winning', 'winner-glow');
        });
        
        // Update score
        scores[result.player]++;
        updateScoreBoard();
        
        // Update turn indicator
        const playerName = (gameMode === 'ai' && result.player === 'O') ? 'AI' : `Player ${result.player}`;
        turnIndicator.textContent = `🎉 ${playerName} Wins!`;
        currentPlayerDisplay.classList.add('winner');
        
        // Trigger celebration
        triggerCelebration();
        playSound('win');
        
        // Show winner message
        setTimeout(() => {
            showNotification(`${playerName} wins the game! 🏆`, 'success');
        }, 500);
    } else if (result.type === 'draw') {
        scores.draw++;
        updateScoreBoard();
        turnIndicator.textContent = "🤝 It's a Draw!";
        currentPlayerDisplay.classList.add('draw');
        playSound('draw');
        showNotification("It's a draw! Well played! 🤝", 'info');
    }
}

// Update turn indicator
function updateTurnIndicator() {
    currentPlayerDisplay.classList.remove('winner', 'draw');
    if (gameMode === 'ai' && currentPlayer === 'O') {
        turnIndicator.textContent = `AI is thinking... (${aiDifficulty})`;
    } else {
        turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

// Update score board
function updateScoreBoard() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;
}

// Reset game (new round)
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    
    gameCells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'disabled', 'winning', 'winner-glow');
    });
    
    updateTurnIndicator();
    playSound('reset');
}

// Change game mode
function changeMode() {
    gameActive = false;
    modeSelection.style.display = 'block';
    difficultySelection.style.display = 'none';
    gameInfo.style.display = 'none';
    gameBoardElement.style.display = 'none';
    gameControls.style.display = 'none';
    additionalControls.style.display = 'none';
    playSound('reset');
}

// Reset all scores
function resetScore() {
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreBoard();
    playSound('reset');
    showNotification('Scores reset!', 'success');
}

// ========== AI LOGIC ==========

// Make AI move (smart AI using minimax algorithm)
function makeAIMove() {
    if (!gameActive) return;
    
    const bestMove = findBestMove();
    
    if (bestMove !== -1) {
        makeMove(bestMove, 'O');
        
        const result = checkGameStatus();
        if (result) {
            handleGameEnd(result);
            return;
        }
        
        currentPlayer = 'X';
        updateTurnIndicator();
    }
}

// Find best move using minimax algorithm
function findBestMove() {
    // Easy mode: Random move with some mistakes
    if (aiDifficulty === 'easy') {
        const emptyIndices = [];
        for (let i = 0; i < 9; i++) {
            if (gameBoard[i] === '') emptyIndices.push(i);
        }
        // 70% chance of random move, 30% chance of smart move
        if (Math.random() < 0.7) {
            return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
    }
    
    // Moderate mode: Mix of random and smart moves
    if (aiDifficulty === 'moderate') {
        // Check if AI can win
        for (let i = 0; i < 9; i++) {
            if (gameBoard[i] === '') {
                gameBoard[i] = 'O';
                const result = checkGameStatus();
                gameBoard[i] = '';
                if (result && result.type === 'win' && result.player === 'O') {
                    return i;
                }
            }
        }
        
        // Check if need to block player
        for (let i = 0; i < 9; i++) {
            if (gameBoard[i] === '') {
                gameBoard[i] = 'X';
                const result = checkGameStatus();
                gameBoard[i] = '';
                if (result && result.type === 'win' && result.player === 'X') {
                    return i;
                }
            }
        }
        
        // 50% chance to make a random move, 50% use minimax
        if (Math.random() < 0.5) {
            const emptyIndices = [];
            for (let i = 0; i < 9; i++) {
                if (gameBoard[i] === '') emptyIndices.push(i);
            }
            return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
    }
    
    // Hard mode: Always use minimax algorithm (optimal play)
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            let score = minimax(gameBoard, 0, false);
            gameBoard[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    const result = checkGameStatus();
    
    if (result) {
        if (result.type === 'win') {
            return result.player === 'O' ? 10 - depth : depth - 10;
        } else {
            return 0;
        }
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// ========== UTILITY FUNCTIONS ==========

// Play sound effects
function playSound(type) {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
        case 'start':
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'move':
            oscillator.frequency.value = 600;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'win':
            // Play winning melody
            const notes = [523, 659, 784, 1047];
            notes.forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
                osc.start(audioContext.currentTime + i * 0.1);
                osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
            });
            break;
        case 'draw':
            oscillator.frequency.value = 400;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'reset':
            oscillator.frequency.value = 500;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
            break;
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
        fullscreenBtn.querySelector('i').className = 'fas fa-compress';
        fullscreenBtn.querySelector('span').textContent = 'Exit Full';
    } else {
        document.exitFullscreen();
        fullscreenBtn.querySelector('i').className = 'fas fa-expand';
        fullscreenBtn.querySelector('span').textContent = 'Fullscreen';
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundBtn.classList.toggle('muted');
    
    if (soundEnabled) {
        soundBtn.querySelector('i').className = 'fas fa-volume-up';
        soundBtn.querySelector('span').textContent = 'Sound On';
        playSound('move');
    } else {
        soundBtn.querySelector('i').className = 'fas fa-volume-mute';
        soundBtn.querySelector('span').textContent = 'Sound Off';
    }
}

// Toggle theme (light/dark mode)
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode');
    themeBtn.classList.toggle('light-mode');
    
    if (isDarkMode) {
        themeBtn.querySelector('i').className = 'fas fa-moon';
        themeBtn.querySelector('span').textContent = 'Dark Mode';
    } else {
        themeBtn.querySelector('i').className = 'fas fa-sun';
        themeBtn.querySelector('span').textContent = 'Light Mode';
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' 
        ? 'linear-gradient(135deg, #10b981, #059669)' 
        : type === 'info'
        ? 'linear-gradient(135deg, #5b8def, #4f46e5)'
        : 'linear-gradient(135deg, #ef4444, #dc2626)';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.4s ease;
        font-size: 0.95rem;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ========== CELEBRATION CONFETTI ==========
function triggerCelebration() {
    const canvas = confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiPieces = [];
    const confettiCount = 150;
    const colors = ['#ff6b35', '#5b8def', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];
    
    // Create confetti pieces
    for (let i = 0; i < confettiCount; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotationSpeed: Math.random() * 5 - 2.5
        });
    }
    
    let animationId;
    let frameCount = 0;
    const maxFrames = 200;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confettiPieces.forEach(piece => {
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate((piece.rotation * Math.PI) / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
            ctx.restore();
            
            piece.y += piece.speedY;
            piece.x += piece.speedX;
            piece.rotation += piece.rotationSpeed;
            piece.speedY += 0.1; // Gravity
        });
        
        frameCount++;
        if (frameCount < maxFrames) {
            animationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    // R key: Reset game
    if (e.code === 'KeyR' && gameActive) {
        resetGame();
    }
    
    // ESC key: Change mode
    if (e.code === 'Escape' && gameActive) {
        changeMode();
    }
    
    // Number keys 1-9: Make move
    if (e.code.startsWith('Digit') && gameActive && currentPlayer === 'X') {
        const num = parseInt(e.code.replace('Digit', ''));
        if (num >= 1 && num <= 9) {
            const index = num - 1;
            if (gameBoard[index] === '') {
                gameCells[index].click();
            }
        }
    }
});

// ========== WELCOME MESSAGE ==========
window.addEventListener('DOMContentLoaded', () => {
    console.log('%c🎮 Tic Tac Toe Game Loaded!', 'color: #5b8def; font-size: 20px; font-weight: bold;');
    console.log('%c⌨️ Keyboard Shortcuts:', 'color: #10b981; font-size: 14px; font-weight: bold;');
    console.log('%c  R - Reset Game', 'color: #ef4444; font-size: 12px;');
    console.log('%c  ESC - Change Mode', 'color: #f59e0b; font-size: 12px;');
    console.log('%c  1-9 - Place mark in cell', 'color: #10b981; font-size: 12px;');
    console.log('%c🤖 AI Difficulty Levels:', 'color: #a855f7; font-size: 14px; font-weight: bold;');
    console.log('%c  Easy - Makes mistakes frequently', 'color: #10b981; font-size: 12px;');
    console.log('%c  Moderate - Balanced gameplay', 'color: #f59e0b; font-size: 12px;');
    console.log('%c  Hard - Unbeatable AI', 'color: #ef4444; font-size: 12px;');
});
