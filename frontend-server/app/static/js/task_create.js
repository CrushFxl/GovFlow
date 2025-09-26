// 任务创建模态框的Vue应用
const { createApp, ref, reactive, computed, watch } = Vue;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化任务创建Vue应用
    const taskCreateApp = createApp({
        setup() {
            // 模态框显示状态
            const dialogVisible = ref(false);
            
            // 表单引用
            const taskFormRef = ref(null);
            
            // 任务表单数据
            const taskForm = reactive({
                title: '',
                type: '',
                description: '',
                creator: localStorage.getItem('nick') || '',
                location: '',
                startDate: '',
                startTime: '',
                endDate: '',
                endTime: '',
                organizations: [],
                partners: [],
                frequency: '',
                attachment: ''
            });
            
            // 判断是否为通知类型
            const isNotificationType = computed(() => {
                return taskForm.type === '通知';
            });
            
            // 党组织选项
            const organizationOptions = ref([]);
            
            // 党员选项
            const partyMembersOptions = ref([]);
            
            // 表单选项
            const formOptions = ref([]);
            
            // 表单验证规则
            const rules = {
                title: [
                    { required: true, message: '请输入任务标题', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
                ],
                type: [
                    { required: true, message: '请选择任务类型', trigger: 'change' }
                ],
                location: [
                    { required: true, message: '请输入任务地点', trigger: 'blur' }
                ],
                startDate: [
                    { required: true, message: '请选择开始日期', trigger: 'change' }
                ],
                endDate: [
                    { required: true, message: '请选择结束日期', trigger: 'change' }
                ],
                organizations: [
                    { required: true, message: '请选择参与党组织', trigger: 'change' },
                    { type: 'array', min: 1, message: '至少选择一个党组织', trigger: 'change' }
                ],
                frequency: [
                    { required: true, message: '请选择执行频次', trigger: 'change' }
                ],
                attachment: [
                    { required: true, message: '请选择关联附件', trigger: 'change' }
                ]
            };
            
            // 获取党组织列表
            const getOrganizations = (query) => {
                $.ajax({
                    url: `${config.backendUrl}/get_organizations_list`,
                    type: 'GET',
                    data: { query: query },
                    success: function(data) {
                        // 根据后端返回格式调整
                        if (data.code === 0) {
                            organizationOptions.value = data.data || [];
                        } else {
                            console.error('获取党组织列表失败:', data.message);
                            ElMessage.error('获取党组织列表失败');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('获取党组织列表失败:', error);
                        ElMessage.error('获取党组织列表失败');
                    }
                });
            };
            
            // 获取党员列表
            const getPartyMembers = (organizationName) => {
                $.ajax({
                    url: `${config.backendUrl}/get_party_members/${encodeURIComponent(organizationName)}`,
                    type: 'GET',
                    success: function(data) {
                        // 根据后端返回格式调整，合并新获取的党员到现有列表中，避免重复
                        const newMembers = data.data || [];
                        const existingMembers = [...partyMembersOptions.value];
                        
                        newMembers.forEach(member => {
                            if (!existingMembers.includes(member)) {
                                existingMembers.push(member);
                            }
                        });
                        partyMembersOptions.value = existingMembers;
                    }
                });
            };
            
            // 获取所有党员（用于手动输入时的匹配）
            const getAllPartyMembers = () => {
                $.ajax({
                    url: `${config.backendUrl}/get_all_party_members`,
                    type: 'GET',
                    success: function(data) {
                        // 根据后端返回格式调整
                        if (data.code === 1000) {
                            partyMembersOptions.value = data.data.map(member => member.real_name) || [];
                        } else {
                            console.error('获取所有党员失败:', data.message);
                            ElMessage.error('获取所有党员失败');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('获取所有党员失败:', error);
                        ElMessage.error('获取所有党员失败');
                    }
                });
            };
            
            // 获取表单列表
            const getForms = (query) => {
                $.ajax({
                    url: `${config.backendUrl}/get_forms_list`,
                    type: 'GET',
                    data: { query: query },
                    success: function(data) {
                        // 根据后端返回格式调整
                        if (data.code === 0) {
                            formOptions.value = data.data || [];
                        } else {
                            console.error('获取表单列表失败:', data.message);
                            ElMessage.error('获取表单列表失败');
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('获取表单列表失败:', error);
                        ElMessage.error('获取表单列表失败');
                    }
                });
            };
            
            // 保存上一次选择的党组织和党员映射关系
            const orgMembersMap = ref(new Map());
            
            // 当选择党组织时，自动获取该党组织下的党员并添加到参与党员列表
            const handleOrganizationsChange = (newOrgs, oldOrgs = []) => {
                // 获取新增的党组织
                const addedOrgs = newOrgs.filter(org => !oldOrgs.includes(org));
                // 获取移除的党组织
                const removedOrgs = oldOrgs.filter(org => !newOrgs.includes(org));
                
                // 处理新增的党组织
                addedOrgs.forEach((org, index) => {
                    setTimeout(() => {
                        // 保存当前的参与党员列表，用于去重
                        const currentPartners = [...taskForm.partners];
                        
                        $.ajax({
                            url: `${config.backendUrl}/get_party_members/${encodeURIComponent(org)}`,
                            type: 'GET',
                            success: function(data) {
                                // 保存党组织和党员的映射关系
                                const members = data.data || [];
                                orgMembersMap.value.set(org, members);
                                
                                // 将新获取的党员添加到党员选项列表
                                members.forEach(member => {
                                    if (!partyMembersOptions.value.includes(member)) {
                                        partyMembersOptions.value.push(member);
                                    }
                                    // 自动添加到参与党员列表，但要避免重复
                                    if (!currentPartners.includes(member)) {
                                        taskForm.partners.push(member);
                                    }
                                });
                            }
                        });
                    }, index * 100);
                });
                
                // 处理移除的党组织
                removedOrgs.forEach(org => {
                    const members = orgMembersMap.value.get(org) || [];
                    // 从参与党员列表中移除该党组织的所有党员
                    taskForm.partners = taskForm.partners.filter(partner => 
                        !members.includes(partner) || 
                        // 如果党员属于其他已选中的党组织，则保留
                        newOrgs.some(otherOrg => {
                            const otherMembers = orgMembersMap.value.get(otherOrg) || [];
                            return otherMembers.includes(partner);
                        })
                    );
                    // 从映射关系中删除
                    orgMembersMap.value.delete(org);
                });
            };
            
            // 提交表单
            const submitForm = () => {
                // 验证表单
                if (taskFormRef.value) {
                    taskFormRef.value.validate((valid) => {
                        if (!valid) {
                            return;
                        }
                        
                        // 合并日期和时间
                        const startTimeStr = taskForm.startDate && taskForm.startTime 
                            ? `${taskForm.startDate} ${taskForm.startTime}` 
                            : '';
                        const endTimeStr = taskForm.endDate && taskForm.endTime 
                            ? `${taskForm.endDate} ${taskForm.endTime}` 
                            : '';
                        
                        // 构建提交数据
                        const submitData = {
                            ...taskForm,
                            start_time: startTimeStr,
                            end_time: endTimeStr
                        };
                        
                        // 发送请求到后端
                        $.ajax({
                            url: `${config.backendUrl}/api/tasks/create`,
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(submitData),
                            success: function(result) {
                                if (result.success) {
                                    ElMessage.success('任务创建成功');
                                    dialogVisible.value = false;
                                    resetForm();
                                    
                                    // 刷新任务列表（如果页面存在）
                                    if (window.taskManagementModule && typeof window.taskManagementModule.fetchScheduleData === 'function') {
                                        window.taskManagementModule.fetchScheduleData();
                                    }
                                } else {
                                    ElMessage.error(result.message || '任务创建失败');
                                }
                            },
                            error: function(xhr, status, error) {
                                console.error('提交任务失败:', error);
                                ElMessage.error('任务创建失败，请重试');
                            }
                        });
                    });
                }
            };
            
            // 重置表单
            const resetForm = () => {
                taskForm.title = '';
                taskForm.type = '';
                taskForm.description = '';
                taskForm.location = '';
                taskForm.startDate = '';
                taskForm.startTime = '';
                taskForm.endDate = '';
                taskForm.endTime = '';
                taskForm.organizations = [];
                taskForm.partners = [];
                taskForm.frequency = '';
                taskForm.attachment = '';
            };
            
            // 监听党组织变化，传入新旧值
            watch(() => taskForm.organizations, (newVal, oldVal) => {
                handleOrganizationsChange(newVal, oldVal || []);
            });
            
            // 监听任务类型变化，当选择通知时自动设置关联附件为无
            watch(() => taskForm.type, (newType, oldType) => {
                if (newType === '通知') {
                    taskForm.attachment = '无';
                } else if (oldType === '通知' && taskForm.attachment === '无') {
                    // 如果从通知类型切换到其他类型，并且当前附件是"无"，则清空附件选择
                    taskForm.attachment = '';
                }
            });
            
            // 初始化获取所有党员列表
            getAllPartyMembers();
            
            return {
                dialogVisible,
                taskForm,
                taskFormRef,
                rules,
                organizationOptions,
                partyMembersOptions,
                formOptions,
                getOrganizations,
                getForms,
                submitForm,
                isNotificationType
            };
        }
    });
    
    // 使用Element Plus插件
    taskCreateApp.use(ElementPlus);
    
    // 挂载应用
    const appInstance = taskCreateApp.mount('#task-create-app');
    
    // 添加任务按钮点击事件
    document.querySelector('#add-task-btn').addEventListener('click', function() {
        // 显示模态框
        appInstance.dialogVisible = true;
    });
});