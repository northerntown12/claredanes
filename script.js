class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '0') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    alert('0으로 나눌 수 없습니다!');
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        this.currentOperand = Number(computation.toFixed(8)).toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '0';
        } else {
            integerDisplay = integerDigits.toLocaleString('ko-KR');
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandElement.textContent = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }
}

const calculator = new Calculator(
    document.querySelector('.previous-operand'),
    document.querySelector('.current-operand')
);

document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        if (button.innerText === 'AC') {
            calculator.clear();
        } else if (button.innerText === 'DEL') {
            calculator.delete();
        } else if (button.innerText === '=' ) {
            calculator.compute();
        } else if ('+-×÷'.includes(button.innerText)) {
            calculator.chooseOperation(button.innerText);
        } else {
            calculator.appendNumber(button.innerText);
        }
        calculator.updateDisplay();
    });
}); 


// Web Audio API를 활용한 효과음 생성기
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 1. 기계식 번호판이 돌아가는 '짜각 짜각' 소리
function playFlipSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.03);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.03);
}

// 2. 1984 LA 올림픽 시상대 팡파레 (웅장한 브라스 사운드)
function playOlympicsFanfare() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const fanfareNotes = [
        { freq: 293.66, duration: 0.2 }, // D4
        { freq: 392.00, duration: 0.2 }, // G4
        { freq: 440.00, duration: 0.2 }, // A4
        { freq: 493.88, duration: 0.2 }, // B4
        { freq: 587.33, duration: 0.6 }, // D5 (웅장하게)
        { freq: 493.88, duration: 0.2 }, // B4
        { freq: 587.33, duration: 0.9 }  // D5 (피날레)
    ];
    
    let time = audioCtx.currentTime;
    fanfareNotes.forEach(note => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = 'sawtooth'; // 브라스(관악기) 느낌의 풍성한 파형
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

        // 1단계: 모든 공이 각자의 색상을 유지하며 5초 동안 빠르게 회전 + 짜각짜각 소리
        ballEls.forEach((ball, idx) => {
            ball.classList.add("rolling");
            rollIntervals[idx] = setInterval(() => {
                const randomNum = Math.floor(Math.random() * 45) + 1;
                ball.innerText = randomNum;
                setBallColor(ball, randomNum);
                playFlipSound();
            }, 60);
        });

        // 2단계: 정확히 5초(5000ms) 뒤에 왼쪽 공부터 0.4초 간격으로 차례대로 정지
        setTimeout(() => {
            ballEls.forEach((ball, idx) => {
                setTimeout(() => {
                    clearInterval(rollIntervals[idx]);
                    ball.classList.remove("rolling");
                    
                    const num = finalNumbers[idx];
                    ball.innerText = num;
                    setBallColor(ball, num);
                    
                    playFlipSound(); // 멈출 때도 찰칵 소리

                    // 마지막 보너스 공까지 모두 멈췄을 때 팡파레 연주
                    if (idx === ballEls.length - 1) {
                        isRolling = false;
                        lottoBtn.innerText = "AGAIN!";
                        lottoBtn.style.opacity = "1";
                        setTimeout(playOlympicsFanfare, 250);
                    }
                }, idx * 400); // 0.4초 간격 순차 정지
            });
        }, 5000); // 5초 동안 신나게 회전
    });
});
