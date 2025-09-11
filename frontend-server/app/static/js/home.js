$(document).ready(function() {
    const URL = $('#URL').text();
    window.isForcedProfile = false; // 标记是否强制在档案页面（全局变量）

    // 初始化用户信息
    $.ajax({
        url: URL + "/user/get_nick",
        xhrFields: {withCredentials: true},
        type: "POST",
        dataType: "json",
        success: function (resp) {
            if (resp.code === 1000) {
                const name = resp.data['nick'];
                $('#username').text(name);
                // 获取解密后的uid
                const uid = resp.data['uid'];
                localStorage.setItem('uid', uid);
                if (uid) {
                    // 更新iframe URL，添加编码后的uid参数
                    updateIframeWithUid(uid);
                }
                
                // 检查用户档案是否完整
                checkUserProfileComplete();
            }
        },
        error: function () {
            alert("同步状态失败：无法连接至服务器，请联系网站管理员或稍后再试。");
        }
    });

    // 检查用户档案是否完整
    function checkUserProfileComplete() {
        $.ajax({
            url: URL + "/user/check_profile_complete",
            xhrFields: {withCredentials: true},
            type: "GET",
            dataType: "json",
            success: function (resp) {
                if (resp.code === 1000 && !resp.data.is_complete) {
                    // 档案不完整，强制跳转到档案页面
                    window.isForcedProfile = true;
                    // 找到档案页面的菜单项并点击
                    const profileMenuItem = document.querySelector('.menu-item[data-page="profile"]');
                    if (profileMenuItem) {
                        profileMenuItem.click();
                        alert("您的党员档案信息尚未完善，需要先完善档案才能使用其它功能噢！");
                    }
                }
            },
            error: function () {
                console.log("检查档案完整性失败");
            }
        });
    }

    // 更新iframe URL，添加编码后的uid参数
    function updateIframeWithUid(uid) {
        try {
            // 1. GZIP压缩
            const compressedArray = pako.gzip(JSON.stringify(uid));
            // 2. 将Uint8Array转换为二进制字符串
            let binaryString = '';
            for (let i = 0; i < compressedArray.length; i++) {
                binaryString += String.fromCharCode(compressedArray[i]);
            }
            // 3. Base64编码
            const base64Encoded = btoa(binaryString);
            // 4. encodeURIComponent编码
            const encodedUid = encodeURIComponent(base64Encoded);
            // 5. 更新iframe的URL
            const iframe = document.querySelector('#dashboard iframe');
            if (iframe) {
                const originalSrc = iframe.src;
                // 检查URL是否已经包含参数
                const separator = originalSrc.includes('?') ? '&' : '?';
                iframe.src = originalSrc + separator + 'uid=' + encodedUid;
                console.log('Updated iframe URL with uid parameter');
            }
        } catch (error) {
            console.error('Error updating iframe with uid:', error);
        }
    }

    // 页面切换渲染
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // 获取要显示的页面ID
            const pageId = this.getAttribute('data-page');
            // 如果被强制在档案页面且尝试离开档案页面，则阻止切换
            if (window.isForcedProfile && pageId !== 'profile') {
                alert('您的党员档案信息尚未完善，需要先完善档案才能使用其它功能噢！');
                return;
            }
            
            // 移除所有菜单项的active类
            menuItems.forEach(i => i.classList.remove('active'));
            // 为当前点击的菜单项添加active类
            this.classList.add('active');
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

    // 退出登录点击事件
    document.getElementById('exit').addEventListener('click', function () {
        sessionStorage.clear();
        $.ajax({
            url: URL + "/auth/logout",
            xhrFields: {withCredentials: true},
            type: "POST",
            dataType: "json",
            success: function (resp) {
                window.location.replace('/login');
                localStorage.removeItem('uid');
            },
            error: function () {
                alert("退出登陆失败：无法连接至服务器。");
            }
        });
    });    

    // 初始化当前激活的页面模块
    function initModule(pageId) {
        switch(pageId) {
            case 'dashboard':
                if (window.dashboardModule && window.dashboardModule.init) {
                    $('.page-title').text('AI工作台');
                    dashboardModule.init();
                }
                break;
            case 'profile':
                if (window.profileModule && window.profileModule.init) {
                    $('.page-title').text('党员信息');
                    profileModule.init();
                }
                break;
            case 'cloud-form':
                // 云表单页面初始化
                if (window.cloudFormModule && window.cloudFormModule.init) {
                    $('.page-title').text('智慧表单');
                    cloudFormModule.init();
                }
                break;
            case 'activity':
                if (window.activityModule && window.activityModule.init) {
                    $('.page-title').text('任务管理');
                    activityModule.init();
                }
                break;
            case 'meeting':
                if (window.meetingModule && window.meetingModule.init) {
                    $('.page-title').text('三会一课');
                    meetingModule.init();
                }
                break;
            case 'fee':
                if (window.feeModule && window.feeModule.init) {
                    $('.page-title').text('党费管理');
                    feeModule.init();
                }
                break;
            case 'development':
                if (window.developmentModule && window.developmentModule.init) {
                    $('.page-title').text('党员发展');
                    developmentModule.init();
                }
                break;
            case 'study':
                if (window.studyModule && window.studyModule.init) {
                    $('.page-title').text('学习教育');
                    studyModule.init();
                }
                break;
            case 'review':
                if (window.reviewModule && window.reviewModule.init) {
                    $('.page-title').text('民主评议');
                    reviewModule.init();
                }
                break;
            case 'statistics':
                if (window.statisticsModule && window.statisticsModule.init) {
                    $('.page-title').text('统计分析');
                    statisticsModule.init();
                }
                break;
            case 'settings':
                if (window.settingsModule && window.settingsModule.init) {
                    $('.page-title').text('系统设置');
                    settingsModule.init();
                }
                break;
            default:
                console.log('未找到对应模块的初始化函数');
        }
    }
    const activeMenuItem = document.querySelector('.menu-item.active');
    initModule(activeMenuItem.getAttribute('data-page'));
});


// 显示加载中函数
function showLoading(text = '加载中') {
    if ($('#loading-mask').length) {
        $('#loading-mask').remove();
    }
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
    const loadingIcon = $('<div>', {
        text: '⟳',
        css: {
            fontSize: '60px',
            animation: 'spin 1s linear infinite',
            color: '#333',
        }
    });
    const loadingText = $('<div>', {
        text: text,
        css: {
            marginTop: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333'
        }
    });
    loadingBox.append(loadingIcon).append(loadingText);
    mask.append(loadingBox);
    $('body').append(mask);
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