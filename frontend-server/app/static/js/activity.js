// 日程下发管理模块逻辑
$(document).ready(function() {
    const URL = $('#URL').text();
    // 分页参数
    const itemsPerPage = 6;
    let currentPage = 1;
    let totalPages = 0;
    let scheduleData = []; // 原始数据
    let filteredData = []; // 筛选后的数据
    
    // 定位DOM元素
    const tableBody = document.querySelector('#activity .table tbody');
    const prevBtn = document.querySelector('#activity .pagination .btn-outline:first-child');
    const nextBtn = document.querySelector('#activity .pagination .btn-outline:last-child');
    const pageInfo = document.querySelector('#activity .pagination .page-info');
    const taskTypeFilter = document.getElementById('task_type_filter');

    // 初始化日程模块
    function initActivity() {        
        fetchScheduleData();
        // 绑定类型筛选事件
        taskTypeFilter.addEventListener('change', applyFilters);
    }
    
    // 获取任务类型列表
    function fetchTaskTypes() {
        // 从现有数据中提取任务类型
        if (scheduleData.length > 0) {
            const types = new Set();
            scheduleData.forEach(item => {
                if (item.task_type) {
                    types.add(item.task_type);
                }
            });
            
            // 清空并重新填充下拉菜单（保留"全部"选项）
            while (taskTypeFilter.options.length > 1) {
                taskTypeFilter.remove(1);
            }
            
            // 添加任务类型选项
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                taskTypeFilter.appendChild(option);
            });
        }
    }
    
    // 应用筛选条件
    function applyFilters() {
        const selectedType = taskTypeFilter.value;
        
        if (selectedType === 'all') {
            filteredData = [...scheduleData];
        } else {
            filteredData = scheduleData.filter(item => 
                item.task_type === selectedType
            );
        }
        
        currentPage = 1; // 重置为第一页
        renderTableData();
    }

    // 获取并渲染日程
    function fetchScheduleData() {
        $.ajax({
            url: URL + "/activity/query",
            xhrFields: {withCredentials: true},
            type: "POST",
            dataType: "json",
            data: {
                'uid': localStorage.getItem('uid'),
                'mode': 'private',
            },
            success: function (resp) {
                if (resp.code === 1000) {
                    scheduleData = resp.data;
                    sessionStorage.setItem('activityData', JSON.stringify(scheduleData));
                    // 初始化筛选数据
                    filteredData = [...scheduleData];
                    // 获取并填充任务类型
                    fetchTaskTypes();
                    renderTableData();
                }
            },
            error: function () {
                alert("连接失败：无法连接至服务器，请联系站长或稍后再试。");
            }
        });
    }

    // 渲染表格数据
    function renderTableData() {
        tableBody.innerHTML = '';
        if (filteredData.length === 0) {
            // 显示空状态
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">暂无任务数据</td></tr>`;
            pageInfo.textContent = `第 1 页 / 共 1 页`;
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        // 重新计算总页数
        totalPages = Math.ceil(filteredData.length / itemsPerPage);
        // 确保当前页不超过总页数
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        // 计算当前页的数据范围
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
        const currentData = filteredData.slice(startIndex, endIndex);
        
        currentData.forEach(item => {
            // 获取状态文本和CSS类
            let statusText = '未知';
            let statusClass = 'status-pending';
            
            switch(item.status) {
                case 1:
                    statusText = '待审核';
                    statusClass = 'status-pending';
                    break;
                case 2:
                    statusText = '进行中';
                    statusClass = 'status-processing';
                    break;
                case 3:
                    statusText = '已完成';
                    statusClass = 'status-completed';
                    break;
                case 4:
                    statusText = '审核拒绝';
                    statusClass = 'status-rejected';
                    break;
            }
            
            // 构建操作按钮
            let actionButtons = `
                <button class="btn-action btn-detail" data-id="${item.id}" data-type="${item.type}">详情</button>
            `;

            // 如果attachment_name不为空，添加'去完成'按钮
            if (item.attachment_name) {
                actionButtons += `
                <button class="btn-action btn-complete" data-id="${item.id}" data-attachment="${item.attachment_name}" data-task-id="${item.id}">去完成</button>`;
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title || '-'}</td>
                <td>${item.task_type || '-'}</td>
                <td>${item.created_time || '-'}</td>
                <td>${item.frequency || '-'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    ${actionButtons}
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // 更新分页信息
        pageInfo.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
        // 更新按钮状态
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        // 绑定详情按钮事件
        bindTableButtons();
    }

    // 绑定表格按钮事件
        function bindTableButtons() {
            // 先移除所有已存在的监听器
            document.querySelectorAll('.btn-detail, .btn-complete, .btn-delete').forEach(button => {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
            });

            // 绑定详情按钮事件
            document.querySelectorAll('.btn-detail').forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    // 获取完整的数据
                    const allData = JSON.parse(sessionStorage.getItem('activityData') || '[]');
                    const item = allData.find(item => item.id === id && item.type === type);
                    
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
                
                // 打开"添加党员发展"的模态框
                openAddRecordModal(1, '党员发展');
                
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

    // 显示加载状态
    function showLoading(message = '处理中...') {
        // 简单的加载提示
        alert(message);
    }
    
    // 隐藏加载状态
    function hideLoading() {
        // 这里可以实现隐藏加载动画的逻辑
    }
    
    // 暴露初始化函数供home.js调用
    window.activityModule = {
        init: initActivity
    };
});