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
        initProfile();
    });
});

function initProfile() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            panels[index].classList.add('active');
        });
    });
    
    const form = document.querySelector('.profile-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('信息已保存', 'success');
        });
    }
    
    const securityBtn = document.querySelector('.security-btn');
    if (securityBtn) {
        securityBtn.addEventListener('click', () => {
            showNotification('密码修改成功', 'success');
        });
    }
    
    const privacyBtn = document.querySelector('.privacy-btn');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', () => {
            showNotification('数据备份成功', 'success');
        });
    }
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        showNotification('已退出登录', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}