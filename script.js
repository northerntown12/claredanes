const calculatorElement = document.querySelector('.calculator');
const previousOperandElement = document.querySelector('.previous-operand');
const currentOperandElement = document.querySelector('.current-operand');

if (calculatorElement && previousOperandElement && currentOperandElement) {

    let currentOperand = '0';
    let previousOperand = '';
    let operation = undefined;

    function updateDisplay() {
        currentOperandElement.textContent = formatNumber(currentOperand);

        if (operation !== undefined) {
            previousOperandElement.textContent =
                `${formatNumber(previousOperand)} ${operation}`;
        } else {
            previousOperandElement.textContent = '';
        }
    }

    function formatNumber(number) {
        const parts = String(number).split('.');
        const integerPart = Number(parts[0]);

        const formattedInteger = Number.isNaN(integerPart)
            ? '0'
            : integerPart.toLocaleString('ko-KR');

        return parts.length > 1
            ? formattedInteger + '.' + parts[1]
            : formattedInteger;
    }

    function clearCalculator() {
        currentOperand = '0';
        previousOperand = '';
        operation = undefined;
    }

    function deleteNumber() {
        currentOperand = currentOperand.slice(0, -1);

        if (currentOperand === '' || currentOperand === '-') {
            currentOperand = '0';
        }
    }

    function appendNumber(number) {
        if (number === '.' && currentOperand.includes('.')) {
            return;
        }

        if (currentOperand === '0' && number !== '.') {
            currentOperand = number;
        } else {
            currentOperand += number;
        }
    }

    function chooseOperation(selectedOperation) {
        if (operation !== undefined) {
            calculate();

            if (operation !== undefined) return;
        }

        previousOperand = currentOperand;
        operation = selectedOperation;
        currentOperand = '0';
    }

    function calculate() {
        const prev = parseFloat(previousOperand);
        const current = parseFloat(currentOperand);

        if (Number.isNaN(prev) || Number.isNaN(current) ||
            operation === undefined) {
            return;
        }

        let result;

        switch (operation) {
            case '+':
                result = prev + current;
                break;

            case '-':
                result = prev - current;
                break;

            case '×':
            case '*':
                result = prev * current;
                break;

            case '÷':
            case '/':
                if (current === 0) {
                    alert('0으로 나눌 수 없습니다!');
                    return;
                }
                result = prev / current;
                break;

            default:
                return;
        }

        currentOperand = String(Number(result.toFixed(8)));
        previousOperand = '';
        operation = undefined;
    }

    // 계산기 내부 버튼만 처리해요.
    calculatorElement.addEventListener('click', function(event) {
        const button = event.target.closest('button');

        if (!button || !calculatorElement.contains(button)) {
            return;
        }

        const value = button.textContent.trim();

        if (value === 'AC') {
            clearCalculator();
        } else if (value === 'DEL') {
            deleteNumber();
        } else if (value === '=') {
            calculate();
        } else if (['+', '-', '×', '*', '÷', '/'].includes(value)) {
            chooseOperation(value);
        } else if (/^\d+$/.test(value) || value === '.') {
            appendNumber(value);
        }

        updateDisplay();
    });

    updateDisplay();
}

// Web Audio API를 활용한 효과음 생성기
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 1. 가늘고 빠른 톤의 '짤깍짤깍' 번호판 회전 소리
function playFlipSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = 'sine'; // 가늘고 부드러운 톤
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime); // 높은 주파수로 가늘게 설정
    osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.015); // 아주 짧고 빠르게 떨어짐
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.015);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.015);
}

// 2. 1984 LA 올림픽 시상대 팡파레 (웅장한 브라스 사운드)
function playOlympicsFanfare() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const fanfareNotes = [
        { freq: 293.66, duration: 0.2 }, // D4
        { freq: 392.00, duration: 0.2 }, // G4
        { freq: 440.00, duration: 0.2 }, // A4
        { freq: 493.88, duration: 0.2 }, // B4
        { freq: 587.33, duration: 0.6 }, // D5 
        { freq: 493.88, duration: 0.2 }, // B4
        { freq: 587.33, duration: 0.9 }  // D5 
    ];
    
    let time = audioCtx.currentTime;
    fanfareNotes.forEach(note => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(note.freq, time);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, time);
        
        gain.gain.setValueAtTime(0.01, time);
        gain.gain.linearRampToValueAtTime(0.22, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + note.duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(time);
        osc.stop(time + note.duration);
        
        time += note.duration + 0.04;
    });
}

// 로또 동작 로직
document.addEventListener("DOMContentLoaded", () => {
    const lottoBtn = document.getElementById("lotto-btn");
    const ballEls = document.querySelectorAll("#lotto-balls .ball");
    
    let isRolling = false;
    let rollIntervals = [];
    let finalNumbers = [];

    function setBallColor(ballEl, num) {
        ballEl.className = "ball";
        if (num >= 1 && num <= 10) ballEl.classList.add("num-1");
        else if (num <= 20) ballEl.classList.add("num-11");
        else if (num <= 30) ballEl.classList.add("num-21");
        else if (num <= 40) ballEl.classList.add("num-31");
        else if (num <= 45) ballEl.classList.add("num-41");
    }

    function generateLottoNumbers() {
        const numbers = Array.from({ length: 45 }, (_, i) => i + 1);
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        const mainNumbers = numbers.slice(0, 6).sort((a, b) => a - b);
        const bonusNumber = numbers[6];
        return [...mainNumbers, bonusNumber];
    }

    lottoBtn.addEventListener("click", () => {
        if (isRolling) return;

        isRolling = true;
        lottoBtn.innerText = "추첨 중...";
        lottoBtn.style.opacity = "0.7";

        finalNumbers = generateLottoNumbers();

        // 1단계: 5초 동안 빠르게 회전하며 가느다란 짤깍 소리 재생 (간격을 45ms로 더 빠르게 설정)
        ballEls.forEach((ball, idx) => {
            ball.classList.add("rolling");
            rollIntervals[idx] = setInterval(() => {
                const randomNum = Math.floor(Math.random() * 45) + 1;
                ball.innerText = randomNum;
                setBallColor(ball, randomNum);
                playFlipSound();
            }, 45);
        });

        // 2단계: 5초 뒤 왼쪽 공부터 0.4초 간격으로 차례대로 정지
        setTimeout(() => {
            ballEls.forEach((ball, idx) => {
                setTimeout(() => {
                    clearInterval(rollIntervals[idx]);
                    ball.classList.remove("rolling");
                    
                    const num = finalNumbers[idx];
                    ball.innerText = num;
                    setBallColor(ball, num);
                    
                    playFlipSound(); 

                    // 마지막 공까지 모두 멈췄을 때 올림픽 팡파레 연주
                    if (idx === ballEls.length - 1) {
                        isRolling = false;
                        lottoBtn.innerText = "AGAIN!";
                        lottoBtn.style.opacity = "1";
                        setTimeout(playOlympicsFanfare, 250);
                    }
                }, idx * 400); 
            });
        }, 5000); 
    });
});

       
   



    
