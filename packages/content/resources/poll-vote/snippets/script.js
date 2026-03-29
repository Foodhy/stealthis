const pollData = {
  question: "What's your favorite frontend tool?",
  options: [
    { label: "React", votes: 850 },
    { label: "Vue", votes: 420 },
    { label: "Svelte", votes: 310 },
    { label: "Angular", votes: 240 }
  ]
};

const optionsContainer = document.getElementById('poll-options');
const resultsContainer = document.getElementById('poll-results');
const voteBtn = document.getElementById('vote-btn');
const totalVotesEl = document.getElementById('total-votes');

let selectedOption = null;

function initPoll() {
  optionsContainer.innerHTML = '';
  pollData.options.forEach((opt, index) => {
    const div = document.createElement('div');
    div.className = 'poll-opt';
    div.innerHTML = `
      <input type="radio" name="poll" id="opt-${index}" value="${index}">
      <label for="opt-${index}">${opt.label}</label>
    `;
    div.addEventListener('click', () => {
        selectedOption = index;
        document.querySelectorAll('.poll-opt').forEach(p => p.classList.remove('selected'));
        div.classList.add('selected');
        div.querySelector('input').checked = true;
        voteBtn.disabled = false;
    });
    optionsContainer.appendChild(div);
  });
  
  updateTotalVotes();
}

function updateTotalVotes() {
    const total = pollData.options.reduce((sum, opt) => sum + opt.votes, 0);
    totalVotesEl.textContent = `Total votes: ${total.toLocaleString()}`;
}

function castVote() {
    if (selectedOption === null) return;
    
    pollData.options[selectedOption].votes++;
    showResults();
}

function showResults() {
    optionsContainer.style.display = 'none';
    resultsContainer.style.display = 'flex';
    voteBtn.style.display = 'none';
    
    const total = pollData.options.reduce((sum, opt) => sum + opt.votes, 0);
    resultsContainer.innerHTML = '';
    
    pollData.options.forEach(opt => {
        const percent = Math.round((opt.votes / total) * 100);
        const row = document.createElement('div');
        row.className = 'result-row';
        row.innerHTML = `
            <div class="result-label">
                <span>${opt.label}</span>
                <span>${percent}%</span>
            </div>
            <div class="result-bar-bg">
                <div class="result-bar-fill" style="width: 0%"></div>
            </div>
        `;
        resultsContainer.appendChild(row);
        
        // Trigger animation
        setTimeout(() => {
            row.querySelector('.result-bar-fill').style.width = `${percent}%`;
        }, 100);
    });
    
    updateTotalVotes();
}

voteBtn.addEventListener('click', castVote);

initPoll();
