// 存储从后端获取的数据
let dashboardData = {
    unread_count: 0,
    unread_list: [],
    todo_count: 0,
    todo_list: [],
    my_published_count: 0,
    my_published_list: []
};

// 获取URL变量 - 使用全局变量或从HTML元数据中获取
let URL = '';

// 初始化加载数据
document.addEventListener('DOMContentLoaded', function() {
    URL = $('#URL').text();
    
    fetchDashboardCounts();
    
    // 添加点击事件监听 - 使用标准JavaScript方法查找元素
    const unreadLink = findLinkByText('未读消息');
    const todoLink = findLinkByText('待办事项');
    const publishedLink = findLinkByText('我发布的');
    
    if (unreadLink) {
        unreadLink.addEventListener('click', function(e) {
            e.preventDefault();
            showItemsModal('未读消息', dashboardData.unread_list);
        });
    }
    
    if (todoLink) {
        todoLink.addEventListener('click', function(e) {
            e.preventDefault();
            showItemsModal('待办事项', dashboardData.todo_list);
        });
    }
    
    if (publishedLink) {
        publishedLink.addEventListener('click', function(e) {
            e.preventDefault();
            showItemsModal('我发布的', dashboardData.my_published_list);
        });
    }
});

// 辅助函数：通过文本内容查找链接元素
function findLinkByText(text) {
    const links = document.querySelectorAll('a[href="#"]');
    for (let i = 0; i < links.length; i++) {
        if (links[i].textContent.includes(text)) {
            return links[i];
        }
    }
    return null;
}

// 获取仪表板数据
function fetchDashboardCounts() {
    fetch(URL + '/user/get_dashboard_counts', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.code === 1000) {
            dashboardData = data.data;
            updateDashboardUI();
        } else {
            console.error('获取数据失败:', data.msg);
            // 处理未登录情况
            if (data.code === 1001) {
                window.location.href = '/login';
            }
        }
    })
    .catch(error => {
        console.error('网络请求失败:', error);
    });
}

// 更新仪表板UI
function updateDashboardUI() {
    // 更新未读消息数量
    updateBadge('未读消息', dashboardData.unread_count);
    
    // 更新待办事项数量
    updateBadge('待办事项', dashboardData.todo_count);
    
    // 更新我发布的数量
    updateBadge('我发布的', dashboardData.my_published_count);
}

// 更新徽章显示
function updateBadge(text, count) {
    const link = findLinkByText(text);
    if (link) {
        // 移除已有的徽章
        let badge = link.querySelector('.badge');
        if (badge) {
            link.removeChild(badge);
        }
        
        // 添加新徽章（如果数量大于0）
        if (count > 0) {
            badge = document.createElement('span');
            badge.className = 'badge';
            badge.textContent = count;
            link.appendChild(badge);
        }
    }
}

// 显示事项详情模态框
function showItemsModal(title, items) {
    // 检查是否已经存在模态框元素
    let modal = document.getElementById('items-modal');
    if (!modal) {
        // 创建模态框HTML，使用固定的唯一ID
        const modalHTML = `
            <div id="items-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: none; justify-content: center; align-items: center; z-index: 1000;">
                <div style="background-color: white; border-radius: 6px; width: 80%; max-width: 800px; max-height: 80vh; display: flex; flex-direction: column;">
                    <div style="padding: 15px 20px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                        <h3 id="modal-title" style="margin: 0;">事项详情</h3>
                        <button id="close-modal-btn" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                    </div>
                    <div id="modal-content-container" style="padding: 20px; overflow-y: auto; flex: 1;">
                        <!-- 内容将通过JavaScript动态填充 -->
                    </div>
                </div>
            </div>
        `;
        
        // 添加到body
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // 获取创建的模态框
        modal = document.getElementById('items-modal');
        
        // 一次性绑定关闭事件监听器到固定ID上
        const closeButton = document.getElementById('close-modal-btn');
        closeButton.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // 点击模态框外部关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // 设置标题
    document.getElementById('modal-title').textContent = title;
    
    // 填充内容
    const contentDiv = document.getElementById('modal-content-container');
    if (items.length === 0) {
        contentDiv.innerHTML = '<p style="text-align: center; color: #999;">暂无相关事项</p>';
    } else {
        let contentHTML = '<div style="display: flex; flex-direction: column; gap: 15px;">';
        items.forEach(item => {
            const typeLabel = item.type === 'notice' ? '通知' : item.type === 'task' ? '任务' : item.type === 'review' ? '待审批' : '其他';
            const statusLabel = item.status === 0 ? '未完成' : item.status === 1 ? '已完成' : '进行中';
            const statusColor = item.status === 0 ? '#f00' : item.status === 1 ? '#0f0' : '#ff9800';
            
            contentHTML += `
                <div style="border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <h4 style="margin: 0; font-size: 16px;">${item.title}</h4>
                        <span style="background-color: var(--light-red); color: var(--primary-red); padding: 2px 8px; border-radius: 12px; font-size: 12px;">${typeLabel}</span>
                    </div>
                    <p style="color: #666; margin: 0 0 10px 0; line-height: 1.5;">${item.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #999;">
                        <span>创建时间: ${item.created_time}</span>
                        ${item.end_date ? `<span>截止时间: ${item.end_date}</span>` : ''}
                        ${item.status !== undefined ? `<span style="color: ${statusColor};">状态: ${statusLabel}</span>` : ''}
                    </div>
                </div>
            `;
        });
        contentHTML += '</div>';
        contentDiv.innerHTML = contentHTML;
    }
    
    // 显示模态框
    modal.style.display = 'flex';
}

// showTaskDetail函数已移至task_management.js文件中，使用ElementUI风格模态框
