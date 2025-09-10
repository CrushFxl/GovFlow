// 日程下发管理模块逻辑
$(document).ready(function() {
    const URL = $('#URL').text();
    // 分页参数
    const itemsPerPage = 6;
    let currentPage = 1;
    let totalPages = 0;
    let scheduleData = [];
    
    // 定位DOM元素
    const tableBody = document.querySelector('#activity .table tbody');
    const prevBtn = document.querySelector('#activity .pagination .btn-outline:first-child');
    const nextBtn = document.querySelector('#activity .pagination .btn-outline:last-child');
    const pageInfo = document.querySelector('#activity .pagination .page-info');

    // 初始化日程模块
    function initActivity() {        
        fetchScheduleData();
    }

    // 获取并渲染日程
    function fetchScheduleData() {
        $.ajax({
            url: URL + "/activity/query",
            xhrFields: {withCredentials: true},
            type: "POST",
            dataType: "json",
            success: function (resp) {
                if (resp.code === 1000) {
                    scheduleData = resp.data;
                    // 存储数据到sessionStorage，方便详情查看
                    sessionStorage.setItem('activityData', JSON.stringify(scheduleData));
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
        if (scheduleData.length === 0) {
            // 显示空状态
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">暂无任务数据</td></tr>`;
            pageInfo.textContent = `第 1 页 / 共 1 页`;
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            return;
        }

        // 重新计算总页数
        totalPages = Math.ceil(scheduleData.length / itemsPerPage);
        // 确保当前页不超过总页数
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        // 计算当前页的数据范围
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, scheduleData.length);
        const currentData = scheduleData.slice(startIndex, endIndex);
        
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
                    statusText = '待完成';
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
            
            // 构建详情和删除按钮
            let actionButtons = `
                <button class="btn-action btn-detail" data-id="${item.id}" data-type="${item.type}">详情</button>
            `;
            actionButtons += `
                <button class="btn-action btn-delete" data-id="${item.id}" data-type="${item.type}">删除</button>`;
            // 待完成状态才显示标记完成按钮
            if (item.status === 2) {
                actionButtons += `
                <button class="btn-action btn-complete" data-id="${item.id}" data-type="${item.type}">标记完成</button>`;
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title || '-'}</td>
                <td>${item.description || '-'}</td>
                <td>${item.created_time || '-'}</td>
                <td>${item.partners || '-'}</td>
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
        // 绑定详情、标记完成和删除按钮事件
        bindTableButtons();
    }

    // 添加任务按钮点击事件
    document.getElementById('add-activity').addEventListener('click', function() {
        showActivityForm({}, false); // 添加模式，显示确认按钮
    });

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
                    showActivityForm(item, true); // 查看详情模式，隐藏确认按钮
                }
            });
        });

        // 绑定标记完成按钮事件
        document.querySelectorAll('.btn-complete').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                if (confirm(`确定要将此任务标记为已完成吗？`)) {
                    showLoading();
                    $.ajax({
                        url: URL + "/activity/mark_complete",
                        xhrFields: {withCredentials: true},
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({data: {id: id, type: type}}),
                        dataType: "json",
                        success: function (resp) {
                            hideLoading();
                            if (resp.code === 1000) {
                                alert('标记成功');
                                fetchScheduleData();
                            } else {
                                alert(resp.message || '标记失败');
                            }
                        },
                        error: function () {
                            hideLoading();
                            alert("连接失败：无法连接至服务器，请联系站长或稍后再试。");
                        }
                    });
                }
            });
        });

        // 绑定删除按钮事件
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                if (confirm(`确定要删除此任务吗？`)) {
                    showLoading();
                    $.ajax({
                        url: URL + "/activity/delete",
                        xhrFields: {withCredentials: true},
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({data: {id: id, type: type}}),
                        dataType: "json",
                        success: function (resp) {
                            hideLoading();
                            if (resp.code === 1000) {
                                alert('删除成功');
                                fetchScheduleData();
                            } else {
                                alert(resp.message || '删除失败');
                            }
                        },
                        error: function () {
                            hideLoading();
                            alert("连接失败：无法连接至服务器，请联系站长或稍后再试。");
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

    // 关闭弹窗按钮点击事件
    document.getElementById('cancel-task-btn').addEventListener('click', function() {
        closeModal();
    });

    // 提交按钮点击事件
    document.getElementById('confirm-btn').addEventListener('click', function() {
        confirmHandler();
    });

    // 关闭弹窗函数
    function closeModal() {
        const modal = document.getElementById('activity-modal');
        modal.classList.remove('show');
    }
    
    // 存储当前活动数据
    let currentActivityData = null;
    
    // 日程表单确认提交处理函数
    function confirmHandler() {        
        // 从表单中获取用户修改后的数据
        const formData = {
            title: document.getElementById('form-title').value,
            description: document.getElementById('activity-form-description').value,
            organizations: document.getElementById('form-organizations').value.split(',').map(item => item.trim()).filter(item => item),
            partners: document.getElementById('form-partners').value.split(',').map(item => item.trim()).filter(item => item),
            initiator: document.getElementById('form-initiator').value,
            type: document.getElementById('form-type').value,
            start_date: document.getElementById('form-date').value,
            start_time: document.getElementById('form-start-time').value,
            end_date: document.getElementById('form-date').value,
            end_time: document.getElementById('form-end-time').value,
            location: document.getElementById('form-location').value
        };
        
        // 保留原始数据中的id和type（如果存在）
        if (currentActivityData && currentActivityData.id) {
            formData.id = currentActivityData.id;
            formData.type = currentActivityData.type;
        }
        
        $.ajax({
            url: URL + "/activity/save",
            xhrFields: {withCredentials: true},
            type: "POST",
            data: JSON.stringify({ data: formData }),
            contentType: "application/json",
            dataType: "json",
            success: function (resp) {
                if (resp.code === 1000) {
                    alert('提交成功');
                    fetchScheduleData();
                    closeModal();
                }
            },
            error: function () {
                alert("连接失败：无法连接至服务器，请联系站长或稍后再试。");
            }
        });
    }
    
    // 显示活动表单弹窗
    function showActivityForm(activityData, isDetailMode = false) {
        // 存储当前活动数据
        currentActivityData = activityData;
        const modal = document.getElementById('activity-modal');
        const confirmBtn = document.getElementById('confirm-btn');
        // 填充表单数据
        document.getElementById('form-title').value = activityData.title || '';
        document.getElementById('activity-form-description').value = activityData.description || '';
        document.getElementById('form-date').value = activityData.start_date || '';
        document.getElementById('form-start-time').value = activityData.start_time || '';
        document.getElementById('form-end-time').value = activityData.end_time || '';
        document.getElementById('form-location').value = activityData.location || '';
        document.getElementById('form-organizations').value = activityData.organizations ? 
            (Array.isArray(activityData.organizations) ? activityData.organizations.join(', ') : activityData.organizations) : '';
        document.getElementById('form-partners').value = activityData.partners ? 
            (Array.isArray(activityData.partners) ? activityData.partners.join(', ') : activityData.partners) : '';
        // 设置发起人
        const currentUserNick = document.getElementById('username') ? document.getElementById('username').textContent : '当前用户';
        document.getElementById('form-initiator').value = activityData.creator || currentUserNick;
        // 设置任务类型
        document.getElementById('form-type').value = activityData.type || '';
        // 显示弹窗
        modal.classList.add('show');        
        // 根据模式决定是否显示确认按钮和添加事件监听器
        if (isDetailMode) {
            // 查看详情模式：隐藏确认按钮，使表单变为只读
            confirmBtn.style.display = 'none';            
            const formElements = document.querySelectorAll('#activity-modal input, #activity-modal textarea, #activity-modal select');
            formElements.forEach(element => {
                if (element.tagName === 'SELECT') {
                    element.disabled = true;
                    element.style.backgroundColor = '#f5f5f5';
                } else {
                    element.readOnly = true;
                    element.style.backgroundColor = '#f5f5f5';
                }
            });
        } else {
            // 添加/编辑模式：显示确认按钮
            confirmBtn.style.display = 'inline-block';
            const formElements = document.querySelectorAll('#activity-modal input, #activity-modal textarea');
            formElements.forEach(element => {
                element.readOnly = false;
                element.style.backgroundColor = '';
            });
        }
    }
    
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