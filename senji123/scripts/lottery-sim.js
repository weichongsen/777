// 等待 Supabase 初始化完成（使用 global.js 中统一的 isSupabaseReady 检查）
function waitForSupabase(callback, retries = 80) {
    if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
        callback();
        return;
    }

    let attempts = 0;
    const tryCheck = () => {
        if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
            callback();
            return;
        } else if (attempts >= retries) {
            console.error('Supabase 初始化超时，重定向到登录页');
            window.location.href = 'login.html';
        } else {
            attempts++;
            setTimeout(tryCheck, 200);
        }
    };
    tryCheck();
}

document.addEventListener('DOMContentLoaded', () => {
    waitForSupabase(async () => {
        const isLoggedIn = await requireAuth();
        if (!isLoggedIn) return;
        await checkAdminAccess();
        initLotterySim();
    });
});

function initLotterySim() {
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const autoBtn = document.getElementById('autoBtn');
    const lottoSelector = document.getElementById('lottoSelector');
    const doubleColorSelector = document.getElementById('doubleColorSelector');
    
    let isLotto = true;
    let isRunning = false;
    
    lottoSelector.addEventListener('click', () => {
        if (!isRunning) {
            isLotto = true;
            lottoSelector.classList.add('active');
            doubleColorSelector.classList.remove('active');
            resetSlots();
        }
    });
    
    doubleColorSelector.addEventListener('click', () => {
        if (!isRunning) {
            isLotto = false;
            doubleColorSelector.classList.add('active');
            lottoSelector.classList.remove('active');
            resetSlots();
        }
    });
    
    startBtn.addEventListener('click', () => {
        if (!isRunning) {
            startLottery();
        }
    });
    
    resetBtn.addEventListener('click', resetSlots);
    
    autoBtn.addEventListener('click', () => {
        if (!isRunning) {
            autoRun();
        }
    });
    
    function resetSlots() {
        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => {
            slot.className = 'slot empty';
            slot.innerHTML = '';
        });
        
        const balls = document.querySelectorAll('.number-ball');
        balls.forEach((ball, index) => {
            ball.className = `number-ball${index >= 5 ? ' special' : ''}`;
            ball.textContent = String(index + 1).padStart(2, '0');
        });
    }
    
    function startLottery() {
        isRunning = true;
        startBtn.disabled = true;
        
        resetSlots();
        
        const numbers = isLotto ? generateLottoNumbers() : generateDoubleColorNumbers();
        const frontNums = isLotto ? numbers.front : numbers.red;
        const backNums = isLotto ? numbers.back : numbers.blue;
        
        const totalBalls = frontNums.length + backNums.length;
        let currentBall = 0;
        
        function drawNextBall() {
            if (currentBall >= totalBalls) {
                isRunning = false;
                startBtn.disabled = false;
                saveResult(numbers, isLotto ? 'lotto' : 'double-color');
                return;
            }
            
            const isFront = currentBall < frontNums.length;
            const num = isFront ? frontNums[currentBall] : backNums[currentBall - frontNums.length];
            const slotIndex = isFront ? currentBall : frontNums.length + (currentBall - frontNums.length);
            
            animateBallDraw(num, isFront, slotIndex);
            
            currentBall++;
            setTimeout(drawNextBall, 2000);
        }
        
        drawNextBall();
    }
    
    function animateBallDraw(num, isFront, slotIndex) {
        const ballElements = document.querySelectorAll('.number-ball');
        const ball = ballElements[slotIndex];
        const slots = isFront ? 
            document.querySelectorAll('#drawnFront .slot') : 
            document.querySelectorAll('#drawnBack .slot');
        
        ball.classList.add('rolling');
        
        let count = 0;
        const maxNum = isLotto ? (isFront ? 35 : 12) : (isFront ? 33 : 16);
        const rollInterval = setInterval(() => {
            count++;
            const randomNum = Math.floor(Math.random() * maxNum) + 1;
            ball.textContent = String(randomNum).padStart(2, '0');
            
            if (count >= 20) {
                clearInterval(rollInterval);
                ball.textContent = String(num).padStart(2, '0');
                ball.classList.remove('rolling');
                
                setTimeout(() => {
                    ball.classList.add('drawn');
                    
                    setTimeout(() => {
                        const slot = slots[isFront ? slotIndex : slotIndex - (isLotto ? 5 : 6)];
                        slot.className = `slot filled ${isFront ? 'red' : 'blue'}`;
                        slot.innerHTML = `<span class="ball-num">${String(num).padStart(2, '0')}</span>`;
                    }, 300);
                }, 500);
            }
        }, 80);
    }
    
    function autoRun() {
        startLottery();
        
        setTimeout(() => {
            if (!isRunning) {
                setTimeout(autoRun, 3000);
            }
        }, 3000);
    }
    
    function saveResult(numbers, type) {
        const resultsList = document.getElementById('resultsList');
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const frontBalls = type === 'lotto' ? numbers.front : numbers.red;
        const backBalls = type === 'lotto' ? numbers.back : numbers.blue;
        
        resultItem.innerHTML = `
            <span class="result-date">${new Date().toLocaleDateString()}</span>
            <span class="result-type">${type === 'lotto' ? '大乐透' : '双色球'}</span>
            <div class="result-balls">
                ${frontBalls.map(n => `<span class="ball red">${String(n).padStart(2, '0')}</span>`).join('')}
                ${backBalls.map(n => `<span class="ball blue">${String(n).padStart(2, '0')}</span>`).join('')}
            </div>
        `;
        
        resultsList.insertBefore(resultItem, resultsList.firstChild);
    }
}