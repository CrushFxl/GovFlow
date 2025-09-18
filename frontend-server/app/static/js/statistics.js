// 统计分析模块逻辑
$(document).ready(function() {
    /**
     * 统计分析模块
     */
    const statisticsModule = {
        // 图表实例存储
        charts: {},
         
        // 初始化统计分析页面
        init() {
            console.log('初始化统计分析页面');
            this.initFilters();
            this.loadOverviewData();
            this.initCharts();
            this.loadActivitiesTable();
            this.initPagination();
        },
         
        // 初始化筛选器
        initFilters() {
            console.log('初始化筛选器');
             
            // 绑定时间范围变更事件
            const timeRangeSelect = document.getElementById('time-range');
            timeRangeSelect.addEventListener('change', () => {
                this.reloadData();
            });
             
            // 绑定党支部筛选变更事件
            const branchSelect = document.getElementById('branch-filter');
            branchSelect.addEventListener('change', () => {
                this.reloadData();
            });
             
            // 绑定导出按钮点击事件
            const exportBtn = document.getElementById('export-btn');
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
             
            // 加载党支部数据
            this.loadBranchOptions();
        },
         
        // 加载党支部选项
        loadBranchOptions() {
            const branchSelect = document.getElementById('branch-filter');
             
            // 发送API请求获取党支部数据
            fetch('/api/statistics/branch_list')
                .then(response => response.json())
                .then(data => {
                    if (data.code === 0 && data.data && data.data.branches) {
                        // 清空现有选项（保留"全部"选项）
                        branchSelect.innerHTML = '<option value="all">全部党支部</option>';
                         
                        // 添加党支部选项
                        data.data.branches.forEach(branch => {
                            const option = document.createElement('option');
                            option.value = branch.id;
                            option.textContent = branch.name;
                            branchSelect.appendChild(option);
                        });
                    }
                })
        },
         
        // 加载概览数据
        loadOverviewData() {
            console.log('加载概览数据');
             
            // 显示加载状态
            this.showLoading(true);
             
            // 获取筛选参数
            const params = this.getFilterParams();
             
            // 构建请求URL
            const url = `/api/statistics/overview?branch_id=${params.branch_id}&time_range=${params.time_range}`;
             
            // 发送API请求
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.showLoading(false);
                     
                    if (data.code === 0 && data.data) {
                        // 更新数据概览卡片
                        document.getElementById('total-members').textContent = data.data.totalMembers || 0;
                        document.getElementById('pending-tasks').textContent = data.data.pendingTasks || 0;
                        document.getElementById('completed-tasks').textContent = data.data.completedTasks || 0;
                        document.getElementById('branch-activity').textContent = `${data.data.branchActivity || 0}%`;
                    } else {
                        console.error('获取概览数据失败:', data.message);
                        // 使用模拟数据
                        this.loadMockOverviewData();
                    }
                })
                .catch(error => {
                    console.error('获取概览数据异常:', error);
                    this.showLoading(false);
                    // 使用模拟数据
                    this.loadMockOverviewData();
                });
        },
         
        // 加载模拟概览数据
        loadMockOverviewData() {
            document.getElementById('total-members').textContent = '148';
            document.getElementById('pending-tasks').textContent = '24';
            document.getElementById('completed-tasks').textContent = '135';
            document.getElementById('branch-activity').textContent = '88%';
        },
         
        // 初始化图表
        initCharts() {
            console.log('初始化图表');
             
            // 初始化活动趋势图
            this.initActivityTrendChart();
             
            // 初始化党员分布图
            this.initMemberDistributionChart();
             
            // 初始化任务完成情况图
            this.initTaskStatusChart();
             
            // 初始化支部活跃度图
            this.initBranchActivityChart();
        },
         
        // 初始化活动趋势图
        initActivityTrendChart() {
            const ctx = document.getElementById('activity-trend-chart').getContext('2d');
             
            // 获取筛选参数
            const params = this.getFilterParams();
             
            // 构建请求URL
            const url = `/api/statistics/activity_trend?branch_id=${params.branch_id}`;
             
            // 发送API请求
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.code === 0 && data.data) {
                        // 创建图表
                        this.charts.activityTrend = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: data.data.labels,
                                datasets: [{
                                    label: '活动数量',
                                    data: data.data.data,
                                    borderColor: '#3b82f6',
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    tension: 0.4,
                                    fill: true
                                }]
                            },
                            options: this.getChartOptions('活动趋势', '活动数量')
                        });
                    } else {
                        console.error('获取活动趋势数据失败:', data.message);
                        // 使用模拟数据
                        this.initMockActivityTrendChart(ctx);
                    }
                })
                .catch(error => {
                    console.error('获取活动趋势数据异常:', error);
                    // 使用模拟数据
                    this.initMockActivityTrendChart(ctx);
                });
        },
         
        // 初始化模拟活动趋势图
        initMockActivityTrendChart(ctx) {
            const labels = ['9月', '10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'];
            const data = [12, 19, 15, 28, 22, 30, 25, 35, 32, 28, 30, 33];
             
            this.charts.activityTrend = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '活动数量',
                        data: data,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: this.getChartOptions('活动趋势', '活动数量')
            });
        },
         
        // 初始化党员分布图
        initMemberDistributionChart() {
            const ctx = document.getElementById('member-distribution-chart').getContext('2d');
             
            // 发送API请求
            fetch('/api/statistics/member_distribution')
                .then(response => response.json())
                .then(data => {
                    if (data.code === 0 && data.data) {
                        // 创建图表
                        this.charts.memberDistribution = new Chart(ctx, {
                            type: 'pie',
                            data: {
                                labels: data.data.labels,
                                datasets: [{
                                    data: data.data.data,
                                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                                }]
                            },
                            options: this.getChartOptions('党员分布', '', true)
                        });
                    } else {
                        console.error('获取党员分布数据失败:', data.message);
                        // 使用模拟数据
                        this.initMockMemberDistributionChart(ctx);
                    }
                })
                .catch(error => {
                    console.error('获取党员分布数据异常:', error);
                    // 使用模拟数据
                    this.initMockMemberDistributionChart(ctx);
                });
        },
         
        // 初始化模拟党员分布图
        initMockMemberDistributionChart(ctx) {
            const labels = ['第一党支部', '第二党支部', '第三党支部', '第四党支部', '第五党支部'];
            const data = [32, 28, 25, 30, 28];
             
            this.charts.memberDistribution = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                    }]
                },
                options: this.getChartOptions('党员分布', '', true)
            });
        },
         
        // 初始化任务完成情况图
        initTaskStatusChart() {
            const ctx = document.getElementById('task-status-chart').getContext('2d');
             
            // 获取筛选参数
            const params = this.getFilterParams();
             
            // 构建请求URL
            const url = `/api/statistics/task_status?branch_id=${params.branch_id}`;
             
            // 发送API请求
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.code === 0 && data.data) {
                        // 创建图表
                        this.charts.taskStatus = new Chart(ctx, {
                            type: 'doughnut',
                            data: {
                                labels: data.data.labels,
                                datasets: [{
                                    data: data.data.data,
                                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
                                }]
                            },
                            options: this.getChartOptions('任务完成情况', '', true)
                        });
                    } else {
                        console.error('获取任务完成情况数据失败:', data.message);
                        // 使用模拟数据
                        this.initMockTaskStatusChart(ctx);
                    }
                })
                .catch(error => {
                    console.error('获取任务完成情况数据异常:', error);
                    // 使用模拟数据
                    this.initMockTaskStatusChart(ctx);
                });
        },
         
        // 初始化模拟任务完成情况图
        initMockTaskStatusChart(ctx) {
            const labels = ['已完成', '进行中', '待分配', '已逾期'];
            const data = [135, 45, 24, 12];
             
            this.charts.taskStatus = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
                    }]
                },
                options: this.getChartOptions('任务完成情况', '', true)
            });
        },
         
        // 初始化支部活跃度图
        initBranchActivityChart() {
            const ctx = document.getElementById('branch-activity-chart').getContext('2d');
             
            // 发送API请求
            fetch('/api/statistics/branch_activity')
                .then(response => response.json())
                .then(data => {
                    if (data.code === 0 && data.data) {
                        // 创建图表
                        this.charts.branchActivity = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: data.data.labels,
                                datasets: [{
                                    label: '活跃度(%)',
                                    data: data.data.data,
                                    backgroundColor: '#3b82f6'
                                }]
                            },
                            options: this.getChartOptions('支部活跃度', '活跃度(%)')
                        });
                    } else {
                        console.error('获取支部活跃度数据失败:', data.message);
                        // 使用模拟数据
                        this.initMockBranchActivityChart(ctx);
                    }
                })
                .catch(error => {
                    console.error('获取支部活跃度数据异常:', error);
                    // 使用模拟数据
                    this.initMockBranchActivityChart(ctx);
                });
        },
         
        // 初始化模拟支部活跃度图
        initMockBranchActivityChart(ctx) {
            const labels = ['第一党支部', '第二党支部', '第三党支部', '第四党支部', '第五党支部'];
            const data = [88, 92, 75, 80, 90];
             
            this.charts.branchActivity = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '活跃度(%)',
                        data: data,
                        backgroundColor: '#3b82f6'
                    }]
                },
                options: this.getChartOptions('支部活跃度', '活跃度(%)')
            });
        },
         
        // 获取图表通用配置
        getChartOptions(title, yLabel, isPie = false) {
            const options = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: isPie ? 'right' : 'top',
                    },
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 16
                        }
                    }
                }
            };
             
            if (!isPie) {
                options.scales = {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: yLabel
                        }
                    }
                };
            }
             
            return options;
        },
         
        // 加载活动表格数据
        loadActivitiesTable(page = 1) {
            console.log('加载活动表格数据，页码:', page);
              
            // 显示表格加载状态
            this.showTableLoading(true);
              
            // 获取筛选参数
            const params = this.getFilterParams();
              
            // 构建请求URL
            const url = `/api/statistics/recent_activities?page=${page}&page_size=10&branch_id=${params.branch_id}`;
              
            // 发送API请求
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.showTableLoading(false);
                       
                    if (data.code === 0 && data.data) {
                        // 更新表格数据
                        this.updateActivitiesTable(data.data.activities);
                           
                        // 更新分页信息
                        this.updatePagination(page, data.data.total, data.data.page_size);
                    } else {
                        console.error('获取活动数据失败:', data.message);
                        // 使用模拟数据
                        this.loadMockActivitiesTable(page);
                    }
                })
                .catch(error => {
                    console.error('获取活动数据异常:', error);
                    this.showTableLoading(false);
                    // 使用模拟数据
                    this.loadMockActivitiesTable(page);
                });
        },
         
        // 加载模拟活动表格数据
        loadMockActivitiesTable(page = 1) {
            // 模拟活动数据
            const activities = [
                {id: 1, name: '圳会日活动', type: '支部活动', participants: 28, completion: 95, branch: '第一党支部', createTime: '2025-09-10'},
                {id: 2, name: 'varpi', type: '学习活动', participants: 120, completion: 85, branch: '全部党支部', createTime: '2025-09-05'},
                {id: 3, name: '公益活动', type: '实践活动', participants: 45, completion: 78, branch: '第三党支部', createTime: '2025-08-28'},
                {id: 4, name: '组织生活会', type: '支部活动', participants: 32, completion: 100, branch: '第二党支部', createTime: '2025-08-20'},
                {id: 5, name: '民主评议党员', type: '评议活动', participants: 143, completion: 92, branch: '全部党支部', createTime: '2025-08-15'},
                {id: 6, name: '党课学习', type: '学习活动', participants: 95, completion: 88, branch: '第四党支部', createTime: '2025-08-10'},
                {id: 7, name: '红色教育基地参观', type: '实践活动', participants: 42, completion: 100, branch: '第五党支部', createTime: '2025-08-05'},
                {id: 8, name: '党员发展大会', type: '组织活动', participants: 58, completion: 100, branch: '第二党支部', createTime: '2025-08-01'},
                {id: 9, name: '专题学习研讨会', type: '学习活动', participants: 65, completion: 85, branch: '第一党支部', createTime: '2025-07-25'},
                {id: 10, name: '社区服务活动', type: '实践活动', participants: 48, completion: 92, branch: '第三党支部', createTime: '2025-07-20'}
            ];
             
            // 更新表格数据
            this.updateActivitiesTable(activities);
             
            // 更新分页信息
            this.updatePagination(page, activities.length, 10);
        },
         
        // 更新活动表格
        updateActivitiesTable(activities) {
            const tableBody = document.querySelector('#activities-table-body');
            tableBody.innerHTML = '';
              
            if (!activities || activities.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="6" class="text-center">暂无数据</td>';
                tableBody.appendChild(emptyRow);
                return;
            }
              
            activities.forEach(activity => {
                const row = document.createElement('tr');
                  
                // 设置完成率颜色
                let completionColor = 'text-danger';
                if (activity.completion >= 90) {
                    completionColor = 'text-success';
                } else if (activity.completion >= 60) {
                    completionColor = 'text-warning';
                }
                  
                row.innerHTML = `
                    <td>${activity.name}</td>
                    <td>${activity.type}</td>
                    <td>${activity.participants}</td>
                    <td>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar" role="progressbar" style="width: ${activity.completion}%;" aria-valuenow="${activity.completion}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <span class="${completionColor} text-sm">${activity.completion}%</span>
                    </td>
                    <td>${activity.branch}</td>
                    <td>${activity.createTime}</td>
                `;
                  
                tableBody.appendChild(row);
            });
        },
         
        // 初始化分页控件
        initPagination() {
            // 绑定分页点击事件
            document.querySelector('.pagination').addEventListener('click', (e) => {
                if (e.target.classList.contains('pagination-btn') && !e.target.disabled) {
                    // 获取页码
                    if (e.target.id === 'prev-page') {
                        // 找到当前激活的页码
                        const activePage = document.querySelector('.pagination-btn.active');
                        if (activePage && activePage.previousElementSibling && activePage.previousElementSibling !== e.target) {
                            const prevPageNum = parseInt(activePage.previousElementSibling.dataset.page);
                            this.loadActivitiesTable(prevPageNum);
                        }
                    } else if (e.target.id === 'next-page') {
                        // 找到当前激活的页码
                        const activePage = document.querySelector('.pagination-btn.active');
                        if (activePage && activePage.nextElementSibling && activePage.nextElementSibling !== e.target && activePage.nextElementSibling.textContent !== '...') {
                            const nextPageNum = parseInt(activePage.nextElementSibling.dataset.page);
                            this.loadActivitiesTable(nextPageNum);
                        } else if (activePage && activePage.nextElementSibling && activePage.nextElementSibling.textContent === '...') {
                            // 如果下一个是省略号，找到后面的页码
                            const nextPageBtn = activePage.nextElementSibling.nextElementSibling;
                            if (nextPageBtn && nextPageBtn !== e.target) {
                                const nextPageNum = parseInt(nextPageBtn.dataset.page);
                                this.loadActivitiesTable(nextPageNum);
                            }
                        }
                    } else if (e.target.dataset.page) {
                        const page = parseInt(e.target.dataset.page);
                        if (!isNaN(page)) {
                            this.loadActivitiesTable(page);
                        }
                    }
                }
            });
        },
          
        // 更新分页信息
        updatePagination(currentPage, totalCount, pageSize) {
            const totalPages = Math.ceil(totalCount / pageSize);
            const pagination = document.querySelector('.pagination');
              
            // 清空现有分页
            pagination.innerHTML = '';
              
            // 创建上一页按钮
            const prevBtn = document.createElement('button');
            prevBtn.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
            prevBtn.id = 'prev-page';
            prevBtn.textContent = '上一页';
            if (currentPage === 1) {
                prevBtn.disabled = true;
            }
            pagination.appendChild(prevBtn);
              
            // 创建页码按钮
            // 简化处理，只显示当前页和前后几页
            let startPage = Math.max(1, currentPage - 1);
            let endPage = Math.min(totalPages, currentPage + 1);
            
            // 如果当前页接近末尾，调整开始页
            if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - 2);
            }
            
            // 如果当前页接近开头，调整结束页
            if (startPage === 1) {
                endPage = Math.min(3, totalPages);
            }
            
            // 添加第一页按钮（如果不包含在当前范围）
            if (startPage > 1) {
                const firstPageBtn = document.createElement('button');
                firstPageBtn.className = 'pagination-btn';
                firstPageBtn.dataset.page = '1';
                firstPageBtn.textContent = '1';
                pagination.appendChild(firstPageBtn);
                
                if (startPage > 2) {
                    const ellipsis = document.createTextNode('...');
                    pagination.appendChild(ellipsis);
                }
            }
            
            // 添加中间的页码按钮
            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
                pageBtn.dataset.page = i;
                pageBtn.textContent = i;
                pagination.appendChild(pageBtn);
            }
            
            // 添加最后一页按钮（如果不包含在当前范围）
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    const ellipsis = document.createTextNode('...');
                    pagination.appendChild(ellipsis);
                }
                
                const lastPageBtn = document.createElement('button');
                lastPageBtn.className = 'pagination-btn';
                lastPageBtn.dataset.page = totalPages;
                lastPageBtn.textContent = totalPages;
                pagination.appendChild(lastPageBtn);
            }
              
            // 创建下一页按钮
            const nextBtn = document.createElement('button');
            nextBtn.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
            nextBtn.id = 'next-page';
            nextBtn.textContent = '下一页';
            if (currentPage === totalPages) {
                nextBtn.disabled = true;
            }
            pagination.appendChild(nextBtn);
        },
         
        // 获取筛选参数
        getFilterParams() {
            const timeRange = document.getElementById('time-range').value;
            const branchId = document.getElementById('branch-filter').value;
             
            return {
                time_range: timeRange,
                branch_id: branchId
            };
        },
         
        // 重新加载数据
        reloadData() {
            console.log('重新加载数据');
             
            // 重新加载概览数据
            this.loadOverviewData();
             
            // 销毁旧图表
            for (const chartKey in this.charts) {
                if (this.charts[chartKey]) {
                    this.charts[chartKey].destroy();
                }
            }
             
            // 重新初始化图表
            this.initCharts();
             
            // 重新加载活动表格数据
            this.loadActivitiesTable(1);
        },
         
        // 导出数据
        exportData() {
            console.log('导出数据');
             
            // 获取筛选参数
            const params = this.getFilterParams();
             
            // 构建导出参数
            const exportParams = {
                type: 'overview', // 可以是overview, charts, activities
                branch_id: params.branch_id,
                time_range: params.time_range
            };
             
            // 发送导出请求
            fetch('/api/statistics/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(exportParams)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.code === 0 && data.data) {
                        // 显示导出成功提示
                        alert(`数据导出成功，文件名：${data.data.filename}`);
                         
                        // 如果有下载链接，可以自动下载
                        if (data.data.download_url) {
                            window.open(data.data.download_url, '_blank');
                        }
                    } else {
                        alert('数据导出失败：' + (data.message || '未知错误'));
                    }
                })
                .catch(error => {
                    console.error('导出数据异常:', error);
                    alert('数据导出异常，请稍后重试');
                });
        },
         
        // 显示加载状态
        showLoading(show) {
            const loadingElement = document.getElementById('loading-overlay');
            if (loadingElement) {
                loadingElement.style.display = show ? 'flex' : 'none';
            }
        },
        
        // 显示表格加载状态
        showTableLoading(show) {
            const tableContainer = document.querySelector('.stats-table-container');
            const tableLoading = document.getElementById('table-loading');
               
            if (tableContainer && tableLoading) {
                tableContainer.style.opacity = show ? '0.5' : '1';
                tableLoading.style.display = show ? 'flex' : 'none';
            }
        }
    };
    
    // 暴露初始化函数供home.js调用
    window.statisticsModule = {
        init: function() {
            statisticsModule.init();
        }
    };
});