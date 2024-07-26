const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const sheets = [
    {
        notes: [['c4'], ['d4'], ['e4'], ['f4'], ['g4', 'b4']],
        durations: [500, 500, 500, 500, 1000],
        image: '1.png'
    },
    {
        notes: [['e4'], ['f4'], ['g4'], ['a4'], ['b4', 'c5']],
        durations: [500, 500, 500, 500, 1000],
        image: '2.png'
    }
];

const frequencies = {
    'c4': 261.63,
    'd4': 293.66,
    'e4': 329.63,
    'f4': 349.23,
    'g4': 392.00,
    'a4': 440.00,
    'b4': 493.88,
    'c5': 523.25
};
let currentSheetIndex = 0;
let index = 0;
let intervalId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSheet(currentSheetIndex);
});

function loadSheet(sheetIndex) {
    const container = document.getElementById('inputs-container');
    container.innerHTML = ''; // Clear existing inputs
    const sheet = sheets[sheetIndex];
    const notes = sheet.notes;
    document.getElementById('sheet-music').src = sheet.image;

    const mode = document.getElementById('mode').value;

    if (mode === 'setTimeout') {
        notes.forEach((noteSet, i) => {
            const div = document.createElement('div');
            div.style.marginLeft = `${i * 5}px`; // indentation

            const label = document.createElement('label');
            label.for = `time${i}`;
            label.textContent = `${i > 0 ? '→ ' : ''}${i + 1}. setTimeout(, play(${noteSet.map(note => note.charAt(0).toUpperCase() + note.slice(1)).join(', ')}, `;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `time${i}`;
            input.placeholder = '500ms';

            const end = document.createElement('span');
            end.textContent = `, ${sheet.durations[i]}ms);`;

            const result = document.createElement('span');
            result.id = `result${i}`;
            result.style.marginLeft = '10px';

            div.appendChild(label);
            div.appendChild(input);
            div.appendChild(end);
            div.appendChild(result);
            container.appendChild(div);
        });
    } else if (mode === 'setInterval') {
        const div = document.createElement('div');
        const label = document.createElement('label');
        label.for = `intervalTime`;
        label.textContent = `setInterval(${notes.map(noteSet => noteSet.map(note => note.charAt(0).toUpperCase() + note.slice(1)).join(', ')).join(' → ')}, `;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `intervalTime`;
        input.placeholder = '500ms';

        const end = document.createElement('span');
        end.textContent = ');';

        const results = document.createElement('div');
        results.id = `intervalResults`;
        results.style.marginLeft = '10px';

        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(end);
        div.appendChild(results);
        container.appendChild(div);
    }
}

function playNextNote() {
    console.log("play");
    const notes = sheets[currentSheetIndex].notes;
    if (index < notes.length) {
        const noteSet = notes[index];
        noteSet.forEach(note => {
            const frequency = frequencies[note];
            playTone(frequency);
        });
        index++;
    } else {
        clearInterval(intervalId);
        document.getElementById('message').textContent = "Bravo !";
    }
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
    const mode = document.getElementById('mode').value;
    index = 0; // Reset index to ensure proper playback
    if (mode === 'setTimeout') {
        startTimeoutGame();
    } else if (mode === 'setInterval') {
        startIntervalGame();
    }
}

function startTimeoutGame() {
    console.log('start');
    const notes = sheets[currentSheetIndex].notes;
    const durations = sheets[currentSheetIndex].durations;
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
            const result = document.getElementById(`result${i}`);
            if (time === durations[i]) {
                result.textContent = '●';
                result.style.color = 'green';
            } else {
                result.textContent = '●';
                result.style.color = 'red';
            }
            if (i === notes.length - 1) {
                document.getElementById('message').textContent = "Jeu terminé !";
            }
        }, totalTime);
        totalTime += time;
    });
}

function startIntervalGame() {
    const intervalTime = document.getElementById('intervalTime').value;
    const sheet = sheets[currentSheetIndex];
    const durations = sheet.durations;

    if (intervalTime === "") {
        document.getElementById('message').textContent = "Erreur : Veuillez remplir le champ.";
        return;
    }

    document.getElementById('message').textContent = ""; // Clear any previous message
    const time = parseInt(intervalTime, 10);
    const results = document.getElementById('intervalResults');
    results.innerHTML = ''; // Clear previous results

    index = 0;
    if (intervalId) {
        clearInterval(intervalId);
    }

    intervalId = setInterval(() => {
        playNextNote();
        const result = document.createElement('span');
        result.textContent = '●';
        if (time === durations[index - 1]) {
            result.style.color = 'green';
        } else {
            result.style.color = 'red';
        }
        results.appendChild(result);

        if (index >= sheet.notes.length) {
            clearInterval(intervalId);
            document.getElementById('message').textContent = "Jeu terminé !";
        }
    }, time);
}

function prevSheet() {
    if (currentSheetIndex > 0) {
        currentSheetIndex--;
        loadSheet(currentSheetIndex);
    }
}

function nextSheet() {
    if (currentSheetIndex < sheets.length - 1) {
        currentSheetIndex++;
        loadSheet(currentSheetIndex);
    }
}
