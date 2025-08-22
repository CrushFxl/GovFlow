$(document).ready(function() {
    const URL = $('#URL').text();

    // 初始化用户信息
    $.ajax({
        url: URL + "/user/get_info",
        xhrFields: {withCredentials: true},
        type: "POST",
        dataType: "json",
        success: function (resp) {
            if (resp.code === 1000) {
                const name = resp.data['username'];
                $('#username').text(name);
                
                // 获取解密后的uid
                const uid = resp.data['uid'];
                if (uid) {
                    // 更新iframe URL，添加编码后的uid参数
                    updateIframeWithUid(uid);
                }
            }
        },
        error: function () {
            alert("同步状态失败：无法连接至服务器，请联系网站管理员或稍后再试。");
        }
    });

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
                    dashboardModule.init();
                }
                break;
            case 'profile':
                if (window.profileModule && window.profileModule.init) {
                    profileModule.init();
                }
                break;
            case 'cloud-form':
                // 云表单页面初始化
                if (window.cloudFormModule && window.cloudFormModule.init) {
                    cloudFormModule.init();
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