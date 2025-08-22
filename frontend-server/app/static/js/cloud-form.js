// 云表单页面模块
const cloudFormModule = {
    currentFormId: null,
    controls: [],
    
    init: function() {
        console.log('云表单页面初始化');
        
        // 获取DOM元素
        this.$addFormBtn = document.getElementById('add-form-btn');
        this.$formModal = document.getElementById('form-modal');
        this.$closeModal = document.getElementById('close-modal');
        this.$cancelForm = document.getElementById('cancel-form');
        this.$saveForm = document.getElementById('save-form');
        this.$formListBody = document.getElementById('form-list-body');
        this.$addSelectControl = document.getElementById('add-select-control');
        this.$addRadioControl = document.getElementById('add-radio-control');
        this.$addTextControl = document.getElementById('add-text-control');
        this.$controlsContainer = document.getElementById('controls-container');
        this.$modalTitle = document.getElementById('modal-title');
        
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
        this.$addSelectControl.addEventListener('click', () => this.addControl('select'));
        this.$addRadioControl.addEventListener('click', () => this.addControl('radio'));
        this.$addTextControl.addEventListener('click', () => this.addControl('text'));
        
        // 点击模态框外部关闭模态框
        this.$formModal.addEventListener('click', (e) => {
            if (e.target === this.$formModal) {
                this.closeFormModal();
            }
        });
    },
    
    loadFormList: function() {
        // 发送API请求获取所有表单列表
        fetch(`/api/form/list`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.data && data.data.length > 0) {
                this.renderFormList(data.data);
            } else {
                this.renderEmptyFormList();
            }
        })
        .catch(error => {
            console.error('加载表单列表失败:', error);
            this.renderEmptyFormList('加载失败，请重试');
        });
    },
    
    renderFormList: function(forms) {
        this.$formListBody.innerHTML = '';
        
        forms.forEach(form => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${form.name}</td>
                <td>${form.description || '-'}</td>
                <td>用户${form.creator_id}</td>
                <td>${form.created_at}</td>
                <td>${form.updated_at}</td>
                <td><span class="status-badge ${form.is_active ? 'active' : 'inactive'}">${form.is_active ? '启用' : '禁用'}</span></td>
                <td>
                    <button class="btn btn-sm btn-action edit-form" data-id="${form.id}">编辑</button>
                    <button class="btn btn-sm btn-action delete-form" data-id="${form.id}">删除</button>
                </td>
            `;
            
            this.$formListBody.appendChild(tr);
        });
        
        // 绑定编辑和删除按钮事件
        // 这里可以根据实际需求添加权限控制，例如只允许编辑/删除自己创建的表单
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
    },
    
    renderEmptyFormList: function(message = '暂无表单数据') {
        this.$formListBody.innerHTML = `
            <tr class="no-data">
                <td colspan="6" class="text-center">${message}</td>
            </tr>
        `;
    },
    
    openAddFormModal: function() {
        this.currentFormId = null;
        this.controls = [];
        
        // 重置表单
        document.getElementById('form-name').value = '';
        document.getElementById('form-description').value = '';
        this.$controlsContainer.innerHTML = '';
        
        // 设置模态框标题
        this.$modalTitle.textContent = '添加新表单';
        
        // 显示模态框
        this.$formModal.style.display = 'flex';
    },
    
    openEditFormModal: function(formId) {
        // 发送API请求获取表单详情
        fetch(`/api/form/detail/${formId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.data) {
                const form = data.data;
                this.currentFormId = form.id;
                this.controls = form.controls || [];
                
                // 填充表单
                document.getElementById('form-name').value = form.name;
                document.getElementById('form-description').value = form.description || '';
                
                // 渲染控件
                this.renderControls();
                
                // 设置模态框标题
                this.$modalTitle.textContent = '编辑表单';
                
                // 显示模态框
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
            'select': '选择题',
            'radio': '判断题',
            'text': '填空题'
        };
        
        const count = this.controls.filter(c => c.type === type).length + 1;
        return `${typeNames[type] || '控件'} ${count}`;
    },
    
    getControlDefaultPlaceholder: function(type) {
        const placeholders = {
            'select': '请选择',
            'radio': '',
            'text': '请输入'
        };
        
        return placeholders[type] || '';
    },
    
    renderControls: function() {
        this.$controlsContainer.innerHTML = '';
        
        this.controls.forEach((control, index) => {
            const controlEl = document.createElement('div');
            controlEl.className = 'control-item';
            controlEl.dataset.id = control.id;
            
            // 生成控件HTML
            let controlHtml = `
                <div class="control-header">
                    <span class="control-type">${this.getControlTypeName(control.type)}</span>
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
                    <div class="form-group">
                        <label>必填</label>
                        <input type="checkbox" class="control-required" ${control.required ? 'checked' : ''} data-index="${index}">
                    </div>
            `;
            
            // 添加特定类型的控件设置
            if (control.type === 'text') {
                controlHtml += `
                    <div class="form-group">
                        <label>提示文字</label>
                        <input type="text" class="form-control control-placeholder" value="${control.placeholder || ''}" data-index="${index}">
                    </div>
                `;
            } else if (control.type === 'select' || control.type === 'radio') {
                controlHtml += `
                    <div class="form-group">
                        <label>选项</label>
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
                            <button type="button" class="btn btn-sm btn-outline add-option" data-index="${index}">添加选项</button>
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
            'select': '选择题',
            'radio': '判断题',
            'text': '填空题'
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
        const formName = document.getElementById('form-name').value.trim();
        const formDescription = document.getElementById('form-description').value.trim();
        
        // 验证表单
        if (!formName) {
            alert('请输入表单名称');
            return;
        }
        
        // 准备表单数据
        const formData = {
            name: formName,
            description: formDescription,
            creator_id: 1, // 实际项目中应从登录信息中获取
            controls: this.controls
        };
        
        // 发送API请求
        const url = this.currentFormId ? `/api/form/update/${this.currentFormId}` : '/api/form/create';
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
        });
    },
    
    deleteForm: function(formId) {
        if (confirm('确定要删除这个表单吗？')) {
            fetch(`/api/form/delete/${formId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.code === 200) {
                    this.loadFormList();
                    alert('表单删除成功');
                } else {
                    alert('删除失败: ' + (data.msg || '未知错误'));
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