// 党员档案模块逻辑
$(document).ready(function() {
    // 初始化切换按钮功能
    initToggleButtons();
    const URL = $('#URL').text();
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
            });
        });
    }

    // 初始化切换按钮功能
    function initToggleButtons() {
        const toggleProfileBtn = $('#toggle-profile-btn');
        const toggleMembersBtn = $('#toggle-members-btn');
        const profileContentArea = $('#profile-content-area');
        const membersSectionArea = $('#members-section-area');
        // 个人信息按钮点击事件
        toggleProfileBtn.on('click', function() {
            // 显示个人信息区域，隐藏党员列表区域
            profileContentArea.show();
            membersSectionArea.hide();
            // 更新按钮激活状态
            toggleProfileBtn.addClass('active');
            toggleMembersBtn.removeClass('active');
            // 更新页面标题
            $('.page_title').text('党员信息');
        });
        
        // 党员列表按钮点击事件
        toggleMembersBtn.on('click', function() {
            // 隐藏个人信息区域，显示党员列表区域
            profileContentArea.hide();
            membersSectionArea.show();            
            // 更新按钮激活状态
            toggleMembersBtn.addClass('active');
            toggleProfileBtn.removeClass('active');
            // 更新页面标题
            $('.page_title').text('党员列表');
        });
    }

    // 初始化党员列表
    let currentPage = 1;
    const pageSize = 7;
    let totalPages = 1;
    let allMembersData = [];

    function initPartyMembersList() {
        console.log('初始化党员列表');
        // 获取所有党员数据
        function fetchAllPartyMembers() {
            showLoadingState();
            $.ajax({
                url: URL + '/get_all_party_members',
                xhrFields: {withCredentials: true},
                type: 'GET',
                dataType: 'json',
                success: function(resp) {
                    allMembersData = resp.data || [];
                    console.log('党员数据总数:', allMembersData.length, '每页显示:', pageSize);
                    totalPages = Math.ceil(allMembersData.length / pageSize);
                    console.log('计算得到的总页数:', totalPages);
                    renderMembersList();
                    renderPagination();
                    hideLoadingState();
                } 
            });
        }
        
        // 渲染党员列表
        function renderMembersList() {
            const tableBody = $('#pf_members_table_body');
            tableBody.empty();
            // 计算当前页的数据范围
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, allMembersData.length);
            const currentPageData = allMembersData.slice(startIndex, endIndex);
            // 渲染表格内容
            if (currentPageData.length === 0) {
                const emptyRow = $('<tr class="no-data"><td colspan="8">暂无党员数据</td></tr>');
                tableBody.append(emptyRow);
            } else {
                currentPageData.forEach((member, index) => {
                    let row = $('<tr>');
                    row.append(`<td>${startIndex + index + 1}</td>`);
                    row.append(`<td>${member.real_name || '-'}</td>`);
                    row.append(`<td>${member.gender || '-'}</td>`);
                    row.append(`<td>${member.party_status || '-'}</td>`);
                    row.append(`<td>${member.position || '-'}</td>`);
                    row.append(`<td>${member.contact || '-'}</td>`);
                    row.append(`<td>${member.party_branch || '-'}</td>`);
                    row.append(`<td><button class="pf_detail-btn btn btn-action " data-id="${member.id}">详情</button></td>`);
                    tableBody.append(row);
                });
            }
        }

        // 渲染分页控件
        function renderPagination() {
            // 清空并完全控制分页容器
            const paginationContainer = $('.pf_pagination');
            paginationContainer.empty();
            
            // 首页按钮
            const firstPageBtn = $(`<button class="pf_pagination-btn ${currentPage === 1 ? 'pf_disabled' : ''}" data-page="1">首页</button>`);
            firstPageBtn.on('click', function() {
                if (currentPage !== 1) {
                    currentPage = 1;
                    renderMembersList();
                    renderPagination();
                }
            });
            paginationContainer.append(firstPageBtn);
            
            // 上一页按钮
            const prevPageBtn = $(`<button id="pf_prev_page" class="pf_pagination-btn ${currentPage === 1 ? 'pf_disabled' : ''}" data-page="${currentPage - 1}">上一页</button>`);
            prevPageBtn.on('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    renderMembersList();
                    renderPagination();
                }
            });
            paginationContainer.append(prevPageBtn);
            
            // 页码按钮 - 只显示当前页附近的页码
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, startPage + 4);
            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = $(`<button class="pf_pagination-btn ${i === currentPage ? 'pf_active' : ''}" data-page="${i}">${i}</button>`);
                pageBtn.on('click', function() {
                    if (i !== currentPage) {
                        currentPage = i;
                        renderMembersList();
                        renderPagination();
                    }
                });
                paginationContainer.append(pageBtn);
            }
            
            // 下一页按钮
            const nextPageBtn = $(`<button id="pf_next_page" class="pf_pagination-btn ${currentPage === totalPages ? 'pf_disabled' : ''}" data-page="${currentPage + 1}">下一页</button>`);
            nextPageBtn.on('click', function() {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderMembersList();
                    renderPagination();
                }
            });
            paginationContainer.append(nextPageBtn);
            
            // 末页按钮
            const lastPageBtn = $(`<button class="pf_pagination-btn ${currentPage === totalPages ? 'pf_disabled' : ''}" data-page="${totalPages}">末页</button>`);
            lastPageBtn.on('click', function() {
                if (currentPage !== totalPages) {
                    currentPage = totalPages;
                    renderMembersList();
                    renderPagination();
                }
            });
            paginationContainer.append(lastPageBtn);
            
            // 页码信息
            const pageInfo = $(`<span id="pf_page_info" class="pf_page-info">第 ${currentPage}/${totalPages} 页，共 ${allMembersData.length} 条记录</span>`);
            paginationContainer.append(pageInfo);
            
            console.log('分页渲染完成: 当前页=' + currentPage + ', 总页数=' + totalPages + ', 总条数=' + allMembersData.length);
        }

        // 显示加载状态
        function showLoadingState() {
            $('#pf_loading-indicator').show();
            $('#pf_members-table-container').hide();
        }
        // 隐藏加载状态
        function hideLoadingState() {
            $('#pf_loading-indicator').hide();
            $('#pf_members-table-container').show();
        }
        
        // 查看党员详情
        function viewMemberDetail(memberId) {
            const modal = $('#pf_member-detail-modal');
            const loadingState = $('#pf_loading-state');
            const detailsContainer = $('#pf_member-details');
            const errorState = $('#pf_error-state');
            
            // 显示弹窗和加载状态
            modal.show();
            loadingState.show();
            detailsContainer.hide();
            errorState.hide();
            
            // 从服务器获取党员详细信息
            $.ajax({
                url: URL + '/get_party_member_detail/' + memberId,
                xhrFields: {withCredentials: true},
                type: 'GET',
                dataType: 'json',
                success: function(resp) {
                    if (resp.code === 1000) {
                        const memberData = resp.data || {};
                        // 填充详情数据
                        $('#pf_member-name').text(memberData.name || '-');
                        $('#pf_member-gender').text(memberData.gender || '-');
                        $('#pf_member-hometown').text(memberData.native_place || '-');
                        $('#pf_member-education').text(getEducationText(memberData.education) || '-');
                        $('#pf_member-political').text(memberData.party_status || '-');
                        $('#pf_member-join-date').text(memberData.join_date || '-');
                        $('#pf_member-phone').text(memberData.contact || '-');
                        $('#pf_member-organization_1').text(memberData.party_committee);
                        $('#pf_member-organization_2').text(memberData.party_subcommittee);
                        $('#pf_member-organization_3').text(memberData.party_branch);
                        $('#pf_member-position').text(memberData.position || '-');
                        $('#pf_member-birth').text(memberData.birth_date || '-');
                        $('#pf_member-address').text(memberData.address || '-');
                        $('#pf_member-student-id').text(memberData.student_id || '-');
                        // 显示详情内容，隐藏加载状态
                        loadingState.hide();
                        detailsContainer.show();
                    } else {
                        console.error('获取党员详情失败:', resp.message || '未知错误');
                        loadingState.hide();
                        errorState.text(resp.message || '获取党员详情失败，请稍后再试');
                        errorState.show();
                    }
                },
                error: function() {
                    console.error('获取党员详情请求失败');
                    loadingState.hide();
                    errorState.text('无法连接至服务器，请检查网络连接后重试');
                    errorState.show();
                }
            });
        }
        
        // 获取学历文本
        function getEducationText(educationValue) {
            const educationMap = {
                'high_school': '高中',
                'college': '专科',
                'bachelor': '本科',
                'master': '硕士',
                'doctor': '博士'
            };
            return educationMap[educationValue] || educationValue;
        }
        // 关闭详情弹窗
        function closeMemberDetailModal() {
            $('#pf_member-detail-modal').hide();
        }
        // 绑定党员列表相关事件
        function bindMembersListEvents() {
            // 委托绑定详情按钮点击事件
            $('#pf_members_table_body').on('click', '.pf_detail-btn', function() {
                const memberId = $(this).data('id');
                viewMemberDetail(memberId);
            });
            // 关闭详情弹窗事件
            $('#pf_close-modal, #pf_close-btn').on('click', closeMemberDetailModal);
        }
        // 初始化党员列表 - 确保在DOM加载完成后再执行
        function init() {
            fetchAllPartyMembers();
            bindMembersListEvents();
        }
        
        // 确保DOM完全加载后再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
    
    $('#pf_members-section').addClass('initialized');
    initPartyMembersList();
    
    // 暴露初始化函数供home.js调用
    window.profileModule = {
        init: initProfile
    };
});