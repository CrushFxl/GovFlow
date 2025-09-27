// 民主评议模块逻辑
$(document).ready(function() {
    // 当前页和每页数据量
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 1;
    let allData = []; // 存储所有数据
    let filteredData = []; // 筛选后的数据

    // 获取DOM元素
    const reviewTableBody = $('#review_table_body');
    const reviewSearchInput = $('#review_search_input');
    const reviewSearchButton = $('#review_search_button');
    const reviewPrevPage = $('#review_prev_page');
    const reviewNextPage = $('#review_next_page');
    const reviewCurrentPage = $('#review_current_page');
    const reviewTotalPages = $('#review_total_pages');
    const URL = $('#URL').text();
    const statusFilter = $('#review_status_filter'); // 状态筛选下拉框

    // 状态映射 - 参考development.js的徽标渲染逻辑
    const statusMap = {
        1: 'status-pending',
        2: 'status-processing',  // 待处理
        3: 'status-completed', // 已完成
        4: 'status-canceled' // 已拒绝/已取消
    };

    const statusTextMap = {
        1: '待审核',
        2: '待处理',
        3: '已完成',
        4: '已拒绝'
    };

    // 加载民主评议数据
    function loadReviewData() {
        // 显示加载状态
        reviewTableBody.html('<tr><td colspan="6" class="rw_dyfz_no_data">加载中...</td></tr>');
        
        // 发送请求到后端获取数据
        $.ajax({
            url: URL + '/get_review_records',
            xhrFields: {withCredentials: true},
            type: 'POST',
            data: {uid: localStorage.getItem('uid')},
            success: function(response) {
                if (response.code === 1000) {
                    // 过滤掉通知类型任务
                    allData = (response.data || []).filter(record => record.task_type !== '通知');
                    filteredData = [...allData]; // 初始化筛选后数据
                    currentPage = 1; // 重置为第一页
                    filterByStatus(); // 应用状态筛选
                } else {
                    reviewTableBody.html('<tr><td colspan="6" class="rw_dyfz_no_data">' + (response.msg || '加载失败') + '</td></tr>');
                }
            },
            error: function() {
                reviewTableBody.html('<tr><td colspan="6" class="rw_dyfz_no_data">网络错误，请稍后重试</td></tr>');
            }
        });
    }
    
    // 审核任务函数
    function reviewTask(taskId, status) {
        $.ajax({
            url: URL + '/activity/review_task',
            xhrFields: {withCredentials: true},
            type: 'POST',
            data: {
                task_id: taskId,
                status: status,
                uid: localStorage.getItem('uid')
            },
            success: function(response) {
                if (response.code === 1000) {
                    alert(status === 2 ? '审核通过！' : '已拒绝该任务！');
                    // 重新加载数据
                    loadReviewData();
                } else {
                    alert(response.msg || '操作失败，请稍后重试');
                }
            }
        });
    }

    // 渲染民主评议表格
    function renderReviewTable() {
        // 获取当前应该显示的数据
        let displayData = [...filteredData];
        
        // 应用状态筛选
        const selectedStatus = statusFilter.val();
        if (selectedStatus !== 'all') {
            const statusValue = parseInt(selectedStatus);
            displayData = displayData.filter(record => record.status === statusValue);
        }
        
        // 计算当前页的数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, displayData.length);
        const currentPageData = displayData.slice(startIndex, endIndex);
        
        // 计算实际总页数
        const actualTotalPages = Math.ceil(displayData.length / pageSize);
        
        // 更新分页信息
        reviewCurrentPage.text(currentPage);
        reviewTotalPages.text(actualTotalPages);
        reviewPrevPage.prop('disabled', currentPage === 1);
        reviewNextPage.prop('disabled', currentPage === actualTotalPages);
        
        // 渲染表格内容
        if (currentPageData.length === 0) {
            reviewTableBody.html('<tr><td colspan="5" class="rw_dyfz_no_data">暂无数据</td></tr>');
            return;
        }
        
        let tableHtml = '';
        currentPageData.forEach(function(record, index) {
            // 合并end_date和end_time作为截止时间
            const endDate = record.end_date || '';
            const endTime = record.end_time || '';
            const deadline = endDate ? (endDate + (endTime ? ' ' + endTime : '')) : '';
            
            // 处理评议说明过长的情况，超出部分用省略号显示
            let description = record.description || '';
            const maxDescriptionLength = 18;
            const fullDescription = description;
            if (description.length > maxDescriptionLength) {
                description = description.substring(0, maxDescriptionLength) + '...';
            }
            
            // 根据状态设置状态徽标样式
            const statusClass = statusMap[record.status] || '';
            const statusText = statusTextMap[record.status] || '-';
            
            // 根据attachment_name是否为空决定是否添加'去完成'按钮
            let actionButtons = `<button class="btn-action btn-detail" data-id="${record.id}" data-type="${record.task_type || 'review'}">详情</button>`;
            
            // 如果attachment_name不为空，添加'去完成'按钮
            if (record.attachment_name  && record.status == 2) {
                actionButtons += ` <button class="btn-action btn-complete" data-id="${record.id}" data-attachment="${record.attachment_name}" data-task-id="${record.id}">去完成</button>`;
            }
            
            // 为待审核状态的任务添加"去审核"按钮
            if (record.status == 1) {
                actionButtons += ` <button class="btn-action btn-review" data-id="${record.id}">去审核</button>`;
            }
            
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${record.title || ''}</td>
                    <td><span title="${fullDescription}">${description}</span></td>
                    <td>${deadline}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        });
        
        reviewTableBody.html(tableHtml);
        
        // 为详情按钮绑定事件
        bindTableButtons();
    }

    // 搜索功能 - 前端筛选
    function searchReview(keyword) {
        // 清空搜索结果提示
        
        if (!keyword) {
            // 如果搜索框为空，重置筛选数据
            filteredData = [...allData];
            filterByStatus(); // 重新应用状态筛选
            return;
        }
        
        // 前端筛选
        if (allData.length > 0) {
            const tempData = allData.filter(function(record) {
                return (
                    record.title && record.title.includes(keyword) ||
                    record.description && record.description.includes(keyword)
                );
            });
            
            filteredData = [...tempData];
            filterByStatus(); // 应用状态筛选
        }
    }
    
    // 按状态筛选
    function filterByStatus() {
        const selectedStatus = statusFilter.val();
        
        // 如果选择全部，则使用所有筛选后的数据
        if (selectedStatus === 'all') {
            totalPages = Math.ceil(filteredData.length / pageSize);
            currentPage = 1;
            renderReviewTable();
            return;
        }
        
        // 根据状态筛选
        const statusValue = parseInt(selectedStatus);
        const statusFilteredData = filteredData.filter(record => record.status === statusValue);
        
        totalPages = Math.ceil(statusFilteredData.length / pageSize);
        currentPage = 1;
        renderReviewTable();
    }

    // 绑定事件
    function bindEvents() {
        // 搜索按钮点击事件
        reviewSearchButton.on('click', function() {
            const keyword = reviewSearchInput.val().trim();
            searchReview(keyword);
        });
        
        // 回车键搜索
        reviewSearchInput.on('keypress', function(e) {
            if (e.which === 13) {
                reviewSearchButton.click();
            }
        });
        
        // 上一页按钮点击事件
        reviewPrevPage.on('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderReviewTable();
            }
        });
        
        // 下一页按钮点击事件
        reviewNextPage.on('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                renderReviewTable();
            }
        });
        
        // 状态筛选下拉框变更事件
        statusFilter.change(filterByStatus);
    }
    
    // 绑定表格按钮事件
    function bindTableButtons() {
        // 先移除所有已存在的监听器
        document.querySelectorAll('.btn-detail').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });

        // 绑定详情按钮事件
        document.querySelectorAll('.btn-detail').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                // 获取完整的数据
                const item = allData.find(item => item.id === id);
                
                if (item) {
                    // 调用统一的详情显示函数
                    showTaskDetail(item);
                }
            });
        });

        // 绑定'去完成'按钮事件
        document.querySelectorAll('.btn-complete').forEach(button => {
            button.addEventListener('click', function() {
                const taskId = this.getAttribute('data-task-id');
                const attachmentName = this.getAttribute('data-attachment');
                
                // 打开添加民主评议模态框
                openAddRecordModal(3, '民主评议');
                
                // 延迟执行，确保模态框已经渲染完成
                setTimeout(function() {
                    // 查找并设置关联表单
                    const taskSelect = document.getElementById('task-select');
                    if (taskSelect) {
                        // 遍历所有选项，找到匹配的附件名称
                        let found = false;
                        for (let i = 0; i < taskSelect.options.length; i++) {
                            const option = taskSelect.options[i];
                            // 使用includes条件，增加匹配的灵活性
                            if (option.text.includes(attachmentName) || option.value.includes(attachmentName)) {
                                taskSelect.value = option.value;
                                // 触发change事件，确保加载相应的表单详情
                                const event = new Event('change');
                                taskSelect.dispatchEvent(event);
                                found = true;
                                break;
                            }
                        }
                        
                        // 禁用下拉框，防止修改
                        taskSelect.disabled = true;
                    }
                    
                    // 如果没找到，尝试其他可能的select元素（作为后备策略）
                    if (!taskSelect || taskSelect.options.length === 0) {
                        const selectElements = document.querySelectorAll('select');
                        selectElements.forEach(select => {
                            for (let i = 0; i < select.options.length; i++) {
                                const option = select.options[i];
                                if (option.text.includes(attachmentName) || option.value.includes(attachmentName)) {
                                    select.value = option.value;
                                    const event = new Event('change');
                                    select.dispatchEvent(event);
                                    select.disabled = true;
                                }
                            }
                        });
                    }
                }, 300); // 300毫秒延迟
            });
        });

        // 绑定"去审核"按钮事件
        document.querySelectorAll('.btn-review').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', function() {
                const taskId = this.getAttribute('data-id');
                
                // 使用prompt提供三个选项
                const choice = prompt('请选择审核操作:\n1. 同意\n2. 拒绝\n3. 取消');
                
                if (choice === '1') {
                    // 同意审核
                    reviewTask(taskId, 2);
                } else if (choice === '2') {
                    // 拒绝审核
                    reviewTask(taskId, 4);
                } else if (choice === '3' || choice === null) {
                    // 取消操作，不执行任何操作
                    return;
                } else {
                    alert('无效的选择，请输入1、2或3');
                }
            });
        });
    }
    
    // 初始化民主评议页面
    function initReview() {
        console.log('民主评议页面初始化');
        bindEvents();
        
        // 直接加载数据
        currentPage = 1;
        loadReviewData();
    }

    // 暴露初始化函数供home.js调用
    window.reviewModule = {
        init: initReview
    };
});