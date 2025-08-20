// 党员档案模块逻辑
$(document).ready(function() {
    // 初始化党员档案页面
    function initProfile() {
        console.log('党员档案页面初始化');
        
        const URL = $('#URL').text();
        
        // 党支部数据映射
        const branchMapping = {
            committee1: [
                {value: "branch11", text: "计算机系党支部"},
                {value: "branch12", text: "软件学院党支部"},
                {value: "branch13", text: "网络工程党支部"}
            ],
            committee2: [
                {value: "branch21", text: "会计系党支部"},
                {value: "branch22", text: "金融系党支部"}
            ],
            committee3: [
                {value: "branch31", text: "中国文学党支部"},
                {value: "branch32", text: "外国语言党支部"}
            ],
            committee4: [
                {value: "branch41", text: "数学系党支部"},
                {value: "branch42", text: "物理系党支部"}
            ]
        };
        
        // 填充表单数据
        function populateForm(data) {
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
            $('#contact').val(data.contact || '');
            $('#address').val(data.address || ''); // 备注字段
            
            // 组织关系信息表单
            $('#party-committee').val(data.party_committee || '');
            
            // 设置党支部
            if (data.party_committee && data.party_branch) {
                loadPartyBranches(data.party_committee);
                setTimeout(() => {
                    $('#party-branch').val(data.party_branch);
                }, 10);
            }
            
            $('#party-status').val(data.party_status || 'official');
            $('#join-date').val(data.join_date || '');
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
        
        // 加载党支部选项
        function loadPartyBranches(committeeId) {
            const branchSelect = $('#party-branch');
            branchSelect.empty();
            branchSelect.append('<option value="">请选择...</option>');
            
            if (committeeId && branchMapping[committeeId]) {
                branchMapping[committeeId].forEach(branch => {
                    branchSelect.append(`<option value="${branch.value}">${branch.text}</option>`);
                });
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
                alert('请选择党总支');
                $('#party-committee').focus();
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
                position: $('#position').val().trim(),
                contact: $('#contact').val().trim(),
                address: $('#address').val().trim(),
                party_committee: committee,
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
                        alert('保存成功');
                        setFormReadOnly(true);
                    } else {
                        alert('保存失败：' + (resp.msg || '未知错误'));
                    }
                },
                error: function() {
                    alert('保存失败：无法连接至服务器，请稍后再试。');
                }
            });
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
            
            // 党总支变化事件
            $('#party-committee').on('change', function() {
                const committeeId = $(this).val();
                loadPartyBranches(committeeId);
            });
        }
        
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
                    populateForm(resp.data || {});
                } else {
                    // 如果没有数据，渲染空表单
                    populateForm({});
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
    }

    // 暴露初始化函数供home.js调用
    window.profileModule = {
        init: initProfile
    };
});