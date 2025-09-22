// 三会一课模块逻辑

// 页面加载完成后执行
$(document).ready(function() {
    // 从home.html获取后端base_url
    const URL = $('#URL').text();
    
    // 页面元素
    const typeFilter = $('#meeting_type_filter');
    const refreshButton = $('#meeting_refresh_button');
    const searchInput = $('#meeting_search_input');
    const searchButton = $('#meeting_search_button');
    const tableBody = $('#meeting_table_body');
    const prevPageButton = $('#meeting_prev_page');
    const nextPageButton = $('#meeting_next_page');
    const currentPageElement = $('#meeting_current_page');
    const totalPagesElement = $('#meeting_total_pages');
    const totalCountElement = $('#meeting_total_count');
    
    // 分页参数
    let currentPage = 1;
    const pageSize = 5;
    let totalPages = 1;
    let allRecords = [];
    
    // 初始化页面
    function initMeeting() {
        console.log('三会一课页面初始化');
        // 绑定事件
        refreshButton.click(loadMeetingData);
        searchButton.click(searchMeeting);
        searchInput.keyup(function(e) {
            if (e.key === 'Enter') {
                searchMeeting();
            }
        });
        prevPageButton.click(goToPrevPage);
        nextPageButton.click(goToNextPage);
        typeFilter.change(filterByType);
        loadMeetingData()
    }
    
    // 加载三会一课数据
    function loadMeetingData() {
        const meetingType = typeFilter.val();
        // 显示加载状态
        tableBody.html('<tr><td colspan="6" class="dyfz_no_data">正在加载数据...</td></tr>');
        // 发送请求获取记录
        $.ajax({
            url: URL + `/get_meeting_records`,
            xhrFields: {withCredentials: true},
            data: {'type' : meetingType, 'keyword': ''},
            type: 'GET',
            success: function(response) {
                if (response.code === 200) {
                    allRecords = response.data;
                    totalPages = Math.ceil(allRecords.length / pageSize);
                    currentPage = 1; // 重置为第一页
                    renderTable();
                    updateStatistics();
                } else {
                    tableBody.html('<tr><td colspan="6" class="dyfz_no_data">' + response.msg + '</td></tr>');
                }
            },
            error: function() {
                tableBody.html('<tr><td colspan="6" class="dyfz_no_data">加载失败，请稍后再试</td></tr>');
            }
        });
    }
    
    // 根据会议类型筛选
    function filterByType() {
        loadMeetingData();
    }
    
    // 搜索会议
    function searchMeeting() {
        const keyword = searchInput.val().trim();
        if (!keyword) {
            alert('请输入会议标题进行查询');
            return;
        }
        // 发送请求查询会议
        $.ajax({
            url: URL + '/get_meeting_records',
            xhrFields: {withCredentials: true},
            type: 'GET',
            data: {'type' : typeFilter.val(), 'keyword': keyword},
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
            tableBody.html('<tr><td colspan="6" class="dyfz_no_data">暂无数据</td></tr>');
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
            
            // 处理会议纪要过长的情况，超出部分用省略号显示
            let summary = record.summary || '';
            const maxSummaryLength = 100;
            const fullSummary = summary;
            if (summary.length > maxSummaryLength) {
                summary = summary.substring(0, maxSummaryLength) + '...';
            }
            
            tableHtml += `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${record.title}</td>
                    <td>${record.type}</td>
                    <td><span class="meeting-summary" title="${fullSummary}">${summary}</span></td>
                    <td>${submitTime}</td>
                    <td><button class="pf_detail-btn btn btn-action delete-meeting" data-id="${record.id}">删除</button></td>
                </tr>
            `;
        });
        
        tableBody.html(tableHtml);
        
        // 为会议纪要添加点击事件，显示完整内容
        $('.meeting-summary').click(function() {
            const fullSummary = $(this).attr('title');
            showSummaryModal(fullSummary);
        });
        
        // 为删除按钮添加点击事件
        $('.delete-meeting').click(function() {
            const recordId = $(this).data('id');
            deleteMeetingRecord(recordId);
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
    
    // 显示会议纪要模态框
    function showSummaryModal(summary) {
        // 创建模态框
        const modalHtml = `
            <div id="summary-modal" class="modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); justify-content: center; align-items: center; z-index: 1000;">
                <div class="modal-content" style="background-color: white; border-radius: 6px; padding: 20px; max-width: 800px; max-height: 80vh; overflow-y: auto; width: 90%;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #eee;">
                        <h3 class="modal-title">会议纪要</h3>
                        <button id="close-summary-modal" class="close-btn" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
                    </div>
                    <div class="modal-body">
                        <p style="white-space: pre-wrap;">${summary}</p>
                    </div>
                </div>
            </div>
        `;
        
        // 添加模态框到body
        $('body').append(modalHtml);
        
        // 绑定关闭事件
        $('#close-summary-modal').click(function() {
            $('#summary-modal').remove();
        });
        
    }
    
    // 删除三会一课记录
    function deleteMeetingRecord(recordId) {
        // 显示确认对话框
        if (confirm('确定要删除这条记录吗？删除后将无法恢复。')) {
            // 发送删除请求
            $.ajax({
                url: URL + '/delete_record',
                type: 'POST',
                data: {id: recordId},
                xhrFields: {withCredentials: true},
                success: function(response) {
                    if (response.code === 200) {
                        alert('删除成功');
                        loadMeetingData();
                    } else {
                        alert('删除失败：' + response.msg);
                    }
                }
            });
        }
    }
    
    // 暴露初始化函数供home.js调用
    window.meetingModule = {
        init: initMeeting
    };
});