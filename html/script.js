document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    const countdownElement = document.getElementById('countdown');
    const gameContainer = document.getElementById('gameContainer');
    const progressBar = document.getElementById('progressBar');

    const playerGrid = document.getElementById('playerGrid');
    const computerGrid = document.getElementById('computerGrid');
    const playerCells = Array.from(playerGrid.getElementsByClassName('cell'));
    const computerCells = Array.from(computerGrid.getElementsByClassName('cell'));

    let sequence = [];
    let playerSequence = [];
    let level = 0;
    let timerInterval;
    let timeLeft = 100;
    let playerTurn = false;

    function resetGame() {
        sequence = [];
        playerSequence = [];
        level = 0;
        clearInterval(timerInterval);
        timeLeft = 100;
        playerTurn = false;
        progressBar.style.width = timeLeft + '%';
    }

    function flashCell(cell) {
        return new Promise(resolve => {
            cell.classList.add('active');
            setTimeout(() => {
                cell.classList.remove('active');
                resolve();
            }, 500);
        });
    }

    async function playSequence() {
        for (const index of sequence) {
            await flashCell(computerCells[index]);
            await new Promise(r => setTimeout(r, 200));
        }
        playerTurn = true;
        resetTimer();
    }

    function nextLevel() {
        level++;
        sequence.push(Math.floor(Math.random() * 9));
        playerSequence = [];
        playerTurn = false;
        playSequence();
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timeLeft = 100;
        progressBar.style.width = timeLeft + '%';
        timerInterval = setInterval(() => {
            if (playerTurn) {
                timeLeft--;
                progressBar.style.width = timeLeft + '%';
                if (timeLeft === 0) {
                    clearInterval(timerInterval);
                    endGame(false);
                }
            }
        }, 100);
    }

    playerCells.forEach((cell, index) => {
        cell.addEventListener('click', () => {
            if (playerTurn && playerSequence.length < sequence.length) {
                playerSequence.push(index);
                flashCell(cell);
                if (playerSequence.length === sequence.length) {
                    playerTurn = false;
                    if (JSON.stringify(playerSequence) === JSON.stringify(sequence)) {
                        if (level === 4) {
                            endGame(true);
                        } else {
                            nextLevel();
                        }
                    } else {
                        endGame(false);
                    }
                }
            }
        });
    });

    function endGame(result) {
        fetch(`https://ms_minigame/minigameResult`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({ success: result }),
        }).then(() => {
            document.body.style.cursor = 'auto';
            gameContainer.classList.add('containerHidden');
            resetGame();
        });
    }

    function startGame() {
        resetGame();
        gameContainer.classList.remove('containerHidden');
        loadingScreen.style.display = 'flex';
        countdownElement.textContent = 5;
        let countdown = 5;
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown === 0) {
                clearInterval(countdownInterval);
                loadingScreen.style.display = 'none';
                nextLevel();
            }
        }, 1000);
    }

    window.addEventListener('message', (event) => {
        if (event.data.action === 'startMinigame') {
            startGame();
        }
    });
});
