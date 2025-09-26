$(document).ready(function() {
    const URL = $('#URL').text();
    // 分页参数
    const itemsPerPage = 6;
    let currentPage = 1;
    let totalPages = 0;
    let scheduleData = []; // 原始数据
    let filteredData = []; // 筛选后的数据
    
    // 定位DOM元素
    const tableBody = document.querySelector('#task_management .table tbody');
    const prevBtn = document.querySelector('#task_management .pagination .btn-outline:first-child');
    const nextBtn = document.querySelector('#task_management .pagination .btn-outline:last-child');
    const pageInfo = document.querySelector('#task_management .pagination .page-info');
    const taskTypeFilter = document.getElementById('task_management_type_filter');
    const taskStatusFilter = document.getElementById('task_management_status_filter');

    // 初始化任务管理模块
    function initTaskManagement() {        
        fetchScheduleData();
        // 绑定筛选事件
        taskTypeFilter.addEventListener('change', applyFilters);
        taskStatusFilter.addEventListener('change', applyFilters);
    }
    
    // 获取任务类型列表
    function fetchTaskTypes() {
        // 从现有数据中提取任务类型
        if (scheduleData.length > 0) {
            const types = new Set(['通知']); // 确保包含通知类型
            scheduleData.forEach(item => {
                if (item.type === 'task' && item.task_type) {
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
        const selectedStatus = taskStatusFilter.value;
        
        filteredData = scheduleData.filter(item => {
            // 首先检查是否为任务类型
            if (item.type !== 'task') return false;
            
            // 检查任务类型筛选
            if (selectedType !== 'all' && item.task_type !== selectedType) {
                return false;
            }
            
            // 检查任务状态筛选
            if (selectedStatus !== 'all' && item.status !== parseInt(selectedStatus)) {
                return false;
            }
            
            return true;
        });
        
        currentPage = 1; // 重置为第一页
        renderTableData();
    }

    // 获取并渲染任务数据
    function fetchScheduleData() {
        $.ajax({
            url: URL + "/activity/query",
            xhrFields: {withCredentials: true},
            type: "POST",
            dataType: "json",
            data: {
                'uid': localStorage.getItem('uid'),
            },
            success: function (resp) {
                if (resp.code === 1000) {
                    scheduleData = resp.data;
                    sessionStorage.setItem('taskManagementData', JSON.stringify(scheduleData));
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
                <button class="btn-action btn-delete" data-id="${item.id}" data-type="${item.type}">删除</button>
            `;
            
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
            document.querySelectorAll('.btn-detail, .btn-delete').forEach(button => {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
            });

            // 绑定详情按钮事件
            document.querySelectorAll('.btn-detail').forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    // 获取完整的数据
                    const allData = JSON.parse(sessionStorage.getItem('taskManagementData') || '[]');
                    const item = allData.find(item => item.id === id && item.type === type);
                    
                    if (item) {
                        // 调用统一的详情显示函数
                        showTaskDetail(item);
                    }
                });
            });

            // 绑定删除按钮事件
            document.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    
                    // 显示确认对话框
                    if (confirm('确定要删除这个任务吗？')) {
                        showLoading('删除中...');
                        
                        // 发送删除请求
                        $.ajax({
                            url: URL + '/activity/delete',
                            xhrFields: {withCredentials: true},
                            type: 'POST',
                            dataType: 'json',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                data: {
                                    id: id,
                                    type: type
                                }
                            }),
                            success: function(resp) {
                                hideLoading();
                                if (resp.code === 1000) {
                                    alert('删除成功');
                                    // 重新获取数据并渲染表格
                                    fetchScheduleData();
                                } else {
                                    alert('删除失败：' + resp.message);
                                }
                            },
                            error: function() {
                                hideLoading();
                                alert('连接失败：无法连接至服务器，请联系站长或稍后再试。');
                            }
                        });
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
    window.taskManagementModule = {
        init: initTaskManagement
    };
});

// 显示单个任务/通知详情 - ElementUI风格模态框
function showTaskDetail(item) {
    // 检查是否已经存在模态框元素
    let modal = document.getElementById('task-detail-modal');
    if (!modal) {
        // 创建ElementUI风格的模态框HTML
        const modalHTML = `
            <div id="task-detail-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 2000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                <div style="background-color: white; border-radius: 4px; width: 80%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);">
                    <div style="padding: 15px 20px; border-bottom: 1px solid #e8e8e8; display: flex; justify-content: space-between; align-items: center; background-color: #fafafa;">
                        <h3 id="task-modal-title" style="margin: 0; font-size: 16px; color: #262626;">任务详情</h3>
                        <button id="close-task-modal-btn" style="background: none; border: none; font-size: 16px; cursor: pointer; color: #909399; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">×</button>
                    </div>
                    <div id="task-modal-content" style="padding: 20px; overflow-y: auto; flex: 1; color: #303133;">
                        <!-- 内容将通过JavaScript动态填充 -->
                    </div>
                    <div style="padding: 10px 20px; border-top: 1px solid #e8e8e8; display: flex; justify-content: flex-end; gap: 10px; background-color: #fafafa;">
                        <button id="close-task-modal-button" style="padding: 8px 16px; border: 1px solid #dcdfe6; border-radius: 4px; background-color: white; color: #606266; cursor: pointer; font-size: 14px; transition: all 0.3s;">关闭</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // 获取创建的模态框
        modal = document.getElementById('task-detail-modal');
        
        // 一次性绑定关闭事件监听器
        const closeButton = document.getElementById('close-task-modal-btn');
        const cancelButton = document.getElementById('close-task-modal-button');
        
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        cancelButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // 设置标题
    document.getElementById('task-modal-title').textContent = item.title || '任务详情';
    // 填充内容
    const contentDiv = document.getElementById('task-modal-content');
    
    // 获取状态文本和颜色
    let statusText = '未知';
    let statusColor = '#909399';
    
    switch(item.status) {
        case 1:
            statusText = '待审核';
            statusColor = '#e6a23c';
            break;
        case 2:
            statusText = '进行中';
            statusColor = '#1890ff';
            break;
        case 3:
            statusText = '已完成';
            statusColor = '#67c23a';
            break;
        case 4:
            statusText = '审核拒绝';
            statusColor = '#f56c6c';
            break;
    }
    
    const typeLabel = item.type === 'notice' ? '通知' : item.type === 'task' ? '任务' : item.type === 'review' ? '待审批' : '其他';
    
    // 构建详情内容
    let contentHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <div class="task-detail-row" style="display: flex; flex-direction: column; gap: 8px;">
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px; padding-top: 4px;">标题：</span>
                    <span class="task-detail-value" style="flex: 1; word-break: break-word;">${item.title || '-'}</span>
                </div>
                
                <div class="task-detail-item" style="display: flex; align-items: flex-start; gap: 10px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px; padding-top: 4px;">类型：</span>
                    <span class="task-detail-value" style="flex: 1;"><span style="display: inline-block; padding: 4px 12px; border-radius: 10px; background-color: #ecf5ff; color: #409eff; font-size: 12px;">${typeLabel}</span></span>
                </div>
                
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px;">状态：</span>
                    <span class="task-detail-value" style="flex: 1;"><span style="display: inline-block; padding: 4px 12px; border-radius: 10px; background-color: rgba(${hexToRgb(statusColor)}, 0.1); color: ${statusColor}; font-size: 12px;">${statusText}</span></span>
                </div>
                
                ${item.task_type ? `
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px;">任务类型：</span>
                    <span class="task-detail-value" style="flex: 1;">${item.task_type}</span>
                </div>
                ` : ''}
                
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px;">描述：</span>
                    <div class="task-detail-value" style="flex: 1; background-color: #f5f7fa; padding: 10px; border-radius: 4px; white-space: pre-wrap; line-height: 1.6;">${item.description || '-'}</div>
                </div>
                
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px;">创建时间：</span>
                    <span class="task-detail-value" style="flex: 1;">${item.created_time || '-'}</span>
                </div>
                
                ${item.end_date ? `
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px;">截止时间：</span>
                    <span class="task-detail-value" style="flex: 1;">${item.end_date}</span>
                </div>
                ` : ''}
                
                ${item.frequency ? `
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px;">频率：</span>
                    <span class="task-detail-value" style="flex: 1;">${item.frequency}</span>
                </div>
                ` : ''}
                
                ${item.location ? `
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px;">地点：</span>
                    <span class="task-detail-value" style="flex: 1;">${item.location}</span>
                </div>
                ` : ''}
                
                ${item.participants ? `
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px;">参与人：</span>
                    <span class="task-detail-value" style="flex: 1;">${item.participants}</span>
                </div>
                ` : ''}
                
                ${item.partners ? `
                <div class="task-detail-item" style="display: flex; align-items: center; gap: 10px; min-height: 32px;">
                    <span class="task-detail-label" style="font-weight: 500; color: #606266; min-width: 80px;">参与党员：</span>
                    <span class="task-detail-value" style="flex: 1;">${item.partners}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    contentDiv.innerHTML = contentHTML;
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 辅助函数：将十六进制颜色转换为RGB值（用于背景色透明度）
    function hexToRgb(hex) {
        // 移除#号
        hex = hex.replace('#', '');
        // 解析RGB值
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }
}