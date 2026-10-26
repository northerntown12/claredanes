
/* ===== 계산기 버튼 소리 ===== */
let calculatorAudioContext;

function playCalculatorSound(type) {
    try {
        if (!calculatorAudioContext) {
            calculatorAudioContext = new (
                window.AudioContext || window.webkitAudioContext
            )();
        }

        const ctx = calculatorAudioContext;

        if (ctx.state === "suspended") {
            ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        const sounds = {
            number:   { frequency: 1200, duration: 0.045, volume: 0.07 },
            operator: { frequency: 720,  duration: 0.075, volume: 0.08 },
            equals:   { frequency: 1500, duration: 0.12,  volume: 0.09 },
            clear:    { frequency: 420,  duration: 0.10,  volume: 0.07 },
            delete:   { frequency: 560,  duration: 0.06,  volume: 0.06 }
        };

        const sound = sounds[type] || sounds.number;
        const now = ctx.currentTime;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(sound.frequency, now);

        // = 버튼은 음이 살짝 올라가도록 설정
        if (type === "equals") {
            oscillator.frequency.setValueAtTime(1900, now + 0.06);
        }

        gain.gain.setValueAtTime(sound.volume, now);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            now + sound.duration
        );

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(now);
        oscillator.stop(now + sound.duration);

    } catch (error) {
        console.warn("계산기 소리를 재생하지 못했어요.", error);
    }
}



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
    
calculatorElement.addEventListener("click", function(event) {
    const button = event.target.closest("button");

    if (!button || !calculatorElement.contains(button)) {
        return;
    }

    const value = button.textContent.trim();

    if (value === "AC") {
        playCalculatorSound("clear");
        clearCalculator();

    } else if (value === "DEL") {
        playCalculatorSound("delete");
        deleteNumber();

    } else if (value === "=") {
        playCalculatorSound("equals");
        calculate();

    } else if (["+", "-", "×", "*", "÷", "/"].includes(value)) {
        playCalculatorSound("operator");
        chooseOperation(value);

    } else if (/^\d+$/.test(value) || value === ".") {
        playCalculatorSound("number");
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


/* ===== 로또 추첨기 ===== */

document.addEventListener("DOMContentLoaded", () => {
    const lottoBtn = document.getElementById("lotto-btn");
    const ballEls = document.querySelectorAll("#lotto-balls .ball");

    let isRolling = false;
    let rollIntervals = [];
    let stopTimeout = null;
    let finalNumbers = [];

    
function setBallColor(ballEl, num) {
    ballEl.className = "ball";

    if (num <= 7) {
        ballEl.classList.add("num-1");
    } else if (num <= 14) {
        ballEl.classList.add("num-8");
    } else if (num <= 21) {
        ballEl.classList.add("num-15");
    } else if (num <= 28) {
        ballEl.classList.add("num-22");
    } else if (num <= 35) {
        ballEl.classList.add("num-29");
    } else if (num <= 42) {
        ballEl.classList.add("num-36");
    } else {
        ballEl.classList.add("num-43");
    }
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

    function stopRolling() {
        if (!isRolling) return;

        isRolling = false;

        // 자동 정지 타이머 취소
        if (stopTimeout !== null) {
            clearTimeout(stopTimeout);
            stopTimeout = null;
        }

        // 모든 공의 회전을 즉시 중지
        rollIntervals.forEach(interval => clearInterval(interval));
        rollIntervals = [];

        ballEls.forEach(ball => {
            ball.classList.remove("rolling");
        });

        // 멈춘 순간 화면에 보이는 번호를 유지
        lottoBtn.innerText = "STOP!";
        lottoBtn.style.opacity = "1";

        // STOP 표시 후 곧바로 AGAIN으로 변경
        setTimeout(() => {
            lottoBtn.innerText = "AGAIN!";
        }, 150);

        // 중간 정지에서는 팡파레를 재생하지 않아요.
    }

    function startRolling() {
        isRolling = true;
        lottoBtn.innerText = "Wait!";
        lottoBtn.style.opacity = "0.7";

        finalNumbers = generateLottoNumbers();

        ballEls.forEach((ball, idx) => {
            ball.classList.add("rolling");

            const interval = setInterval(() => {
                const randomNum = Math.floor(Math.random() * 45) + 1;

                ball.innerText = randomNum;
                setBallColor(ball, randomNum);

                if (typeof playFlipSound === "function") {
                    playFlipSound();
                }
            }, 45);

            rollIntervals[idx] = interval;
        });

        // 5초 동안 누르지 않으면 기존처럼 자동 추첨 완료
        stopTimeout = setTimeout(() => {
            if (!isRolling) return;

            rollIntervals.forEach(interval => clearInterval(interval));
            rollIntervals = [];
            stopTimeout = null;

            ballEls.forEach((ball, idx) => {
                ball.classList.remove("rolling");

                const num = finalNumbers[idx];
                ball.innerText = num;
                setBallColor(ball, num);
            });

            isRolling = false;
            lottoBtn.innerText = "AGAIN!";
            lottoBtn.style.opacity = "1";

            setTimeout(() => {
                if (typeof playOlympicsFanfare === "function") {
                    playOlympicsFanfare();
                }
            }, 250);
        }, 5000);
    }

    lottoBtn.addEventListener("click", () => {
        if (isRolling) {
            stopRolling();
        } else {
            startRolling();
        }
    });
});

