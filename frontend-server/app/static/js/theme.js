// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 定义深橙色主题色
    const deepOrange = '#FCE4E4';
    const darkDeepOrange = '(1, 11, 1)';
    const lightDeepOrange = '#FCE4E4';
    // 定义文本颜色 - 管理员主题下使用深色文本以提高对比度
    const adminTextColor = '#B4432F';
    const defaultTextColor = '#FFFFFF';
    // 检查localStorage中的admin状态
    function checkAdminStatus() {
        const isAdmin = localStorage.getItem('admin') === '1';
        const root = document.documentElement;
        if (isAdmin) {
            // 管理员用户 - 使用深橙色主题
            root.style.setProperty('--primary-red', deepOrange);
            root.style.setProperty('--dark-red', darkDeepOrange);
            root.style.setProperty('--light-red', lightDeepOrange);
            // 设置文本颜色 - 管理员主题使用深色文本
            root.style.setProperty('--menu-text-color', adminTextColor);
            root.style.setProperty('--header-text-color', adminTextColor);
            root.style.setProperty('--table-header-text-color', adminTextColor);
            // 显示所有菜单项
            showAllMenuItems();
            // 切换到橙色图标
            updateMenuIcons('orange-icon');
        } else {
            // 普通用户 - 恢复默认红色主题
            root.style.setProperty('--primary-red', '#c12c1f');
            root.style.setProperty('--dark-red', '#8e1c11');
            root.style.setProperty('--light-red', '#f8e6e5');
            // 强制设置文本颜色 - 普通主题使用白色文本
            root.style.setProperty('--menu-text-color', defaultTextColor);
            root.style.setProperty('--header-text-color', defaultTextColor);
            root.style.setProperty('--table-header-text-color', defaultTextColor);
            // 隐藏部分菜单项
            hideRestrictedMenuItems();
            // 切换到红色图标
            updateMenuIcons('red-icon');
        }
    }
    
    // 根据管理员状态更新菜单图标
    function updateMenuIcons(iconType) {
        const menuItemIcons = document.querySelectorAll('.menu-item img');
        menuItemIcons.forEach(icon => {
            // 获取当前图标文件名
            const currentSrc = icon.getAttribute('src');
            const iconFileName = currentSrc.split('/').pop();
            
            // 根据iconType更新图标路径
            if (iconType === 'orange-icon') {
                icon.setAttribute('src', `../static/img/orange-icon/${iconFileName}`);
            } else {
                icon.setAttribute('src', `../static/img/red-icon/${iconFileName}`);
            }
        });
    }
    

    // 显示所有菜单项
    function showAllMenuItems() {
        const cloudFormItem = document.querySelector('.menu-item[data-page="cloud-form"]');
        const settingsItem = document.querySelector('.menu-item[data-page="settings"]');
        const llmManageItem = document.querySelector('.menu-item[data-page="llm_manage"]');
        const knowledgeManageItem = document.querySelector('.menu-item[data-page="knowledge_manage"]');
        const taskManagementItem = document.querySelector('.menu-item[data-page="task_management"]');
        if (cloudFormItem) cloudFormItem.style.display = '';
        if (settingsItem) settingsItem.style.display = '';
        if (llmManageItem) llmManageItem.style.display = '';
        if (knowledgeManageItem) knowledgeManageItem.style.display = '';
        if (taskManagementItem) taskManagementItem.style.display = '';
    }
    // 隐藏受限菜单项
    function hideRestrictedMenuItems() {
        const cloudFormItem = document.querySelector('.menu-item[data-page="cloud-form"]');
        const settingsItem = document.querySelector('.menu-item[data-page="settings"]');
        const llmManageItem = document.querySelector('.menu-item[data-page="llm_manage"]');
        const knowledgeManageItem = document.querySelector('.menu-item[data-page="knowledge_manage"]');
        const taskManagementItem = document.querySelector('.menu-item[data-page="task_management"]');
        if (cloudFormItem) cloudFormItem.style.display = 'none';
        if (taskManagementItem) taskManagementItem.style.display = 'none';
        if (settingsItem) settingsItem.style.display = 'none';
        if (llmManageItem) llmManageItem.style.display = 'none';
        if (knowledgeManageItem) knowledgeManageItem.style.display = 'none';
    }
    checkAdminStatus();    
    window.addEventListener('storage', function(e) {
        if (e.key === 'admin') {
            checkAdminStatus();
        }
    });
});