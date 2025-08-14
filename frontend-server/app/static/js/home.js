$(document).ready(function() {
    const URL = $('#URL').text();
    $.ajax({
        url: URL + "/user/get_info",
        xhrFields: {withCredentials: true},
        type: "POST",
        dataType: "json",
        success: function (resp) {
            if (resp.code === 1000) {
                const name = resp.data['username'];
                $('#username').text(name);
            }
        },
        error: function () {
            alert("同步状态失败：无法连接至服务器，请联系网站管理员或稍后再试。");
        }
    });

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有菜单项的active类
            menuItems.forEach(i => i.classList.remove('active'));
            // 为当前点击的菜单项添加active类
            this.classList.add('active');
            // 获取要显示的页面ID
            const pageId = this.getAttribute('data-page');
            // 隐藏所有页面内容
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            // 显示当前选中的页面
            const activePage = document.getElementById(pageId);
            activePage.classList.add('active');
            // 调用对应模块的初始化函数
            initModule(pageId);
        });
    });

    // 退出登录点击
    document.getElementById('exit').addEventListener('click', function () {
        sessionStorage.clear();
        $.ajax({
            url: URL + "/auth/logout",
            xhrFields: {withCredentials: true},
            type: "POST",
            dataType: "json",
            success: function (resp) {
                window.location.replace('/login');
            },
            error: function () {
                alert("退出登陆失败：无法连接至服务器。");
            }
        });
    });

    // 初始化对应模块
    function initModule(pageId) {
        switch(pageId) {
            case 'dashboard':
                if (window.dashboardModule && window.dashboardModule.init) {
                    dashboardModule.init();
                }
                break;
            case 'member':
                if (window.memberModule && window.memberModule.init) {
                    memberModule.init();
                }
                break;
            case 'activity':
                if (window.activityModule && window.activityModule.init) {
                    activityModule.init();
                }
                break;
            case 'meeting':
                if (window.meetingModule && window.meetingModule.init) {
                    meetingModule.init();
                }
                break;
            case 'fee':
                if (window.feeModule && window.feeModule.init) {
                    feeModule.init();
                }
                break;
            case 'development':
                if (window.developmentModule && window.developmentModule.init) {
                    developmentModule.init();
                }
                break;
            case 'study':
                if (window.studyModule && window.studyModule.init) {
                    studyModule.init();
                }
                break;
            case 'review':
                if (window.reviewModule && window.reviewModule.init) {
                    reviewModule.init();
                }
                break;
            case 'statistics':
                if (window.statisticsModule && window.statisticsModule.init) {
                    statisticsModule.init();
                }
                break;
            case 'settings':
                if (window.settingsModule && window.settingsModule.init) {
                    settingsModule.init();
                }
                break;
            default:
                console.log('未找到对应模块的初始化函数');
        }
    }

    // 初始化当前激活的页面模块
    const activeMenuItem = document.querySelector('.menu-item.active');
    if (activeMenuItem) {
        const activePageId = activeMenuItem.getAttribute('data-page');
        initModule(activePageId);
    }
});


// 显示加载中函数
function showLoading(text = '加载中') {
    if ($('#loading-mask').length) {
        $('#loading-mask').remove();
    }
    // 创建遮罩层
    const mask = $('<div>', {
        id: 'loading-mask',
        css: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center'
        }
    });
    const loadingBox = $('<div>', {
        css: {
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
            width: '200px',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }
    });
    
    // 添加加载图标
    const loadingIcon = $('<div>', {
        text: '⟳',
        css: {
            fontSize: '60px',
            animation: 'spin 1s linear infinite',
            color: '#333',
        }
    });
    // 添加加载文本
    const loadingText = $('<div>', {
        text: text,
        css: {
            marginTop: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333'
        }
    });
    // 组装元素
    loadingBox.append(loadingIcon).append(loadingText);
    mask.append(loadingBox);
    $('body').append(mask);
    // 添加旋转动画
    if (!$('style#loading-animation').length) {
        const style = $('<style>', {
            id: 'loading-animation',
            text: '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'
        });
        $('head').append(style);
    }
}

// 隐藏加载中函数
function hideLoading() {
    $('#loading-mask').remove();
}