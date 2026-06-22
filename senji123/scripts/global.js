// Supabase 配置 - 请替换为您自己的值
const SUPABASE_URL = 'https://kltgecxywsajonxjsawz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3C8V8U4lPZUQ0xDYFzBLWA_2I_yR6q8';

// 初始化 Supabase 客户端（使用 supabaseClient 避免与 CDN 的 supabase 变量冲突）
let supabaseClient = null;
let supabaseReady = false;

// 为了兼容其他脚本，创建一个别名
window.supabaseClient = null;

function initSupabase() {
    // 检查 Supabase SDK 是否已加载（支持本地和 CDN 两种方式）
    // 本地版本：window.supabase 是一个对象，包含 createClient 方法
    // CDN 版本：window.supabase 是一个函数，也包含 createClient 方法
    if (typeof window !== 'undefined' && 
        typeof window.supabase !== 'undefined' &&
        typeof window.supabase.createClient === 'function') {
        try {
            // 创建客户端实例
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            // 同时设置到 window 对象供其他脚本使用
            window.supabaseClient = supabaseClient;
            supabaseReady = true;
            console.log('Supabase 已连接');
            // 派发事件通知其他脚本
            document.dispatchEvent(new Event('supabaseReady'));
            return true;
        } catch (err) {
            console.error('Supabase 初始化异常:', err);
        }
    }
    // 调试信息
    if (typeof window !== 'undefined') {
        console.log('Supabase SDK 状态:', {
            'window.supabase': typeof window.supabase,
            'window.supabase.createClient': typeof (window.supabase?.createClient)
        });
    }
    return false;
}

// 立即尝试初始化，如果失败则延迟重试
(function tryInitSupabase() {
    console.log('开始初始化 Supabase...');
    
    function tryInitialize(retriesLeft = 100, delay = 100) {
        if (initSupabase()) {
            console.log('Supabase 初始化成功');
            return;
        }
        
        if (retriesLeft <= 0) {
            console.error('Supabase SDK 加载超时，请检查网络或 CDN 地址');
            return;
        }
        
        console.log(`Supabase 初始化重试中，剩余次数: ${retriesLeft}`);
        
        setTimeout(() => {
            tryInitialize(retriesLeft - 1, Math.min(delay + 50, 500));
        }, delay);
    }
    
    tryInitialize();
})();

// 供外部脚本使用：判断 Supabase 是否已完成初始化
function isSupabaseReady() {
    return supabaseReady && supabaseClient !== null;
}

// 获取 Supabase 客户端的便捷函数
function getSupabase() {
    return supabaseClient;
}

function getRandomNumbers(min, max, count) {
    const numbers = [];
    while (numbers.length < count) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    return numbers.sort((a, b) => a - b);
}

function animateNumberBalls(balls) {
    balls.forEach((ball, index) => {
        setTimeout(() => {
            ball.classList.add('rolling');
            let current = 0;
            const target = parseInt(ball.textContent);
            const interval = setInterval(() => {
                current = Math.floor(Math.random() * 35) + 1;
                ball.textContent = current.toString().padStart(2, '0');
            }, 50);
            
            setTimeout(() => {
                clearInterval(interval);
                ball.textContent = target.toString().padStart(2, '0');
                ball.classList.remove('rolling');
            }, 1500 + index * 200);
        }, index * 500);
    });
}

function generateLottoNumbers() {
    const front = getRandomNumbers(1, 35, 5);
    const back = getRandomNumbers(1, 12, 2);
    return { front, back };
}

function generateDoubleColorNumbers() {
    const red = getRandomNumbers(1, 33, 6);
    const blue = getRandomNumbers(1, 16, 1);
    return { red, blue };
}

function calculateAIRating(numbers) {
    const score = Math.random() * 30 + 70;
    if (score >= 95) return { rating: 'SSS', score: score.toFixed(1) };
    if (score >= 90) return { rating: 'SS', score: score.toFixed(1) };
    if (score >= 85) return { rating: 'S', score: score.toFixed(1) };
    if (score >= 80) return { rating: 'A', score: score.toFixed(1) };
    return { rating: 'B', score: score.toFixed(1) };
}

function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

function exportNumbers(numbers, type) {
    const data = JSON.stringify(numbers, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_numbers_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// 等待 Supabase 完成初始化（带超时）
function waitForSupabaseReady(timeoutMs = 10000) {
    return new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
            if (isSupabaseReady()) {
                resolve(true);
            } else if (Date.now() - start > timeoutMs) {
                console.error('等待 Supabase 初始化超时');
                resolve(false);
            } else {
                setTimeout(check, 200);
            }
        };
        check();
    });
}

// 需要登录验证 - 保护需要登录才能访问的页面
async function requireAuth() {
    const ready = await waitForSupabaseReady();
    if (!ready) {
        showNotification('系统初始化中，请稍后刷新重试', 'error');
        return false;
    }

    try {
        const client = getSupabase();
        if (!client) {
            console.warn('Supabase 客户端未初始化，重定向到登录页');
            window.location.href = 'login.html';
            return false;
        }
        
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
            console.error('获取会话失败:', error);
            window.location.href = 'login.html';
            return false;
        }
        
        if (!session) {
            console.log('未检测到登录会话，重定向到登录页');
            window.location.href = 'login.html';
            return false;
        }
        
        console.log('已检测到有效会话，用户已登录');
        return true;
    } catch (err) {
        console.error('检查登录状态失败:', err);
        window.location.href = 'login.html';
        return false;
    }
}

// 检查管理员权限并控制管理员链接显示
async function checkAdminAccess() {
    const client = getSupabase();
    if (!client) return;

    try {
        const { data: { user } } = await client.auth.getUser();
        const adminIcons = document.querySelectorAll('.admin-icon');

        if (user && user.user_metadata && user.user_metadata.level === 'admin') {
            adminIcons.forEach(icon => { if (icon) icon.style.display = 'inline-block'; });
        } else {
            adminIcons.forEach(icon => { if (icon) icon.style.display = 'none'; });
        }
    } catch (err) {
        console.error('检查管理员权限失败:', err);
    }
}

// 退出登录
async function logout() {
    const client = getSupabase();
    if (client) {
        try {
            await client.auth.signOut();
        } catch (err) {
            console.error('退出登录失败:', err);
        }
    }
    window.location.href = 'login.html';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

async function saveFavorite(numbers, type) {
    const client = getSupabase();
    if (!client) {
        showNotification('系统初始化中，请稍后重试', 'error');
        return;
    }
    try {
        const { error } = await client
            .from('favorites')
            .insert({ numbers, type, created_at: new Date().toISOString() });
        if (error) {
            showNotification('保存失败: ' + error.message, 'error');
        } else {
            showNotification('收藏成功');
        }
    } catch (err) {
        console.error('保存收藏失败:', err);
        showNotification('保存失败，请稍后重试', 'error');
    }
}

async function getFavorites() {
    const client = getSupabase();
    if (!client) return [];
    try {
        const { data, error } = await client
            .from('favorites')
            .select('*')
            .order('created_at', { ascending: false });
        return error ? [] : (data || []);
    } catch (err) {
        console.error('获取收藏失败:', err);
        return [];
    }
}

async function deleteFavorite(id) {
    const client = getSupabase();
    if (!client) return;
    try {
        const { error } = await client
            .from('favorites')
            .delete()
            .eq('id', id);
        if (error) {
            showNotification('删除失败: ' + error.message, 'error');
        } else {
            showNotification('删除成功');
        }
    } catch (err) {
        console.error('删除收藏失败:', err);
        showNotification('删除失败，请稍后重试', 'error');
    }
}

async function savePrediction(numbers, type, rating, score) {
    const client = getSupabase();
    if (!client) {
        showNotification('系统初始化中，请稍后重试', 'error');
        return;
    }
    try {
        const { error } = await client
            .from('predictions')
            .insert({
                numbers,
                type,
                rating,
                score,
                created_at: new Date().toISOString()
            });
        if (error) {
            showNotification('保存失败: ' + error.message, 'error');
        } else {
            showNotification('预测记录已保存');
        }
    } catch (err) {
        console.error('保存预测失败:', err);
        showNotification('保存失败，请稍后重试', 'error');
    }
}

async function getPredictions(limit = 50) {
    const client = getSupabase();
    if (!client) return [];
    try {
        const { data, error } = await client
            .from('predictions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        return error ? [] : (data || []);
    } catch (err) {
        console.error('获取预测记录失败:', err);
        return [];
    }
}

async function deletePrediction(id) {
    const client = getSupabase();
    if (!client) return;
    try {
        const { error } = await client
            .from('predictions')
            .delete()
            .eq('id', id);
        if (error) {
            showNotification('删除失败: ' + error.message, 'error');
        } else {
            showNotification('删除成功');
        }
    } catch (err) {
        console.error('删除预测失败:', err);
        showNotification('删除失败，请稍后重试', 'error');
    }
}

async function getUserProfile() {
    const client = getSupabase();
    if (!client) return null;
    try {
        const { data: userData, error } = await client.auth.getUser();
        if (error || !userData || !userData.user) return null;

        const { data: profile, error: profileError } = await client
            .from('profiles')
            .select('*')
            .eq('id', userData.user.id)
            .single();

        return profileError ? null : profile;
    } catch (err) {
        console.error('获取用户资料失败:', err);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const particles = document.querySelector('.particle-background');
    if (particles) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.width = particle.style.height = `${Math.random() * 3 + 1}px`;
            particles.appendChild(particle);
        }
    }
});

document.addEventListener('mousemove', (e) => {
    const aura = document.createElement('div');
    aura.className = 'mouse-aura';
    aura.style.left = `${e.clientX}px`;
    aura.style.top = `${e.clientY}px`;
    document.body.appendChild(aura);
    
    setTimeout(() => {
        aura.classList.add('fade');
        setTimeout(() => {
            document.body.removeChild(aura);
        }, 1000);
    }, 10);
});