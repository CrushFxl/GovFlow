// 党费管理模块逻辑

// 定义全局的fee模块
window.feeModule = {
    URL: '',
    refreshButton: null,
    tableBody: null,
    prevPageButton: null,
    nextPageButton: null,
    currentPageElement: null,
    totalPagesElement: null,
    currentPage: 1,
    pageSize: 5,
    totalPages: 1,
    allRecords: [],
    
    // 状态映射
    statusMap: {
        1: 'status-pending',
        2: 'status-processing',
        3: 'status-completed',
        4: 'status-canceled'
    },
    
    statusTextMap: {
        1: '待审核',
        2: '待处理',
        3: '已完成',
        4: '已取消'
    },
    
    // 加载党费数据
    loadFeeData: function() {
        // 显示加载状态
        this.tableBody.html('<tr><td colspan="7" class="dyfz_no_data">正在加载数据...</td></tr>');
        
        // 发送请求获取记录
        $.ajax({
            url: this.URL + `/get_fee_records`,
            xhrFields: {withCredentials: true},
            data: {uid: localStorage.getItem('uid')},
            type: 'POST',
            success: function(response) {
                if (response.code === 200) {
                    // 过滤掉通知类型任务
                    window.feeModule.allRecords = response.data.filter(record => record.task_type !== '通知');
                    window.feeModule.filterByStatus(); // 加载数据后应用筛选
                } else {
                    window.feeModule.tableBody.html('<tr><td colspan="7" class="dyfz_no_data">' + response.msg + '</td></tr>');
                }
            },
            error: function() {
                window.feeModule.tableBody.html('<tr><td colspan="7" class="dyfz_no_data">加载失败，请稍后再试</td></tr>');
            }
        });
    },
    
    // 渲染表格数据
    renderTable: function() {
        // 计算当前页的数据
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.filteredRecords.length);
        const currentRecords = this.filteredRecords.slice(startIndex, endIndex);
        
        // 更新分页信息
        this.currentPageElement.text(this.currentPage);
        this.totalPagesElement.text(this.totalPages);
        
        // 更新分页按钮状态
        this.prevPageButton.prop('disabled', this.currentPage === 1);
        this.nextPageButton.prop('disabled', this.currentPage === this.totalPages);
        
        // 渲染表格内容
        if (currentRecords.length === 0) {
            this.tableBody.html('<tr><td colspan="6" class="dyfz_no_data">暂无数据</td></tr>');
            return;
        }
        
        let tableHtml = '';
        currentRecords.forEach(function(record, index) {
            // 格式化日期
            const submitTime = new Date(record.created_time).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // 构建截止时间
            let deadlineTime = '';
            if (record.end_date && record.end_time) {
                deadlineTime = `${record.end_date} ${record.end_time}`;
            } else if (record.end_date) {
                deadlineTime = record.end_date;
            } else if (record.end_time) {
                deadlineTime = record.end_time;
            } else {
                deadlineTime = '-';
            }
            
            // 处理说明内容过长的情况，超出部分用省略号显示
            let description = record.description || '';
            const maxDescriptionLength = 20;
            const fullDescription = description;
            if (description.length > maxDescriptionLength) {
                description = description.substring(0, maxDescriptionLength) + '...';
            }
            
            // 获取状态信息
            const status = record.status || 0;
            const statusText = window.feeModule.statusTextMap[status] || '未知';
            const statusClass = window.feeModule.statusMap[status] || 'status-unknown';
            
            tableHtml += `
                <tr>
                        <td>${startIndex + index + 1}</td>
                        <td>${record.title || '-'}</td>
                        <td><span title="${fullDescription}">${description}</span></td>
                        <td>${submitTime}</td>
                        <td>${deadlineTime}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td><button class="btn-action btn-detail" data-id="${record.id}" data-type="${record.task_type || 'fee'}">详情</button></td>
                    </tr>
            `;
        });
        
        this.tableBody.html(tableHtml);
        
        // 为详情按钮绑定事件
        this.bindTableButtons();
    },
    
    // 绑定表格按钮事件
    bindTableButtons: function() {
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
                const allData = [...window.feeModule.allRecords];
                const item = allData.find(item => item.id === id);
                
                if (item) {
                    // 调用统一的详情显示函数
                    showTaskDetail(item);
                }
            });
        });
    },
    
    // 绑定事件处理程序
    bindEvents: function() {
        // 刷新按钮点击事件
        this.refreshButton.click(function() {
            window.feeModule.loadFeeData();
        });
        
        // 上一页按钮点击事件
        this.prevPageButton.click(function() {
            if (window.feeModule.currentPage > 1) {
                window.feeModule.currentPage--;
                window.feeModule.renderTable();
            }
        });
        
        // 下一页按钮点击事件
        this.nextPageButton.click(function() {
            if (window.feeModule.currentPage < window.feeModule.totalPages) {
                window.feeModule.currentPage++;
                window.feeModule.renderTable();
            }
        });
        
        // 状态筛选下拉框改变事件
        this.statusFilter.change(function() {
            window.feeModule.filterByStatus();
        });
    },
    
    // 初始化模块
    init: function() {
        // 从home.html获取后端base_url
        this.URL = $('#URL').text();
        
        // 初始化页面元素
        this.refreshButton = $('#dfy_refresh_button');
        this.tableBody = $('#dfy_table_body');
        this.prevPageButton = $('#dfy_prev_page');
        this.nextPageButton = $('#dfy_next_page');
        this.currentPageElement = $('#dfy_current_page');
        this.totalPagesElement = $('#dfy_total_pages');
        this.statusFilter = $('#dfy_month_filter'); // 复用现有下拉框作为状态筛选
        
        // 重置分页参数
        this.currentPage = 1;
        this.pageSize = 5;
        this.totalPages = 1;
        this.allRecords = [];
        this.filteredRecords = [];
        
        this.bindEvents();
        this.loadFeeData();
        this.updateFilterOptions();
    },
    
    // 更新筛选下拉框选项为状态选项
    updateFilterOptions: function() {
        const statusFilter = this.statusFilter;
        statusFilter.empty();
        statusFilter.append('<option value="all">全部</option>');
        
        // 遍历状态映射，添加状态选项
        for (const [key, value] of Object.entries(this.statusTextMap)) {
            statusFilter.append(`<option value="${key}">${value}</option>`);
        }
        
        // 更新标签文本
        const label = statusFilter.prev('label');
        if (label) {
            label.text('筛选状态：');
        }
    },
    
    // 根据状态筛选数据
    filterByStatus: function() {
        const selectedStatus = this.statusFilter.val();
        
        if (selectedStatus === 'all') {
            this.filteredRecords = [...this.allRecords];
        } else {
            this.filteredRecords = this.allRecords.filter(record => 
                record.status === parseInt(selectedStatus)
            );
        }
        
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredRecords.length / this.pageSize);
        this.renderTable();
    }
};

// 页面加载完成后执行
$(document).ready(function() {
    // 如果当前页面是党费缴纳页面，则初始化模块
    if ($('#fee').hasClass('active')) {
        window.feeModule.init();
    }
});