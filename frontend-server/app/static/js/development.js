// 党员发展模块逻辑

// 页面加载完成后执行
$(document).ready(function() {
    const URL = $('#URL').text();
    
    // 页面元素
    const searchInput = $('#dyfz_search_input');
    const searchButton = $('#dyfz_search_button');
    const searchResult = $('#dyfz_search_result');
    const refreshButton = $('#dyfz_refresh_button');
    const tableBody = $('#dyfz_table_body');
    const prevPageButton = $('#dyfz_prev_page');
    const nextPageButton = $('#dyfz_next_page');
    const currentPageElement = $('#dyfz_current_page');
    const totalPagesElement = $('#dyfz_total_pages');
    const statusFilter = $('#dyfz_status_filter'); // 复用现有下拉框作为状态筛选

    const statusMap = {
        1: 'status-pending',
        2: 'status-processing',
        3: 'status-completed',
        4: 'status-canceled'
    };

    const statusTextMap = {
        1: '待审核',
        2: '待处理',
        3: '已完成',
        4: '已取消'
    };
    
    // 分页参数
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 1;
    let allRecords = [];
    let filteredRecords = [];
    
    // 更新筛选下拉框选项为状态选项
    function updateFilterOptions() {
        statusFilter.empty();
        statusFilter.append('<option value="all">全部</option>');
        
        // 遍历状态映射，添加状态选项
        for (const [key, value] of Object.entries(statusTextMap)) {
            statusFilter.append(`<option value="${key}">${value}</option>`);
        }
        
        // 更新标签文本
        const label = statusFilter.prev('label');
        if (label) {
            label.text('筛选状态：');
        }
    }
    
    // 根据状态筛选数据
    function filterByStatus() {
        const selectedStatus = statusFilter.val();
        
        if (selectedStatus === 'all') {
            filteredRecords = [...allRecords];
        } else {
            filteredRecords = allRecords.filter(record => 
                record.status === parseInt(selectedStatus)
            );
        }
        
        currentPage = 1;
        totalPages = Math.ceil(filteredRecords.length / pageSize);
        renderTable();
    }
    
    // 搜索功能（根据新接口调整）
    function searchUser() {
        const keyword = searchInput.val().trim();
        if (!keyword) {
            searchResult.html('<div style="color: #e74c3c;">请输入关键词查询</div>');
            return;
        }
        
        // 根据新接口，先获取所有数据然后在前端筛选
        loadDevelopmentRecords().then(function() {
            if (allRecords.length > 0) {
                // 在前端进行关键词筛选，同时过滤掉通知类型
                const keywordFiltered = allRecords.filter(function(record) {
                    return record.task_type !== '通知' && (
                        record.title && record.title.includes(keyword) ||
                        record.description && record.description.includes(keyword)
                    );
                });
                
                // 应用状态筛选
                const selectedStatus = statusFilter.val();
                let finalFiltered = [];
                
                if (selectedStatus === 'all') {
                    finalFiltered = [...keywordFiltered];
                } else {
                    finalFiltered = keywordFiltered.filter(record => 
                        record.status === parseInt(selectedStatus)
                    );
                }
                
                if (finalFiltered.length > 0) {
                    filteredRecords = finalFiltered;
                    totalPages = Math.ceil(filteredRecords.length / pageSize);
                    currentPage = 1;
                    renderTable();
                    searchResult.html('');
                } else {
                    tableBody.html('<tr><td colspan="6" class="dyfz_no_data">未找到相关数据</td></tr>');
                    searchResult.html('<div style="color: #e74c3c;">未找到相关数据</div>');
                }
            }
        });
    }
    
    // 加载党员发展记录
    function loadDevelopmentRecords() {
        // 显示加载状态
        tableBody.html('<tr><td colspan="6" class="dyfz_no_data">正在加载数据...</td></tr>');
        
        // 返回Promise以便searchUser函数可以等待数据加载完成
        return new Promise(function(resolve, reject) {
            // 发送请求获取记录
            $.ajax({
                url: URL + '/get_development_records',
                xhrFields: {withCredentials: true},
                type: 'POST',
                data: {uid: localStorage.getItem('uid')},
                success: function(response) {
                    if (response.code === 1000) {
                        // 过滤掉通知类型任务
                        allRecords = response.data.filter(record => record.task_type !== '通知');
                        filterByStatus(); // 加载数据后应用状态筛选
                        resolve();
                    } else {
                        tableBody.html('<tr><td colspan="6" class="dyfz_no_data">' + (response.msg || '加载失败') + '</td></tr>');
                        reject(response);
                    }
                }
            });
        });
    }
    
    // 渲染表格数据
    function renderTable() {
        // 计算当前页的数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, filteredRecords.length);
        const currentRecords = filteredRecords.slice(startIndex, endIndex);
        
        // 更新分页信息
        currentPageElement.text(currentPage);
        totalPagesElement.text(totalPages);
        
        // 更新分页按钮状态
        prevPageButton.prop('disabled', currentPage === 1);
        nextPageButton.prop('disabled', currentPage === totalPages);
        
        // 渲染表格内容
        if (currentRecords.length === 0) {
            tableBody.html('<tr><td colspan="5" class="dyfz_no_data">暂无数据</td></tr>');
            return;
        }
        
        let tableHtml = '';
        currentRecords.forEach(function(record, index) {
            // 格式化日期
            const formattedDate = record.start_date ? new Date(record.start_date).toLocaleDateString() : '';
            
            // 处理说明内容过长的情况，超出部分用省略号显示
            let description = record.description || '';
            const maxDescriptionLength = 20;
            const fullDescription = description;
            if (description.length > maxDescriptionLength) {
                description = description.substring(0, maxDescriptionLength) + '...';
            }
            
            // 获取状态信息
            const status = record.status || 0;
            const statusText = statusTextMap[status] || '未知';
            const statusClass = statusMap[status] || 'status-unknown';
            
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${record.title || ''}</td>
                    <td><span title="${fullDescription}">${description}</span></td>
                    <td>${formattedDate}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td><button class="btn-action btn-detail" data-id="${record.id}" data-type="${record.task_type || 'development'}">详情</button></td>
                </tr>
            `;
        });
        
        tableBody.html(tableHtml);
        
        // 为详情按钮绑定事件
        bindTableButtons();
    }
    
    // 绑定表格按钮事件
    function bindTableButtons() {
        // 先移除所有已存在的监听器
        document.querySelectorAll('.btn-detail').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });

        // 绑定详情按钮事件
        document.querySelectorAll('.btn-detail').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const type = this.getAttribute('data-type');
                // 获取完整的数据
                const allData = [...allRecords];
                const item = allData.find(item => item.id === id);
                
                if (item) {
                    // 调用统一的详情显示函数
                    showTaskDetail(item);
                }
            });
        });
    }
    
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
        // 状态筛选下拉框改变事件
        statusFilter.change(function() {
            filterByStatus();
        });
    }
    
    // 暴露初始化函数供home.js调用
    window.developmentModule = {
        init: function() {
            console.log('党员发展页面初始化');
            // 更新筛选选项
            updateFilterOptions();
            // 绑定事件处理程序
            bindEvents();
            // 加载数据
            loadDevelopmentRecords();
        }
    };
});