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
        initPredictions();
    });
});

function initPredictions() {
    const lotteryType = document.getElementById('lotteryType');
    const ratingFilter = document.getElementById('ratingFilter');
    const refreshBtn = document.getElementById('refreshBtn');
    
    lotteryType.addEventListener('change', filterPredictions);
    ratingFilter.addEventListener('change', filterPredictions);
    refreshBtn.addEventListener('click', refreshPredictions);
}

function filterPredictions() {
    const cards = document.querySelectorAll('.prediction-card');
    const type = document.getElementById('lotteryType').value;
    const rating = document.getElementById('ratingFilter').value;
    
    cards.forEach(card => {
        const cardType = card.querySelector('.lottery-type').textContent;
        const cardRating = card.querySelector('.rating').textContent;
        
        let show = true;
        
        if (type !== 'all') {
            const typeMap = {
                'lotto': '大乐透',
                'double-color': '双色球'
            };
            show = cardType === typeMap[type];
        }
        
        if (rating !== 'all' && show) {
            show = cardRating === rating;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

function refreshPredictions() {
    showNotification('正在刷新预测...', 'success');
    
    setTimeout(() => {
        showNotification('预测已刷新', 'success');
    }, 1500);
}