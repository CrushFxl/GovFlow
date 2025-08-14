// 日程下发管理模块逻辑
$(document).ready(function() {
    // 分页参数
    const itemsPerPage = 6;
    let currentPage = 1;

    // 拉取数据
    const scheduleData = [
        { name: '庆祝建党102周年主题党日', time: '2023-07-01 14:00', location: '党员活动室', participants: '全体党员', status: 'completed', statusText: '已完成' },
        { name: '第二季度党员大会', time: '2023-06-25 15:30', location: '会议室', participants: '全体党员', status: 'completed', statusText: '已完成' },
        { name: '党史学习专题党课', time: '2023-06-15 09:00', location: '报告厅', participants: '全体党员', status: 'completed', statusText: '已完成' },
        { name: '七一文艺汇演筹备会', time: '2023-06-28 10:00', location: '党员活动室', participants: '文艺组成员', status: 'pending', statusText: '进行中' },
        { name: '组织生活会', time: '2023-07-10 14:00', location: '会议室', participants: '支部委员', status: 'upcoming', statusText: '未开始' },
        { name: '志愿服务活动', time: '2023-07-15 08:30', location: '社区中心', participants: '志愿者', status: 'canceled', statusText: '已取消' },
        { name: '党委扩大会议', time: '2023-07-20 15:00', location: '党委会议室', participants: '党委成员', status: 'upcoming', statusText: '未开始' },
        { name: '新党员入党宣誓仪式', time: '2023-07-01 09:00', location: '报告厅', participants: '新党员、党委成员', status: 'completed', statusText: '已完成' },
        { name: '党员先锋岗创建活动', time: '2023-07-05 14:30', location: '各部门', participants: '全体党员', status: 'pending', statusText: '进行中' }
    ];

    // 定位DOM元素
    const totalPages = Math.ceil(scheduleData.length / itemsPerPage);
    const tableBody = document.querySelector('#activity .table tbody');
    const prevBtn = document.querySelector('#activity .pagination .btn-outline:first-child');
    const nextBtn = document.querySelector('#activity .pagination .btn-outline:last-child');
    const pageInfo = document.querySelector('#activity .pagination .page-info');

    // 初始化日程模块
    function initActivity() {        
        renderTableData();
    }

    // 渲染日程
    function renderTableData() {
        tableBody.innerHTML = '';
        // 计算当前页的数据范围
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, scheduleData.length);
        const currentData = scheduleData.slice(startIndex, endIndex);
        // 渲染数据
        currentData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.time}</td>
                <td>${item.location}</td>
                <td>${item.participants}</td>
                <td><span class="status-badge status-${item.status}">${item.statusText}</span></td>
                <td>
                    <button class="btn-action btn-detail">详情</button>
                    <button class="btn-action btn-delete">删除</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        // 更新分页信息
        pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
        // 更新按钮状态
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        // 绑定详情和删除按钮事件
        bindTableButtons();
    }

    // 添加日程按钮点击事件
    document.getElementById('add-activity').addEventListener('click', function() {
        showLoading('AI识别中...');
        // ajax请求
        
    });

    // 详情按钮点击事件
    document.querySelectorAll('.btn-detail').forEach(btn => {
        btn.addEventListener('click', function() {
            const activityName = this.closest('tr').querySelector('td').textContent;
            alert('查看详情: ' + activityName);
        });
    });

    // 绑定表格按钮事件
    function bindTableButtons() {
        // 详情按钮点击事件
        document.querySelectorAll('.btn-detail').forEach(btn => {
            btn.addEventListener('click', function() {
                const activityName = this.closest('tr').querySelector('td').textContent;
                alert('查看详情: ' + activityName);
            });
        });
        // 删除按钮点击事件
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const activityName = this.closest('tr').querySelector('td').textContent;
                if(confirm('确定要删除日程 "' + activityName + '" 吗?')) {
                    alert('删除功能将在后续实现');
                }
            });
        });
    }

    // 上一页按钮点击事件
    prevBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderTableData();
        }
    });

    // 下一页按钮点击事件
    nextBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            renderTableData();
        }
    });

    // 暴露初始化函数供home.js调用
    window.activityModule = {
        init: initActivity
    };
});