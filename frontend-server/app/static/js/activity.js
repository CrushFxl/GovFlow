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
                    renderTableData();
                }
            },
            error: function () {
                alert("连接失败：无法连接至服务器，请联系站长或稍后再试。");
            }
        });
    }

    // 渲染日程
    function renderTableData() {
        tableBody.innerHTML = '';
        if (scheduleData.length === 0) {
            // 显示空状态
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">暂无日程数据</td></tr>`;
            pageInfo.textContent = `第 0 页 / 共 0 页`;
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
            // 临时设置状态
            item.status = 'pending';
            item.statusText = '进行中';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.title}</td>
                <td>${item.date} ${item.start_time}</td>
                <td>${item.location}</td>
                <td>${item.partners}</td>
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
        const content = $('#daily-input').val();
        console.log(content)
        $.ajax({
            url: URL + "/activity/json",
            xhrFields: {withCredentials: true},
            type: "POST",
            data: {'content': content},
            dataType: "json",
            success: function (resp) {
                hideLoading();
                if (resp.code === 1000) {
                    console.log(resp.data);
                    showActivityForm(resp.data, false); // 添加/编辑模式，显示确认按钮
                }
            },
            error: function () {
                hideLoading();
                alert("连接失败：无法连接至服务器，请联系站长或稍后再试。");
            }
        });
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
        // 先移除所有已存在的监听器
        document.querySelectorAll('.btn-detail, .btn-delete').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });

        // 绑定详情按钮事件
        document.querySelectorAll('.btn-detail').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.closest('tr').rowIndex - 1;
                const item = scheduleData[(currentPage - 1) * itemsPerPage + index];
                showActivityForm(item, true); // 查看详情模式，隐藏确认按钮
            });
        });

        // 绑定删除按钮事件
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.closest('tr').rowIndex - 1;
                const item = scheduleData[(currentPage - 1) * itemsPerPage + index];
                if (confirm(`确定要删除日程：${item.title} 吗？`)) {
                    showLoading();
                    $.ajax({
                        url: URL + "/activity/delete",
                        xhrFields: {withCredentials: true},
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({id: item.id}),
                        dataType: "json",
                        success: function (resp) {
                            hideLoading();
                            if (resp.code === 1000) {
                                alert('删除成功');
                                fetchScheduleData();
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


    // 关闭弹窗函数 - 修复版本
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
            acid: currentActivityData.acid,
            title: document.getElementById('form-title').value,
            date: document.getElementById('form-date').value,
            start_time: document.getElementById('form-start-time').value,
            end_time: document.getElementById('form-end-time').value,
            location: document.getElementById('form-location').value,
            description: document.getElementById('form-description').value,
            organizations: document.getElementById('form-organizations').value.split(',').map(item => item.trim()).filter(item => item),
            partners: document.getElementById('form-partners').value.split(',').map(item => item.trim()).filter(item => item),
            initiator: document.getElementById('form-initiator').value,
            type: document.getElementById('form-type').value,
            need_attachment: document.getElementById('form-need-attachment').checked
        };
        
        // 保留原始数据中的id（如果存在）
        if (currentActivityData && currentActivityData.id) {
            formData.id = currentActivityData.id;
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
        document.getElementById('form-date').value = activityData.date || '';
        document.getElementById('form-start-time').value = activityData.start_time || '';
        document.getElementById('form-end-time').value = activityData.end_time || '';
        document.getElementById('form-location').value = activityData.location || '';
        document.getElementById('form-description').value = activityData.description || '';
        document.getElementById('form-organizations').value = activityData.organizations ? activityData.organizations.join(', ') : '';
        document.getElementById('form-partners').value = activityData.partners ? activityData.partners.join(', ') : '';
        // 设置发起人（当前用户昵称）
        const currentUserNick = document.getElementById('username') ? document.getElementById('username').textContent : '当前用户';
        document.getElementById('form-initiator').value = activityData.initiator || currentUserNick;
        // 设置任务类型
        document.getElementById('form-type').value = activityData.type || '';
        // 设置是否需要附件
        document.getElementById('form-need-attachment').checked = activityData.need_attachment || false;
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
    // 暴露初始化函数供home.js调用
    window.activityModule = {
        init: initActivity
    };
});