import random
from flask import Blueprint, request, session
import time

from app.models import db
from app.models.User import User

VALID_CHAR = ("0123456789ABCEDFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
              "!@#$%^&*()_+.-/<>,';:=`~|\\")

user_bk = Blueprint('user', __name__, url_prefix='/user')


@user_bk.post('/get_info')
def get_user_info():
    uid = session.get('uid')
    user = User.query.filter_by(uid=uid).first()
    if user:
        return {'code':1000, 'msg': 'ok', 'data':{'username': user.nick,}}
    return {'code': 1001, 'msg': '用户不存在！'}



