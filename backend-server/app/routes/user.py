import random
from flask import Blueprint, request, session
import time

from app.models import db
from app.models.User import User
from app.models.Profile import Profile
from app.models.Notice import Notice
from app.models.Task import Task
from app.models.Todo import Todo
from app.models.Review import Review


user_bk = Blueprint('user', __name__, url_prefix='/user')


def number_to_uuid(uid, number):
    # 根据用户uid和待办临时编号反查待办事项的UUID
    todos = Todo.query.filter_by(uid=uid, status=0).all()
    count = 1
    for t in todos:
        if t.type == 'notice':
            if count == number:
                return t.related_uuid
            count += 1
        elif t.type == 'task':
            if count == number:
                return t.related_uuid
            count += 1
        elif t.type == 'review':
            if count == number:
                return t.related_uuid
            count += 1
    return None


@user_bk.route('/get_nick', methods=['GET', 'POST'])
def get_nick():
    uid = session.get('uid')
    nick = User.query.filter_by(uid=uid).first().nick
    return {'code': 1000, 'msg': 'ok', 'data': {'uid': uid, 'nick': nick}}


@user_bk.route('/get_todos', methods=['GET', 'POST'])
def get_todos():
    uid = request.args.get('uid')
    todos = Todo.query.filter_by(uid=uid, status=0).all()
    notice_todos = []
    task_todos = []
    review_todos = []
    count = 1
    for t in todos:
        if t.type == 'notice':
            todo = Notice.query.filter_by(uuid=t.related_uuid).first()
            record_str = f'({count}) 【待阅读】{todo.title}'
            notice_todos.append(record_str)
            count += 1
        elif t.type == 'task':
            todo = Task.query.filter_by(uuid=t.related_uuid).first()
            record_str = f'({count}) 【待完成】{todo.title}'
            task_todos.append(record_str)
            count += 1
        elif t.type == 'review':
            todo = Review.query.filter_by(uuid=t.related_uuid).first()
            record_str = f'({count}) 【待审核】{todo.title}'
            review_todos.append(record_str)
            count += 1
    prompt = ""
    for i in (notice_todos + task_todos + review_todos):
        prompt += i + '\n'
    return {
        'code': 1000,
        'msg': 'ok', 
        'data': {
            'prompt': prompt[:-1]
        }
    }


@user_bk.route('/check_profile_complete', methods=['GET'])
def check_profile_complete():
    """
    检查用户档案是否完整
    """
    uid = session.get('uid')
    profile = Profile.query.filter_by(uid=uid).first()
    # 检查关键字段是否已填写（根据需求定义哪些是必填字段）
    required_fields = [
        profile.real_name, profile.gender, profile.birth_date, profile.party_committee,
        profile.party_subcommittee, profile.party_branch, profile.party_status
    ]
    is_complete = all(field and field.strip() for field in required_fields)
    return {'code': 1000, 'msg': 'ok', 'data': {'is_complete': is_complete}}



