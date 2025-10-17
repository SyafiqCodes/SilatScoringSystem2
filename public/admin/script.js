document.addEventListener('DOMContentLoaded', () => {
    const redButtons = document.querySelectorAll('.btn-red');
    const blueButtons = document.querySelectorAll('.btn-blue');
    const redScore = document.getElementById('red-score');
    const blueScore = document.getElementById('blue-score');
    const redHistory = document.getElementById('red-history');
    const blueHistory = document.getElementById('blue-history');
    const resetButton = document.getElementById('reset');
    let redScoreHistory = [];
    let blueScoreHistory = [];

    const socket = io(); // Initialize Socket.io

    const handleInput = (corner, value) => {
        if (value === 'backspace') {
            socket.emit('adminBackspace', { corner: corner });
            if (corner === 'red') {
                redScoreHistory.pop();
                updateHistory(redHistory, redScoreHistory);
            } else if (corner === 'blue') {
                blueScoreHistory.pop();
                updateHistory(blueHistory, blueScoreHistory);
            }
        } else {
            if (corner === 'red') {
                redScoreHistory.push(parseInt(value));
                if (redScoreHistory.length > 10) {
                    redScoreHistory = [parseInt(value)];
                }
                updateHistory(redHistory, redScoreHistory);
            } else if (corner === 'blue') {
                blueScoreHistory.push(parseInt(value));
                if (blueScoreHistory.length > 10) {
                    blueScoreHistory = [parseInt(value)];
                }
                updateHistory(blueHistory, blueScoreHistory);
            }
            socket.emit('adminScore', { corner: corner, value: parseInt(value) });
        }
    };

    redButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            handleInput('red', value);
        });
    });

    blueButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            handleInput('blue', value);
        });
    });

    socket.on('updateScore', data => {
        if (data.corner === 'red') {
            redScore.textContent = data.value;
        } else if (data.corner === 'blue') {
            blueScore.textContent = data.value;
        }
    });

    resetButton.addEventListener('click', () => {
        redScore.textContent = 0;
        blueScore.textContent = 0;
        redScoreHistory = [];
        blueScoreHistory = [];
        updateHistory(redHistory, redScoreHistory);
        updateHistory(blueHistory, blueScoreHistory);
        socket.emit('reset');
    });

    socket.on('reset', () => {
        redScore.textContent = 0;
        blueScore.textContent = 0;
        redScoreHistory = [];
        blueScoreHistory = [];
        updateHistory(redHistory, redScoreHistory);
        updateHistory(blueHistory, blueScoreHistory);
    });

    function updateHistory(element, history) {
        element.textContent = history.join(' ');
    }
});
