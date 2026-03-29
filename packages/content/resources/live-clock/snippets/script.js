function updateLiveClock() {
  const now = new Date();

  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  // Analog calculations
  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourDeg = (hours / 12) * 360 + (minutes / 60) * 30;

  document.getElementById("second-hand").style.transform =
    `translateX(-50%) rotate(${secondDeg}deg)`;
  document.getElementById("minute-hand").style.transform =
    `translateX(-50%) rotate(${minuteDeg}deg)`;
  document.getElementById("hour-hand").style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;

  // Digital readout
  const displayHours = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayTime = `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  document.getElementById("digital-time").textContent = displayTime;
  document.getElementById("digital-ampm").textContent = ampm;
}

setInterval(updateLiveClock, 1000);
updateLiveClock();
