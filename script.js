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

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('inputs-container');
    notes.forEach((noteSet, i) => {
        const label = document.createElement('label');
        label.for = `time${i}`;
        label.textContent = `Temps pour ${noteSet.map(note => note.toUpperCase()).join(' et ')} : `;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `time${i}`;
        input.placeholder = '500ms';
        container.appendChild(label);
        container.appendChild(input);
        container.appendChild(document.createElement('br'));
    });
});

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

function startGame() {
    const times = notes.map((_, i) => parseInt(document.getElementById(`time${i}`).value, 10));
    let totalTime = 0;

    times.forEach((time, i) => {
        setTimeout(() => {
            playNextNote();
            if (i === notes.length - 1) {
                document.getElementById('message').textContent = "Jeu terminé !";
            }
        }, totalTime);
        totalTime += time;
    });
}
