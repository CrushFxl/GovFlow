// 党费管理模块逻辑

// 页面加载完成后执行
$(document).ready(function() {
    // 从home.html获取后端base_url
    const URL = $('#URL').text();
    
    // 页面元素
    const monthFilter = $('#dfy_month_filter');
    const refreshButton = $('#dfy_refresh_button');
    const searchInput = $('#dfy_search_input');
    const searchButton = $('#dfy_search_button');
    const tableBody = $('#dfy_table_body');
    const prevPageButton = $('#dfy_prev_page');
    const nextPageButton = $('#dfy_next_page');
    const currentPageElement = $('#dfy_current_page');
    const totalPagesElement = $('#dfy_total_pages');
    const totalAmountElement = $('#dfy_total_amount');
    const totalCountElement = $('#dfy_total_count');
    
    // 分页参数
    let currentPage = 1;
    const pageSize = 5;
    let totalPages = 1;
    let allRecords = [];
    let chartInstance = null;
    
    // 加载党费数据
    function loadFeeData() {
        const month = monthFilter.val();
        // 显示加载状态
        tableBody.html('<tr><td colspan="7" class="dyfz_no_data">正在加载数据...</td></tr>');
        // 发送请求获取记录
        $.ajax({
            url: URL + `/get_fee_records`,
            xhrFields: {withCredentials: true},
            data: {'month' : month, 'keyword': ''},
            type: 'GET',
            success: function(response) {
                if (response.code === 200) {
                    allRecords = response.data;
                    totalPages = Math.ceil(allRecords.length / pageSize);
                    currentPage = 1; // 重置为第一页
                    renderTable();
                    updateStatistics();
                    renderChart();
                } else {
                    tableBody.html('<tr><td colspan="7" class="dyfz_no_data">' + response.msg + '</td></tr>');
                }
            },
            error: function() {
                tableBody.html('<tr><td colspan="7" class="dyfz_no_data">加载失败，请稍后再试</td></tr>');
            }
        });
    }
    
    // 搜索用户
    function searchUser() {
        const keyword = searchInput.val().trim();
        if (!keyword) {
            alert('请输入姓名进行查询');
            return;
        }
        // 发送请求查询用户
        $.ajax({
            url: URL + '/get_fee_records',
            xhrFields: {withCredentials: true},
            type: 'GET',
            data: {'month' : monthFilter.val(), 'keyword': keyword},
            success: function(response) {
                if (response.code === 200) {
                    allRecords = response.data;
                    totalPages = Math.ceil(allRecords.length / pageSize);
                    currentPage = 1;
                    renderTable();
                    updateStatistics();
                    renderChart();
                }
            },
            error: function() {
                alert('搜索失败，请稍后再试');
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
            return;
        }
        
        let tableHtml = '';
        currentRecords.forEach(function(record, index) {
            // 格式化日期
            const submitTime = new Date(record.created_at).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${record.name}</td>
                    <td>${record.month}月</td>
                    <td class="fee-amount">${parseFloat(record.amount).toFixed(2)} 元</td>
                    <td>${submitTime}</td>
                    <td><span class="receipt-material" title="${record.receipt}">查看回执材料</span></td>
                    <td><button class="pf_detail-btn btn btn-action delete-fee" data-id="${record.id}">删除</button></td>
                </tr>
            `;
        });
        
        tableBody.html(tableHtml);
        
        // 为回执材料添加点击事件
        $('.receipt-material').click(function() {
            const receiptContent = $(this).attr('title');
            showReceiptModal(receiptContent);
        });
        
        // 为删除按钮添加点击事件
        $('.delete-fee').click(function() {
            const recordId = $(this).data('id');
            deleteFeeRecord(recordId);
        });
    }
    
    // 更新统计信息
    function updateStatistics() {
        let totalAmount = 0;
        allRecords.forEach(function(record) {
            totalAmount += parseFloat(record.amount) || 0;
        });
        
        totalAmountElement.html(`总金额: <span style="color: var(--primary-red);">${totalAmount.toFixed(2)}</span> 元`);
        totalCountElement.html(`总笔数: <span style="color: var(--primary-red);">${allRecords.length}</span> 笔`);
    }
    
    // 渲染图表
    function renderChart() {
        // 准备图表数据
        const monthlyData = {};
        // 初始化1-12月的数据
        for (let i = 1; i <= 12; i++) {
            monthlyData[i] = 0;
        }
        
        // 统计各月金额
        allRecords.forEach(function(record) {
            const month = parseInt(record.month);
            if (month >= 1 && month <= 12) {
                monthlyData[month] += parseFloat(record.amount) || 0;
            }
        });
        
        // 获取canvas元素
        const ctx = document.getElementById('feeChart').getContext('2d');
        
        // 如果图表实例已存在，先销毁
        if (chartInstance) {
            chartInstance.destroy();
        }
        
        // 创建折线图
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                datasets: [{
                    label: '党费缴纳金额（元）',
                    data: Object.values(monthlyData),
                    borderColor: '#c12c1f',
                    backgroundColor: 'rgba(193, 44, 31, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#c12c1f',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `金额: ${context.parsed.y.toFixed(2)} 元`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 显示回执材料弹窗
    function showReceiptModal(content) {
        // 检查是否已存在弹窗
        let modal = $('#receipt-modal');
        if (modal.length === 0) {
            // 创建新弹窗
            modal = $(
                `<div id="receipt-modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; border-radius: 8px; max-width: 80%; max-height: 80%; overflow-y: auto;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h3>回执材料</h3>
                            <button id="close-receipt-modal" style="background: none; border: none; font-size: 20px; cursor: pointer; margin-left: 20px">×</button>
                        </div>
                        <div id="receipt-content" style="white-space: pre-wrap; word-break: break-word;"></div>
                    </div>
                </div>`
            );
            $('body').append(modal);
            
            // 绑定关闭事件
            $('#close-receipt-modal').click(function() {
                modal.hide();
            });
        }
        
        // 设置内容并显示
        $('#receipt-content').text(content);
        modal.show();
    }
    
    // 绑定事件处理程序
    function bindEvents() {
        // 刷新按钮点击事件
        refreshButton.click(function() {
            loadFeeData();
        });
        
        // 月份筛选改变事件
        monthFilter.change(function() {
            loadFeeData();
        });
        
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
    
    // 初始化
    function init() {
        bindEvents();
        // 页面加载时默认加载数据
        loadFeeData();
    }
    
    // 删除党费记录
    function deleteFeeRecord(recordId) {
        // 显示确认对话框
        if (!confirm('确定要删除这条党费记录吗？此操作不可撤销。')) {
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
                    loadFeeData();
                } else {
                    alert('删除失败：' + response.msg);
                }
            },
            error: function() {
                alert('网络错误，请稍后再试');
            }
        });
    }
    
    // 初始化页面
    init();
});