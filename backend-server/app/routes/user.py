import random
from flask import Blueprint, request, session
import time

from app.models import db
from app.models.User import User
from app.models.Profile import Profile
from app.models.Todo import Todo


user_bk = Blueprint('user', __name__, url_prefix='/user')


@user_bk.route('/get_info', methods=['GET', 'POST'])
def get_user_info():
    uid = session.get('uid')
    if uid is None:
        uid = request.args.get('uid')
    user = User.query.filter_by(uid=uid).first()
    profile = Profile.query.filter_by(uid=uid).first()
    todos = Todo.query.filter_by(accept_user_uid=uid).all()
    
    # 初始化四个整型变量，用于存储待完成的任务类型个数
    num_review_todo = 0
    num_notice_todo = 0
    num_task_todo = 0
    num_other_todo = 0
    # 格式化todo数据
    user_todos = {}
    for idx, todo in enumerate(todos, 1):
        # 将todo对象转换为字典
        todo_dict = {
            'id': todo.id,
            'type': todo.type,
            'title': todo.title,
            'relate': todo.relate,
            'create_user_uid': todo.create_user_uid,
            'accept_user_uid': todo.accept_user_uid,
            'status': todo.status
        }
        user_todos[str(idx)] = todo_dict
        # 只统计待完成的任务（status为0）
        if todo.status == 0:
            if todo.type == 'review':
                num_review_todo += 1
            elif todo.type == 'notice':
                num_notice_todo += 1
            elif todo.type == 'task':
                num_task_todo += 1
            elif todo.type == 'other':
                num_other_todo += 1
    return {
        'code': 1000,
        'msg': 'ok', 
        'data': {
            'uid': uid,
            'username': user.nick,
            'user_realname': profile.real_name,
            'user_todos': user_todos,
            'num_review_todo': num_review_todo,
            'num_notice_todo': num_notice_todo,
            'num_task_todo': num_task_todo,
            'num_other_todo': num_other_todo
        }
    }



