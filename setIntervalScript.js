const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const notes = [['do4'], ['ré4'], ['mi4'], ['f4'], ['sol4', 'si4']];
const frequencies = {
    'do4': 261.63,
    'ré4': 293.66,
    'mi4': 329.63,
    'fa4': 349.23,
    'sol4': 392.00,
    'si4': 493.88
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
