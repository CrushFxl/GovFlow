from flask import Blueprint, request, session, jsonify

from app.models.User import User
from app.models.Profile import Profile
from app.models.Notice import Notice
from app.models.Task import Task
from app.models.Todo import Todo

from app.utils import get_user_todos_list_prompt


user_bk = Blueprint('user', __name__, url_prefix='/user')


@user_bk.route('/get_nick', methods=['GET', 'POST'])
def get_nick():
    uid = session.get('uid')
    user = User.query.filter_by(uid=uid).first()
    nick = user.nick
    coin = user.coin
    admin = Profile.query.filter_by(uid=uid).first().admin_status
    return {'code': 1000, 'msg': 'ok', 'data':
        {'uid': uid, 'nick': nick, 'admin': admin, 'coin': coin}}


@user_bk.route('/add_coin', methods=['POST'])
def add_coin():
    """
    处理用户点击新闻后增加学点的请求
    """
    uid = session.get('uid')
    # 从请求中获取新闻URL（可用于记录或验证）
    # news_url = request.form.get('news_url')
    user = User.query.filter_by(uid=uid).first()
    user.coin += 1
    from app.models import db
    db.session.commit()
    return jsonify({'code': 1000, 'msg': 'success', 'data': {'coin': user.coin}})


@user_bk.route('/get_todos', methods=['GET', 'POST'])
def get_todos():
    uid = request.args.get('uid')
    prompt = '**以下是您目前的待办事项**。'
    todo_list_prompt, count = get_user_todos_list_prompt(uid)
    prompt += todo_list_prompt
    prompt += "输入括号内对应的数字，开始处理待办。"
    if count == 0:
        prompt = "好耶！**您已完成所有待办事项**，没有什么需要做的啦！"
    return {'data': {'prompt': prompt}}


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


@user_bk.route('/get_dashboard_counts', methods=['GET'])
def get_dashboard_counts():
    uid = session.get('uid')
    # 未读消息：Todo表中type为notice并且status为0
    unread_notices = Todo.query.filter_by(uid=uid, type='notice', status=0).all()
    unread_count = len(unread_notices)
    unread_list = []
    for todo in unread_notices:
        notice = Notice.query.filter_by(uuid=todo.related_uuid).first()
        if notice:
            unread_list.append({
                'uuid': todo.uuid,
                'related_uuid': todo.related_uuid,
                'title': notice.title,
                'description': notice.description,
                'created_time': notice.created_time
            })
    
    # 待办事项：Todo表中type为review或task，并且status为0
    todo_items = Todo.query.filter(Todo.uid == uid, Todo.type.in_(['review', 'task']), Todo.status == 0).all()
    todo_count = len(todo_items)
    todo_list = []
    for todo in todo_items:
        if todo.type == 'review':
            notice = Notice.query.filter_by(uuid=todo.related_uuid).first()
            if notice:
                todo_list.append({
                    'uuid': todo.uuid,
                    'type': 'review',
                    'related_uuid': todo.related_uuid,
                    'title': notice.title,
                    'description': notice.description,
                    'created_time': notice.created_time
                })
        elif todo.type == 'task':
            task = Task.query.filter_by(uuid=todo.related_uuid).first()
            if task:
                todo_list.append({
                    'uuid': todo.uuid,
                    'type': 'task',
                    'related_uuid': todo.related_uuid,
                    'title': task.title,
                    'description': task.description,
                    'created_time': task.created_time,
                    'end_date': task.end_date
                })
    
    # 我发布的：Notice、Task表中created_uid为我的记录
    my_notices = Notice.query.filter_by(created_uid=uid).all()
    my_tasks = Task.query.filter_by(created_uid=uid).all()
    my_published_count = len(my_notices) + len(my_tasks)
    my_published_list = []
    
    for notice in my_notices:
        my_published_list.append({
            'uuid': notice.uuid,
            'type': 'notice',
            'title': notice.title,
            'description': notice.description,
            'created_time': notice.created_time,
            'status': notice.status
        })
    
    for task in my_tasks:
        my_published_list.append({
            'uuid': task.uuid,
            'type': 'task',
            'title': task.title,
            'description': task.description,
            'created_time': task.created_time,
            'end_date': task.end_date,
            'status': task.status
        })
    
    # 按创建时间倒序排序
    my_published_list.sort(key=lambda x: x['created_time'], reverse=True)
    
    return {
        'code': 1000,
        'msg': 'ok',
        'data': {
            'unread_count': unread_count,
            'unread_list': unread_list,
            'todo_count': todo_count,
            'todo_list': todo_list,
            'my_published_count': my_published_count,
            'my_published_list': my_published_list
        }
    }



