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
        initLotto();
    });
});

function initLotto() {
    const frontGrid = document.getElementById('frontGrid');
    const backGrid = document.getElementById('backGrid');
    const selectedFront = document.getElementById('selectedFront');
    const selectedBack = document.getElementById('selectedBack');
    
    const selectedFrontNums = [];
    const selectedBackNums = [];
    
    frontGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('num-btn')) {
            const num = e.target.dataset.num;
            const index = selectedFrontNums.indexOf(num);
            
            if (index > -1) {
                selectedFrontNums.splice(index, 1);
                e.target.classList.remove('selected');
            } else if (selectedFrontNums.length < 5) {
                selectedFrontNums.push(num);
                e.target.classList.add('selected');
            }
            
            updateSelectedDisplay();
        }
    });
    
    backGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('num-btn')) {
            const num = e.target.dataset.num;
            const index = selectedBackNums.indexOf(num);
            
            if (index > -1) {
                selectedBackNums.splice(index, 1);
                e.target.classList.remove('selected');
            } else if (selectedBackNums.length < 2) {
                selectedBackNums.push(num);
                e.target.classList.add('selected');
            }
            
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
        selectedFront.innerHTML = '';
        selectedBack.innerHTML = '';
        
        selectedFrontNums.sort().forEach(num => {
            const ball = document.createElement('div');
            ball.className = 'ball red';
            ball.textContent = num;
            selectedFront.appendChild(ball);
        });
        
        selectedBackNums.sort().forEach(num => {
            const ball = document.createElement('div');
            ball.className = 'ball blue';
            ball.textContent = num;
            selectedBack.appendChild(ball);
        });
    }
    
    function randomSelect() {
        const frontBtn = frontGrid.querySelectorAll('.num-btn');
        const backBtn = backGrid.querySelectorAll('.num-btn');
        
        frontBtn.forEach(btn => btn.classList.remove('selected'));
        backBtn.forEach(btn => btn.classList.remove('selected'));
        
        selectedFrontNums.length = 0;
        selectedBackNums.length = 0;
        
        const frontRandom = getRandomNumbers(1, 35, 5).map(n => formatNumber(n));
        const backRandom = getRandomNumbers(1, 12, 2).map(n => formatNumber(n));
        
        frontRandom.forEach(num => {
            const btn = frontGrid.querySelector(`[data-num="${num}"]`);
            if (btn) btn.classList.add('selected');
            selectedFrontNums.push(num);
        });
        
        backRandom.forEach(num => {
            const btn = backGrid.querySelector(`[data-num="${num}"]`);
            if (btn) btn.classList.add('selected');
            selectedBackNums.push(num);
        });
        
        updateSelectedDisplay();
    }
    
    function clearSelection() {
        const frontBtn = frontGrid.querySelectorAll('.num-btn');
        const backBtn = backGrid.querySelectorAll('.num-btn');
        
        frontBtn.forEach(btn => btn.classList.remove('selected'));
        backBtn.forEach(btn => btn.classList.remove('selected'));
        
        selectedFrontNums.length = 0;
        selectedBackNums.length = 0;
        
        updateSelectedDisplay();
        
        document.getElementById('resultsGrid').innerHTML = '';
    }
    
    function generatePredictions(count) {
        const resultsGrid = document.getElementById('resultsGrid');
        resultsGrid.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const prediction = generateLottoNumbers();
            const rating = calculateAIRating(prediction);
            
            const card = document.createElement('div');
            card.className = 'prediction-card';
            card.innerHTML = `
                <div class="prediction-header">
                    <span class="prediction-number">预测 #${i + 1}</span>
                    <span class="prediction-rating ${rating.rating}">${rating.rating}</span>
                </div>
                <div class="prediction-balls" data-index="${i}">
                    ${prediction.front.map(n => `<span class="ball red">${formatNumber(n)}</span>`).join('')}
                    ${prediction.back.map(n => `<span class="ball blue">${formatNumber(n)}</span>`).join('')}
                </div>
                <div class="prediction-score">可信度: <span>${rating.score}%</span></div>
                <div class="card-actions">
                    <button class="card-action-btn" onclick="saveFavoritePrediction(${JSON.stringify(prediction)}, 'lotto')">收藏</button>
                    <button class="card-action-btn" onclick="savePrediction(${JSON.stringify(prediction)}, 'lotto', '${rating.rating}', ${rating.score})">保存</button>
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
        const maxNum = ball.classList.contains('red') ? 35 : 12;
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