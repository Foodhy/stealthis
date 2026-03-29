function updateClock() {
  const now = new Date();
  
  // Format Time
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = String(hours).padStart(2, '0');

  // Update DOM
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const ampmEl = document.getElementById('ampm');
  const dateEl = document.getElementById('date');

  if (hoursEl) hoursEl.textContent = hoursStr;
  if (minutesEl) minutesEl.textContent = minutes;
  if (secondsEl) secondsEl.textContent = seconds;
  if (ampmEl) ampmEl.textContent = ampm;

  // Format Date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString(undefined, options);
  }
}

// Initial call
updateClock();

// Update every second
setInterval(updateClock, 1000);
