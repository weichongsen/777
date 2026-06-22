// 等待 Supabase 初始化完成（带超时和事件通知）
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
            console.error('Supabase 初始化超时');
            if (typeof showNotification === 'function') {
                showNotification('系统初始化失败，请刷新页面', 'error');
            }
        } else {
            attempts++;
            setTimeout(tryCheck, 200);
        }
    };
    tryCheck();
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // 等待 Supabase 就绪后再检查登录状态
    waitForSupabase(() => {
        checkAuth();
    });
});

async function checkAuth() {
    const client = getSupabase();
    if (!client) return;
    try {
        const { data: { session } } = await client.auth.getSession();
        if (session) {
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error('检查登录状态失败:', err);
    }
}

function setButtonLoading(loading) {
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    if (!submitBtn) return;
    const btnText = submitBtn.querySelector('.btn-text');
    if (loading) {
        submitBtn.dataset.originalText = btnText ? btnText.textContent : '注册';
        if (btnText) btnText.textContent = '注册中...';
        submitBtn.disabled = true;
    } else {
        if (btnText && submitBtn.dataset.originalText) btnText.textContent = submitBtn.dataset.originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const client = getSupabase();
    if (!client) {
        showNotification('系统初始化中，请稍后重试', 'error');
        return;
    }

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms');

    if (!username || !email || !password || !confirmPassword) {
        showNotification('请填写所有字段', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('两次输入的密码不一致', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('密码长度至少6位', 'error');
        return;
    }

    if (agreeTerms && !agreeTerms.checked) {
        showNotification('请先勾选同意服务条款', 'error');
        return;
    }

    setButtonLoading(true);

    try {
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username
                }
            }
        });

        if (error) {
            console.error('注册失败:', error);
            showNotification('注册失败：' + (error.message || '请检查输入信息'), 'error');
        } else if (data && data.user) {
            if (data.session) {
                showNotification('注册成功，正在跳转...', 'success');
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            } else {
                // 邮箱需要邮箱验证
                showNotification('注册成功，请查收邮箱验证邮件进行验证后登录', 'success');
                setTimeout(() => { window.location.href = 'login.html'; }, 3000);
            }
        } else {
            showNotification('注册成功，请登录', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        }
    } catch (err) {
        console.error('注册异常:', err);
        showNotification('网络错误，请稍后重试', 'error');
    } finally {
        setButtonLoading(false);
    }
}
