document.addEventListener('DOMContentLoaded', () => {
    const redScore = document.getElementById('red-score');
    const blueScore = document.getElementById('blue-score');

    const socket = io(); // Initialize Socket.io

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
    });
});
