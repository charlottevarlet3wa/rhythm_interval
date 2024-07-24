const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const notes = [['c4'], ['d4'], ['e4'], ['f4'], ['g4', 'b4']];
const frequencies = {
    'c4': 261.63,
    'd4': 293.66,
    'e4': 329.63,
    'f4': 349.23,
    'g4': 392.00,
    'b4': 493.88
};
let index = 0;
let intervalId;

function playNextNote() {
    const noteSet = notes[index];
    noteSet.forEach(note => {
        const frequency = frequencies[note];
        playTone(frequency);
    });
    index = (index + 1) % notes.length;
}

function playTone(frequency) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const duration = 0.5;
    oscillator.start();
    
    // Faire un fade out à la fin
    gainNode.gain.setValueAtTime(1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.stop(audioContext.currentTime + duration);
}

function startInterval() {
    const intervalTime = parseInt(document.getElementById('intervalTime').value, 10);
    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
        playNextNote();
    }, intervalTime);
}

function stopInterval() {
    if (intervalId) {
        clearInterval(intervalId);
        document.getElementById('message').textContent = "Jeu arrêté.";
    }
}
