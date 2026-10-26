
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


/* ===== 계산기 ===== */
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

        if (
            Number.isNaN(prev) ||
            Number.isNaN(current) ||
            operation === undefined
        ) {
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


/* ===== 로또 효과음 ===== */
const audioCtx = new (
    window.AudioContext || window.webkitAudioContext
)();

function playFlipSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
        500,
        audioCtx.currentTime + 0.015
    );

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.015
    );

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.015);
}


/* ===== 팡파레 ===== */
// 팡파레의 마지막 음이 끝나면 onComplete를 실행해요.
function playOlympicsFanfare(onComplete) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const fanfareNotes = [
        { freq: 293.66, duration: 0.2 },
        { freq: 392.00, duration: 0.2 },
        { freq: 440.00, duration: 0.2 },
        { freq: 493.88, duration: 0.2 },
        { freq: 587.33, duration: 0.6 },
        { freq: 493.88, duration: 0.2 },
        { freq: 587.33, duration: 0.9 }
    ];

    let time = audioCtx.currentTime;

    fanfareNotes.forEach((note, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, time);

        gain.gain.setValueAtTime(0.01, time);
        gain.gain.linearRampToValueAtTime(0.22, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            time + note.duration
        );

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        // 마지막 음이 끝나는 순간 완료 처리를 실행해요.
        if (
            index === fanfareNotes.length - 1 &&
            typeof onComplete === 'function'
        ) {
            osc.addEventListener('ended', onComplete, { once: true });
        }

        osc.start(time);
        osc.stop(time + note.duration);

        time += note.duration + 0.04;
    });
}


/* ===== 로또 추첨기 ===== */
document.addEventListener("DOMContentLoaded", () => {
    const lottoBtn = document.getElementById("lotto-btn");
    const ballEls = Array.from(
        document.querySelectorAll("#lotto-balls .ball")
    );

    if (!lottoBtn || ballEls.length === 0) {
        return;
    }

    let isRolling = false;
    let canStop = false;
    let rollIntervals = [];
    let stopTimeout = null;
    let revealTimeouts = [];
    let finalNumbers = [];
    let runId = 0;

    function clearRollIntervals() {
        rollIntervals.forEach(interval => clearInterval(interval));
        rollIntervals = [];
    }

    function clearPendingTimers() {
        if (stopTimeout !== null) {
            clearTimeout(stopTimeout);
            stopTimeout = null;
        }

        revealTimeouts.forEach(timeout => clearTimeout(timeout));
        revealTimeouts = [];
    }

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
        const numbers = Array.from(
            { length: 45 },
            (_, i) => i + 1
        );

        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        const mainNumbers = numbers
            .slice(0, 6)
            .sort((a, b) => a - b);

        const bonusNumber = numbers[6];

        return [...mainNumbers, bonusNumber];
    }

    function stopRolling() {
        if (!isRolling || !canStop) {
            return;
        }

        isRolling = false;
        canStop = false;
        runId++;

        clearPendingTimers();
        clearRollIntervals();

        ballEls.forEach(ball => {
            ball.classList.remove("rolling");
        });

        lottoBtn.innerText = "STOP!";
        lottoBtn.style.opacity = "1";

        const stoppedRunId = runId;

        const timeout = setTimeout(() => {
            if (runId === stoppedRunId && !isRolling) {
                lottoBtn.innerText = "AGAIN!";
            }
        }, 150);

        revealTimeouts.push(timeout);
    }

  
function revealNumbersSequentially(currentRunId) {
    // 각 공은 자신의 결과가 공개될 때까지 계속 회전해요.
    ballEls.forEach((ball, idx) => {
        const timeout = setTimeout(() => {
            if (runId !== currentRunId || !isRolling) {
                return;
            }

            // 해당 공의 회전만 멈춰요.
            const interval = rollIntervals[idx];
            if (interval !== undefined) {
                clearInterval(interval);
                rollIntervals[idx] = undefined;
            }

            ball.classList.remove("rolling");

            // 해당 공의 최종 결과를 표시해요.
            const num = finalNumbers[idx];
            ball.innerText = num;
            setBallColor(ball, num);

            // 마지막 공까지 공개되면 축하 단계로 넘어가요.
            if (idx === ballEls.length - 1) {
                lottoBtn.innerText = "👍";
                lottoBtn.style.opacity = "1";

                playOlympicsFanfare(() => {
                    if (runId !== currentRunId) {
                        return;
                    }

                    isRolling = false;
                    canStop = false;

                    lottoBtn.innerText = "AGAIN!";
                    lottoBtn.style.opacity = "1";
                });
            }
        }, idx * 350);

        revealTimeouts.push(timeout);
    });
}


    function startRolling() {
        runId++;
        const currentRunId = runId;

        isRolling = true;
        canStop = true;

        finalNumbers = generateLottoNumbers();

        clearPendingTimers();
        clearRollIntervals();

        lottoBtn.innerText = "Wait!";
        lottoBtn.style.opacity = "0.7";

        ballEls.forEach((ball, idx) => {
            ball.classList.add("rolling");

            const interval = setInterval(() => {
                if (runId !== currentRunId || !isRolling) {
                    return;
                }

                const randomNum = Math.floor(Math.random() * 45) + 1;

                ball.innerText = randomNum;
                setBallColor(ball, randomNum);

                playFlipSound();
            }, 45);

            rollIntervals[idx] = interval;
        });

        // 4초 회전한 뒤 번호를 왼쪽부터 차례대로 공개해요.
        stopTimeout = setTimeout(() => {
            if (runId !== currentRunId || !isRolling) {
                return;
            }

            stopTimeout = null;
            canStop = false;

        revealNumbersSequentially(currentRunId);
        }, 4000);
    }

    lottoBtn.addEventListener("click", () => {
        if (isRolling) {
            // 회전 중에는 STOP!을 허용하고,
            // 결과 공개 중에는 중복 클릭을 막아요.
            if (canStop) {
                stopRolling();
            }

            return;
        }

        startRolling();
    });
});
