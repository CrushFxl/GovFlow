// 系统设置页面相关脚本
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const passwordVerifyForm = document.getElementById('password-verify-form');
    const passwordError = document.getElementById('password-error');
    const passwordVerifySection = document.getElementById('password-verify-section');
    const systemSettingsSection = document.getElementById('system-settings-section');
    const systemSettingsForm = document.getElementById('system-settings-form');
    const settingsMessage = document.getElementById('settings-message');
    const passwordUpdateForm = document.getElementById('password-update-form');
    const passwordUpdateMessage = document.getElementById('password-update-message');
    $('.page-title').text('系统设置');
    
    // 验证密码表单提交
    passwordVerifyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('system-password').value;
        // 隐藏之前的错误信息
        passwordError.style.display = 'none';
        // 发送密码验证请求
        fetch(`${config.backendUrl}/auth/verify_system_password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 验证成功，显示设置表单
                passwordVerifySection.style.display = 'none';
                systemSettingsSection.style.display = 'block';
                // 获取现有设置
                loadSystemSettings();
            } else {                
                // 添加错误动画效果
                const authCard = document.querySelector('.auth-card');
                authCard.classList.add('error-shake');
                setTimeout(() => {
                    authCard.classList.remove('error-shake');
                }, 500);
                // 清空密码输入框
                document.getElementById('system-password').value = '';
            }
        })
        .catch(error => {
            console.error('验证失败:', error);
            const errorText = document.querySelector('#password-error .error-text');
            errorText.textContent = '验证过程中发生错误';
            passwordError.style.display = 'flex';
            
            // 添加错误动画效果
            const authCard = document.querySelector('.auth-card');
            authCard.classList.add('error-shake');
            setTimeout(() => {
                authCard.classList.remove('error-shake');
            }, 500);
        });
    });
    
    // 加载系统设置
    function loadSystemSettings() {
        fetch(`${config.backendUrl}/auth/system_settings`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200 && data.data) {
                const settings = data.data;
                if (settings.dingtalk_url) {
                    document.getElementById('dingtalk-url').value = settings.dingtalk_url;
                }
                if (settings.dingtalk_appkey) {
                    document.getElementById('dingtalk-appkey').value = settings.dingtalk_appkey;
                }
                if (settings.dingtalk_appsecret) {
                    document.getElementById('dingtalk-appsecret').value = settings.dingtalk_appsecret;
                }
            }
        })
        .catch(error => {
            console.error('加载设置失败:', error);
            showMessage(settingsMessage, '加载设置失败', 'error');
        });
    }
    
    // 保存系统设置表单提交
    systemSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // 收集表单数据
        const formData = {
            dingtalk_url: document.getElementById('dingtalk-url').value,
            dingtalk_appkey: document.getElementById('dingtalk-appkey').value,
            dingtalk_appsecret: document.getElementById('dingtalk-appsecret').value
        };
        // 发送保存请求
        fetch(`${config.backendUrl}/auth/system_settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                showMessage(settingsMessage, data.msg || '保存成功', 'success');
            } else {
                showMessage(settingsMessage, data.msg || '保存失败', 'error');
            }
        })
        .catch(error => {
            console.error('保存设置失败:', error);
            showMessage(settingsMessage, '保存过程中发生错误', 'error');
        });
    });
    
    // 更新系统密码表单提交
    passwordUpdateForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // 收集表单数据
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        // 前端验证
        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage(passwordUpdateMessage, '密码不能为空', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showMessage(passwordUpdateMessage, '两次输入的新密码不一致', 'error');
            return;
        }
        
        // 发送密码更新请求
        fetch(`${config.backendUrl}/auth/update_system_password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                // 更新成功，显示成功信息
                showMessage(passwordUpdateMessage, data.msg || '密码更新成功', 'success');
                
                // 清空密码输入框
                passwordUpdateForm.reset();
            } else {
                // 更新失败，显示错误信息
                showMessage(passwordUpdateMessage, data.msg || '密码更新失败', 'error');
            }
        })
        .catch(error => {
            console.error('更新密码失败:', error);
            showMessage(passwordUpdateMessage, '更新过程中发生错误', 'error');
        });
    });
    
    // 显示消息的辅助函数
    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = type === 'success' ? 'success-message' : 'error-message';
        element.style.display = 'block';
        // 3秒后隐藏消息
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }
    
    // 加载第三方消息推送记录
    function loadMessagePushRecords() {
        // 模拟推送记录数据
        const pushRecords = [
            {
                companyName: '灵创大学',
                channel: '钉钉(DingTalk)',
                eventTitle: '关于冯小二年度评议的通知',
                pushCount: 12,
                status: '成功'
            },
            {
                companyName: '灵创大学',
                channel: '钉钉(DingTalk)',
                eventTitle: '2024年度党员发展工作安排',
                pushCount: 28,
                status: '成功'
            },
            {
                companyName: '灵创大学',
                channel: '钉钉(DingTalk)',
                eventTitle: '5月份主题党日活动通知',
                pushCount: 45,
                status: '成功'
            },
            {
                companyName: '灵创大学',
                channel: '微信(WeChat)',
                eventTitle: '党费缴纳提醒',
                pushCount: 73,
                status: '成功'
            },
            {
                companyName: '灵创大学',
                channel: '微信(WeChat)',
                eventTitle: '2024年第一季度三会一课安排',
                pushCount: 62,
                status: '成功'
            }
        ];
        
        // 获取表格tbody元素
        const tableBody = document.getElementById('message-push-records');
        // 清空表格
        tableBody.innerHTML = '';
        // 填充表格数据
        pushRecords.forEach(record => {
            const row = document.createElement('tr');
            // 根据状态设置不同的样式
            const statusClass = record.status === '成功' ? 'status-success' : 'status-failed';
            row.innerHTML = `
                <td>${record.companyName}</td>
                <td>${record.channel}</td>
                <td>${record.eventTitle}</td>
                <td>${record.pushCount}</td>
                <td><span class="status-badge ${statusClass}">${record.status}</span></td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    loadMessagePushRecords();
});