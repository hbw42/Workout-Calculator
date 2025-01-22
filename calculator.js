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
    if (!container) return; // Early return if not on time calculator page
    
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

// Duration Calculator Logic
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

    document.getElementById('durationResult').innerHTML = `
        <div class="total">
            <div class="total-label">Duration:</div>
            <div class="total-time">${formattedDuration}</div>
        </div>
        <div class="total" style="margin-top: 12px; background: #e8f5e9;">
            <div class="total-label">Next Start Time:</div>
            <div class="total-time">${formattedNextStart}</div>
        </div>
    `;
}

function resetDurationCalculator() {
    ['startHours', 'startMinutes', 'startSeconds', 
     'endHours', 'endMinutes', 'endSeconds'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('durationResult').innerHTML = '';
}

// Weight Converter Logic
function convertWeight(from) {
    const kgInput = document.getElementById('kg');
    const lbInput = document.getElementById('lb');
    
    if (from === 'kg') {
        const kg = parseFloat(kgInput.value) || 0;
        lbInput.value = (kg * 2.20462).toFixed(2);
    } else {
        const lb = parseFloat(lbInput.value) || 0;
        kgInput.value = (lb / 2.20462).toFixed(2);
    }
}

// Initialize time calculator if we're on that page
if (document.getElementById('splits')) {
    addSplit();
}
