// 页面加载完成后执行
$(document).ready(function() {
    const URL = $('#URL').text();
    
    // 页面元素
    const searchInput = $('#party_day_search_input');
    const searchButton = $('#party_day_search_button');
    const tableBody = $('#party_day_table_body');
    const prevPageButton = $('#party_day_prev_page');
    const nextPageButton = $('#party_day_next_page');
    const currentPageElement = $('#party_day_current_page');
    const totalPagesElement = $('#party_day_total_pages');
    const totalCountElement = $('#party_day_total_count');
    
    // 分页参数
    let currentPage = 1;
    const pageSize = 5;
    let totalPages = 1;
    let allRecords = [];
    
    // 初始化页面
    function initPartyDay() {
        console.log('主题党日页面初始化');
        searchButton.click(searchPartyDay);
        searchInput.keyup(function(e) {
            if (e.key === 'Enter') {
                searchPartyDay();
            }
        });
        prevPageButton.click(goToPrevPage);
        nextPageButton.click(goToNextPage);
        loadPartyDayData();
    }
    
    // 加载主题党日数据
    function loadPartyDayData() {
        // 显示加载状态
        tableBody.html('<tr><td colspan="6" class="dyfz_no_data">正在加载数据...</td></tr>');
        $.ajax({
            url: URL + `/party_day/get_records`,
            xhrFields: {withCredentials: true},
            data: {'task_type': '主题党日', 'uid': localStorage.getItem('uid')},
            type: 'POST',
            success: function(response) {
                if (response.code === 1000) {
                    allRecords = response.data;
                    totalPages = Math.ceil(allRecords.length / pageSize);
                    currentPage = 1;
                    renderTable();
                    updateStatistics();
                } else {
                    tableBody.html('<tr><td colspan="6" class="dyfz_no_data">' + (response.msg || '加载失败') + '</td></tr>');
                }
            },
            error: function() {
                tableBody.html('<tr><td colspan="6" class="dyfz_no_data">加载失败，请稍后再试</td></tr>');
            }
        });
    }
    
    // 搜索主题党日活动
    function searchPartyDay() {
        const keyword = searchInput.val().trim();
        if (!keyword) {
            alert('请输入活动标题进行查询');
            return;
        }
        // 发送请求查询活动 - 修改为调用filter_related_task_by_user相关接口
        $.ajax({
            url: URL + '/activity/query',
            xhrFields: {withCredentials: true},
            type: 'POST',
            data: {'task_type': 'party_day', 'uid': localStorage.getItem('uid'), 'keyword': keyword},
            success: function(response) {
                if (response.code === 1000) {
                    allRecords = response.data;
                    totalPages = Math.ceil(allRecords.length / pageSize);
                    currentPage = 1;
                    renderTable();
                    updateStatistics();
                } else {
                    alert('搜索失败：' + (response.msg || '未知错误'));
                }
            },
            error: function() {
                alert('搜索失败，请稍后再试');
            }
        });
    }
    
    // 日期时间格式化函数
    function formatDateTime(dateStr, timeStr) {
        if (!dateStr || dateStr === '') {
            return '';
        }
        
        let formattedDate = dateStr;
        // 确保日期格式正确（YYYY-MM-DD）
        if (dateStr && !dateStr.includes('-')) {
            // 处理可能的其他格式
            if (dateStr.length === 8) {
                formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
            }
        }
        
        if (timeStr && timeStr !== '') {
            return `${formattedDate} ${timeStr}`;
        }
        return formattedDate;
    }
    
    // 状态映射对象
    const statusMap = {
        1: 'status-pending',
        2: 'status-processing',
        3: 'status-completed',
        4: 'status-canceled'
    };
    
    // 状态文本映射对象
    const statusTextMap = {
        1: '待审核',
        2: '进行中',
        3: '已完成',
        4: '已取消'
    };
    
    // 渲染表格数据
    function renderTable() {
        // 计算当前页的数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, allRecords.length);
        const currentRecords = allRecords.slice(startIndex, endIndex);
        // 更新分页信息
        currentPageElement.text(currentPage);
        totalPagesElement.text(totalPages);
        // 更新分页按钮状态
        prevPageButton.prop('disabled', currentPage === 1);
        nextPageButton.prop('disabled', currentPage === totalPages);
        // 渲染表格内容
        if (currentRecords.length === 0) {
            tableBody.html('<tr><td colspan="6" class="dyfz_no_data">暂无数据</td></tr>');
            return;
        }
        let tableHtml = '';
        currentRecords.forEach(function(record, index) {
            // 获取活动标题
            const activityName = record.title || '未命名活动';
            
            // 格式化开始日期+时间和结束日期+时间
            const startTime = formatDateTime(record.start_date, record.start_time);
            const endTime = formatDateTime(record.end_date, record.end_time);
            
            // 获取状态信息
            const status = record.status || 0;
            
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${activityName}</td>
                    <td>${startTime}</td>
                    <td>${endTime}</td>
                    <td><span class="status-badge ${statusMap[status]}">${statusTextMap[status]}</span></td>
                    <td></td>
                </tr>
            `;
        });
        tableBody.html(tableHtml);
    }
    
    // 更新统计信息
    function updateStatistics() {
        totalCountElement.html(`总记录数: <span style="color: var(--primary-red);">${allRecords.length}</span>`);
    }
    
    // 跳转到上一页
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    }
    
    // 跳转到下一页
    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    }
    

    

    
    // 暴露初始化函数供home.js调用
    window.partyDayModule = {
        init: initPartyDay
    };
});