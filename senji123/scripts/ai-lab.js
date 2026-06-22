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
        initAILab();
    });
});

function initAILab() {
    initWeightSliders();
    initStrategyCards();
    initAdvancedSettings();
}

function initWeightSliders() {
    const sliders = document.querySelectorAll('.slider');
    const totalWeight = document.getElementById('totalWeight');
    const totalStatus = document.querySelector('.total-status');
    
    sliders.forEach(slider => {
        slider.addEventListener('input', updateTotalWeight);
    });
    
    function updateTotalWeight() {
        let total = 0;
        sliders.forEach(slider => {
            total += parseInt(slider.value);
        });
        
        totalWeight.textContent = total + '%';
        
        const weightValueElements = document.querySelectorAll('.weight-value');
        sliders.forEach((slider, index) => {
            weightValueElements[index].textContent = slider.value + '%';
        });
        
        if (total === 100) {
            totalStatus.textContent = '推荐范围';
            totalStatus.className = 'total-status success';
        } else {
            totalStatus.textContent = '超出推荐范围';
            totalStatus.className = 'total-status warning';
        }
    }
    
    document.getElementById('resetWeights').addEventListener('click', () => {
        const defaultWeights = {
            hotWeight: 20,
            coldWeight: 10,
            missWeight: 20,
            sumWeight: 10,
            parityWeight: 5,
            markovWeight: 20,
            monteWeight: 15,
            consecWeight: 10
        };
        
        Object.entries(defaultWeights).forEach(([id, value]) => {
            const slider = document.getElementById(id);
            if (slider) slider.value = value;
        });
        
        updateTotalWeight();
        showNotification('权重已重置为默认值', 'success');
    });
    
    document.getElementById('saveWeights').addEventListener('click', () => {
        const weights = {};
        sliders.forEach(slider => {
            weights[slider.id] = slider.value;
        });
        
        showNotification('权重配置已保存', 'success');
    });
}

function initStrategyCards() {
    const strategyCards = document.querySelectorAll('.strategy-card');
    
    strategyCards.forEach(card => {
        card.addEventListener('click', () => {
            strategyCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const strategyName = card.querySelector('.strategy-name').textContent;
            showNotification(`已选择策略：${strategyName}`, 'success');
        });
    });
}

function initAdvancedSettings() {
    const optionBtns = document.querySelectorAll('.option-btn');
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.parentElement;
            group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    const bayesSlider = document.getElementById('bayesPrior');
    const sliderValue = document.querySelector('.slider-value');
    
    bayesSlider.addEventListener('input', () => {
        sliderValue.textContent = bayesSlider.value + '%';
    });
    
    document.getElementById('runSimulation').addEventListener('click', () => {
        showNotification('正在运行模拟分析...', 'success');
        
        setTimeout(() => {
            showNotification('模拟完成', 'success');
        }, 2000);
    });
}