const URL = $("#URL").text()

// 切换排序方式
function switchSortMethod(element) {
    // 移除所有激活状态
    $("#sorted_by_time, #sorted_by_channel").removeClass("active");
    // 添加当前激活状态
    $(element).addClass("active");
    // 获取排序方式
    let sortBy = $(element).attr("id") === "sorted_by_time" ? "time" : "channel";
    // 清空现有新闻卡片
    $("#studyPage > .news").remove();
    // 根据排序方式获取新闻数据
    getNewsData(sortBy);
}

// 获取新闻数据
function getNewsData(sortBy) {
    // 构建查询参数
    let params = {};
    if (sortBy === "time") {
        params.date = "latest";
    } else if (sortBy === "channel") {
        // 按渠道排序时，可以通过option参数实现
        params.option = "random";
    }
    
    // 发送请求到后端API
    $.ajax({
        url: URL + "/get_news_by_database",
        type: "GET",
        data: params,
        success: function(response) {
            if (response.code === 1000 && response.data && response.data.length > 0) {
                // 渲染新闻卡片
                renderNewsCards(response.data);
            } else {
                console.log("获取新闻数据失败");
            }
        },
        error: function(xhr, status, error) {
            console.error("请求失败:", error);
        }
    });
}

// 渲染新闻卡片
function renderNewsCards(newsList) {
    let studyPage = $("#studyPage");
    
    newsList.forEach(function(news) {
        let newsCard = $(
            `<div class="box sd0 news" style="margin: 5px 0">
                <img src="${news.poster}" alt="" />
                <div class="news_content">
                    <a href="${news.url}">${news.title}</a>
                    <div class="news_data">
                        <p class="news_date">${news.time || '2025-11-07'}</p>
                        <p class="news_read">阅读量&nbsp;${news.readCount || Math.floor(Math.random() * 1000)}</p>
                        <p class="news_like">收藏量&nbsp;${news.likeCount || Math.floor(Math.random() * 100)}</p>
                    </div>
                </div>
            </div>`
        );
        
        studyPage.append(newsCard);
    });
}

window.onload = function () {
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
                const coin = resp.data['coin'];
                const user_type = resp.data['user_type'];
                localStorage.setItem('coin', coin);
                localStorage.setItem('uid', uid);
                localStorage.setItem('nick', name);
                $('#user_name').text(name);
                $('#user_status').text(user_type);
                $('#user_star').text(coin);
                $('#user_party').text(resp.data['party_branch']);
                updateIframeWithUid(uid);           // 在Dify对话框中嵌入UID
            }
        },
        error: function () {
            alert("同步状态失败：无法连接至服务器，请联系网站管理员或稍后再试。");
        }
    });
    /*点击底部首页标签*/
    $(document).on("click", "#indexTab", function () {
        changePage(this);
    });


    /*点击首页AI相关跳转*/
    $(document).on("click", ".ai_jump_button", function () {
        $("#AITab").trigger("click");
    });
    $(document).on("click", "#q1", function () {
        $("#AITab").trigger("click");
    });
    $(document).on("click", "#q2", function () {
        $("#AITab").trigger("click");
    });
    $(document).on("click", "#q3", function () {
        $("#AITab").trigger("click");
    });


    /*shortcut link*/
    $(document).on("click", "#task_manage", function () {
        window.location.assign('/task_manage')
    });
    $(document).on("click", "#party_day", function () {
        window.location.assign('/party_day')
    });
    $(document).on("click", "#san_and_one", function () {
        window.location.assign('/san_and_one')
    });
    $(document).on("click", "#party_fee", function () {
        window.location.assign('/party_fee')
    });
    $(document).on("click", "#party_development", function () {
        window.location.assign('/party_development')
    });
    $(document).on("click", "#party_judge", function () {
        window.location.assign('/party_judge')
    });

    /*点击底部AI工作台标签*/
    $(document).on("click", "#AITab", function () {
        changePage(this);
    });
    /*点击底部学习教育标签*/
    $(document).on("click", "#studyTab", function () {
        changePage(this);
        // 切换到学习页面时，默认按时间排序并获取数据
        setTimeout(function() {
            $("#sorted_by_time").addClass("active");
            $("#studyPage > .news").remove();
            getNewsData("time");
        }, 100);
    });
    /*点击底部我的标签*/
    $(document).on("click", "#mineTab", function () {
        changePage(this)
    });
    /*点击设置*/
    $(document).on("click", "#setting", function () {
        window.location.assign('/setting')
    });
    
    /*排序切换事件*/
    $(document).on("click", "#sorted_by_time", function() {
        switchSortMethod(this);
    });
    
    $(document).on("click", "#sorted_by_channel", function() {
        switchSortMethod(this);
    });

    $(document).on("click", "#logout_btn", function () {
        sessionStorage.clear();
        $.ajax({
            url: URL + "/auth/logout",
            xhrFields: {withCredentials: true},
            type: "POST",
            dataType: "json",
            success: function (resp) {
                window.location.replace('/mobile_login');
                localStorage.removeItem('uid');
                localStorage.removeItem('admin');
            },
            error: function () {
                alert("退出登陆失败：无法连接至服务器。");
            }
        });
    });


    // 更新iframe URL，添加编码后的uid参数
    function updateIframeWithUid(uid) {
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
        const iframe = document.querySelector('iframe');
        const originalSrc = iframe.src;
        // 检查URL是否已经包含参数
        const separator = originalSrc.includes('?') ? '&' : '?';
        iframe.src = originalSrc + separator + 'uid=' + encodedUid;
    }

    /*刷新页面时自动触发点击事件*/
    let page = sessionStorage.getItem("page");
    if (!page) page = "index";  //默认主页
    $("#" + page + "Tab").trigger("click");
}