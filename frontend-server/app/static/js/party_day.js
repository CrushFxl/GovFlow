// 页面加载完成后执行
$(document).ready(function() {
    const URL = $('#URL').text();
    
    // 页面元素
    const searchInput = $('#party_day_search_input');
    const searchButton = $('#party_day_search_button');
    const tableBody = $('#party_day_table_body');
    const prevPageButton = $('#party_day_prev_page');
    const nextPageButton = $('#party_day_next_page');
    const currentPageElement = $('#party_day_current_page');
    const totalPagesElement = $('#party_day_total_pages');
    const totalCountElement = $('#party_day_total_count');
    
    // 分页参数
    let currentPage = 1;
    const pageSize = 5;
    let totalPages = 1;
    let allRecords = [];
    
    // 初始化页面
    function initPartyDay() {
        console.log('主题党日页面初始化');
        searchButton.click(searchPartyDay);
        searchInput.keyup(function(e) {
            if (e.key === 'Enter') {
                searchPartyDay();
            }
        });
        prevPageButton.click(goToPrevPage);
        nextPageButton.click(goToNextPage);
        loadPartyDayData();
    }
    
    // 加载主题党日数据
    function loadPartyDayData() {
        // 显示加载状态
        tableBody.html('<tr><td colspan="5" class="dyfz_no_data">正在加载数据...</td></tr>');
        // 发送请求获取记录
        $.ajax({
            url: URL + `/party_day/get_records`,
            xhrFields: {withCredentials: true},
            data: {'keyword': ''},
            type: 'GET',
            success: function(response) {
                if (response.code === 200) {
                    allRecords = response.data;
                    totalPages = Math.ceil(allRecords.length / pageSize);
                    currentPage = 1;
                    renderTable();
                    updateStatistics();
                } else {
                    tableBody.html('<tr><td colspan="5" class="dyfz_no_data">' + response.msg + '</td></tr>');
                }
            },
            error: function() {
                tableBody.html('<tr><td colspan="5" class="dyfz_no_data">加载失败，请稍后再试</td></tr>');
            }
        });
    }
    
    // 搜索主题党日活动
    function searchPartyDay() {
        const keyword = searchInput.val().trim();
        if (!keyword) {
            alert('请输入活动标题进行查询');
            return;
        }
        // 发送请求查询活动
        $.ajax({
            url: URL + '/party_day/get_records',
            xhrFields: {withCredentials: true},
            type: 'GET',
            data: {'keyword': keyword},
            success: function(response) {
                if (response.code === 200) {
                    allRecords = response.data;
                    totalPages = Math.ceil(allRecords.length / pageSize);
                    currentPage = 1;
                    renderTable();
                    updateStatistics();
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
        console.log("测试！！！！");
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
            tableBody.html('<tr><td colspan="5" class="dyfz_no_data">暂无数据</td></tr>');
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
            // 解析data字段中的JSON字符串
            let formData = {};
            try {
                formData = JSON.parse(record.data);
            } catch (e) {
                console.error('解析数据失败:', e);
            }
            // 获取活动标题、姓名和心得内容
            const activityName = formData['主题党日活动名称'] || '未命名活动';
            const userName = formData['姓名'] || '未知';
            const content = formData['心得内容'] || '';
            // 处理心得内容过长的情况，超出部分用省略号显示
            const maxContentLength = 100;
            const fullContent = content;
            let displayContent = content;
            if (content.length > maxContentLength) {
                displayContent = content.substring(0, maxContentLength) + '...';
            }
            
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${activityName}</td>
                    <td>${userName}</td>
                    <td><span class="party-day-content" title="${fullContent}">${displayContent}</span></td>
                    <td>${submitTime}</td>
                </tr>
            `;
        });
        tableBody.html(tableHtml);
        // 为活动内容添加点击事件，显示完整内容
        $('.party-day-content').click(function() {
            const fullContent = $(this).attr('title');
            showContentModal(fullContent);
        });
    }
    
    // 更新统计信息
    function updateStatistics() {
        totalCountElement.html(`总记录数: <span style="color: var(--primary-red);">${allRecords.length}</span>`);
    }
    
    // 跳转到上一页
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    }
    
    // 跳转到下一页
    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    }
    
    // 显示活动内容模态框
    function showContentModal(content) {
        // 创建模态框
        const modalHtml = `
            <div id="content-modal" class="modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); justify-content: center; align-items: center; z-index: 1000;">
                <div class="modal-content" style="background-color: white; border-radius: 6px; padding: 20px; max-width: 800px; max-height: 80vh; overflow-y: auto; width: 90%;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee;">
                        <h3 class="modal-title">活动内容</h3>
                        <button id="close-content-modal" class="close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                    </div>
                    <div class="modal-body">
                        <p style="white-space: pre-wrap;">${content}</p>
                    </div>
                </div>
            </div>
        `;
        
        // 添加模态框到body
        $('body').append(modalHtml);
        
        // 绑定关闭事件
        $('#close-content-modal').click(function() {
            $('#content-modal').remove();
        });
        
    }
    
    // 暴露初始化函数供home.js调用
    window.partyDayModule = {
        init: initPartyDay
    };
});