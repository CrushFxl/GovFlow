// 三会一课模块逻辑

// 页面加载完成后执行
$(document).ready(function() {
    // 从home.html获取后端base_url
    const URL = $('#URL').text();
    
    // 页面元素
    const typeFilter = $('#meeting_type_filter');
    const statusFilter = $('#meeting_status_filter'); // 状态筛选下拉框
    const refreshButton = $('#meeting_refresh_button');
    const searchInput = $('#meeting_search_input');
    const searchButton = $('#meeting_search_button');
    const tableBody = $('#meeting_table_body');
    const prevPageButton = $('#meeting_prev_page');
    const nextPageButton = $('#meeting_next_page');
    const currentPageElement = $('#meeting_current_page');
    const totalPagesElement = $('#meeting_total_pages');
    const totalCountElement = $('#meeting_total_count');
    
    // 状态映射
    const statusMap = {
        1: 'status-pending',
        2: 'status-processing',
        3: 'status-completed',
        4: 'status-canceled'
    };

    const statusTextMap = {
        1: '待审核',
        2: '待处理',
        3: '已完成',
        4: '已取消'
    };

    // 分页参数
    let currentPage = 1;
    const pageSize = 5;
    let totalPages = 1;
    let allRecords = []; // 原始数据
    let filteredRecords = []; // 筛选后的数据
    
    // 初始化页面
    function initMeeting() {
        console.log('三会一课页面初始化');
        // 绑定事件
        refreshButton.click(loadMeetingData);
        searchButton.click(searchMeeting);
        searchInput.keyup(function(e) {
            if (e.key === 'Enter') {
                searchMeeting();
            }
        });
        prevPageButton.click(goToPrevPage);
        nextPageButton.click(goToNextPage);
        typeFilter.change(filterByType);
        statusFilter.change(filterByStatus); // 绑定状态筛选事件
        loadMeetingData()
    }
    
    // 加载三会一课数据
    function loadMeetingData() {
        // 显示加载状态
        tableBody.html('<tr><td colspan="7" class="dyfz_no_data">正在加载数据...</td></tr>');
        // 发送请求获取记录
        $.ajax({
            url: URL + `/get_meeting_records`,
            xhrFields: {withCredentials: true},
            type: 'POST',
            data: {'type' : 'all', 'keyword': '', 'uid': localStorage.getItem('uid')},
            success: function(response) {
                if (response.code === 1000) {
                    // 过滤掉通知类型任务
                    allRecords = response.data.filter(record => record.task_type !== '通知');
                    filteredRecords = [...allRecords]; // 初始化筛选后数据
                    currentPage = 1; // 重置为第一页
                    filterByType(); // 应用类型筛选
                } else {
                    tableBody.html('<tr><td colspan="6" class="dyfz_no_data">' + (response.msg || '加载失败') + '</td></tr>');
                }
            },
            error: function() {
                tableBody.html('<tr><td colspan="6" class="dyfz_no_data">加载失败，请稍后再试</td></tr>');
            }
        });
    }
    
    // 根据会议类型筛选
    function filterByType() {
        currentPage = 1;
        const meetingType = typeFilter.val();
        if (meetingType === 'all') {
            filteredRecords = [...allRecords];
        } else {
            filteredRecords = allRecords.filter(record => record.task_type === meetingType);
        }
        filterByStatus(); // 应用状态筛选
    }

    // 根据会议状态筛选
    function filterByStatus() {
        const status = statusFilter.val();
        let tempRecords = [...filteredRecords];
        
        if (status !== 'all') {
            tempRecords = tempRecords.filter(record => record.status.toString() === status);
        }
        
        // 计算总页数
        totalPages = Math.ceil(tempRecords.length / pageSize);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        renderTable(tempRecords);
        updateStatistics(tempRecords);
    }
    
    // 搜索会议
    function searchMeeting() {
        const keyword = searchInput.val().trim();
        if (!keyword) {
            alert('请输入会议标题进行查询');
            return;
        }
        
        // 在当前筛选结果中进行本地搜索
        const meetingType = typeFilter.val();
        let searchRecords = allRecords;
        
        // 先应用类型筛选
        if (meetingType !== 'all') {
            searchRecords = searchRecords.filter(record => record.task_type === meetingType);
        }
        
        // 应用关键词搜索
        searchRecords = searchRecords.filter(record => 
            record.title.toLowerCase().includes(keyword.toLowerCase()) ||
            (record.description && record.description.toLowerCase().includes(keyword.toLowerCase()))
        );
        
        // 更新筛选记录并应用状态筛选
        filteredRecords = [...searchRecords];
        currentPage = 1;
        filterByStatus();
    }
    
    // 渲染表格数据
    function renderTable(records) {
        // 使用传入的records参数，如果没有则使用filteredRecords
        const dataToRender = records || filteredRecords;
        
        // 计算当前页的数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, dataToRender.length);
        const currentRecords = dataToRender.slice(startIndex, endIndex);
        
        // 更新分页信息
        currentPageElement.text(currentPage);
        totalPagesElement.text(totalPages);
        
        // 更新分页按钮状态
        prevPageButton.prop('disabled', currentPage === 1);
        nextPageButton.prop('disabled', currentPage === totalPages);
        
        // 渲染表格内容
        if (currentRecords.length === 0) {
            tableBody.html('<tr><td colspan="7" class="dyfz_no_data">暂无数据</td></tr>');
            return;
        }
        
        let tableHtml = '';
        currentRecords.forEach(function(record, index) {
            // 格式化日期 - 使用created_time代替created_at
            const submitTime = new Date(record.created_time).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // 处理会议纪要过长的情况，超出部分用省略号显示 - 使用description代替summary
            let summary = record.description || '';
            const maxSummaryLength = 18;
            const fullSummary = summary;
            if (summary.length > maxSummaryLength) {
                summary = summary.substring(0, maxSummaryLength) + '...';
            }
            
            // 获取会议类型 - 使用task_type代替type
            const meetingType = record.task_type;
            
            // 获取状态信息
            const status = record.status;
            const statusText = statusTextMap[status];
            const statusClass = statusMap[status];
            
            // 构建操作按钮
            let actionButtons = `<button class="btn-action btn-detail" data-id="${record.id}" data-type="${record.type || 'meeting'}">详情</button>`;
            
            // 如果有attachment_name且不为空，则添加"去完成"按钮
            if (record.attachment_name && record.attachment_name.trim() !== '' && record.status === 2) {
                actionButtons += ` <button class="btn-action btn-complete" data-id="${record.id}" data-attachment="${record.attachment_name}" data-type="${record.type || 'meeting'}">去完成</button>`;
            }
            
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${record.title}</td>
                    <td>${meetingType}</td>
                    <td><span class="meeting-summary" title="${fullSummary}">${summary}</span></td>
                    <td>${submitTime}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        });
        
        tableBody.html(tableHtml);
        
        // 为详情按钮绑定事件
        bindTableButtons();
    }
    
    // 跳转到上一页
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderTable(filteredRecords);
        }
    }
    
    // 跳转到下一页
    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(filteredRecords);
        }
    }
    
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
                
                // 打开"添加三会一课"的模态框
                openAddRecordModal(4, '三会一课');
                
                // 延迟一下，确保模态框已经渲染
                setTimeout(function() {
                    // 查找任务选择下拉框
                    const taskSelect = document.getElementById('task-select');
                    if (taskSelect) {
                        // 查找匹配附件名称的任务选项
                        const options = Array.from(taskSelect.options);
                        let found = false;
                        
                        for (let option of options) {
                            // 使用includes进行模糊匹配
                            if (option.text.includes(attachmentName) || option.value === taskId) {
                                option.selected = true;
                                // 触发change事件以加载任务详情
                                const event = new Event('change');
                                taskSelect.dispatchEvent(event);
                                // 禁用下拉框
                                taskSelect.disabled = true;
                                found = true;
                                break;
                            }
                        }
                        
                        // 如果没找到，尝试遍历所有select元素查找附件名称匹配项
                        if (!found) {
                            const allSelects = document.querySelectorAll('select');
                            for (let select of allSelects) {
                                const selectOptions = Array.from(select.options);
                                for (let option of selectOptions) {
                                    if (option.text.includes(attachmentName) || option.value === taskId) {
                                        option.selected = true;
                                        select.disabled = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }, 300);
            });
        });
    }
    
    // 更新统计信息
    function updateStatistics(records) {
        const dataToCount = records || filteredRecords;
        
        // 更新总记录数
        totalCountElement.text(dataToCount.length);
    }
    
    // 暴露初始化函数供home.js调用
    window.meetingModule = {
        init: initMeeting
    };
});