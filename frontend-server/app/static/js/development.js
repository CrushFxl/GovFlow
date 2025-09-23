// 党员发展模块逻辑
// 党员发展页面交互逻辑

// 页面加载完成后执行
$(document).ready(function() {
    // 从home.html获取后端base_url
    const URL = $('#URL').text();
    
    // 页面元素
    const searchInput = $('#dyfz_search_input');
    const searchButton = $('#dyfz_search_button');
    const searchResult = $('#dyfz_search_result');
    const statusFilter = $('#dyfz_status_filter');
    const refreshButton = $('#dyfz_refresh_button');
    const tableBody = $('#dyfz_table_body');
    const prevPageButton = $('#dyfz_prev_page');
    const nextPageButton = $('#dyfz_next_page');
    const currentPageElement = $('#dyfz_current_page');
    const totalPagesElement = $('#dyfz_total_pages');
    
    // 分页参数
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 1;
    let allRecords = [];
    
    // 初始化流程条
    function initProgressBar() {
        // 默认将申请入党节点设为激活状态
        $('.dyfz_progress_step').removeClass('active highlight');
        $('.dyfz_progress_step:first').addClass('active');
    }
    
    // 搜索用户
    function searchUser() {
        const keyword = searchInput.val().trim();
        if (!keyword) {
            searchResult.html('<div style="color: #e74c3c;">请输入学工号或姓名</div>');
            return;
        }
        // 发送请求查询用户
        $.ajax({
            url: URL + '/get_development_records',
            xhrFields: {withCredentials: true},
            type: 'GET',
            data: {'status' : 'all', 'keyword': keyword},
            success: function(response) {
                if (response.code === 200) {
                    allRecords = response.data;
                    totalPages = Math.ceil(allRecords.length / pageSize);
                    currentPage = 1;
                    renderTable();        // 重新刷新页面
                }
            },
            error: function() {
                searchResult.html('<div style="color: #e74c3c;">搜索失败，请稍后再试</div>');
            }
        });
    }
    
    // 高亮显示政治面貌
    function highlightPoliticalStatus(status) {
        // 重置所有节点样式
        $('.dyfz_progress_step').removeClass('active highlight');
        
        // 高亮显示目标状态节点
        const statusStep = $('.dyfz_progress_step.dyfz_step' + status);
        
        if (statusStep.length > 0) {
            // 高亮目标节点
            statusStep.addClass('highlight');
            
            // 激活所有前面的节点
            const allSteps = $('.dyfz_progress_step');
            const targetIndex = allSteps.index(statusStep);
            
            for (let i = 0; i <= targetIndex; i++) {
                allSteps.eq(i).addClass('active');
            }
        } else {
            // 如果没找到对应状态，默认激活第一个节点
            $('.dyfz_progress_step:first').addClass('active');
        }
    }
    
    // 加载党员发展记录
    function loadDevelopmentRecords() {
        const status = statusFilter.val();
        // 显示加载状态
        tableBody.html('<tr><td colspan="7" class="dyfz_no_data">正在加载数据...</td></tr>');
        // 发送请求获取记录
        $.ajax({
            url: URL + `/get_development_records`,
            xhrFields: {withCredentials: true},
            data: {'status' : status, 'keyword': ''},
            type: 'GET',
            success: function(response) {
                if (response.code === 200) {
                    allRecords = response.data;
                    totalPages = Math.ceil(allRecords.length / pageSize);
                    currentPage = 1; // 重置为第一页
                    renderTable();
                } else {
                    tableBody.html('<tr><td colspan="7" class="dyfz_no_data">' + response.msg + '</td></tr>');
                }
            }
        });
    }
    
    // 渲染表格数据
    function renderTable() {
        // 计算当前页的数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, allRecords.length);
        const currentRecords = allRecords.slice(startIndex, endIndex);
        
        // 更新分页信息
        currentPageElement.text(currentPage);
        totalPagesElement.text(totalPages);
        
        // 更新分页按钮状态
        prevPageButton.prop('disabled', currentPage === 1);
        nextPageButton.prop('disabled', currentPage === totalPages);
        
        // 渲染表格内容
        if (currentRecords.length === 0) {
            tableBody.html('<tr><td colspan="7" class="dyfz_no_data">暂无数据</td></tr>');
            // 无数据时重置流程条
            initProgressBar();
            return;
        }
        
        let tableHtml = '';
        currentRecords.forEach(function(record, index) {
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${record.real_name}</td>
                    <td>
                        <span class="dyfz_status_${record.political_status.replace(/\s+/g, '_')}">
                            ${record.political_status}
                        </span>
                    </td>
                    <td>${record.contact}</td>
                    <td>${record.description}</td>
                    <td>${record.created_at}</td>
                    <td><button class="pf_detail-btn btn btn-action delete-development" data-id="${record.id}">删除</button></td>
                </tr>
            `;
        });
        
        tableBody.html(tableHtml);
        
        // 为删除按钮添加点击事件
        $('.delete-development').click(function() {
            const recordId = $(this).data('id');
            deleteDevelopmentRecord(recordId);
        });
        
        // 以表格的第一个对象的政治面貌为准，渲染流程条
        const firstRecord = currentRecords[0];
        if (firstRecord && firstRecord.political_status) {
            highlightPoliticalStatus(firstRecord.political_status);
        }
    }
    
    // 为不同政治面貌添加颜色样式
    function addStatusColorStyles() {
        const styleElement = $('<style></style>');
        const statusColors = {
            '群众': '#95a5a6',
            '入党积极分子': '#3498db',
            '发展对象': '#f39c12',
            '预备党员': '#e67e22',
            '普通正式党员': '#27ae60'
        };
        
        let cssRules = '';
        Object.entries(statusColors).forEach(([status, color]) => {
            const className = `.dyfz_status_${status.replace(/\s+/g, '_')}`;
            cssRules += `${className} { color: ${color}; font-weight: bold; }
`;
        });
        
        styleElement.text(cssRules);
        $('head').append(styleElement);
    }
    
    // 添加状态颜色样式
    addStatusColorStyles();
    
    // 绑定事件处理程序
    function bindEvents() {
        // 搜索按钮点击事件
        searchButton.click(function() {
            searchUser();
        });
        // 回车键搜索
        searchInput.keyup(function(event) {
            if (event.keyCode === 13) {
                searchUser();
            }
        });
        // 刷新按钮点击事件
        refreshButton.click(function() {
            loadDevelopmentRecords();
        });
        // 筛选条件变化事件
        statusFilter.change(function() {
            currentPage = 1;
            loadDevelopmentRecords();
        });
        // 上一页按钮点击事件
        prevPageButton.click(function() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
        // 下一页按钮点击事件
        nextPageButton.click(function() {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });
    }
    
    // 删除党员发展记录
    function deleteDevelopmentRecord(recordId) {
        // 显示确认对话框
        if (!confirm('确定要删除这条党员发展记录吗？此操作不可撤销。')) {
            return;
        }
        
        // 发送删除请求
        $.ajax({
            url: URL + '/delete_record',
            xhrFields: {withCredentials: true},
            type: 'POST',
            data: {id: recordId},
            success: function(response) {
                if (response.code === 200) {
                    alert('删除成功');
                    // 重新加载数据
                    loadDevelopmentRecords();
                } else {
                    alert('删除失败：' + response.msg);
                }
            },
            error: function() {
                alert('网络错误，请稍后再试');
            }
        });
    }
    
    // 暴露初始化函数供home.js调用
    window.developmentModule = {
        init: function() {
            console.log('党员发展页面初始化');
            // 绑定事件处理程序
            bindEvents();
            // 初始化流程条
            initProgressBar();
            // 加载数据
            loadDevelopmentRecords();
        }
    };
});