import random
from flask import Blueprint, request, session
import time

from app.models import db
from app.models.User import User

VALID_CHAR = ("0123456789ABCEDFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
              "!@#$%^&*()_+.-/<>,';:=`~|\\")

auth_bk = Blueprint('auth', __name__, url_prefix='/auth')


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


# @auth_bk.post('/register')
# def register():
#     mob = request.form.get("mob")
#     pwd = request.form.get("pwd")
#
#     # 检查密码格式
#     for i in pwd:
#         if i not in VALID_CHAR:
#             return {"code": 1001}
#     if not 8 <= len(pwd) <= 18:
#         return {"code": 1001}
#
#     # 检查是否已被注册
#     if User.query.filter(User.mob == mob).first():
#         return {"code": 1002}
#
#     # 检查注册信息
#     while True:
#         uid = random.randint(10000, 1000000000)
#         if not User.query.filter(User.uid == uid).first():
#             break
#     db.session.add(User(uid=uid, mob=mob, pwd=pwd))
#
#     db.session.commit()
#     session['uid'] = uid
#     session.permanent = True
#     return {"code": 1000}
