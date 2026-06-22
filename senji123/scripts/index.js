// 首页认证检查（不再自动重定向到登录页）
document.addEventListener('DOMContentLoaded', async () => {
    console.log('首页 DOM 加载完成');
    
    // 等待 Supabase 初始化
    let waitCount = 0;
    const maxWait = 50; // 最多等待 10 秒
    
    const waitForInit = () => {
        return new Promise((resolve) => {
            const check = () => {
                if (typeof isSupabaseReady === 'function' && isSupabaseReady()) {
                    resolve(true);
                } else if (waitCount >= maxWait) {
                    console.error('Supabase 初始化超时');
                    resolve(false);
                } else {
                    waitCount++;
                    setTimeout(check, 200);
                }
            };
            check();
        });
    };
    
    const ready = await waitForInit();
    if (!ready) {
        console.error('系统初始化失败');
        return;
    }
    
    console.log('开始检查登录状态');
    
    // 检查登录状态
    const client = getSupabase();
    if (!client) {
        console.error('Supabase 客户端未初始化');
        return;
    }
    
    try {
        const { data: { session }, error } = await client.auth.getSession();
        
        if (error) {
            console.error('获取会话失败:', error);
            return;
        }
        
        if (!session) {
            console.log('未登录，显示登录提示');
            // 不重定向，只是显示提示
            return;
        }
        
        console.log('已登录，用户ID:', session.user.id);
        
        // 检查用户角色并控制管理后台链接显示
        await checkAdminAccess();
        
        // 初始化页面功能
        initScoreChart();
    } catch (err) {
        console.error('检查登录状态失败:', err);
    }
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