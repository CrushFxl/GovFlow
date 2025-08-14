// 工作台模块逻辑
$(document).ready(function() {
    // 工作台页面加载时执行的逻辑
    function initDashboard() {
        // 初始化图表
        initDashboardChart();
        // 可以添加其他工作台特定的初始化逻辑
    }

    // 初始化工作台图表
    function initDashboardChart() {
        if (document.getElementById('study-chart')) {
            const ctx = document.getElementById('study-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['党史学习', '政策学习', '业务学习', '专题培训'],
                    datasets: [{
                        label: '已完成',
                        data: [85, 78, 92, 65],
                        backgroundColor: '#c12c1f',
                        borderWidth: 1
                    }, {
                        label: '进行中',
                        data: [15, 22, 8, 35],
                        backgroundColor: '#d4af37',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    // 暴露初始化函数供home.js调用
    window.dashboardModule = {
        init: initDashboard
    };
});