import base64
import random
from flask import Blueprint, request, session, make_response, jsonify
import time
from PIL import Image, ImageDraw, ImageFont
import random
import string
from io import BytesIO
import base64

from app.models import db
from app.models.User import User
from app.models.Code import Code
from app.models.System import System

VALID_CHAR = ("0123456789ABCEDFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
              "!@#$%^&*()_+.-/<>,';:=`~|\\")

auth_bk = Blueprint('auth', __name__, url_prefix='/auth')
register_bk = Blueprint('register', __name__, url_prefix='/register')


@auth_bk.post('/')
def auth():
    uid = session.get('uid')
    if uid:
        return {'code': 1000, 'msg': 'ok'}
    return {'code': 1001, 'msg': '登陆身份已过期，请重新登陆'}


@auth_bk.post('/login')
def login():
    req = request.form.to_dict()
    username = req['username']
    password = req['password']
    user = User.query.filter_by(mob=username, pwd=password).first()
    if user:
        session['uid'] = user.uid
        session.permanent = True
        return {"code": 1000, "msg": "ok"}
    return {"code": 1001, "msg": "用户名或密码错误"}


@auth_bk.post('/logout')
def logout():
    session.clear()
    return {'code': 1000, 'msg': 'ok'}


@register_bk.get('/code')
def set_code():
    img_height = 100
    img_width = 42
    code_length = 4
    chars = string.digits + string.ascii_uppercase + string.ascii_lowercase
    code = ''.join(random.choice(chars) for _ in range(code_length))
    # 创建空白图片
    img = Image.new('RGB', (img_width, img_height), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    # 添加干扰线
    for _ in range(5):
        start = (random.randint(0, img_width), random.randint(0, img_height))
        end = (random.randint(0, img_width), random.randint(0, img_height))
        draw.line([start, end], fill=(180, 180, 180), width=1)
    # 添加验证码文本
    font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), code, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text(
        ((img_width - text_width) / 2, (img_height - text_height) / 2),
        code,
        fill=(193, 44, 31),  # 红色
        font=font
    )
    # 将图片转为Base64编码
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')
    # 验证码写入数据库
    cid = ''.join(random.choice(chars) for _ in range(8))
    ctime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
    codeInfo = Code(cid=cid, code=code, ctime=ctime)
    db.session.add(codeInfo)
    db.session.commit()
    return jsonify({
        'image': f"data:image/png;base64,{img_base64}",
        'cid': cid
    })


@register_bk.post('/commit')
def register():
    username = request.form.get('username')
    phone = request.form.get("phone")
    password = request.form.get("password")
    cid = request.form.get("cid")
    req_code = request.form.get("code")
    # 检查密码格式
    for i in password:
        if i not in VALID_CHAR:
            return {"code": 1001}
    if not 8 <= len(password) <= 18:
        return {"code": 1001}
    # 检查是否已被注册
    if User.query.filter(User.mob == phone).first():
        return {"code": 1002}
    # 检查验证码是否正确
    if not Code.query.filter_by(cid=cid, code=req_code).first():
        return {"code": 1003}
    # 检查注册信息
    while True:
        uid = random.randint(10000, 1000000000)
        if not User.query.filter(User.uid == uid).first():
            break
    db.session.add(User(uid=uid, nick=username, status=0, mob=phone, pwd=password))
    db.session.commit()
    session['uid'] = uid
    session.permanent = True
    return {"code": 1000}


@auth_bk.post('/verify_system_password')
def verify_system_password():
    """验证系统设置页面密码"""
    try:
        password = request.json.get('password')
        if not password:
            return jsonify({'code': 400, 'msg': '密码不能为空'})
        
        # 获取系统密码设置
        system_password = System.query.filter_by(key='system_password').first()
        
        # 如果系统密码不存在，设置默认密码为'123456'
        if not system_password:
            default_password = '123456'
            if password == default_password:
                # 存储默认密码到数据库
                new_system = System(key='system_password', value=default_password, description='系统设置页面访问密码')
                db.session.add(new_system)
                db.session.commit()
                return jsonify({'code': 200, 'msg': '验证成功'})
            else:
                return jsonify({'code': 401, 'msg': '密码错误'})
        
        # 验证密码
        if password == system_password.value:
            return jsonify({'code': 200, 'msg': '验证成功'})
        else:
            return jsonify({'code': 401, 'msg': '密码错误'})
    except Exception as e:
        return jsonify({'code': 500, 'msg': f'验证失败: {str(e)}'})


@auth_bk.get('/system_settings')
def get_system_settings():
    """获取系统设置信息"""
    try:
        # 验证用户身份
        if not session.get('uid'):
            return jsonify({'code': 401, 'msg': '请先登录'})
        
        # 获取所有系统设置
        settings = System.query.all()
        result = {}
        for setting in settings:
            result[setting.key] = setting.value
        
        return jsonify({'code': 200, 'data': result, 'msg': 'success'})
    except Exception as e:
        return jsonify({'code': 500, 'msg': f'获取系统设置失败: {str(e)}'})


@auth_bk.post('/system_settings')
def save_system_settings():
    """保存系统设置信息（钉钉相关设置）"""
    try:
        # 验证用户身份
        if not session.get('uid'):
            return jsonify({'code': 401, 'msg': '请先登录'})
        
        data = request.json
        
        # 保存钉钉相关设置
        if 'dingtalk_url' in data:
            system_setting = System.query.filter_by(key='dingtalk_url').first()
            if system_setting:
                system_setting.value = data['dingtalk_url']
            else:
                new_setting = System(key='dingtalk_url', value=data['dingtalk_url'], description='钉钉DingTalk URL')
                db.session.add(new_setting)
        
        if 'dingtalk_appkey' in data:
            system_setting = System.query.filter_by(key='dingtalk_appkey').first()
            if system_setting:
                system_setting.value = data['dingtalk_appkey']
            else:
                new_setting = System(key='dingtalk_appkey', value=data['dingtalk_appkey'], description='钉钉AppKey')
                db.session.add(new_setting)
        
        if 'dingtalk_appsecret' in data:
            system_setting = System.query.filter_by(key='dingtalk_appsecret').first()
            if system_setting:
                system_setting.value = data['dingtalk_appsecret']
            else:
                new_setting = System(key='dingtalk_appsecret', value=data['dingtalk_appsecret'], description='钉钉AppSecret')
                db.session.add(new_setting)
        
        db.session.commit()
        return jsonify({'code': 200, 'msg': '保存成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'msg': f'保存失败: {str(e)}'})


@auth_bk.post('/update_system_password')
def update_system_password():
    """更新系统设置页面密码"""
    try:
        # 验证用户身份
        if not session.get('uid'):
            return jsonify({'code': 401, 'msg': '请先登录'})
        
        data = request.json
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')
        
        # 验证参数
        if not current_password or not new_password or not confirm_password:
            return jsonify({'code': 400, 'msg': '密码不能为空'})
        
        if new_password != confirm_password:
            return jsonify({'code': 400, 'msg': '两次输入的新密码不一致'})
        
        # 验证当前密码
        system_password = System.query.filter_by(key='system_password').first()
        if not system_password or system_password.value != current_password:
            return jsonify({'code': 401, 'msg': '当前密码错误'})
        
        # 更新密码
        if system_password:
            system_password.value = new_password
        else:
            system_password = System(key='system_password', value=new_password, description='系统设置页面访问密码')
            db.session.add(system_password)
        
        db.session.commit()
        return jsonify({'code': 200, 'msg': '密码更新成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'msg': f'更新失败: {str(e)}'})
