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
            case '횞':
                computation = prev * current;
                break;
            case '첨':
                if (current === 0) {
                    alert('0?쇰줈 ?섎닃 ???놁뒿?덈떎!');
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
        } else if ('+-횞첨'.includes(button.innerText)) {
            calculator.chooseOperation(button.innerText);
        } else {
            calculator.appendNumber(button.innerText);
        }
        calculator.updateDisplay();
    });
}); 


// Web Audio API瑜??쒖슜???④낵???앹꽦湲?
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// 1. 媛?섍퀬 鍮좊Ⅸ ?ㅼ쓽 '吏ㅺ퉵吏ㅺ퉵' 踰덊샇???뚯쟾 ?뚮━
function playFlipSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    osc.type = 'sine'; // 媛?섍퀬 遺?쒕윭????
    osc.frequency.setValueAtTime(1400, audioCtx.currentTime); // ?믪? 二쇳뙆?섎줈 媛?섍쾶 ?ㅼ젙
    osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.015); // ?꾩＜ 吏㏐퀬 鍮좊Ⅴ寃??⑥뼱吏?
    
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

// 2. 1984 LA ?щ┝???쒖긽? ?≫뙆??(?낆옣??釉뚮씪???ъ슫??
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

// 濡쒕삉 ?숈옉 濡쒖쭅
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
        lottoBtn.innerText = "異붿꺼 以?..";
        lottoBtn.style.opacity = "0.7";

        finalNumbers = generateLottoNumbers();

        // 1?④퀎: 5珥??숈븞 鍮좊Ⅴ寃??뚯쟾?섎ŉ 媛?먮떎? 吏ㅺ퉵 ?뚮━ ?ъ깮 (媛꾧꺽??45ms濡???鍮좊Ⅴ寃??ㅼ젙)
        ballEls.forEach((ball, idx) => {
            ball.classList.add("rolling");
            rollIntervals[idx] = setInterval(() => {
                const randomNum = Math.floor(Math.random() * 45) + 1;
                ball.innerText = randomNum;
                setBallColor(ball, randomNum);
                playFlipSound();
            }, 45);
        });

        // 2?④퀎: 5珥????쇱そ 怨듬???0.4珥?媛꾧꺽?쇰줈 李⑤??濡??뺤?
        setTimeout(() => {
            ballEls.forEach((ball, idx) => {
                setTimeout(() => {
                    clearInterval(rollIntervals[idx]);
                    ball.classList.remove("rolling");
                    
                    const num = finalNumbers[idx];
                    ball.innerText = num;
                    setBallColor(ball, num);
                    
                    playFlipSound(); 

                    // 留덉?留?怨듦퉴吏 紐⑤몢 硫덉톬?????щ┝???≫뙆???곗＜
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

