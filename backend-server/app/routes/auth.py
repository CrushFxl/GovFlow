import random
from flask import Blueprint, request, session, make_response
import time
from PIL import Image, ImageDraw, ImageFont
import random
import string
from io import BytesIO
from fastapi import Response

from app.models import db
from app.models.User import User

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

code1=''
code_length = 4
img_height = 100
img_width = 42
@register_bk.get('/code')
def set_code():
    global code1
    chars = string.digits + string.ascii_uppercase + string.ascii_lowercase
    code = ''.join(random.choice(chars) for _ in range(code_length))
    code1=code
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
    # text_width, text_height = draw.textsize(code, font=font)
    bbox = draw.textbbox((0, 0), code, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text(
        ((img_width - text_width) / 2, (img_height - text_height) / 2),
        code,
        fill=(193, 44, 31),  # 红色
        font=font
    )
    # 将图片转为字节流
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)

    response = make_response(img_io.getvalue())
    response.headers.set('Content-Type', 'image/png')
    return response
    # 返回图片响应
    # return Response(content=img_io.getvalue(), media_type="image/png")

@register_bk.post('/register')
def register():
    username = request.form.get('username')
    phone = request.form.get("phone")
    password = request.form.get("password")
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

    #检查验证码是否正确
    if not code1.upper() == req_code.upper():
        return {"code": 1003}

    # 检查注册信息
    while True:
        uid = random.randint(10000, 1000000000)
        if not User.query.filter(User.uid == uid).first():
            break
    db.session.add(User(uid=uid, nick=username,status=1,mob=phone, pwd=password))

    db.session.commit()
    session['uid'] = uid
    session.permanent = True
    return {"code": 1000}
