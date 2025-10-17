document.addEventListener('DOMContentLoaded', () => {
    const redButtons = document.querySelectorAll('.btn-red');
    const blueButtons = document.querySelectorAll('.btn-blue');
    const redScore = document.getElementById('red-score');
    const blueScore = document.getElementById('blue-score');
    const redHistory = document.getElementById('red-history');
    const blueHistory = document.getElementById('blue-history');
    let redScoreHistory = [];
    let blueScoreHistory = [];

    const socket = io(); // Initialize Socket.io

    const handleInput = (corner, value) => {
        if (corner === 'red') {
            redScoreHistory.push(parseInt(value));
            if (redScoreHistory.length > 10) {
                redScoreHistory = [parseInt(value)];
            }
            updateHistory(redHistory, redScoreHistory);
            flashInput(redHistory); // Flash effect for red history input box
        } else if (corner === 'blue') {
            blueScoreHistory.push(parseInt(value));
            if (blueScoreHistory.length > 10) {
                blueScoreHistory = [parseInt(value)];
            }
            updateHistory(blueHistory, blueScoreHistory);
            flashInput(blueHistory); // Flash effect for blue history input box
        }
        socket.emit('score', { corner: corner, value: parseInt(value) });
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

    socket.on('reset', () => {
        redScore.textContent = 0;
        blueScore.textContent = 0;
        redScoreHistory = [];
        blueScoreHistory = [];
        updateHistory(redHistory, redScoreHistory);
        updateHistory(blueHistory, blueScoreHistory);
    });

    function updateHistory(element, history) {
        element.value = history.join(' ');
    }

    function flashInput(element) {
        element.classList.add('input-flash'); // Add flash class to change color
        setTimeout(() => {
            element.classList.remove('input-flash'); // Remove flash class after 150ms
        }, 150);
    }
});
