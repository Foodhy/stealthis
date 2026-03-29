const display = document.getElementById('calc-display');
const history = document.getElementById('calc-history');
const buttons = document.querySelectorAll('.calc-btn');

let currentInput = '0';
let previousInput = '';
let operation = null;
let shouldResetDisplay = false;

function updateDisplay() {
  display.textContent = currentInput;
}

function handleNumber(num) {
  if (currentInput === '0' || shouldResetDisplay) {
    currentInput = num;
    shouldResetDisplay = false;
  } else {
    currentInput += num;
  }
}

function handleDecimal() {
  if (shouldResetDisplay) {
    currentInput = '0.';
    shouldResetDisplay = false;
    return;
  }
  if (!currentInput.includes('.')) {
    currentInput += '.';
  }
}

function handleOperator(op) {
  if (operation !== null) calculate();
  previousInput = currentInput;
  operation = op;
  shouldResetDisplay = true;
  history.textContent = `${previousInput} ${getOpSymbol(op)}`;
}

function getOpSymbol(op) {
  const symbols = {
    add: '+',
    subtract: '-',
    multiply: '×',
    divide: '÷'
  };
  return symbols[op] || '';
}

function calculate() {
  if (operation === null || shouldResetDisplay) return;
  
  let result;
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);
  
  switch (operation) {
    case 'add': result = prev + current; break;
    case 'subtract': result = prev - current; break;
    case 'multiply': result = prev * current; break;
    case 'divide': 
      if (current === 0) {
        alert("Cannot divide by zero");
        clear();
        return;
      }
      result = prev / current; 
      break;
    default: return;
  }
  
  currentInput = String(parseFloat(result.toFixed(8)));
  operation = null;
  history.textContent = '';
  shouldResetDisplay = true;
}

function clear() {
  currentInput = '0';
  previousInput = '';
  operation = null;
  history.textContent = '';
}

function toggleSign() {
  currentInput = String(parseFloat(currentInput) * -1);
}

function handlePercent() {
  currentInput = String(parseFloat(currentInput) / 100);
}

// Click Listeners
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value = btn.textContent;
    
    if (!action) {
      if (value === '.') handleDecimal();
      else handleNumber(value);
    } else {
      switch (action) {
        case 'clear': clear(); break;
        case 'toggle-sign': toggleSign(); break;
        case 'percent': handlePercent(); break;
        case 'calculate': calculate(); break;
        default: handleOperator(action);
      }
    }
    updateDisplay();
  });
});

// Keyboard Support
window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
  if (e.key === '.') handleDecimal();
  if (e.key === 'Enter' || e.key === '=') calculate();
  if (e.key === 'Escape') clear();
  if (e.key === '+') handleOperator('add');
  if (e.key === '-') handleOperator('subtract');
  if (e.key === '*') handleOperator('multiply');
  if (e.key === '/') {
    e.preventDefault();
    handleOperator('divide');
  }
  updateDisplay();
});
