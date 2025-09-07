// 党员档案模块逻辑
$(document).ready(function() {
    // 初始化党员档案页面
    function initProfile() {
        console.log('党员档案页面初始化');
        const URL = $('#URL').text();
        // 存储从后端获取的组织结构数据
        let branchData = { committees: [], subcommittees: {}, branches: {} };  // 格式: {committees: [], subcommittees: {committeeId: [...]}, branches: {subcommitteeId: [...]}}
        let allCommittees = [];  // 存储所有党总委信息
        // 从后端获取组织结构数据
        function fetchBranchData() {
                return $.ajax({
                    url: URL + '/profile/branches',
                    xhrFields: {withCredentials: true},
                    type: 'GET',
                    dataType: 'json'
                }).done(function(resp) {
                    if (resp.code === 1000) {
                        // 构建三级组织结构映射
                        resp.data.forEach(committee => {
                            // 保存党总委信息
                            const committeeInfo = {
                                value: committee.value,
                                text: committee.name
                            };
                            branchData.committees.push(committeeInfo);
                            allCommittees.push(committeeInfo);
                             
                            // 处理二级党组织和基层党支部
                            if (committee.subcommittees) {
                                committee.subcommittees.forEach(subcommittee => {
                                    // 保存二级党组织信息
                                    if (!branchData.subcommittees[committee.value]) {
                                        branchData.subcommittees[committee.value] = [];
                                    }
                                    branchData.subcommittees[committee.value].push({
                                        value: subcommittee.value,
                                        text: subcommittee.name
                                    });
                                    
                                    // 保存基层党支部信息
                                    if (subcommittee.branches) {
                                        branchData.branches[subcommittee.value] = subcommittee.branches.map(branch => ({
                                            value: branch.value,
                                            text: branch.name
                                        }));
                                    }
                                });
                            }
                        });
                        // 填充党总委下拉框
                        populateCommittees();
                    } else {
                        console.error('获取组织结构数据失败:', resp.msg);
                    }
                }).fail(function() {
                    console.error('获取组织结构数据失败：无法连接至服务器');
                });
            }
        
        // 填充党总委下拉框
        function populateCommittees() {
            const committeeSelect = $('#party-committee');
            committeeSelect.empty();
            committeeSelect.append('<option value="">请选择党总委</option>');
            
            allCommittees.forEach(committee => {
                committeeSelect.append(`<option value="${committee.value}">${committee.text}</option>`);
            });
        }

        // 加载二级党组织
        function loadPartySubcommittees(committeeId) {
            const subcommitteeSelect = $('#party-subcommittee');
            subcommitteeSelect.empty();
            subcommitteeSelect.append('<option value="">请选择二级党组织</option>');
            
            // 清空并禁用基层党支部
            const branchSelect = $('#party-branch');
            branchSelect.empty();
            branchSelect.append('<option value="">请选择基层党支部</option>');
            branchSelect.prop('disabled', true);
            
            if (committeeId && branchData.subcommittees[committeeId]) {
                branchData.subcommittees[committeeId].forEach(subcommittee => {
                    subcommitteeSelect.append(`<option value="${subcommittee.value}">${subcommittee.text}</option>`);
                });
                subcommitteeSelect.prop('disabled', false);
            } else {
                subcommitteeSelect.prop('disabled', true);
            }
        }
        
        // 填充表单数据
        function populateForm(data, isReadOnly) {
            // 个人基本信息表单
            $('#real-name').val(data.real_name || '');
            $('#alias').val(data.alias || '');
            $('#gender').val(data.gender || 'male');
            $('#birth-date').val(data.birth_date || '');
            
            // 计算并设置年龄
            if (data.birth_date) {
                const age = calculateAge(data.birth_date);
                $('#age').val(age);
            }
            
            $('#native-place').val(data.native_place || '');
            $('#education').val(data.education || 'bachelor');
            $('#position').val(data.position || '');
            $('#student-id').val(data.student_id || ''); // 学工号字段
            $('#contact').val(data.contact || '');
            $('#address').val(data.address || ''); // 备注字段
            
            // 组织关系信息表单
            $('#party-committee').val(data.party_committee || '');
            
            // 设置党总委、二级党组织和基层党支部
            if (data.party_committee) {
                // 先加载二级党组织
                loadPartySubcommittees(data.party_committee);
                setTimeout(() => {
                    if (data.party_subcommittee) {
                        $('#party-subcommittee').val(data.party_subcommittee);
                        // 再加载基层党支部
                        loadPartyBranches(data.party_subcommittee);
                        setTimeout(() => {
                            if (data.party_branch) {
                                $('#party-branch').val(data.party_branch);
                            }
                            // 确保表单处于正确的只读状态
                            if (isReadOnly !== undefined) {
                                setFormReadOnly(isReadOnly);
                            }
                        }, 5);
                    } else {
                        // 如果没有二级党组织数据，也确保表单处于正确的只读状态
                        if (isReadOnly !== undefined) {
                            setFormReadOnly(isReadOnly);
                        }
                    }
                }, 5);
            } else {
                // 如果没有党总委数据，也确保表单处于正确的只读状态
                if (isReadOnly !== undefined) {
                    setFormReadOnly(isReadOnly);
                }
            }
            
            $('#party-status').val(data.party_status || '普通正式党员');
            $('#join-date').val(data.join_date || '');
            
            // 如果有党支部名称，显示出来
            if (data.party_branch_name && $('#branch-name-display').length === 0) {
                // 添加显示党支部名称的元素
                const branchSelect = $('#party-branch');
                const nameDisplay = $(`<span id="branch-name-display" class="ml-2 text-muted" style="display: none">(${data.party_branch_name})</span>`);
                branchSelect.after(nameDisplay);
            } else if (data.party_branch_name && $('#branch-name-display').length > 0) {
                // 更新已有的党支部名称显示
                $('#branch-name-display').text(`(${data.party_branch_name})`);
            } else if ($('#branch-name-display').length > 0) {
                // 如果没有党支部名称，移除显示元素
                $('#branch-name-display').remove();
            }
        }
        
        // 计算年龄
        function calculateAge(birthDate) {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age + '岁';
        }
        // 加载基层党支部选项
        function loadPartyBranches(subcommitteeId) {
            const branchSelect = $('#party-branch');
            branchSelect.empty();
            branchSelect.append('<option value="">请选择基层党支部</option>');
            
            if (subcommitteeId && branchData.branches[subcommitteeId]) {
                branchData.branches[subcommitteeId].forEach(branch => {
                    branchSelect.append(`<option value="${branch.value}">${branch.text}</option>`);
                });
                branchSelect.prop('disabled', false);
            } else {
                branchSelect.prop('disabled', true);
            }
        }
        
        // 设置表单为只读模式
        function setFormReadOnly(readOnly) {
            // 个人基本信息表单
            const basicFormElements = $('#profile-form input, #profile-form select, #profile-form textarea');
            basicFormElements.prop('readonly', readOnly);
            basicFormElements.prop('disabled', readOnly);
            // 组织关系信息表单
            const partyFormElements = $('#party-relation-form input, #party-relation-form select');
            partyFormElements.prop('readonly', readOnly);
            partyFormElements.prop('disabled', readOnly);
            // 显示或隐藏按钮
            if (readOnly) {
                $('#edit-btn').show();
                $('#save-btn').hide();
                $('#cancel-btn').hide();
            } else {
                $('#edit-btn').hide();
                $('#save-btn').show();
                $('#cancel-btn').show();
            }
        }
        
        // 保存表单数据
        function saveForm() {
            // 验证表单
            const realName = $('#real-name').val().trim();
            const birthDate = $('#birth-date').val();
            const nativePlace = $('#native-place').val().trim();
            const committee = $('#party-committee').val();
            const status = $('#party-status').val();
            
            if (!realName) {
                alert('请输入真实姓名');
                $('#real-name').focus();
                return;
            }
            
            if (!birthDate) {
                alert('请选择出生日期');
                $('#birth-date').focus();
                return;
            }
            
            if (!nativePlace) {
                alert('请输入籍贯');
                $('#native-place').focus();
                return;
            }
            
            if (!committee) {
                alert('请选择党总委');
                $('#party-committee').focus();
                return;
            }
            
            const subcommittee = $('#party-subcommittee').val();
            if (!subcommittee) {
                alert('请选择二级党组织');
                $('#party-subcommittee').focus();
                return;
            }
            
            // 收集表单数据
            const formData = {
                real_name: realName,
                alias: $('#alias').val().trim(),
                gender: $('#gender').val(),
                birth_date: birthDate,
                native_place: nativePlace,
                education: $('#education').val(),
                student_id: $('#student-id').val() ? parseInt($('#student-id').val()) : null, // 学工号字段，转换为整数
                position: $('#position').val().trim(),
                contact: $('#contact').val().trim(),
                address: $('#address').val().trim(),
                party_committee: committee,
                party_subcommittee: subcommittee,
                party_branch: $('#party-branch').val(),
                party_status: status,
                join_date: $('#join-date').val()
            };
            
            console.log('保存表单数据:', formData);
            
            // 发送AJAX请求到服务器保存数据
            $.ajax({
                url: URL + '/profile/modify',
                xhrFields: {withCredentials: true},
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData),
                dataType: 'json',
                success: function(resp) {
                    if (resp.code === 1000) {
                        alert('保存成功！');
                        setFormReadOnly(true);
                        checkProfileCompleteAfterSave();
                    } else {
                        alert('保存失败：' + (resp.msg || '未知错误'));
                    }
                },
                error: function() {
                    alert('保存失败：无法连接至服务器，请稍后再试。');
                }
            });
        
        // 保存后检查档案是否完整
        function checkProfileCompleteAfterSave() {
            $.ajax({
                url: URL + '/user/check_profile_complete',
                xhrFields: {withCredentials: true},
                type: 'GET',
                dataType: 'json',
                success: function (resp) {
                    if (resp.code === 1000 && resp.data.is_complete) {
                        if (window.isForcedProfile !== undefined) {
                            window.isForcedProfile = false;
                            alert('您的党员档案信息已完善，现在可以浏览其他页面了。');
                        }
                    }
                },
                error: function () {
                    console.log("检查档案完整性失败");
                }
            });
        }
        }
        
        // 绑定事件监听
        function bindEvents() {
            // 编辑按钮点击事件
            $('#edit-btn').on('click', function() {
                setFormReadOnly(false);
            });
            
            // 保存按钮点击事件
            $('#save-btn').on('click', saveForm);
            
            // 取消按钮点击事件
            $('#cancel-btn').on('click', function() {
                // 重新填充表单数据，取消编辑
                populateForm(mockProfileData);
                setFormReadOnly(true);
            });
            
            // 出生日期变化事件
            $('#birth-date').on('change', function() {
                const birthDate = $(this).val();
                if (birthDate) {
                    const age = calculateAge(birthDate);
                    $('#age').val(age);
                } else {
                    $('#age').val('');
                }
            });
            
            // 党总委变化事件
            $('#party-committee').on('change', function() {
                const committeeId = $(this).val();
                loadPartySubcommittees(committeeId);
                // 移除党支部名称显示
                $('#branch-name-display').remove();
            });
            
            // 二级党组织变化事件
            $('#party-subcommittee').on('change', function() {
                const subcommitteeId = $(this).val();
                loadPartyBranches(subcommitteeId);
                // 移除党支部名称显示
                $('#branch-name-display').remove();
            });
            
            // 基层党支部变化事件
            $('#party-branch').on('change', function() {
                const branchId = $(this).val();
                const subcommitteeId = $('#party-subcommittee').val();
                
                // 如果有选择基层党支部，显示名称
                if (branchId && subcommitteeId && branchData.branches[subcommitteeId]) {
                    const selectedBranch = branchData.branches[subcommitteeId].find(branch => branch.value === branchId);
                    if (selectedBranch) {
                        if ($('#branch-name-display').length === 0) {
                            const branchSelect = $(this);
                            const nameDisplay = $(`<span id="branch-name-display" class="ml-2 text-muted" style="display: none">(${selectedBranch.text})</span>`);
                            branchSelect.after(nameDisplay);
                        } else {
                            $('#branch-name-display').text(`(${selectedBranch.text})`);
                        }
                    }
                } else {
                    // 移除党支部名称显示
                    $('#branch-name-display').remove();
                }
            });
        }
        
        // 先获取组织结构数据，然后获取用户档案数据
        $.when(fetchBranchData()).done(function() {
            // 从后端获取profile数据
            $.ajax({
                url: URL + '/profile/get',
                xhrFields: {withCredentials: true},
                type: 'GET',
                dataType: 'json',
                success: function(resp) {
                    let isReadOnly = true;
                    if (resp.code === 1000) {
                        // 如果有数据，使用后端返回的数据
                        populateForm(resp.data || {}, isReadOnly);
                    } else {
                        // 如果没有数据，渲染空表单
                        populateForm({}, isReadOnly);
                        // 没有数据时默认为可编辑状态
                        isReadOnly = false;
                    }
                    // 设置表单状态
                    setFormReadOnly(isReadOnly);
                    bindEvents();
                },
                error: function() {
                    alert('获取档案数据失败：无法连接至服务器，请稍后再试。');
                    // 渲染空表单
                    populateForm({});
                    // 错误时默认为可编辑状态
                    setFormReadOnly(false);
                    bindEvents();
                }
            });
        });
    }

    // 暴露初始化函数供home.js调用
    window.profileModule = {
        init: initProfile
    };
});