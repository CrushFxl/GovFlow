// 学习教育模块逻辑
$(document).ready(function() {
    // 初始化学习教育页面
    function initStudy() {
        // 可以添加学习教育页面的初始化逻辑
        console.log('学习教育页面初始化');
        // 未来可以添加学习资源管理、学习记录等功能
    }

    // 暴露初始化函数供home.js调用
    window.studyModule = {
        init: initStudy
    };
});