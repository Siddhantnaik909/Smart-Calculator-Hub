function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const ov = document.getElementById('overlay');
    sb.classList.toggle('active');
    ov.style.display = sb.classList.contains('active') ? 'block' : 'none';
}

document.getElementById('startDate').valueAsDate = new Date();

function calculateDeadline() {
    const startStr = document.getElementById('startDate').value;
    const daysToAdd = parseInt(document.getElementById('daysAdd').value);
    const type = parseInt(document.getElementById('weekendType').value);

    if (!startStr || isNaN(daysToAdd)) { alert("Please enter valid details"); return; }

    let currentDate = new Date(startStr);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay(); // 0 = Sun, 6 = Sat

        if (type === 1) { 
            // Sunday only excluded
            if (dayOfWeek !== 0) addedDays++;
        } else {
            // Sat & Sun excluded
            if (dayOfWeek !== 0 && dayOfWeek !== 6) addedDays++;
        }
    }

    // Indian Date Format
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = currentDate.toLocaleDateString('en-IN', options);

    document.getElementById('finalDate').innerText = dateString;
    document.getElementById('desc').innerText = `Deadline after ${daysToAdd} working days.`;
    document.getElementById('resultBox').style.display = 'block';
}
