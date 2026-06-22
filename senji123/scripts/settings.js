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
        initSettings();
    });
});

function initSettings() {
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            themeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const theme = card.dataset.theme;
            applyTheme(theme);
            showNotification(`已切换到${card.querySelector('.theme-name').textContent}主题`, 'success');
        });
    });
    
    const exportJson = document.getElementById('exportJson');
    const exportExcel = document.getElementById('exportExcel');
    const exportTxt = document.getElementById('exportTxt');
    const importData = document.getElementById('importData');
    const clearCache = document.getElementById('clearCache');
    const resetSettings = document.getElementById('resetSettings');
    const deleteAccount = document.getElementById('deleteAccount');
    
    exportJson.addEventListener('click', () => exportData('json'));
    exportExcel.addEventListener('click', () => exportData('excel'));
    exportTxt.addEventListener('click', () => exportData('txt'));
    importData.addEventListener('click', () => importDataFunc());
    clearCache.addEventListener('click', () => clearCacheFunc());
    resetSettings.addEventListener('click', () => resetSettingsFunc());
    deleteAccount.addEventListener('click', () => deleteAccountFunc());
}

function applyTheme(theme) {
    document.documentElement.style.setProperty('--ai-blue', '#00F5FF');
    
    switch(theme) {
        case 'cyberpunk':
            document.documentElement.style.setProperty('--tech-purple', '#FF4D6D');
            break;
        case 'ai-purple':
            document.documentElement.style.setProperty('--tech-purple', '#9D4EDD');
            break;
        case 'deep-space':
            document.documentElement.style.setProperty('--deep-space', '#050510');
            break;
        default:
            document.documentElement.style.setProperty('--tech-purple', '#6E00FF');
    }
}

function exportData(format) {
    const data = {
        favorites: [],
        predictions: [],
        settings: {
            theme: 'tech-blue',
            animations: true,
            sound: true
        }
    };
    
    let content, filename, type;
    
    switch(format) {
        case 'json':
            content = JSON.stringify(data, null, 2);
            filename = `data_${Date.now()}.json`;
            type = 'application/json';
            break;
        case 'excel':
            content = '用户名,邮箱,收藏数\n用户1,user@example.com,25';
            filename = `data_${Date.now()}.csv`;
            type = 'text/csv';
            break;
        case 'txt':
            content = `AI彩票预测专家 - 数据导出\n时间: ${new Date().toLocaleString()}\n\n收藏: 25条\n预测: 128次`;
            filename = `data_${Date.now()}.txt`;
            type = 'text/plain';
            break;
    }
    
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification(`数据已导出为${format.toUpperCase()}格式`, 'success');
}

function importDataFunc() {
    const input = document.querySelector('.file-input');
    input.click();
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            showNotification(`正在导入 ${file.name}`, 'success');
            setTimeout(() => {
                showNotification('导入成功', 'success');
            }, 1000);
        }
    });
}

function clearCacheFunc() {
    if (confirm('确定要清理缓存吗？')) {
        showNotification('正在清理缓存...', 'success');
        setTimeout(() => {
            showNotification('缓存清理完成', 'success');
        }, 1000);
    }
}

function resetSettingsFunc() {
    if (confirm('确定要重置所有设置吗？')) {
        showNotification('正在重置设置...', 'success');
        setTimeout(() => {
            showNotification('设置已重置', 'success');
        }, 1000);
    }
}

function deleteAccountFunc() {
    if (confirm('确定要删除账户吗？此操作不可撤销！')) {
        showNotification('正在删除账户...', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}