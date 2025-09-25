
$(document).ready(function() {
    // 绑定添加记录按钮事件
    $(document).on('click', '#add-meeting-btn', function() {
        openAddRecordModal(4, '三会一课');
    });
    $(document).on('click', '#add-party-day-btn', function() {
        openAddRecordModal(5, '主题党日');
    });
    $(document).on('click', '#add-fee-btn', function() {
        openAddRecordModal(2, '党费缴纳');
    });
    $(document).on('click', '#add-develop-btn', function() {
        openAddRecordModal(1, '党员发展');
    });
    $(document).on('click', '#add-review-btn', function() {
        openAddRecordModal(3, '民主评议');
    });
});

// 显示加载状态
function showLoading(message) {
    // 检查是否已有加载遮罩
    if ($('#global-loading').length) {
        $('#global-loading').remove();
    }
    const loadingHtml = `
        <div id="global-loading" class="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
            <div class="spinner-border text-white" style="width: 3rem; height: 3rem;"></div>
            <p class="text-white mt-2">${message || '加载中...'}</p>
        </div>
    `;
    $('body').append(loadingHtml);
}

// 隐藏加载状态
function hideLoading() {
    $('#global-loading').remove();
}

// 打开添加记录模态弹窗
function openAddRecordModal(formId, formName) {
    // 检查是否已有模态弹窗，如果有则移除
    if ($('#add-record-modal').length) {
        $('#add-record-modal').remove();
    }
    // 创建模态弹窗HTML结构
    const modalHtml = `
        <style>
            #add-record-modal .modal-dialog {
                display: flex;
                align-items: center;
                min-height: calc(100vh - 1rem);
                justify-content: center;
            }
            .task-detail-container {
                width: 96%;
                margin-left: 10px;
                margin-top: 10px;
                margin-bottom: 10px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                padding: 15px 0;
                background-color: #f9f9f9;
            }
            .task-detail-header {
                cursor: pointer;
                display: flex;
                align-items: center;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .task-detail-header::before {
                content: '▼';
                margin-right: 5px;
                font-size: 12px;
                transition: transform 0.3s;
            }
            .task-detail-header.collapsed::before {
                transform: rotate(-90deg);
            }
            .task-detail-content {
                display: none;
                padding-left: 15px;
            }
            .task-detail-row {
                margin-bottom: 8px;
                display: flex;
            }
            .task-detail-label {
                font-weight: bold;
                width: 100px;
            }
            .task-detail-value {
                flex: 1;
            }
        </style>
        <div id="add-record-modal" class="modal fade" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">添加${formName}记录</h5>
                        <button type="button" class="pf_close-btn" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div id="form-loading" class="text-center py-4">
                            <div class="spinner-border" role="status">
                                <span class="sr-only">加载中...</span>
                            </div>
                            <p class="mt-2">正在加载表单...</p>
                        </div>
                        <form id="record-form" style="display: none;">
                            <!-- 任务关联部分 -->
                            <div class="form-group">
                                <label>关联任务 <span class="text-danger">*</span></label>
                                <select id="task-select" name="task_uuid" class="form-control" required>
                                    <option value="">请选择关联任务</option>
                                </select>
                            </div>
                            
                            <!-- 任务详情部分 -->
                            <div id="task-detail-container" class="task-detail-container" style="display: none;">
                                <div id="task-detail-header" class="task-detail-header collapsed">
                                    任务详情
                                </div>
                                <div id="task-detail-content" class="task-detail-content">
                                    <div class="task-detail-row">
                                        <div class="task-detail-label">任务标题：</div>
                                        <div id="task-title" class="task-detail-value"></div>
                                    </div>
                                    <div class="task-detail-row">
                                        <div class="task-detail-label">任务描述：</div>
                                        <div id="task-description" class="task-detail-value"></div>
                                    </div>
                                    <div class="task-detail-row">
                                        <div class="task-detail-label">时间：</div>
                                        <div id="task-time" class="task-detail-value"></div>
                                    </div>
                                    <div class="task-detail-row">
                                        <div class="task-detail-label">地点：</div>
                                        <div id="task-location" class="task-detail-value"></div>
                                    </div>
                                    <div class="task-detail-row">
                                        <div class="task-detail-label">参与党员：</div>
                                        <div id="task-partners" class="task-detail-value"></div>
                                    </div>
                                    <div class="task-detail-row">
                                        <div class="task-detail-label">参与党组织：</div>
                                        <div id="task-organizations" class="task-detail-value"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 表单内容将通过JavaScript动态加载 -->
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" id="submit-record-btn">提交</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    $('body').append(modalHtml);
    const $modal = $('#add-record-modal');
    $modal.modal('show');
    
    // 加载任务列表
    loadTaskList();
    
    // 绑定任务选择变化事件
    $('#task-select').change(function() {
        const taskUuid = $(this).val();
        if (taskUuid) {
            loadTaskDetail(taskUuid);
        } else {
            $('#task-detail-container').hide();
        }
    });
    
    // 绑定任务详情折叠/展开事件
    $('#task-detail-header').click(function() {
        $(this).toggleClass('collapsed');
        $('#task-detail-content').toggle();
    });
    
    // 请求表单结构
    $.ajax({
        url: `${URL}/form_get`,
        type: 'GET',
        data: {form_id: formId},
        success: function(response) {
            if (response.code === 0 && response.data) {
                $('#form-loading').hide();
                // 渲染表单
                const $form = $('#record-form');
                const formData = response.data;
                // 存储form_id到表单中
                $form.append(`<input type="hidden" name="form_id" value="${formId}">`);
                // 遍历表单控件并渲染
                Object.values(formData).forEach(control => {
                    const controlHtml = generateFormControl(control);
                    $form.append(controlHtml);
                });
                // 显示表单
                $form.show();
                // 绑定提交按钮事件
                $('#submit-record-btn').off('click').on('click', function() {
                    submitRecordForm(formId, formName);
                });
            } else {
                $('#form-loading').html('<p class="text-danger">加载表单失败</p>');
            }
        }
    });
    // 当模态弹窗关闭时清理资源
    $modal.on('hidden.bs.modal', function() {
        $(this).remove();
    });
}

// 加载任务列表
function loadTaskList() {
    $.ajax({
        url: `${URL}/get_task_list`,
        type: 'GET',
        success: function(response) {
            if (response.code === 0 && response.data && response.data.length > 0) {
                const $taskSelect = $('#task-select');
                $taskSelect.empty().append('<option value="">请选择关联任务</option>');
                response.data.forEach(task => {
                    $taskSelect.append(`<option value="${task.uuid}">${task.title}</option>`);
                });
            }
        },
        error: function() {
            console.error('加载任务列表失败');
        }
    });
}

// 加载任务详情
function loadTaskDetail(taskUuid) {
    showLoading('加载任务详情...');
    $.ajax({
        url: `${URL}/get_task_detail/${taskUuid}`,
        type: 'GET',
        success: function(response) {
            hideLoading();
            if (response.code === 0 && response.data) {
                const taskData = response.data;
                // 填充任务详情
                $('#task-title').text(taskData.title);
                $('#task-description').text(taskData.description);
                $('#task-time').text(`${taskData.start_date} ${taskData.start_time} - ${taskData.end_date} ${taskData.end_time}`);
                $('#task-location').text(taskData.location);
                $('#task-partners').text(Array.isArray(taskData.partners) ? taskData.partners.join('、') : taskData.partners);
                $('#task-organizations').text(Array.isArray(taskData.organizations) ? taskData.organizations.join('、') : taskData.organizations);
                
                // 显示任务详情容器
                $('#task-detail-container').show();
                // 默认展开详情
                $('#task-detail-header').removeClass('collapsed');
                $('#task-detail-content').show();
            }
        },
        error: function() {
            hideLoading();
            console.error('加载任务详情失败');
        }
    });
}

// 生成表单控件
function generateFormControl(control) {
    const {type, label, placeholder, required, default_value, options} = control;
    const requiredMark = required ? '<span class="text-danger">*</span>' : '';
    const controlClass = 'form-control';
    let controlHtml = `<div class="form-group">
        <label>${label}${requiredMark}</label>`;
    switch(type) {
        case 'text':
        case 'number':
        case 'date':
            const tag = type === 'textarea' ? 'textarea' : 'input';
            const inputAttrs = `type="${type}" placeholder="${placeholder || ''}"`;
            controlHtml += `
                <${tag} name="${label}" class="${controlClass}" ${inputAttrs} ${default_value ? `value="${default_value}"` : ''} ${required ? 'required' : ''}>
                </${tag}>`;
            break;
        case 'textarea':
            controlHtml += `
                <textarea name="${label}" class="${controlClass}" rows="4" placeholder="${placeholder || ''}" ${required ? 'required' : ''}>
                ${default_value || ''}
                </textarea>`;
            break;
        case 'select':
            controlHtml += `
                <select name="${label}" class="${controlClass}" ${required ? 'required' : ''}>
                    <option value="">请选择${label}</option>`;  
            if (options && options.length) {
                options.forEach(option => {
                    const selected = default_value === option ? 'selected' : '';
                    controlHtml += `<option value="${option}" ${selected}>${option}</option>`;
                });
            }
            controlHtml += `
                </select>`;
            break;
        case 'radio':
            if (options && options.length) {
                controlHtml += `<div class="form-check">`;
                options.forEach(option => {
                    const checked = default_value === option ? 'checked' : '';
                    controlHtml += `
                        <label class="form-check-label mr-4">
                            <input type="radio" name="${label}" value="${option}" class="form-check-input" ${checked} ${required ? 'required' : ''}>
                            ${option}
                        </label>`;
                });
                controlHtml += `</div>`;
            }
            break;
        case 'checkbox':
            if (options && options.length) {
                controlHtml += `<div class="form-check">`;
                options.forEach((option, index) => {
                    const checked = default_value && default_value.includes(option) ? 'checked' : '';
                    controlHtml += `
                        <label class="form-check-label mr-4">
                            <input type="checkbox" name="${label}_${index}" value="${option}" class="form-check-input checkbox-option" data-group="${label}" ${checked} ${required ? 'required' : ''}>
                            ${option}
                        </label>`;
                });
                controlHtml += `</div>`;
            }
            break;
        default:
            controlHtml += `
                <input type="text" name="${label}" class="${controlClass}" placeholder="${placeholder || ''}" ${default_value ? `value="${default_value}"` : ''} ${required ? 'required' : ''}>`;
    }
    controlHtml += `</div>`;
    return controlHtml;
}

// 提交记录表单
function submitRecordForm(formId, formName) {
    const $form = $('#record-form');
    // 收集表单数据
    const formData = {};
    // 处理普通表单字段
    $form.find('input[type!="checkbox"][type!="radio"], select, textarea').each(function() {
        const name = $(this).attr('name');
        const value = $(this).val();
        if (name && name !== 'form_id') {
            formData[name] = value;
        }
    });
    // 处理单选框
    $form.find('input[type="radio"]:checked').each(function() {
        const name = $(this).attr('name');
        const value = $(this).val();
        if (name) {
            formData[name] = value;
        }
    });
    // 处理多选框
    const checkboxGroups = {};
    $form.find('input[type="checkbox"].checkbox-option:checked').each(function() {
        const group = $(this).data('group');
        const value = $(this).val();
        if (!checkboxGroups[group]) {
            checkboxGroups[group] = [];
        }
        checkboxGroups[group].push(value);
    });
    // 合并多选框数据到表单数据
    Object.assign(formData, checkboxGroups);
    // 显示加载状态
    showLoading('提交中...');
    // 获取选中的任务UUID
    const taskUuid = $('#task-select').val();
    
    // 发送请求到后端
    $.ajax({
        url: `${URL}/submit_form_data`,
        type: 'POST',
        data: {
            form_id: formId,
            form_data: JSON.stringify(formData),
            uid: localStorage.getItem('uid'),
            task_uuid: taskUuid  // 新增：提交关联任务UUID
        },
        success: function(response) {
            hideLoading();
            if (response.code === 200) {
                alert(`添加${formName}记录成功`);
                // 关闭模态弹窗
                $('#add-record-modal').modal('hide');
                
                // 重新加载对应页面的数据
                reloadPageData(formId);
            } else {
                alert(`添加${formName}记录失败：${response.message || '未知错误'}`);
            }
        },
        error: function() {
            hideLoading();
            alert('网络错误，请稍后重试');
        }
    });
}

// 重新加载页面数据
function reloadPageData(formId) {
    // 根据form_id确定要重新加载哪个页面的数据
    switch(formId) {
        case 1: // 党员发展
            if (window.developmentModule && window.developmentModule.init) {
                window.developmentModule.init();
            }
            break;
        case 2: // 党费缴纳
            if (window.feeModule && window.feeModule.init) {
                window.feeModule.init();
            }
            break;
        case 3: // 民主评议
            if (window.reviewModule && window.reviewModule.init) {
                window.reviewModule.init();
            }
            break;
        case 4: // 三会一课
            if (window.meetingModule && window.meetingModule.init) {
                window.meetingModule.init();
            }
            break;
        case 5: // 主题党日
            if (window.partyDayModule && window.partyDayModule.init) {
                window.partyDayModule.init();
            }
            break;
    }
}