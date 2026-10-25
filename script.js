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


// Web Audio API를 활용한 효과음 생성기 (외부 파일 없이 작동)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 슬롯머신 클릭/스톱 소리
function playClickSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
}

// 잭팟/완료 효과음
function playWinSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // 도, 미, 솔, 도
    notes.forEach((freq, index) => {
        setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        }, index * 80);
    });
}

// 로또 동작 로직
document.addEventListener("DOMContentLoaded", () => {
    const lottoBtn = document.getElementById("lotto-btn");
    const ballEls = document.querySelectorAll("#lotto-balls .ball");
    
    let isRolling = false;
    let rollIntervals = [];
    let finalNumbers = [];

    // 로또 번호 공 색상 क्लास 부여 함수
    function setBallColor(ballEl, num) {
        ballEl.className = "ball"; // 초기화
        if (num >= 1 && num <= 10) ballEl.classList.add("num-1");
        else if (num <= 20) ballEl.classList.add("num-11");
        else if (num <= 30) ballEl.classList.add("num-21");
        else if (num <= 40) ballEl.classList.add("num-31");
        else if (num <= 45) ballEl.classList.add("num-41");
    }

    // 중복 없는 7개 번호(6개 + 보너스 1개) 생성
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

    // 버튼 클릭 이벤트
    lottoBtn.addEventListener("click", () => {
        if (isRolling) return; // 이미 회전 중이면 무시

        isRolling = true;
        lottoBtn.innerText = "추첨 중...";
        lottoBtn.style.opacity = "0.7";

        finalNumbers = generateLottoNumbers();

        // 1단계: 모든 공 빠르게 회전 (초시계 효과)
        ballEls.forEach((ball, idx) => {
            ball.classList.add("rolling");
            rollIntervals[idx] = setInterval(() => {
                const randomNum = Math.floor(Math.random() * 45) + 1;
                ball.innerText = randomNum;
                setBallColor(ball, randomNum);
            }, 50);
        });

        // 2단계: 첫번째 공부터 0.35초 간격으로 탁- 탁- 멈추기
        ballEls.forEach((ball, idx) => {
            setTimeout(() => {
                clearInterval(rollIntervals[idx]);
                ball.classList.remove("rolling");
                
                const num = finalNumbers[idx];
                ball.innerText = num;
                setBallColor(ball, num);
                
                playClickSound(); // 공이 딱 멈출 때마다 사운드 재생

                // 마지막 공(보너스 공)까지 다 멈췄을 때
                if (idx === ballEls.length - 1) {
                    isRolling = false;
                    lottoBtn.innerText = "AGAIN!";
                    lottoBtn.style.opacity = "1";
                    setTimeout(playWinSound, 200); // 잭팟 축하 사운드
                }
            }, 800 + idx * 350); // 시작 후 0.8초 뒤부터 차례대로 멈춤
        });
    });
});
