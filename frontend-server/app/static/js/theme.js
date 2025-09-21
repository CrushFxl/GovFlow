// 主题切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 定义深橙色主题色
    const deepOrange = '#E46034';
    const darkDeepOrange = '(168, 10, 155)';
    const lightDeepOrange = '#fce2d9';


    // 检查localStorage中的admin状态
    function checkAdminStatus() {
        const isAdmin = localStorage.getItem('admin') === '1';
        const root = document.documentElement;
        if (isAdmin) {
            // 管理员用户 - 使用深橙色主题
            root.style.setProperty('--primary-red', deepOrange);
            root.style.setProperty('--dark-red', darkDeepOrange);
            root.style.setProperty('--light-red', lightDeepOrange);
            // 显示所有菜单项
            showAllMenuItems();
            // 显示管理员登录提示
            showAdminLoginHint();
            // 切换到橙色图标
            updateMenuIcons('orange-icon');
        } else {
            // 普通用户 - 恢复默认红色主题
            root.style.setProperty('--primary-red', '#c12c1f');
            root.style.setProperty('--dark-red', '#8e1c11');
            root.style.setProperty('--light-red', '#f8e6e5');
            // 隐藏智慧表单和系统设计菜单项
            hideRestrictedMenuItems();
            // 隐藏管理员登录提示
            hideAdminLoginHint();
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
    
    // 显示管理员登录提示
    function showAdminLoginHint() {
        // 检查提示元素是否已存在
        let adminHint = document.getElementById('admin-login-hint');
        if (!adminHint) {
            // 创建li元素作为同级标签
            adminHint = document.createElement('li');
            adminHint.id = 'admin-login-hint';
            adminHint.innerText = '您正在以超级管理员身份登录';
            
            // 设置高对比度样式
            adminHint.style.cssText = `
                background-color: #fff;
                color: #000;
                font-weight: bold;
                padding: 5px 10px;
                border-radius: 5px;
                margin: 5x 0 0 0;
                font-size: 0.9em;
                border: 2px solid #000;
                display: inline-block;
            `;
            
            // 将提示元素添加为'我发布的'链接的同级标签（放在其后）
            const publishedLink = document.querySelector('.nav-menu li:last-child');
            const navMenu = document.querySelector('.nav-menu');
            if (publishedLink && navMenu) {
                navMenu.insertBefore(adminHint, publishedLink.nextSibling);
            }
        } else {
            // 如果元素已存在，确保它是可见的
            adminHint.style.display = 'inline-block';
        }
    }
    
    // 隐藏管理员登录提示
    function hideAdminLoginHint() {
        const adminHint = document.getElementById('admin-login-hint');
        if (adminHint) {
            adminHint.style.display = 'none';
        }
    }
    
    // 显示所有菜单项
    function showAllMenuItems() {
        const cloudFormItem = document.querySelector('.menu-item[data-page="cloud-form"]');
        const settingsItem = document.querySelector('.menu-item[data-page="settings"]');
        if (cloudFormItem) cloudFormItem.style.display = '';
        if (settingsItem) settingsItem.style.display = '';
    }
    
    // 隐藏受限菜单项
    function hideRestrictedMenuItems() {
        const cloudFormItem = document.querySelector('.menu-item[data-page="cloud-form"]');
        const settingsItem = document.querySelector('.menu-item[data-page="settings"]');
        if (cloudFormItem) cloudFormItem.style.display = 'none';
        if (settingsItem) settingsItem.style.display = 'none';
    }
    checkAdminStatus();    
    window.addEventListener('storage', function(e) {
        if (e.key === 'admin') {
            checkAdminStatus();
        }
    });
});