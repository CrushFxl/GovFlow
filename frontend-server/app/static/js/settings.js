// 系统设置模块逻辑
$(document).ready(function() {
    // 初始化系统设置页面
    function initSettings() {
        // 可以添加系统设置页面的初始化逻辑
        console.log('系统设置页面初始化');
        // 未来可以添加用户设置、系统配置等功能
    }

    // 暴露初始化函数供home.js调用
    window.settingsModule = {
        init: initSettings
    };
});