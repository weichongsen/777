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
        // 检查登录状态
        const isLoggedIn = await requireAuth();
        if (!isLoggedIn) return;
        
        // 检查用户角色并控制管理后台链接显示（使用 global.js 中的全局函数）
        await checkAdminAccess();
        
        // 初始化页面功能
        initScoreChart();
    });
});

function initScoreChart() {
    const chartDom = document.getElementById('scoreChart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    
    const option = {
        backgroundColor: 'transparent',
        grid: {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        },
        xAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: {
                lineStyle: { color: 'rgba(0, 245, 255, 0.3)' }
            },
            axisLabel: {
                color: 'rgba(255, 255, 255, 0.7)'
            }
        },
        yAxis: {
            type: 'value',
            min: 70,
            max: 100,
            axisLine: {
                lineStyle: { color: 'rgba(0, 245, 255, 0.3)' }
            },
            axisLabel: {
                color: 'rgba(255, 255, 255, 0.7)'
            },
            splitLine: {
                lineStyle: { color: 'rgba(0, 245, 255, 0.1)' }
            }
        },
        series: [{
            data: [85, 92, 88, 95, 89, 93, 91],
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
                color: '#00F5FF',
                width: 3
            },
            itemStyle: {
                color: '#00F5FF',
                borderColor: '#fff',
                borderWidth: 2
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(0, 245, 255, 0.4)' },
                    { offset: 1, color: 'rgba(0, 245, 255, 0.05)' }
                ])
            }
        }]
    };
    
    myChart.setOption(option);
    
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}