const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const bravoElem = document.getElementById('bravo');
let bpm = 60;

// Test

// Durations : 
/*
0 : double croche
1 : croche
2 : noire
3 : croche pointée
*/

const sheets = [
    {
        name: 'Jurassic Park',
        notes: [
            ['c5'], ['b4'], ['c5'], ['g4'], ['f4'], 
            ['c5'], ['b4'], ['c5'], ['g4'], ['f4']
        ],
        notesDisplay: [
            ['do'], ['si'], ['do'], ['sol'], ['fa'], 
            ['do'], ['si'], ['do'], ['sol'], ['fa']
        ],
        durations: [
            1, 1, 2, 2, 2,
            1, 1, 2, 2, 2
        ],
        image: 'images/r_park.jpg'
    },
    {
        name: 'Dark Vador',
        notes: [['d4'], ['d4'], ['d4'], 
        ['a3'], ['f4'], ['d4'],
        ['a3'], ['f4'], ['d4']],
        notesDisplay: [['ré'], ['ré'], ['ré'], 
        ['la'], ['fa'], ['ré'],
        ['la'], ['fa'], ['ré']],
        durations: [
            2, 2, 2,
            3, 0, 2,
            3, 0, 2
        ],
        image: 'images/r_vador.jpg'
    }, 
    {
        name: 'Pirates des Caraïbes',
        notes: [['a3'], ['c4'], ['d4'], ['d4'], 
        ['d4'], ['e4'], ['f4'], ['f4'], 
        ['f4'], ['g4'], ['e4'], ['e4'], 
        ['d4'], ['c4'], ['c4'], ['d4'], ],
        notesDisplay : [['la'], ['do'], ['ré'], ['ré'], 
        ['ré'], ['mi'], ['fa'], ['fa'], 
        ['fa'], ['sol'], ['mi'], ['mi'], 
        ['ré'], ['do'], ['do'], ['ré'], ],
        durations: [
            1, 1, 2, 2,
            1, 1, 2, 2,
            1, 1, 2, 2,
            1, 1, 1, 2
        ],
        image: 'images/r_pirates.jpg'
    }

];

const frequencies = {
    'a3': 220.00,
    'b3': 246.94,
    'c4': 261.63,
    'd4': 293.66,
    'e4': 329.63,
    'f4': 349.23,
    'g4': 392.00,
    'a4': 440.00,
    'b4': 493.88,
    'c5': 523.25
};

const durationsMap = new Map([
    [0, 125],
    [1, 250],
    [2, 500],
    [3, 375]
])

const durationsCorrection = [];



let currentSheetIndex = 0;
let index = 0;
let intervalId = null;

const inputs = [];

// document.addEventListener('DOMContentLoaded', () => {
//     loadSheet(currentSheetIndex);
// });

const errorElem = document.getElementById('message');
const noireElem = document.getElementById('noire');
const crocheElem = document.getElementById('croche');
const crochePointeeElem = document.getElementById('croche-pointee');
const doubleCrocheElem = document.getElementById('double-croche');

function displayError(msg) {
    errorElem.textContent = msg;
}

function calculateDurations() {
    const bpm = document.getElementById('bpm-input').value;
    if (bpm <= 0 || isNaN(bpm)) {
        displayError("Veuillez entrer un BPM valide (supérieur à 0).");
        return;
    }

    // Calculer la durée d'une noire en ms
    const noireDuration = 60000 / bpm;

    // Calculer la durée d'une croche en ms (la moitié de la noire)
    const crocheDuration = noireDuration / 2;
    const doubleCrocheDuration = noireDuration / 4;
    const crochePointeeDuration = doubleCrocheDuration * 3;

    // Afficher les résultats
    noireElem.textContent = Math.round(noireDuration);
    crocheElem.textContent = Math.round(crocheDuration);
    crochePointeeElem.textContent = Math.round(crochePointeeDuration);
    doubleCrocheElem.textContent = Math.round(doubleCrocheDuration);

    durationsMap.set(2, noireDuration);
    durationsMap.set(1, crocheDuration);
    durationsMap.set(3, crochePointeeDuration);
    durationsMap.set(0, doubleCrocheDuration);

    // Update correction
    durationsCorrection.length = 0;
    sheets[currentSheetIndex].durations.map(duration => durationsCorrection.push(durationsMap.get(duration)));
}

document.getElementById('bpm-btn').addEventListener('click', calculateDurations);

document.addEventListener('DOMContentLoaded', () => {
    loadSheet(currentSheetIndex);
    calculateDurations();
});




function playNextNote() {
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
    // const mode = document.getElementById('mode').value;
    index = 0; // Reset index to ensure proper playback
    // if (mode === 'setTimeout') {
        startTimeoutGame();
    // } else if (mode === 'setInterval') {
        // startIntervalGame();
    // }
}

function startTimeoutGame() {
    const notes = sheets[currentSheetIndex].notes;
    // const durations = sheets[currentSheetIndex].durations;
    const times = notes.map((_, i) => document.getElementById(`time${i}`).value);
    const isValid = times.every(time => time !== "");

    if (!isValid) {
        displayError("Erreur : Veuillez remplir tous les champs.");
        return;
    }

    displayError(""); // Clear any previous message
    let totalTime = 0;

    times.map(time => parseInt(time, 10)).forEach((time, i) => {
        setTimeout(() => {
            playNextNote();
            const result = document.getElementById(`result${i}`);
            console.log(result)
            if (time === durationsCorrection[i]) {
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

    bravoElem.textContent = "Vous avez joué " + sheets[currentSheetIndex].name + " !";
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


function generateSetTimeoutCode() {
    const sheet = sheets[currentSheetIndex];
    const notes = sheet.notes;
    const durations = sheet.durations;
    let code = '';

    function createTimeoutBlock(level) {
        if (level < notes.length) {
            const noteSet = notes[level].map(note => `'${note.charAt(0).toUpperCase() + note.slice(1)}'`).join(', ');
            code += `${' '.repeat(level * 2)}setTimeout(() => {\n${' '.repeat((level + 1) * 2)}play(${noteSet});\n`;
            createTimeoutBlock(level + 1);
            code += `${' '.repeat(level * 2)}}, ${durations[level]});\n`;
        }
    }

    createTimeoutBlock(0);
    return code;
}




function loadSheet(sheetIndex) {
    const container = document.getElementById('inputs-container');
    container.innerHTML = ''; // Clear existing inputs
    const sheet = sheets[sheetIndex];
    const notes = sheet.notesDisplay;
    const durations = sheet.durations;

    calculateDurations();
    durationsCorrection.length = 0;
    // durations.map(duration => durationsCorrection.push(durationsMap[duration]));
    durations.map(duration => {
        durationsCorrection.push(durationsMap.get(duration))
    });

    document.getElementById('sheet-music').src = sheet.image;

    // const mode = document.getElementById('mode').value;

    // if (mode === 'setTimeout') {
        let indentLevel = 0;
        notes.forEach((noteSet, i) => {
            const div = document.createElement('div');
            div.style.marginLeft = `${indentLevel * 20}px`; // indentation

            
            const label = document.createElement('span');
            label.textContent = `setTimeout(() => {`;

            const func = document.createElement('p');
            func.style.marginLeft = `20px`;
            func.textContent = `play([`;
            
            const note = document.createElement('strong');
            // end.textContent = ` }, ${durations[i]});`;
            note.textContent = `'${noteSet.join("', '")}'`

            const end = document.createElement('span');
            // end.textContent = ` }, ${durations[i]});`;
            end.textContent = `]);`;

            div.appendChild(label);
            func.appendChild(note);
            func.appendChild(end);
            div.appendChild(func)
            container.appendChild(div);

            indentLevel++;
        });

        indentLevel--;

        notes.forEach((noteSet, i) => {

            const div = document.createElement('div');
            div.style.marginLeft = `${indentLevel * 20}px`; // indentation

            const label = document.createElement('label');
            // label.for = `time${i}`;
            label.for = `time${notes.length - 1 - i}`;
            label.textContent = `}, `;

            //   TODO : check if chord
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `time${notes.length - 1 - i}`;
            // input.value = durationsCorrection[notes.length - 1 - i];
            // input.value = durationsCorrection.get(durations[i]);
            input.style.width = '50px';
            
            const end = document.createElement('span')
            end.textContent = `);`;
            
            const result = document.createElement('span');
            result.id = `result${notes.length - 1 - i}`
            result.textContent = '';

            end.appendChild(result);
            div.appendChild(label);
            div.appendChild(input);
            div.appendChild(end);
            container.appendChild(div);

            indentLevel--;
        });
    // } else if (mode === 'setInterval') {
    //     const div = document.createElement('div');
    //     const label = document.createElement('label');
    //     label.for = `intervalTime`;
    //     label.textContent = `setInterval(${notes.map(noteSet => noteSet.map(note => note.charAt(0).toUpperCase() + note.slice(1)).join(', ')).join(' → ')}, `;

    //     const input = document.createElement('input');
    //     input.type = 'text';
    //     input.id = `intervalTime`;
    //     input.placeholder = '500ms';

    //     const end = document.createElement('span');
    //     end.textContent = ');';

    //     const results = document.createElement('div');
    //     results.id = `intervalResults`;
    //     results.style.marginLeft = '10px';

    //     div.appendChild(label);
    //     div.appendChild(input);
    //     div.appendChild(end);
    //     div.appendChild(results);
    //     container.appendChild(div);
    // }
}


// function loadSheet(sheetIndex) {
//     const container = document.getElementById('inputs-container');
//     container.innerHTML = ''; // Clear existing inputs
//     const sheet = sheets[sheetIndex];
//     const notes = sheet.notes;
//     const durations = sheet.durations;
//     document.getElementById('sheet-music').src = sheet.image;

//     const mode = document.getElementById('mode').value;

//     if (mode === 'setTimeout') {
//         let indentLevel = 0;
//         notes.forEach((noteSet, i) => {
//             const div = document.createElement('div');
//             div.style.marginLeft = `${indentLevel * 20}px`; // indentation

//             const label = document.createElement('label');
//             label.for = `time${i}`;
//             label.textContent = `${'→ '.repeat(indentLevel)}setTimeout(() => { play(${noteSet.map(note => `'${note.charAt(0).toUpperCase() + note.slice(1)}'`).join(', ')}); `;

//             const input = document.createElement('input');
//             input.type = 'text';
//             input.id = `time${i}`;
//             input.value = durations[i];
//             input.style.width = '50px';
            
//             const end = document.createElement('span');
//             end.textContent = ` }, ${durations[i]});`;

//             div.appendChild(label);
//             div.appendChild(input);
//             div.appendChild(end);
//             container.appendChild(div);

//             indentLevel++;
//         });
//     } else if (mode === 'setInterval') {
//         const div = document.createElement('div');
//         const label = document.createElement('label');
//         label.for = `intervalTime`;
//         label.textContent = `setInterval(${notes.map(noteSet => noteSet.map(note => note.charAt(0).toUpperCase() + note.slice(1)).join(', ')).join(' → ')}, `;

//         const input = document.createElement('input');
//         input.type = 'text';
//         input.id = `intervalTime`;
//         input.placeholder = '500ms';

//         const end = document.createElement('span');
//         end.textContent = ');';

//         const results = document.createElement('div');
//         results.id = `intervalResults`;
//         results.style.marginLeft = '10px';

//         div.appendChild(label);
//         div.appendChild(input);
//         div.appendChild(end);
//         div.appendChild(results);
//         container.appendChild(div);
//     }
// }

