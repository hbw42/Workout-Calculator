// Time splits calculator logic
let splits = [];

function addSplit() {
    splits.push({ hours: '', minutes: '', seconds: '' });
    updateDisplay();
}

function removeSplit(index) {
    splits.splice(index, 1);
    updateDisplay();
}

function updateValue(index, type, value) {
    value = value === '' ? '' : parseInt(value) || 0;
    if (type !== 'hours' && value > 59) value = 59;
    splits[index][type] = value;
    calculateTotal();
}

function calculateTotal() {
    let totalSeconds = splits.reduce((acc, split) => {
        const hours = parseInt(split.hours) || 0;
        const minutes = parseInt(split.minutes) || 0;
        const seconds = parseInt(split.seconds) || 0;
        return acc + (hours * 3600) + (minutes * 60) + seconds;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    document.getElementById('total').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateDisplay() {
    const container = document.getElementById('splits');
    if (!container) return;
    
    container.innerHTML = splits.map((split, index) => `
        <div class="split">
            <input type="number" placeholder="HH" min="0" 
                   value="${split.hours}"
                   onchange="updateValue(${index}, 'hours', this.value)">
            <input type="number" placeholder="MM" min="0" max="59"
                   value="${split.minutes}"
                   onchange="updateValue(${index}, 'minutes', this.value)">
            <input type="number" placeholder="SS" min="0" max="59"
                   value="${split.seconds}"
                   onchange="updateValue(${index}, 'seconds', this.value)">
            ${splits.length > 1 ? `
                <button class="delete" onclick="removeSplit(${index})">×</button>
            ` : ''}
        </div>
    `).join('');
    calculateTotal();
}



if (document.getElementById('splits')) {
    addSplit();
}


// Round Duration Calculator Logic

let rounds = JSON.parse(localStorage.getItem('durationRounds') || '[]');

function calculateDuration() {
    const startHours = parseInt(document.getElementById('startHours').value || 0);
    const startMinutes = parseInt(document.getElementById('startMinutes').value || 0);
    const startSeconds = parseInt(document.getElementById('startSeconds').value || 0);
    const endHours = parseInt(document.getElementById('endHours').value || 0);
    const endMinutes = parseInt(document.getElementById('endMinutes').value || 0);
    const endSeconds = parseInt(document.getElementById('endSeconds').value || 0);

    const startTotalSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
    const endTotalSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

    let diffSeconds = endTotalSeconds - startTotalSeconds;
    if (diffSeconds < 0) {
        diffSeconds += 24 * 3600;
    }

    const durationHours = Math.floor(diffSeconds / 3600);
    const durationMinutes = Math.floor((diffSeconds % 3600) / 60);
    const durationSeconds = diffSeconds % 60;

    const nextStartSeconds = (endTotalSeconds + diffSeconds) % (24 * 3600);
    const nextHours = Math.floor(nextStartSeconds / 3600);
    const nextMinutes = Math.floor((nextStartSeconds % 3600) / 60);
    const nextSeconds = nextStartSeconds % 60;

    const formattedDuration = `${String(durationHours).padStart(2, '0')}:${String(durationMinutes).padStart(2, '0')}:${String(durationSeconds).padStart(2, '0')}`;
    const formattedNextStart = `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}:${String(nextSeconds).padStart(2, '0')}`;

    rounds.push({
        duration: formattedDuration,
        nextStart: formattedNextStart
    });

    localStorage.setItem('durationRounds', JSON.stringify(rounds));

    document.getElementById('startHours').value = nextHours;
    document.getElementById('startMinutes').value = nextMinutes;
    document.getElementById('startSeconds').value = nextSeconds;
    document.getElementById('endHours').value = '';
    document.getElementById('endMinutes').value = '';
    document.getElementById('endSeconds').value = '';

    displayRounds();
}

function editRound(index) {
    const roundElement = document.querySelector(`[data-round="${index}"]`);
    const startTime = index > 0 ? rounds[index - 1].nextStart : '00:00:00';
    const [startH, startM, startS] = startTime.split(':').map(Number);

    // Calculate actual end time from start and duration
    const [durH, durM, durS] = rounds[index].duration.split(':').map(Number);
    let endSeconds = (startH * 3600 + startM * 60 + startS) + 
                    (durH * 3600 + durM * 60 + durS);
    endSeconds = endSeconds % (24 * 3600);
    const endH = Math.floor(endSeconds / 3600);
    const endM = Math.floor((endSeconds % 3600) / 60);
    const endS = endSeconds % 60;
    
    roundElement.innerHTML += `
        <div class="edit-section">
            <div class="total-label">Edit End Time:</div>
            <div class="edit-inputs">
                <input type="number" id="editHours${index}" value="${endH || ''}" min="0" max="23" placeholder="HH">
                <input type="number" id="editMinutes${index}" value="${endM}" min="0" max="59" placeholder="MM">
                <input type="number" id="editSeconds${index}" value="${endS}" min="0" max="59" placeholder="SS">
            </div>
            <div class="edit-buttons">
                <button class="save-edit" onclick="saveEdit(${index})">Save</button>
                <button class="cancel-edit" onclick="displayRounds()">Cancel</button>
            </div>
        </div>
    `;
}

function saveEdit(index) {
    const endHours = parseInt(document.getElementById(`editHours${index}`).value || 0);
    const endMinutes = parseInt(document.getElementById(`editMinutes${index}`).value || 0);
    const endSeconds = parseInt(document.getElementById(`editSeconds${index}`).value || 0);
    
    const startTime = index > 0 ? rounds[index - 1].nextStart : '00:00:00';
    const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);

    let duration = calculateTimeDifference(
        startHours, startMinutes, startSeconds,
        endHours, endMinutes, endSeconds
    );

    rounds[index] = duration;

    for(let i = index + 1; i < rounds.length; i++) {
        const prevStart = rounds[i-1].nextStart;
        const [prevHours, prevMinutes, prevSeconds] = prevStart.split(':').map(Number);
        const [roundHours, roundMinutes, roundSeconds] = rounds[i].duration.split(':').map(Number);
        
        rounds[i] = calculateTimeDifference(
            prevHours, prevMinutes, prevSeconds,
            (prevHours + roundHours) % 24, prevMinutes + roundMinutes, prevSeconds + roundSeconds
        );
    }

    // Reset main start time inputs to the last round's next start time
    if (rounds.length > 0) {
        const lastRound = rounds[rounds.length - 1];
        const [nextH, nextM, nextS] = lastRound.nextStart.split(':').map(Number);
        document.getElementById('startHours').value = nextH || '';
        document.getElementById('startMinutes').value = nextM;
        document.getElementById('startSeconds').value = nextS;
    }

    localStorage.setItem('durationRounds', JSON.stringify(rounds));
    displayRounds();
}

function calculateTimeDifference(startH, startM, startS, endH, endM, endS) {
    const startSeconds = startH * 3600 + startM * 60 + startS;
    const endSeconds = endH * 3600 + endM * 60 + endS;

    let diffSeconds = endSeconds - startSeconds;
    if (diffSeconds < 0) diffSeconds += 24 * 3600;

    const durationH = Math.floor(diffSeconds / 3600);
    const durationM = Math.floor((diffSeconds % 3600) / 60);
    const durationS = diffSeconds % 60;

    const nextStartSeconds = (endSeconds + diffSeconds) % (24 * 3600);
    const nextH = Math.floor(nextStartSeconds / 3600);
    const nextM = Math.floor((nextStartSeconds % 3600) / 60);
    const nextS = nextStartSeconds % 60;

    return {
        duration: `${String(durationH).padStart(2, '0')}:${String(durationM).padStart(2, '0')}:${String(durationS).padStart(2, '0')}`,
        nextStart: `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}:${String(nextS).padStart(2, '0')}`
    };
}

function deleteRound(index) {
    rounds.splice(index, 1);
    localStorage.setItem('durationRounds', JSON.stringify(rounds));
    displayRounds();
}

function displayRounds() {
    const resultDiv = document.getElementById('durationResult');
    if (!resultDiv) return;
    
    resultDiv.innerHTML = rounds.map((round, index) => {
        const startTime = index > 0 ? rounds[index - 1].nextStart : '00:00:00';
        const [startH, startM, startS] = startTime.split(':').map(Number);
        
        // Calculate actual end time by adding duration to start time
        const [durH, durM, durS] = round.duration.split(':').map(Number);
        let endSeconds = (startH * 3600 + startM * 60 + startS) + 
                        (durH * 3600 + durM * 60 + durS);
        endSeconds = endSeconds % (24 * 3600);
        const endH = Math.floor(endSeconds / 3600);
        const endM = Math.floor((endSeconds % 3600) / 60);
        const endS = endSeconds % 60;
        
        return `
            <div class="round-container" data-round="${index}">
                <div class="round-header">
                    <div class="round-title">
                        <span class="round-label">Round ${index + 1}</span>
                        <span class="time-details">(${formatTime(startH, startM, startS)} - ${formatTime(endH, endM, endS)})</span>
                    </div>
                    <div class="round-actions">
                        <button class="edit-round" onclick="editRound(${index})">Edit</button>
                        <button class="delete-round" onclick="deleteRound(${index})">×</button>
                    </div>
                </div>
                <div class="split">
                    <div class="total">
                        <div class="total-label">Round Time</div>
                        <div class="total-time">${formatTime(...round.duration.split(':').map(Number))}</div>
                    </div>
                    <div class="total" style="background: #e8f5e9;">
                        <div class="total-label">Start Next Round</div>
                        <div class="total-time">${formatTime(...round.nextStart.split(':').map(Number))}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatTime(h, m, s) {
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function resetDurationCalculator() {
    ['startHours', 'startMinutes', 'startSeconds', 
     'endHours', 'endMinutes', 'endSeconds'].forEach(id => {
        document.getElementById(id).value = '';
    });
    rounds = [];
    localStorage.removeItem('durationRounds');
    document.getElementById('durationResult').innerHTML = '';
}


if (document.getElementById('durationResult')) {
    displayRounds();
}


// KG to LB conversion

function convertKgLb(from) {
    const kgInput = document.getElementById('kg');
    const lbInput = document.getElementById('lb');
    
    if (from === 'kg') {
        const kg = parseFloat(kgInput.value);
        if (!isNaN(kg)) {
            lbInput.value = (kg * 2.20462).toFixed(2);
        } else {
            lbInput.value = '';
        }
    } else {
        const lb = parseFloat(lbInput.value);
        if (!isNaN(lb)) {
            kgInput.value = (lb / 2.20462).toFixed(2);
        } else {
            kgInput.value = '';
        }
    }
}

// Ounce to Grams conversion

function convertOzGrams(from) {
    const ouncesInput = document.getElementById('ounces');
    const gramsInput = document.getElementById('grams');
    
    // Conversion rate: 1 ounce = 28.34952 grams
    if (from === 'ounces') {
        const ounces = parseFloat(ouncesInput.value);
        if (!isNaN(ounces)) {
            gramsInput.value = (ounces * 28.34952).toFixed(2);
        } else {
            gramsInput.value = '';
        }
    } else if (from === 'grams') {
        const grams = parseFloat(gramsInput.value);
        if (!isNaN(grams)) {
            ouncesInput.value = (grams / 28.34952).toFixed(2);
        } else {
            ouncesInput.value = '';
        }
    }
}

// Meters to Feet conversion

function convertMeters(from) {
    const metersInput = document.getElementById('meters');
    const feetInput = document.getElementById('feet');
    
    if (from === 'meters') {
        const meters = parseFloat(metersInput.value);
        if (!isNaN(meters)) {
            feetInput.value = (meters * 3.28084).toFixed(2);
        } else {
            feetInput.value = '';
        }
    } else if (from === 'feet') {
        const feet = parseFloat(feetInput.value);
        if (!isNaN(feet)) {
            metersInput.value = (feet / 3.28084).toFixed(2);
        } else {
            metersInput.value = '';
        }
    }
}

// Meters to Miles

function convertMetersToMiles(from) {
    const metersForMilesInput = document.getElementById('metersForMiles');
    const milesForMetersInput = document.getElementById('milesForMeters');
    
    if (from === 'metersForMiles') {
        const meters = parseFloat(metersForMilesInput.value);
        if (!isNaN(meters)) {
            milesForMetersInput.value = (meters / 1609.34).toFixed(4);
        } else {
            milesForMetersInput.value = '';
        }
    } else if (from === 'milesForMeters') {
        const miles = parseFloat(milesForMetersInput.value);
        if (!isNaN(miles)) {
            metersForMilesInput.value = (miles * 1609.34).toFixed(2);
        } else {
            metersForMilesInput.value = '';
        }
    }
}

// Reset converters

function resetAllConverters() {
    // Reset KG/LB Converter
    document.getElementById('kg').value = '';
    document.getElementById('lb').value = '';
    
    // Reset Ounces/Grams Converter
    document.getElementById('ounces').value = '';
    document.getElementById('grams').value = '';

    // Reset Meters/Feet Converter
    document.getElementById('meters').value = '';
    document.getElementById('feet').value = '';

    // Reset Meters/Miles Converter
    document.getElementById('metersForMiles').value = '';
    document.getElementById('milesForMeters').value = '';

    // Trigger change events to reset calculations
    ['kg', 'lb', 'ounces', 'grams', 'meters', 'feet','metersForMiles', 'milesForMeters'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.dispatchEvent(new Event('change'));
        }
    });
}

// Instruction modals


function showInstructions() {
    document.getElementById('instructionsModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeInstructions() {
    document.getElementById('instructionsModal').style.display = 'none';
    document.body.style.overflow = '';
}

function showInstallInstructions() {
    document.getElementById('installModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeInstallInstructions() {
    document.getElementById('installModal').style.display = 'none';
    document.body.style.overflow = '';
}

window.onclick = function(event) {
    const instructionsModal = document.getElementById('instructionsModal');
    const installModal = document.getElementById('installModal');
    if (event.target === instructionsModal) {
        closeInstructions();
    } else if (event.target === installModal) {
        closeInstallInstructions();
    }
}