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
        initVisualization();
    });
});

function initCharts() {
    initHotTrendChart();
    initColdTrendChart();
    initMissTrendChart();
    initHeatmapChart();
    initParityPieChart();
    initSizePieChart();
    initScoreTrendChart();
    initSumDistChart();
    initConsecChart();
    
    document.getElementById('refreshCharts').addEventListener('click', refreshAllCharts);
}

function initHotTrendChart() {
    const chart = echarts.init(document.getElementById('hotTrendChart'));
    chart.setOption({
        backgroundColor: 'transparent',
        grid: { top: 30, right: 30, bottom: 40, left: 60 },
        xAxis: {
            type: 'category',
            data: ['第1期', '第2期', '第3期', '第4期', '第5期', '第6期', '第7期', '第8期', '第9期', '第10期'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.1)' } }
        },
        series: [{
            data: [85, 92, 88, 95, 89, 93, 91, 87, 94, 90],
            type: 'line',
            smooth: true,
            lineStyle: { color: '#00F5FF', width: 3 },
            itemStyle: { color: '#00F5FF' },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(0, 245, 255, 0.4)' },
                    { offset: 1, color: 'rgba(0, 245, 255, 0.05)' }
                ])
            }
        }]
    });
    window.addEventListener('resize', () => chart.resize());
}

function initColdTrendChart() {
    const chart = echarts.init(document.getElementById('coldTrendChart'));
    chart.setOption({
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 50 },
        xAxis: {
            type: 'category',
            data: ['01', '04', '17', '33', '07'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.1)' } }
        },
        series: [{
            data: [15, 12, 10, 8, 6],
            type: 'bar',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#4ECDC4' },
                    { offset: 1, color: '#44A08D' }
                ]),
                borderRadius: [4, 4, 0, 0]
            }
        }]
    });
    window.addEventListener('resize', () => chart.resize());
}

function initMissTrendChart() {
    const chart = echarts.init(document.getElementById('missTrendChart'));
    chart.setOption({
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 50 },
        xAxis: {
            type: 'category',
            data: ['04', '17', '33', '07', '29'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.1)' } }
        },
        series: [{
            data: [15, 12, 10, 8, 6],
            type: 'line',
            smooth: true,
            lineStyle: { color: '#FF4D6D', width: 3 },
            itemStyle: { color: '#FF4D6D' },
            symbol: 'circle',
            symbolSize: 8
        }]
    });
    window.addEventListener('resize', () => chart.resize());
}

function initHeatmapChart() {
    const chart = echarts.init(document.getElementById('heatmapChart'));
    const data = [];
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 5; j++) {
            data.push([j, i, Math.floor(Math.random() * 50) + 10]);
        }
    }
    chart.setOption({
        backgroundColor: 'transparent',
        grid: { top: 30, right: 30, bottom: 50, left: 50 },
        xAxis: {
            type: 'category',
            data: ['号码1', '号码2', '号码3', '号码4', '号码5'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }
        },
        yAxis: {
            type: 'category',
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }
        },
        visualMap: {
            min: 0,
            max: 60,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0',
            textStyle: { color: '#fff' },
            inRange: {
                color: ['#0B1020', '#00F5FF', '#6E00FF', '#FF4D6D']
            }
        },
        series: [{
            data: data,
            type: 'heatmap',
            itemStyle: { borderRadius: 4, borderColor: 'rgba(0, 245, 255, 0.2)' }
        }]
    });
    window.addEventListener('resize', () => chart.resize());
}

function initParityPieChart() {
    const chart = echarts.init(document.getElementById('parityPieChart'));
    chart.setOption({
        backgroundColor: 'transparent',
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#0B1020',
                borderWidth: 3
            },
            label: {
                show: true,
                color: '#fff',
                fontSize: 12
            },
            labelLine: {
                lineStyle: { color: 'rgba(0, 245, 255, 0.3)' }
            },
            data: [
                { value: 52, name: '奇数', itemStyle: { color: '#00F5FF' } },
                { value: 48, name: '偶数', itemStyle: { color: '#6E00FF' } }
            ]
        }]
    });
    window.addEventListener('resize', () => chart.resize());
}

function initSizePieChart() {
    const chart = echarts.init(document.getElementById('sizePieChart'));
    chart.setOption({
        backgroundColor: 'transparent',
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#0B1020',
                borderWidth: 3
            },
            label: {
                show: true,
                color: '#fff',
                fontSize: 12
            },
            labelLine: {
                lineStyle: { color: 'rgba(0, 245, 255, 0.3)' }
            },
            data: [
                { value: 58, name: '大号', itemStyle: { color: '#00FF9D' } },
                { value: 42, name: '小号', itemStyle: { color: '#4ECDC4' } }
            ]
        }]
    });
    window.addEventListener('resize', () => chart.resize());
}

function initScoreTrendChart() {
    const chart = echarts.init(document.getElementById('scoreTrendChart'));
    chart.setOption({
        backgroundColor: 'transparent',
        grid: { top: 30, right: 30, bottom: 40, left: 60 },
        xAxis: {
            type: 'category',
            data: ['06-15', '06-16', '06-17', '06-18', '06-19', '06-20', '06-21'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            min: 70,
            max: 100,
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.1)' } }
        },
        series: [
            {
                name: '大乐透',
                data: [88, 92, 89, 95, 91, 94, 90],
                type: 'line',
                smooth: true,
                lineStyle: { color: '#FF4D6D', width: 3 },
                itemStyle: { color: '#FF4D6D' },
                symbol: 'circle',
                symbolSize: 8
            },
            {
                name: '双色球',
                data: [91, 87, 93, 89, 92, 88, 95],
                type: 'line',
                smooth: true,
                lineStyle: { color: '#00F5FF', width: 3 },
                itemStyle: { color: '#00F5FF' },
                symbol: 'circle',
                symbolSize: 8
            }
        ],
        legend: {
            data: ['大乐透', '双色球'],
            textStyle: { color: 'rgba(255, 255, 255, 0.7)' },
            bottom: 0
        }
    });
    window.addEventListener('resize', () => chart.resize());
}

function initSumDistChart() {
    const chart = echarts.init(document.getElementById('sumDistChart'));
    chart.setOption({
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 50 },
        xAxis: {
            type: 'category',
            data: ['60-70', '70-80', '80-90', '90-100', '100-110'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.1)' } }
        },
        series: [{
            data: [12, 28, 35, 18, 7],
            type: 'bar',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#00FF9D' },
                    { offset: 1, color: '#00F5FF' }
                ]),
                borderRadius: [4, 4, 0, 0]
            }
        }]
    });
    window.addEventListener('resize', () => chart.resize());
}

function initConsecChart() {
    const chart = echarts.init(document.getElementById('consecChart'));
    chart.setOption({
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 50 },
        xAxis: {
            type: 'category',
            data: ['无连号', '2连号', '3连号', '4连号', '5连号'],
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.3)' } },
            axisLabel: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 11 },
            splitLine: { lineStyle: { color: 'rgba(0, 245, 255, 0.1)' } }
        },
        series: [{
            data: [32, 45, 18, 4, 1],
            type: 'bar',
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#6E00FF' },
                    { offset: 1, color: '#00F5FF' }
                ]),
                borderRadius: [4, 4, 0, 0]
            }
        }]
    });
    window.addEventListener('resize', () => chart.resize());
}

function refreshAllCharts() {
    showNotification('正在刷新图表数据...', 'success');
    
    setTimeout(() => {
        initHotTrendChart();
        initColdTrendChart();
        initMissTrendChart();
        initHeatmapChart();
        initParityPieChart();
        initSizePieChart();
        initScoreTrendChart();
        initSumDistChart();
        initConsecChart();
        
        showNotification('图表已刷新', 'success');
    }, 1000);
}