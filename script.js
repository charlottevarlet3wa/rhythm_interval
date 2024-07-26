const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const notes = [['do4'], ['ré4'], ['mi4'], ['fa4'], ['sol4', 'si4']];
const frequencies = {
    'do4': 261.63,
    'ré4': 293.66,
    'mi4': 329.63,
    'fa4': 349.23,
    'sol4': 392.00,
    'si4': 493.88
};
let index = 0;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('inputs-container');
    notes.forEach((noteSet, i) => {
        console.log(notes);
        const div = document.createElement('div');
        div.style.marginLeft = `${i * 5}px`; // indentation

        const label = document.createElement('label');
        label.for = `time${i}`;
        label.textContent = `${i>0 ? '→ ' : ''}${i + 1}. setTimeout(, play(${noteSet.map(note => note.charAt(0).toUpperCase() + note.slice(1)).join(', ')}, `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `time${i}`;
        input.placeholder = '500ms';
        
        const end = document.createElement('span');
        end.textContent = ');';
        
        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(end);
        container.appendChild(div);
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
    const times = notes.map((_, i) => document.getElementById(`time${i}`).value);
    const isValid = times.every(time => time !== "");

    if (!isValid) {
        document.getElementById('message').textContent = "Erreur : Veuillez remplir tous les champs.";
        return;
    }

    document.getElementById('message').textContent = ""; // Clear any previous message
    let totalTime = 0;

    times.map(time => parseInt(time, 10)).forEach((time, i) => {
        setTimeout(() => {
            playNextNote();
            if (i === notes.length - 1) {
                document.getElementById('message').textContent = "Bravo !";
            }
        }, totalTime);
        totalTime += time;
    });
}

