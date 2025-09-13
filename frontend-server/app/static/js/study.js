// 学习教育页面的前端逻辑

const studyModule = {
    currentChannel: 'all',      // 当前选中的渠道
    currentDate: '',            // 当前选中的日期筛选条件
    totalSlice: 5,              // 轮播图显示的新闻数量
    currentSlide: 0,            // 当前轮播图索引
    slideInterval: null,        // 轮播图定时器
    slideIntervalTime: 3000,    // 轮播图自动播放间隔（毫秒）
    columns: 3,                 // 新闻卡片分栏数
    news: [],                   // 新闻数据

    URL: $('#URL').text(),
    
    // 初始化函数
    init: function() {
        // 加载新闻数据
        this.loadNewsData();
        // 绑定筛选按钮事件
        this.bindChannelFilterEvents();
        // 绑定轮播图控制事件
        this.bindSlideControlEvents();
    },
    
    // 加载新闻数据
    loadNewsData: function(option="") { 
        $.ajax({
            url: URL + '/get_news_by_database',
            type: 'GET',
            data: { 
                channel: this.currentChannel,
                date: this.currentDate,
                option: option
            },
            dataType: 'json',
            success: function(response) {
                console.log('新闻数据加载成功:', response);
                this.news = response.data || [];
                // 渲染轮播图
                this.renderSlideShow(this.news.slice(0, this.totalSlice));
                // 渲染新闻卡片
                this.renderNewsCards(this.news);
            }.bind(this),
            error: function(xhr, status, error) {
                console.error('加载新闻数据失败:', error);
                // 显示错误提示
                this.showErrorMessage('加载新闻数据失败，请稍后重试');
            }.bind(this)
        });
    },
    
    // 绑定筛选按钮事件
    bindChannelFilterEvents: function() {
        // 绑定渠道筛选按钮事件
        const channelButtons = document.querySelectorAll('.filter-channel-buttons button');
        channelButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 更新当前选中的渠道
                studyModule.currentChannel = this.getAttribute('data-channel') || 'all';
                // 更新按钮样式
                channelButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                // 重新加载新闻数据
                studyModule.loadNewsData();
            });
        });
        
        // 绑定日期筛选按钮事件
        const dateButtons = document.querySelectorAll('.filter-date-buttons button');
        dateButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 更新当前选中的日期
                const dateText = this.textContent.trim();
                switch(dateText) {
                    case '全部':
                        studyModule.currentDate = '';
                        break;
                    case '最新':
                        studyModule.currentDate = 'latest';
                        break;
                    case '近一天':
                        studyModule.currentDate = 'oneday';
                        break;
                    case '近三天':
                        studyModule.currentDate = 'threedays';
                        break;
                    case '近七天':
                        studyModule.currentDate = 'sevendays';
                        break;
                    default:
                        studyModule.currentDate = '';
                }
                
                // 更新按钮样式
                dateButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // 重新加载新闻数据
                studyModule.loadNewsData();
            });
        });
        
        // 绑定刷新按钮事件
        document.querySelector('#refresh_news').addEventListener('click', function() {
            studyModule.loadNewsData('random');
        });
        
        // 绑定获取今日新闻按钮事件
        document.querySelector('#get_today_news').addEventListener('click', function() {
            $.ajax({
                url: URL + '/get_news_by_database',
                type: 'GET',
                data: { 
                    option: 'today',
                    channel: studyModule.currentChannel,
                    date: studyModule.currentDate
                },
                dataType: 'json',
                success: function(response) {
                    studyModule.news = response.data || [];
                    // 渲染轮播图
                    studyModule.renderSlideShow(studyModule.news.slice(0, studyModule.totalSlice));
                    // 渲染新闻卡片
                    studyModule.renderNewsCards(studyModule.news);
                },
                error: function(xhr, status, error) {
                    console.error('获取今日新闻失败:', error);
                    studyModule.showErrorMessage('获取今日新闻失败，请稍后重试');
                }
            });
        });
    },
    
    // 绑定轮播图控制事件
    bindSlideControlEvents: function() {
        // 上一张按钮
        document.querySelector('.carousel-prev').addEventListener('click', function() {
            studyModule.goToPrevSlide();
        });
        // 下一张按钮
        document.querySelector('.carousel-next').addEventListener('click', function() {
            studyModule.goToNextSlide();
        });
        // 指示器点击事件
        const indicators = document.querySelectorAll('.carousel-indicators .indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', function() {
                studyModule.goToSlide(index);
            });
        });
    },
    
    // 渲染轮播图
    renderSlideShow: function(news) {
        const slideContainer = document.querySelector('.carousel');
        const indicatorsContainer = document.querySelector('.carousel-indicators');
        
        // 清空轮播图容器
        slideContainer.innerHTML = '';
        indicatorsContainer.innerHTML = '';
        
        // 重置当前轮播图索引
        this.currentSlide = 0;
        
        // 创建轮播图项目和指示器
        news.forEach((item, index) => {
            // 创建轮播图项目
            const slideItem = document.createElement('div');
            slideItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            slideItem.style.opacity = index === 0 ? '1' : '0';
            slideItem.style.transition = 'opacity 0.5s ease';
            // 创建链接
            const link = document.createElement('a');
            link.href = item.url;
            link.target = '_blank';
            // 创建图片
            const img = document.createElement('img');
            img.src = item.poster;
            img.alt = item.title;
            // 创建标题区域
            const caption = document.createElement('div');
            caption.className = 'carousel-caption';
            // 创建标题
            const title = document.createElement('h3');
            title.textContent = item.title;
            // 创建描述
            const desc = document.createElement('p');
            desc.textContent = item.description || '新闻描述';
            // 组装标题区域
            caption.appendChild(title);
            caption.appendChild(desc);
            // 组装轮播图项目
            link.appendChild(img);
            link.appendChild(caption);
            slideItem.appendChild(link);
            slideContainer.appendChild(slideItem);
            // 创建指示器
            const indicator = document.createElement('span');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-index', index);
            indicator.addEventListener('click', function() {
                studyModule.goToSlide(index);
            });
            indicatorsContainer.appendChild(indicator);
        });
        
        // 启动轮播图自动播放
        this.startSlideInterval();
    },
    
    // 渲染新闻卡片
    renderNewsCards: function(news) {
        // 清除之前可能创建的额外列容器
        for (let i = 2; i <= this.columns; i++) {
            const extraContainer = document.querySelector(`#news-cards-container-${i}`);
            if (extraContainer) {
                extraContainer.remove();
            }
        }
        // 获取当前设置的分栏数
        const columnCount = this.columns;
        // 创建列容器数组，用于存放不同列的新闻卡片
        const columnContainers = [];
        // 首先获取并清空现有的两个容器
        const leftContainer = document.querySelector('#news-cards-container-left');
        const rightContainer = document.querySelector('#news-cards-container');
        leftContainer.innerHTML = '';
        rightContainer.innerHTML = '';
        // 添加现有的两个容器到数组中
        columnContainers.push(leftContainer);
        columnContainers.push(rightContainer);
        // 为超过两列的情况创建新的容器
        for (let i = 2; i < columnCount; i++) {
            const newContainer = document.createElement('div');
            newContainer.className = 'news-cards-container';
            newContainer.id = `news-cards-container-${i}`;
            // 插入到右侧容器之后
            rightContainer.parentNode.insertBefore(newContainer, rightContainer.nextSibling);
            columnContainers.push(newContainer);
        }
    
        // 创建新闻卡片
        news.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'news-card';
            // 创建标签（放置在卡片顶部）
            const tag = document.createElement('div');
            tag.className = 'news-card-tag';
            tag.textContent = item.channel;
            // 创建内容容器（分为左右两栏）
            const contentContainer = document.createElement('div');
            contentContainer.className = 'news-card-content';
            // 创建左侧图片部分
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'news-card-image';
            const imageLink = document.createElement('a');
            imageLink.href = item.url;
            imageLink.target = '_blank';
            const image = document.createElement('img');
            image.src = item.poster || 'https://via.placeholder.com/200x200'; // 默认图片占位符
            image.alt = item.title;
            image.className = 'news-image';
            image.style.borderRadius = '8px'; // 方形圆角
            imageLink.appendChild(image);
            imageWrapper.appendChild(imageLink);
            // 创建右侧内容部分
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'news-content-wrapper';
            // 创建标题并添加链接
            const titleContainer = document.createElement('h3');
            titleContainer.className = 'news-card-title';
            const titleLink = document.createElement('a');
            titleLink.href = item.url;
            titleLink.target = '_blank';
            titleLink.textContent = item.title;
            titleLink.className = 'news-title-link';
            titleContainer.appendChild(titleLink);
            // 创建描述
            const description = document.createElement('p');
            description.className = 'news-card-desc';
            description.textContent = item.description || '';
            // 创建日期
            const date = document.createElement('span');
            date.textContent = item.time || '';
            // 创建页脚
            const footer = document.createElement('div');
            footer.className = 'news-card-footer';
            footer.appendChild(date);
            // 组装右侧内容
            contentWrapper.appendChild(titleContainer);
            contentWrapper.appendChild(description);
            contentWrapper.appendChild(footer);
            // 组装内容容器
            contentContainer.appendChild(imageWrapper);
            contentContainer.appendChild(contentWrapper);
            // 组装完整卡片
            card.appendChild(tag);
            card.appendChild(contentContainer);
            // 根据索引将卡片分配到对应的列容器
            const columnIndex = index % columnCount;
            columnContainers[columnIndex].appendChild(card);
        });
        // 根据分栏数更新CSS样式
        this.updateColumnStyles(columnCount);
    },
    
    // 更新列容器的样式以支持多列布局
    updateColumnStyles: function(columnCount) {
        // 清除之前的样式
        const styleId = 'news-columns-style';
        let styleElement = document.getElementById(styleId);
        if (styleElement) {
            styleElement.remove();
        }
        // 创建新的样式元素
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        // 计算每列的宽度百分比
        const columnWidth = 100 / columnCount;
        // 生成CSS规则
        let cssRules = `
            /* 保持轮播图和筛选区域在顶部 */
            .study-layout {
                display: block;
            }
            .study-left-column {
                width: 100%;
                margin-bottom: 20px;
            }
            .study-right-column {
                width: 100%;
                margin-bottom: 20px;
            }
            /* 新闻卡片容器布局 */
            .news-cards-container-wrapper {
                display: flex;
                flex-wrap: wrap;
            }
            #news-cards-container-left,
            #news-cards-container {
                width: ${columnWidth}%;
                padding: 0 10px;
                box-sizing: border-box;
                float: left;
            }
        `;
        // 添加额外列的样式
        for (let i = 2; i < columnCount; i++) {
            cssRules += `
            #news-cards-container-${i} {
                width: ${columnWidth}%;
                padding: 0 10px;
                box-sizing: border-box;
                float: left;
            }`;
        }
        // 添加到页面
        styleElement.textContent = cssRules;
        document.head.appendChild(styleElement);
    },
    
    // 显示错误消息
    showErrorMessage: function(message) {
        const leftContainer = document.querySelector('#news-cards-container-left');
        const rightContainer = document.querySelector('#news-cards-container');
        leftContainer.innerHTML = `<div class="error-message">${message}</div>`;
        rightContainer.innerHTML = `<div class="error-message">${message}</div>`;
    },
    
    // 启动轮播图自动播放
    startSlideInterval: function() {
        // 清除之前的定时器
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
        }
        // 设置新的定时器
        this.slideInterval = setInterval(() => {
            this.goToNextSlide();
        }, this.slideIntervalTime);
    },
    
    // 切换到上一张轮播图
    goToPrevSlide: function() {
        const slideItems = document.querySelectorAll('.carousel-item');
        const indicators = document.querySelectorAll('.carousel-indicators .indicator');
        if (slideItems.length === 0) return;
        // 更新当前索引
        this.currentSlide = (this.currentSlide - 1 + slideItems.length) % slideItems.length;
        // 更新轮播图显示
        this.updateSlideDisplay(slideItems, indicators);
        // 重新启动定时器
        this.startSlideInterval();
    },
    
    // 切换到下一张轮播图
    goToNextSlide: function() {
        const slideItems = document.querySelectorAll('.carousel-item');
        const indicators = document.querySelectorAll('.carousel-indicators .indicator');
        if (slideItems.length === 0) return;
        // 更新当前索引
        this.currentSlide = (this.currentSlide + 1) % slideItems.length;
        // 更新轮播图显示
        this.updateSlideDisplay(slideItems, indicators);
        // 重新启动定时器
        this.startSlideInterval();
    },
    
    // 切换到指定轮播图
    goToSlide: function(index) {
        const slideItems = document.querySelectorAll('.carousel-item');
        const indicators = document.querySelectorAll('.carousel-indicators .indicator');
        if (slideItems.length === 0 || index < 0 || index >= slideItems.length) return;
        // 更新当前索引
        this.currentSlide = index;
        // 更新轮播图显示
        this.updateSlideDisplay(slideItems, indicators);
        // 重新启动定时器
        this.startSlideInterval();
    },
    
    // 更新轮播图显示
    updateSlideDisplay: function(slideItems, indicators) {
        // 更新轮播图项目显示
        slideItems.forEach((item, index) => {
            if (index === this.currentSlide) {
                item.classList.add('active');
                item.style.opacity = '1';
            } else {
                item.classList.remove('active');
                item.style.opacity = '0';
            }
        });
        // 更新指示器显示
        indicators.forEach((indicator, index) => {
            if (index === this.currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
};

window.studyModule = studyModule;