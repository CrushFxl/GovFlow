// 云表单页面模块
// 时间格式化函数，将时间字符串转换为 yyyy-mm-dd hh:mm 格式
function formatDateTime(dateString) {
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
        console.error('时间格式化失败:', error);
        return dateString; // 如果格式化失败，返回原始字符串
    }
}

// 中文字符串截断函数，最多显示15个中文字，多余用...表示
function truncateChinese(str, maxLength = 15) {
    if (!str || typeof str !== 'string') {
        return '-';
    }
    const chineseRegex = /[\u4e00-\u9fa5]/g;
    const chineseMatches = str.match(chineseRegex);
    if (chineseMatches && chineseMatches.length > maxLength) {
        let chineseCount = 0;
        let result = '';
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if (/[\u4e00-\u9fa5]/.test(char)) {
                chineseCount++;
                if (chineseCount > maxLength) {
                    break;
                }
            }
            result += char;
        }
        return result + '...';
    } else if (str.length > maxLength * 2) {
        return str.substring(0, maxLength * 2) + '...';
    }
    return str;
}

const cloudFormModule = {
    currentFormId: null,
    controls: [],
    isSubmitting: false,
    // 分页参数
    itemsPerPage: 6,
    currentPage: 1,
    totalPages: 0,
    allForms: [],
    
    init: function() {
        console.log('云表单页面初始化');
        // 获取DOM元素
        this.$addFormBtn = document.getElementById('add-form-btn');
        this.$formModal = document.getElementById('form-modal');
        this.$closeModal = document.getElementById('close-modal');
        this.$cancelForm = document.getElementById('cancel-form');
        this.$saveForm = document.getElementById('save-form');
        this.$formListBody = document.getElementById('form-list-body');
        this.$addRadioControl = document.getElementById('add-radio-control');
        this.$addCheckboxControl = document.getElementById('add-checkbox-control');
        this.$addTextControl = document.getElementById('add-text-control');
        this.$addTextareaControl = document.getElementById('add-textarea-control');
        this.$controlsContainer = document.getElementById('controls-container');
        this.$modalTitle = document.getElementById('modal-title');
        // 分页相关DOM元素
        this.$prevPageBtn = document.getElementById('form-prev-page');
        this.$nextPageBtn = document.getElementById('form-next-page');
        this.$pageInfo = document.getElementById('form-page-info');
        // 绑定事件监听
        this.bindEvents();
        // 加载表单列表
        this.loadFormList();
    },
    
    bindEvents: function() {
        // 添加新表单按钮点击事件
        this.$addFormBtn.addEventListener('click', () => this.openAddFormModal());
        // 关闭模态框事件
        this.$closeModal.addEventListener('click', () => this.closeFormModal());
        this.$cancelForm.addEventListener('click', () => this.closeFormModal());
        // 保存表单事件
        this.$saveForm.addEventListener('click', () => this.saveForm());
        // 添加控件按钮点击事件
        this.$addRadioControl.addEventListener('click', () => this.addControl('radio'));
        this.$addCheckboxControl.addEventListener('click', () => this.addControl('checkbox'));
        this.$addTextControl.addEventListener('click', () => this.addControl('text'));
        this.$addTextareaControl.addEventListener('click', () => this.addControl('textarea'));
        // 分页按钮点击事件
        this.$prevPageBtn.addEventListener('click', () => this.goToPrevPage());
        this.$nextPageBtn.addEventListener('click', () => this.goToNextPage());
    },
    
    loadFormList: function() {
        // 发送API请求获取所有表单列表
        fetch(`${config.backendUrl}/form/list`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.data && data.data.length > 0) {
                this.allForms = data.data;
                this.currentPage = 1;
                this.renderPagination();
            } else {
                this.allForms = [];
                this.renderEmptyFormList();
            }
        })
        .catch(error => {
            console.error('加载表单列表失败:', error);
            this.allForms = [];
            this.renderEmptyFormList('加载失败，请重试');
        });
    },
    
    // 渲染表单列表，考虑分页
    renderFormList: function(forms) {
        this.$formListBody.innerHTML = '';
        
        forms.forEach(form => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${form.name}</td>
                <td>${truncateChinese(form.description)}</td>
                <td>${form.created_realname}</td>
                <td>${formatDateTime(form.created_at)}</td>
                <td>${formatDateTime(form.updated_at)}</td>
                <td><span class="status-badge ${form.is_active ? 'active' : 'inactive'}">${form.is_active ? '启用' : '禁用'}</span></td>
                <td>
                    ${form.is_protected === 1 ? `
                        <button class="btn btn-sm btn-action preview-form" data-id="${form.id}">预览</button>
                        <span style="color: #666;">🔒表格受保护</span>
                    ` : `
                        <button class="btn btn-sm btn-action edit-form" data-id="${form.id}">编辑</button>
                        <button class="btn btn-sm btn-action delete-form" data-id="${form.id}">删除</button>
                    `}
                </td>
            `;
            this.$formListBody.appendChild(tr);
        });
        // 绑定编辑和删除按钮事件
        document.querySelectorAll('.edit-form').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const formId = parseInt(e.target.dataset.id);
                this.openEditFormModal(formId);
            });
        });
        document.querySelectorAll('.delete-form').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const formId = parseInt(e.target.dataset.id);
                this.deleteForm(formId);
            });
        });
        // 绑定预览按钮事件
        document.querySelectorAll('.preview-form').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const formId = parseInt(e.target.dataset.id);
                this.openFormPreviewModal(formId);
            });
        });
    },
    
    // 渲染分页
    renderPagination: function() {
        // 重新计算总页数
        this.totalPages = Math.ceil(this.allForms.length / this.itemsPerPage);
        // 确保当前页不超过总页数
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }
        // 计算当前页的数据范围
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.allForms.length);
        const currentData = this.allForms.slice(startIndex, endIndex);
        // 渲染当前页的数据
        if (currentData.length > 0) {
            this.renderFormList(currentData);
        } else {
            this.renderEmptyFormList();
        }
        // 更新分页信息
        this.$pageInfo.textContent = `第 ${this.currentPage} 页 / 共 ${this.totalPages} 页`;
        // 更新按钮状态
        this.$prevPageBtn.disabled = this.currentPage === 1;
        this.$nextPageBtn.disabled = this.currentPage === this.totalPages;
    },
    
    // 上一页
    goToPrevPage: function() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderPagination();
        }
    },
    
    // 下一页
    goToNextPage: function() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.renderPagination();
        }
    },
    
    renderEmptyFormList: function(message = '暂无表单数据') {
        this.$formListBody.innerHTML = `
            <tr class="no-data">
                <td colspan="6" class="text-center">${message}</td>
            </tr>
        `;
    },
    
    // 打开表单预览模态框
    openFormPreviewModal: function(formId) {
        // 发送API请求获取表单预览数据
        fetch(`${config.backendUrl}/form_preview/${formId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 0 && data.data) {
                const form = data.data;
                this.renderFormPreview(form);
            } else {
                alert('获取表单预览数据失败: ' + (data.message || '未知错误'));
            }
        })
        .catch(error => {
            console.error('获取表单预览数据失败:', error);
            alert('获取表单预览数据失败，请重试');
        });
    },
    
    // 渲染表单预览
    renderFormPreview: function(form) {
        // 创建预览模态框
        const modal = document.createElement('div');
        modal.className = 'modal cloud-form-preview-modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content" style="margin: auto; width: 80%; max-width: 800px;">
                <div class="modal-header">
                    <h3 class="modal-title">表单预览 - ${form.name}</h3>
                    <button class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <p class="cloud-form-preview-description">${form.description || '无描述'}</p>
                    <div class="cloud-form-preview-container">
                        <!-- 预览内容将通过JavaScript动态添加 -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary cloud-form-close-preview">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 获取预览容器
        const previewContainer = modal.querySelector('.cloud-form-preview-container');
        
        // 渲染表单控件（禁用状态）
        form.controls.forEach(control => {
            const controlEl = document.createElement('div');
            controlEl.className = 'form-group';
            
            let controlHtml = `<label>${control.label} ${control.required ? '<span class="required">*</span>' : ''}</label>`;
            
            switch(control.type) {
                case 'text':
                    controlHtml += `
                        <input type="text" class="form-control" placeholder="${control.placeholder || ''}" value="${control.default_value || ''}" disabled>
                    `;
                    break;
                case 'textarea':
                    controlHtml += `
                        <textarea class="form-control" rows="4" placeholder="${control.placeholder || ''}" disabled>${control.default_value || ''}</textarea>
                    `;
                    break;
                case 'radio':
                    controlHtml += `<div class="cloud-form-preview-radio-group">`;
                    if (control.options && control.options.length > 0) {
                        control.options.forEach((option, index) => {
                            const isChecked = control.default_value === option;
                            controlHtml += `
                                <label class="cloud-form-preview-radio-label">
                                    <input type="radio" name="preview-radio-${control.id}" value="${option}" ${isChecked ? 'checked' : ''} disabled>
                                    ${option}
                                </label>
                            `;
                        });
                    }
                    controlHtml += `</div>`;
                    break;
                case 'checkbox':
                    controlHtml += `<div class="cloud-form-preview-checkbox-group">`;
                    if (control.options && control.options.length > 0) {
                        control.options.forEach((option, index) => {
                            const isChecked = control.default_value && control.default_value.includes(option);
                            controlHtml += `
                                <label class="cloud-form-preview-checkbox-label">
                                    <input type="checkbox" name="preview-checkbox-${control.id}" value="${option}" ${isChecked ? 'checked' : ''} disabled>
                                    ${option}
                                </label>
                            `;
                        });
                    }
                    controlHtml += `</div>`;
                    break;
                default:
                    controlHtml += `
                        <div class="form-control disabled">
                            不支持的控件类型: ${control.type}
                        </div>
                    `;
            }
            
            controlEl.innerHTML = controlHtml;
            previewContainer.appendChild(controlEl);
        });
        
        // 绑定关闭事件
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        modal.querySelector('.cloud-form-close-preview').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    },
    
    openAddFormModal: function() {
        this.currentFormId = null;
        this.controls = [];
        
        // 重置表单
        document.getElementById('form-name').value = '';
        document.getElementById('cloud-form-description').value = '';
        this.$controlsContainer.innerHTML = '';
        // 设置模态框标题
        this.$modalTitle.textContent = '添加新表单';
        // 显示模态框
        this.$formModal.style.display = 'flex';
    },
    
    openEditFormModal: function(formId) {
        // 发送API请求获取表单详情
        fetch(`${config.backendUrl}/form/detail/${formId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.data) {
                const form = data.data;
                this.currentFormId = form.id;
                this.controls = form.controls || [];
                document.getElementById('form-name').value = form.name;
                document.getElementById('cloud-form-description').value = form.description || '';
                this.renderControls();
                this.$modalTitle.textContent = '编辑表单';
                this.$formModal.style.display = 'flex';
            } else {
                alert('获取表单详情失败: ' + (data.msg || '未知错误'));
            }
        })
        .catch(error => {
            console.error('获取表单详情失败:', error);
            alert('获取表单详情失败，请重试');
        });
    },
    
    closeFormModal: function() {
        this.$formModal.style.display = 'none';
        // 重置提交状态
        this.isSubmitting = false;
        if (this.$saveForm) {
            this.$saveForm.disabled = false;
            this.$saveForm.textContent = '保存';
        }
    },
    
    addControl: function(type) {
        const controlId = Date.now(); // 使用时间戳作为临时ID
        const control = {
            id: controlId,
            type: type,
            label: this.getControlDefaultLabel(type),
            placeholder: this.getControlDefaultPlaceholder(type),
            required: false,
            options: type === 'select' || type === 'radio' ? ['选项1', '选项2', '选项3'] : [],
            default_value: ''
        };
        
        this.controls.push(control);
        this.renderControls();
    },
    
    getControlDefaultLabel: function(type) {
        const typeNames = {
            'radio': '单选题',
            'checkbox': '多选题',
            'text': '填空题',
            'textarea': '文本题'
        };
        
        const count = this.controls.filter(c => c.type === type).length + 1;
        return `${typeNames[type] || '控件'} ${count}`;
    },
    
    getControlDefaultPlaceholder: function(type) {
        const placeholders = {
            'radio': '',
            'checkbox': '',
            'text': '请输入',
            'textarea': '请输入详细内容'
        };
        
        return placeholders[type] || '';
    },
    
    renderControls: function() {
        // 清除所有事件监听器，防止重复绑定
        while (this.$controlsContainer.firstChild) {
            this.$controlsContainer.removeChild(this.$controlsContainer.firstChild);
        }
        
        this.controls.forEach((control, index) => {
            const controlEl = document.createElement('div');
            controlEl.className = 'control-item';
            controlEl.dataset.id = control.id;
            
            // 生成控件HTML
            let controlHtml = `
                <div class="control-header">
                    <span class="control-type">
                        ${this.getControlTypeName(control.type)}
                        <label class="control-checkbox" style="display:inline-flex; align-items:center; margin-left:15px; font-weight:normal; white-space:nowrap;">
                            必填
                            <input type="checkbox" class="control-required" ${control.required ? 'checked' : ''} data-index="${index}">
                        </label>
                    </span>
                    <div class="control-actions">
                        <button type="button" class="btn btn-xs btn-action move-up" data-index="${index}">↑</button>
                        <button type="button" class="btn btn-xs btn-action move-down" data-index="${index}">↓</button>
                        <button type="button" class="btn btn-xs btn-action remove-control" data-index="${index}">删除</button>
                    </div>
                </div>
                <div class="control-content">
                    <div class="form-group">
                        <label>标题</label>
                        <input type="text" class="form-control control-label" value="${control.label || ''}" data-index="${index}">
                    </div>
            `;
            
            // 添加特定类型的控件设置
            if (control.type === 'text' || control.type === 'textarea') {
                controlHtml += `
                    <div class="form-group">
                        <label>提示文字</label>
                        <input type="text" class="form-control control-placeholder" value="${control.placeholder || ''}" data-index="${index}">
                    </div>
                `;
            } else if (control.type === 'radio' || control.type === 'checkbox') {
                controlHtml += `
                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="margin-bottom: 0;">选项</label>
                            <button type="button" class="btn btn-sm btn-outline add-option" style="height: 24px; padding: 1px 5px; margin-right: 5px" data-index="${index}">添加选项</button>
                        </div>
                        <div class="options-container" data-index="${index}">
                `;
                control.options.forEach((option, optIndex) => {
                    controlHtml += `
                            <div class="option-item">
                                <input type="text" class="form-control option-text" value="${option || ''}" data-index="${index}" data-opt-index="${optIndex}">
                                <button type="button" class="btn btn-xs btn-action remove-option" data-index="${index}" data-opt-index="${optIndex}">删除</button>
                            </div>
                    `;
                });
                controlHtml += `
                        </div>
                    </div>
                `;
            }
            controlHtml += `
                </div>
            `;
            controlEl.innerHTML = controlHtml;
            this.$controlsContainer.appendChild(controlEl);
        });
        
        // 绑定控件相关事件
        this.bindControlEvents();
    },
    
    getControlTypeName: function(type) {
        const typeNames = {
            'radio': '单选题',
            'checkbox': '多选题',
            'text': '填空题',
            'textarea': '文本题'
        };
        
        return typeNames[type] || type;
    },
    
    bindControlEvents: function() {
        // 控件标题输入事件
        document.querySelectorAll('.control-label').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.controls[index].label = e.target.value;
            });
        });
        
        // 控件必填选项事件
        document.querySelectorAll('.control-required').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.controls[index].required = e.target.checked;
            });
        });
        
        // 控件提示文字输入事件
        document.querySelectorAll('.control-placeholder').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.controls[index].placeholder = e.target.value;
            });
        });
        
        // 选项输入事件
        document.querySelectorAll('.option-text').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const optIndex = parseInt(e.target.dataset.optIndex);
                this.controls[index].options[optIndex] = e.target.value;
            });
        });
        
        // 删除选项事件
        document.querySelectorAll('.remove-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const optIndex = parseInt(e.target.dataset.optIndex);
                this.controls[index].options.splice(optIndex, 1);
                this.renderControls();
            });
        });
        
        // 添加选项事件
        document.querySelectorAll('.add-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.controls[index].options.push('新选项');
                this.renderControls();
            });
        });
        
        // 移除控件事件
        document.querySelectorAll('.remove-control').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.controls.splice(index, 1);
                this.renderControls();
            });
        });
        
        // 上移控件事件
        document.querySelectorAll('.move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (index > 0) {
                    [this.controls[index - 1], this.controls[index]] = [this.controls[index], this.controls[index - 1]];
                    this.renderControls();
                }
            });
        });
        
        // 下移控件事件
        document.querySelectorAll('.move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (index < this.controls.length - 1) {
                    [this.controls[index], this.controls[index + 1]] = [this.controls[index + 1], this.controls[index]];
                    this.renderControls();
                }
            });
        });
    },
    
    saveForm: function() {
        // 防止重复提交
        if (this.isSubmitting) {
            return;
        }
        const formName = document.getElementById('form-name').value.trim();
        const formDescription = document.getElementById('cloud-form-description').value.trim();
        // 验证表单
        if (!formName) {
            alert('请输入表单名称');
            this.isSubmitting = false;
            return;
        }
        this.isSubmitting = true;
        this.$saveForm.disabled = true;
        this.$saveForm.textContent = '提交中...';
        // 准备表单数据
        const formData = {
            name: formName,
            description: formDescription,
            created_uid: localStorage.getItem('uid'),
            created_realname: $('#username').text(),
            controls: this.controls
        };
        // 发送API请求
        const url = this.currentFormId ? `${config.backendUrl}/form/update/${this.currentFormId}` : `${config.backendUrl}/form/create`;
        const method = this.currentFormId ? 'PUT' : 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                this.closeFormModal();
                this.loadFormList();
                alert(this.currentFormId ? '表单更新成功' : '表单创建成功');
            } else {
                alert('保存失败: ' + (data.msg || '未知错误'));
            }
        })
        .catch(error => {
            console.error('保存表单失败:', error);
            alert('保存表单失败，请重试');
        })
        .finally(() => {
            // 无论成功失败，都重置提交状态
            this.isSubmitting = false;
            this.$saveForm.disabled = false;
            this.$saveForm.textContent = '保存';
        });
    },
    
    deleteForm: function(formId) {
        if (confirm('确定要删除这个表单吗？')) {
            fetch(`${config.backendUrl}/form/delete/${formId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    this.loadFormList();
                    alert('表单删除成功');
                }
            })
            .catch(error => {
                console.error('删除表单失败:', error);
                alert('删除表单失败，请重试');
            });
        }
    }
};

// 将模块挂载到window对象上，以便在home.js中调用
window.cloudFormModule = cloudFormModule;