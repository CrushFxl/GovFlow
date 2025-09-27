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
    const statusFilter = $('#party_day_status_filter'); // 状态筛选下拉框
    
    // 分页参数
    let currentPage = 1;
    const pageSize = 5;
    let totalPages = 1;
    let allRecords = []; // 原始数据
    let filteredRecords = []; // 筛选后的数据
    
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
        statusFilter.change(filterByStatus); // 绑定状态筛选事件
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
                    filteredRecords = [...allRecords]; // 初始化筛选后数据
                    currentPage = 1;
                    filterByStatus(); // 应用状态筛选
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
        
        // 如果搜索框为空，则显示所有数据
        if (!keyword) {
            filteredRecords = [...allRecords];
            filterByStatus(); // 重新应用状态筛选
            return;
        }
        
        // 先尝试在本地过滤数据，确保只筛选主题党日类型的活动
        const tempRecords = allRecords.filter(record => {
            // 确保任务类型是主题党日
            if (record.task_type !== '主题党日') return false;
            
            const title = record.title || '';
            return title.toLowerCase().includes(keyword.toLowerCase());
        });
        
        filteredRecords = [...tempRecords];
        filterByStatus(); // 应用状态筛选
    }
    
    // 按状态筛选
    function filterByStatus() {
        const selectedStatus = statusFilter.val();
        
        // 如果选择全部，则使用所有筛选后的数据
        if (selectedStatus === 'all') {
            const themePartyDayRecords = filteredRecords.filter(record => record.task_type === '主题党日');
            totalPages = Math.ceil(themePartyDayRecords.length / pageSize);
            currentPage = 1;
            renderTable();
            updateStatistics();
            return;
        }
        
        // 根据状态筛选
        const statusValue = parseInt(selectedStatus);
        const filteredByStatus = filteredRecords.filter(record => {
            return record.task_type === '主题党日' && record.status === statusValue;
        });
        
        totalPages = Math.ceil(filteredByStatus.length / pageSize);
        currentPage = 1;
        renderTable();
        updateStatistics();
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

    // 绑定表格按钮事件
    function bindTableButtons() {
        // 先移除所有已存在的监听器
        document.querySelectorAll('.btn-detail, .btn-complete').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });

        // 绑定详情按钮事件
        document.querySelectorAll('.btn-detail').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                // 获取完整的数据
                const allData = [...allRecords];
                const item = allData.find(item => item.id === id);
                
                if (item) {
                    // 调用统一的详情显示函数
                    showTaskDetail(item);
                }
            });
        });
        
        // 绑定"去完成"按钮事件
        document.querySelectorAll('.btn-complete').forEach(button => {
            button.addEventListener('click', function() {
                const attachmentName = this.getAttribute('data-attachment');
                const taskId = this.getAttribute('data-id');
                
                // 打开"添加主题党日"的模态框
                openAddRecordModal(5, '主题党日');
                
                // 延迟一下，确保模态框已经渲染
                setTimeout(function() {
                    // 1. 查找任务选择下拉框并自动选择对应任务
                    const taskSelect = document.querySelector('#task-select');
                    if (taskSelect) {
                        // 遍历选项，查找与当前任务相关的选项
                        for (let i = 0; i < taskSelect.options.length; i++) {
                            if (taskSelect.options[i].text.includes(attachmentName) || 
                                taskSelect.options[i].value.includes(taskId)) {
                                taskSelect.value = taskSelect.options[i].value;
                                // 触发change事件，加载任务详情
                                $(taskSelect).trigger('change');
                                break;
                            }
                        }
                        // 禁止修改任务选择
                        taskSelect.disabled = true;
                    }
                    
                    // 2. 查找所有select元素，寻找可能包含附件名称的下拉框
                    const allSelects = document.querySelectorAll('select');
                    allSelects.forEach(select => {
                        // 检查这个select是否可能是附件选择框
                        for (let i = 0; i < select.options.length; i++) {
                            if (select.options[i].text === attachmentName || 
                                select.options[i].text.includes(attachmentName)) {
                                // 找到匹配的附件，设置并禁用
                                select.value = select.options[i].value;
                                select.disabled = true;
                                break;
                            }
                        }
                    });
                }, 300);
            });
        });
    }
    
    // 渲染表格数据
    function renderTable() {
        // 确保只显示主题党日类型的活动
        let displayRecords = filteredRecords.filter(record => record.task_type === '主题党日');
        
        // 应用状态筛选
        const selectedStatus = statusFilter.val();
        if (selectedStatus !== 'all') {
            const statusValue = parseInt(selectedStatus);
            displayRecords = displayRecords.filter(record => record.status === statusValue);
        }
        
        // 计算当前页的数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, displayRecords.length);
        const currentRecords = displayRecords.slice(startIndex, endIndex);
        // 更新分页信息
        currentPageElement.text(currentPage);
        totalPagesElement.text(Math.ceil(displayRecords.length / pageSize));
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
            
            // 构建操作按钮
            let actionButtons = `<button class="btn-action btn-detail" data-id="${record.id}" data-type="${record.type || 'meeting'}">详情</button>`;
            
            // 如果有attachment_name字段且不为空，则添加"去完成"按钮
            if (record.attachment_name && record.attachment_name !== '' && record.status === 2) {
                actionButtons += ` <button class="btn-action btn-complete" data-id="${record.id}" data-attachment="${record.attachment_name}">去完成</button>`;
            }
            
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${activityName}</td>
                    <td>${startTime}</td>
                    <td>${endTime}</td>
                    <td><span class="status-badge ${statusMap[status]}">${statusTextMap[status]}</span></td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        });
        tableBody.html(tableHtml);

        bindTableButtons();

    }
    
    // 更新统计信息
    function updateStatistics() {
        // 确保只统计主题党日类型的活动
        let displayRecords = filteredRecords.filter(record => record.task_type === '主题党日');
        
        // 应用状态筛选
        const selectedStatus = statusFilter.val();
        if (selectedStatus !== 'all') {
            const statusValue = parseInt(selectedStatus);
            displayRecords = displayRecords.filter(record => record.status === statusValue);
        }
        
        totalCountElement.html(`总记录数: <span style="color: var(--primary-red);">${displayRecords.length}</span>`);
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