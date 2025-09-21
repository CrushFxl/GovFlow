// 民主评议模块逻辑
$(document).ready(function() {
    // 当前页和每页数据量
    let currentPage = 1;
    const pageSize = 10;
    let totalPages = 1;
    let allData = []; // 存储所有数据，用于分页
    let filteredData = []; // 存储筛选后的数据

    // 获取DOM元素
    const reviewTableBody = $('#review_table_body');
    const reviewSearchInput = $('#review_search_input');
    const reviewSearchButton = $('#review_search_button');
    const reviewRefreshButton = $('#review_refresh_button');
    const reviewPrevPage = $('#review_prev_page');
    const reviewNextPage = $('#review_next_page');
    const reviewCurrentPage = $('#review_current_page');
    const reviewTotalPages = $('#review_total_pages');

    // 加载民主评议数据
    function loadReviewData(keyword = '') {
        // 显示加载状态
        reviewTableBody.html('<tr><td colspan="7" class="rw_dyfz_no_data">加载中...</td></tr>');
        
        // 发送请求到后端获取数据
        $.ajax({
            url: `${config.backendUrl}/get_review_records`,
            type: 'GET',
            data: {
                keyword: keyword,
                page: currentPage,
                page_size: pageSize
            },
            success: function(response) {
                if (response.code === 200 && response.data) {
                    allData = response.data.records || [];
                    filteredData = [...allData];
                    totalPages = response.data.total_pages || 1;
                    
                    // 更新表格
                    renderReviewTable();
                    // 更新分页信息
                    updatePagination();
                } else {
                    reviewTableBody.html('<tr><td colspan="7" class="rw_dyfz_no_data">加载数据失败</td></tr>');
                }
            },
            error: function() {
                reviewTableBody.html('<tr><td colspan="7" class="rw_dyfz_no_data">网络错误，请稍后重试</td></tr>');
            }
        });
    }

    // 渲染民主评议表格
    function renderReviewTable() {
        reviewTableBody.empty();
        if (filteredData.length === 0) {
            reviewTableBody.html('<tr><td colspan="7" class="rw_dyfz_no_data">暂无数据</td></tr>');
            return;
        }
        // 计算当前页要显示的数据
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, filteredData.length);
        const currentPageData = filteredData.slice(startIndex, endIndex);
        
        // 渲染表格行
        currentPageData.forEach((item, index) => {
            const row = $('<tr></tr>');
            const rowNumber = startIndex + index + 1;
            row.append(`<td>${rowNumber}</td>`);
            row.append(`<td>${item.name || '-'}</td>`);
            row.append(`<td>${item.year || '-'}</td>`);
            row.append(`<td>${item.political_score || '-'}</td>`);
            row.append(`<td>${item.work_score || '-'}</td>`);
            row.append(`<td>${item.moral_score || '-'}</td>`);
            row.append(`<td>${item.other_comments || '-'}</td>`);
            reviewTableBody.append(row);
        });
    }

    // 更新分页控件
    function updatePagination() {
        reviewCurrentPage.text(currentPage);
        reviewTotalPages.text(totalPages);
        
        reviewPrevPage.prop('disabled', currentPage <= 1);
        reviewNextPage.prop('disabled', currentPage >= totalPages);
    }

    // 绑定事件
    function bindEvents() {
        // 搜索按钮点击事件
        reviewSearchButton.on('click', function() {
            const keyword = reviewSearchInput.val().trim();
            currentPage = 1;
            loadReviewData(keyword);
        });
        
        // 回车键搜索
        reviewSearchInput.on('keypress', function(e) {
            if (e.which === 13) {
                reviewSearchButton.click();
            }
        });
        
        // 刷新按钮点击事件
        reviewRefreshButton.on('click', function() {
            reviewSearchInput.val('');
            currentPage = 1;
            loadReviewData();
        });
        
        // 上一页按钮点击事件
        reviewPrevPage.on('click', function() {
            if (currentPage > 1) {
                currentPage--;
                loadReviewData(reviewSearchInput.val().trim());
            }
        });
        
        // 下一页按钮点击事件
        reviewNextPage.on('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                loadReviewData(reviewSearchInput.val().trim());
            }
        });
        
        // 页面切换到民主评议时的事件
        $(document).on('pageChange', function(e, pageId) {
            if (pageId === 'review') {
                // 延迟加载，确保页面已经显示
                setTimeout(() => {
                    currentPage = 1;
                    loadReviewData();
                }, 10);
            }
        });
    }

    // 初始化民主评议页面
    function initReview() {
        console.log('民主评议页面初始化');
        bindEvents();
        
        // 检查当前是否在民主评议页面
        const currentPageElement = $('#review');
        if (currentPageElement.is(':visible')) {
            setTimeout(() => {
                loadReviewData();
            }, 100);
        }
    }

    // 暴露初始化函数供home.js调用
    window.reviewModule = {
        init: initReview
    };
});