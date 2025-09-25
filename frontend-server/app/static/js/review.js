// 民主评议模块逻辑
$(document).ready(function() {
    // 当前页和每页数据量
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 1;
    let allData = []; // 存储所有数据

    // 获取DOM元素
    const reviewTableBody = $('#review_table_body');
    const reviewSearchInput = $('#review_search_input');
    const reviewSearchButton = $('#review_search_button');
    const reviewPrevPage = $('#review_prev_page');
    const reviewNextPage = $('#review_next_page');
    const reviewCurrentPage = $('#review_current_page');
    const reviewTotalPages = $('#review_total_pages');
    const URL = $('#URL').text();

    // 状态映射 - 参考development.js的徽标渲染逻辑
    const statusMap = {
        1: 'status-pending',
        2: 'status-processing',  // 待处理
        3: 'status-completed', // 已完成
        4: 'status-canceled' // 已拒绝/已取消
    };

    const statusTextMap = {
        1: '待审核',
        2: '待处理',
        3: '已完成',
        4: '已拒绝'
    };

    // 加载民主评议数据
    function loadReviewData() {
        // 显示加载状态
        reviewTableBody.html('<tr><td colspan="5" class="rw_dyfz_no_data">加载中...</td></tr>');
        
        // 发送请求到后端获取数据
        $.ajax({
            url: URL + '/get_review_records',
            xhrFields: {withCredentials: true},
            type: 'POST',
            data: {uid: localStorage.getItem('uid')},
            success: function(response) {
                if (response.code === 1000) {
                    allData = response.data || [];
                    totalPages = Math.ceil(allData.length / pageSize);
                    currentPage = 1; // 重置为第一页
                    renderReviewTable();
                } else {
                    reviewTableBody.html('<tr><td colspan="5" class="rw_dyfz_no_data">' + (response.msg || '加载失败') + '</td></tr>');
                }
            },
            error: function() {
                reviewTableBody.html('<tr><td colspan="5" class="rw_dyfz_no_data">网络错误，请稍后重试</td></tr>');
            }
        });
    }

    // 渲染民主评议表格
    function renderReviewTable() {
        // 计算当前页的数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, allData.length);
        const currentPageData = allData.slice(startIndex, endIndex);
        
        // 更新分页信息
        reviewCurrentPage.text(currentPage);
        reviewTotalPages.text(totalPages);
        reviewPrevPage.prop('disabled', currentPage === 1);
        reviewNextPage.prop('disabled', currentPage === totalPages);
        
        // 渲染表格内容
        if (currentPageData.length === 0) {
            reviewTableBody.html('<tr><td colspan="5" class="rw_dyfz_no_data">暂无数据</td></tr>');
            return;
        }
        
        let tableHtml = '';
        currentPageData.forEach(function(record, index) {
            // 合并end_date和end_time作为截止时间
            const endDate = record.end_date || '';
            const endTime = record.end_time || '';
            const deadline = endDate ? (endDate + (endTime ? ' ' + endTime : '')) : '';
            
            // 根据状态设置状态徽标样式
            const statusClass = statusMap[record.status] || '';
            const statusText = statusTextMap[record.status] || '-';
            
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${record.title || ''}</td>
                    <td>${record.description || ''}</td>
                    <td>${deadline}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                </tr>
            `;
        });
        
        reviewTableBody.html(tableHtml);
    }

    // 搜索功能 - 前端筛选
    function searchReview(keyword) {
        // 清空搜索结果提示
        
        if (!keyword) {
            // 如果搜索框为空，直接重新加载数据
            loadReviewData();
            return;
        }
        
        // 前端筛选
        if (allData.length > 0) {
            const filteredData = allData.filter(function(record) {
                return (
                    record.title && record.title.includes(keyword) ||
                    record.description && record.description.includes(keyword)
                );
            });
            
            if (filteredData.length > 0) {
                allData = filteredData;
                totalPages = Math.ceil(allData.length / pageSize);
                currentPage = 1;
                renderReviewTable();
            } else {
                reviewTableBody.html('<tr><td colspan="5" class="rw_dyfz_no_data">未找到相关数据</td></tr>');
            }
        }
    }

    // 绑定事件
    function bindEvents() {
        // 搜索按钮点击事件
        reviewSearchButton.on('click', function() {
            const keyword = reviewSearchInput.val().trim();
            searchReview(keyword);
        });
        
        // 回车键搜索
        reviewSearchInput.on('keypress', function(e) {
            if (e.which === 13) {
                reviewSearchButton.click();
            }
        });
        
        // 上一页按钮点击事件
        reviewPrevPage.on('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderReviewTable();
            }
        });
        
        // 下一页按钮点击事件
        reviewNextPage.on('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                renderReviewTable();
            }
        });
    }
    
    // 初始化民主评议页面
    function initReview() {
        console.log('民主评议页面初始化');
        bindEvents();
        
        // 直接加载数据
        currentPage = 1;
        loadReviewData();
    }

    // 暴露初始化函数供home.js调用
    window.reviewModule = {
        init: initReview
    };
});