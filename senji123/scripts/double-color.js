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
        initDoubleColor();
    });
});

function initDoubleColor() {
    const redGrid = document.getElementById('redGrid');
    const blueGrid = document.getElementById('blueGrid');
    const selectedRed = document.getElementById('selectedRed');
    const selectedBlue = document.getElementById('selectedBlue');
    
    const selectedRedNums = [];
    const selectedBlueNums = [];
    
    redGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('num-btn')) {
            const num = e.target.dataset.num;
            const index = selectedRedNums.indexOf(num);
            
            if (index > -1) {
                selectedRedNums.splice(index, 1);
                e.target.classList.remove('selected');
            } else if (selectedRedNums.length < 6) {
                selectedRedNums.push(num);
                e.target.classList.add('selected');
            }
            
            updateSelectedDisplay();
        }
    });
    
    blueGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('num-btn')) {
            const num = e.target.dataset.num;
            
            blueGrid.querySelectorAll('.num-btn').forEach(btn => btn.classList.remove('selected'));
            selectedBlueNums.length = 0;
            
            selectedBlueNums.push(num);
            e.target.classList.add('selected');
            
            updateSelectedDisplay();
        }
    });
    
    document.getElementById('aiPredictBtn').addEventListener('click', () => {
        const count = document.querySelector('input[name="predictionCount"]:checked').value;
        generatePredictions(parseInt(count));
    });
    
    document.getElementById('randomBtn').addEventListener('click', () => {
        randomSelect();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        clearSelection();
    });
    
    function updateSelectedDisplay() {
        selectedRed.innerHTML = '';
        selectedBlue.innerHTML = '';
        
        selectedRedNums.sort().forEach(num => {
            const ball = document.createElement('div');
            ball.className = 'ball red';
            ball.textContent = num;
            selectedRed.appendChild(ball);
        });
        
        selectedBlueNums.forEach(num => {
            const ball = document.createElement('div');
            ball.className = 'ball blue';
            ball.textContent = num;
            selectedBlue.appendChild(ball);
        });
    }
    
    function randomSelect() {
        const redBtn = redGrid.querySelectorAll('.num-btn');
        const blueBtn = blueGrid.querySelectorAll('.num-btn');
        
        redBtn.forEach(btn => btn.classList.remove('selected'));
        blueBtn.forEach(btn => btn.classList.remove('selected'));
        
        selectedRedNums.length = 0;
        selectedBlueNums.length = 0;
        
        const redRandom = getRandomNumbers(1, 33, 6).map(n => formatNumber(n));
        const blueRandom = getRandomNumbers(1, 16, 1).map(n => formatNumber(n));
        
        redRandom.forEach(num => {
            const btn = redGrid.querySelector(`[data-num="${num}"]`);
            if (btn) btn.classList.add('selected');
            selectedRedNums.push(num);
        });
        
        blueRandom.forEach(num => {
            const btn = blueGrid.querySelector(`[data-num="${num}"]`);
            if (btn) btn.classList.add('selected');
            selectedBlueNums.push(num);
        });
        
        updateSelectedDisplay();
    }
    
    function clearSelection() {
        const redBtn = redGrid.querySelectorAll('.num-btn');
        const blueBtn = blueGrid.querySelectorAll('.num-btn');
        
        redBtn.forEach(btn => btn.classList.remove('selected'));
        blueBtn.forEach(btn => btn.classList.remove('selected'));
        
        selectedRedNums.length = 0;
        selectedBlueNums.length = 0;
        
        updateSelectedDisplay();
        
        document.getElementById('resultsGrid').innerHTML = '';
    }
    
    function generatePredictions(count) {
        const resultsGrid = document.getElementById('resultsGrid');
        resultsGrid.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const prediction = generateDoubleColorNumbers();
            const rating = calculateAIRating(prediction);
            
            const card = document.createElement('div');
            card.className = 'prediction-card';
            card.innerHTML = `
                <div class="prediction-header">
                    <span class="prediction-number">预测 #${i + 1}</span>
                    <span class="prediction-rating ${rating.rating}">${rating.rating}</span>
                </div>
                <div class="prediction-balls" data-index="${i}">
                    ${prediction.red.map(n => `<span class="ball red">${formatNumber(n)}</span>`).join('')}
                    ${prediction.blue.map(n => `<span class="ball blue">${formatNumber(n)}</span>`).join('')}
                </div>
                <div class="prediction-score">可信度: <span>${rating.score}%</span></div>
                <div class="card-actions">
                    <button class="card-action-btn" onclick="saveFavoritePrediction(${JSON.stringify(prediction)}, 'double-color')">收藏</button>
                    <button class="card-action-btn" onclick="savePrediction(${JSON.stringify(prediction)}, 'double-color', '${rating.rating}', ${rating.score})">保存</button>
                </div>
            `;
            
            resultsGrid.appendChild(card);
        }
        
        setTimeout(() => {
            animateAllBalls();
        }, 500);
    }
    
    function animateAllBalls() {
        const cards = document.querySelectorAll('.prediction-card');
        cards.forEach((card, cardIndex) => {
            const balls = card.querySelectorAll('.ball');
            balls.forEach((ball, ballIndex) => {
                setTimeout(() => {
                    animateBall(ball);
                }, cardIndex * 300 + ballIndex * 200);
            });
        });
    }
    
    function animateBall(ball) {
        const target = ball.textContent;
        ball.classList.add('rolling');
        
        let current = 0;
        const maxNum = ball.classList.contains('red') ? 33 : 16;
        const interval = setInterval(() => {
            current = Math.floor(Math.random() * maxNum) + 1;
            ball.textContent = formatNumber(current);
        }, 50);
        
        setTimeout(() => {
            clearInterval(interval);
            ball.textContent = target;
            ball.classList.remove('rolling');
        }, 1500);
    }
}

function saveFavoritePrediction(numbers, type) {
    saveFavorite(numbers, type);
}

function formatNumber(num) {
    return num.toString().padStart(2, '0');
}