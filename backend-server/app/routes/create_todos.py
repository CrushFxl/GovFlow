import datetime
import json

from flask import Blueprint, request
import uuid as Uuid
from app.models import db
from app.models.Branch import Branch
from app.models.Profile import Profile
from app.models.Todo import Todo
from app.models.Notice import Notice
from app.models.Task import Task

from app.utils import create_task_prompt, add_todo_for_all_users

create_todos_bk = Blueprint('create_todos', __name__)


@create_todos_bk.route('/create_notice', methods=['GET'])
def create_notice():
    prompt = "**您正在创建一个通知任务，以下是通知详情。**"
    uid = int(request.args.get('uid'))
    data = json.loads(request.args.get('data'))
    organizations = json.loads(request.args.get('organizations'))
    partners = json.loads(request.args.get('partners'))
    data['organizations'] = organizations
    data['partners'] = partners
    data['created_uid'] = uid
    data['uuid'] = str(Uuid.uuid4())
    data['created_time'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    # 确定下一步审核人
    my_profile = Profile.query.filter_by(uid=uid).first()
    my_branch = my_profile.party_branch
    admin = Profile.query.filter_by(admin_status=1, party_branch=my_branch).first()
    data['next_uid'] = uid if my_profile.admin_status else admin.uid
    # 写入数据库
    notice = Notice(**data)
    db.session.add(notice)
    db.session.commit()
    # 组装提示词
    prompt += create_task_prompt(data['uuid'])
    if int(data['next_uid']) == uid:
        prompt += f"由于您是职级人员，可以无需审核直接发布通知。\n回答**确定**发布通知，回答**取消**放弃发布，如需**修改**通知，您可以直接告诉我需要修改的地方。"
    else:
        prompt += f"**此通知需要先交由{admin.party_status}【{admin.real_name}】审核后才能发布**。\n回答**确定**提交审核申请，回答**取消**放弃发布，如需**修改**通知，您可以直接告诉我需要修改的地方。"
    return {'data': {'prompt': prompt, 'uuid': data['uuid'], 'type': 'notice'}}


@create_todos_bk.route('/create_task', methods=['GET'])
def create_task():
    prompt = "**您正在发布一个日程任务，以下是任务详情。**"
    uid = int(request.args.get('uid'))
    data = json.loads(request.args.get('data'))
    organizations = json.loads(request.args.get('organizations'))
    partners = json.loads(request.args.get('partners'))
    data['organizations'] = organizations
    data['partners'] = partners
    data['created_uid'] = uid
    data['uuid'] = str(Uuid.uuid4())
    data['created_time'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    if not data['location']:
        data['location'] = '线上'
    # 确定下一步审核人
    my_profile = Profile.query.filter_by(uid=uid).first()
    my_branch = my_profile.party_branch
    admin = Profile.query.filter_by(admin_status=1, party_branch=my_branch).first()
    data['next_uid'] = uid if my_profile.admin_status else admin.uid
    # 向Task表添加对象
    task = Task(**data)
    db.session.add(task)
    db.session.commit()
    # 确定下一步审核人
    prompt += create_task_prompt(data['uuid'])
    if int(data['next_uid']) == uid:
        prompt += f"由于您是职级人员，可以无需审核直接发布日程。\n回答**确定**发布此日程，回答**取消**放弃发布，如需**修改**日程，您可以直接告诉我需要修改的地方。"
    else:
        prompt += f"**此日程需要先交由{admin.party_status}【{admin.real_name}】审核后才能发布**。\n回答**确定**提交审核申请，回答**取消**放弃发布，如需**修改**日程，您可以直接告诉我需要修改的地方。"

    return {'data': {'prompt': prompt, 'uuid': data['uuid'], 'type': 'task'}}


@create_todos_bk.route('/commit_todo', methods=['GET'])
def commit_todo():
    uuid = request.args.get('uuid')
    type = request.args.get('type')
    if type == 'notice':
        todo = Notice.query.filter_by(uuid=uuid).first()
    else:
        todo = Task.query.filter_by(uuid=uuid).first()
    if int(todo.next_uid) == int(todo.created_uid):   # 同一人 无需审核
        todo.status = 2
        add_todo_for_all_users(uuid)
        prompt = f'任务【{todo.title}】**已成功下发**给相应支部和党员。\n\n您可在<我发布的>卡片中查看，或直接询问我任务的完成进度。'
    else:
        todo.status = 1
        todo_record = Todo(uuid=str(Uuid.uuid4()), type='review', related_uuid=todo.uuid, uid=todo.next_uid, status=0)
        db.session.add(todo_record)
        prompt = f'任务【{todo.title}】**已成功提交**给上级审核。\n\n您可在<我发布的>卡片中查看审核进度，也可以直接询问我哦。'

    db.session.commit()
    return {'data': {'prompt': prompt}}


@create_todos_bk.route('/get_notice', methods=['GET'])
def get_notice():
    uuid = request.args.get('uuid')
    notice = Notice.query.filter_by(uuid=uuid).first()
    return {
        'code': 1000,
        'data': {
            'title': notice.title,
            'description': notice.description,
            'organizations': notice.organizations,
            'partners': notice.partners
        }
    }


@create_todos_bk.route('/modify_notice', methods=['GET'])
def modify_notice():
    # 替换党员和党组织列表
    uuid = request.args.get('uuid')
    notice = Notice.query.filter_by(uuid=uuid).first()
    organizations = json.loads(request.args.get('organizations'))
    if organizations:
        notice.organizations = organizations
    partners = json.loads(request.args.get('partners'))
    if partners:
        notice.partners = partners
        
    # 修改其他信息
    title = request.args.get('title')
    if title:
        notice.title = title
    description = request.args.get('description')
    if description:
        notice.description = description
    db.session.commit()
    # 组装提示词
    prompt = create_task_prompt(uuid)
    return {'data': {'prompt': prompt}}


@create_todos_bk.route('/get_task', methods=['GET'])
def get_task():
    uuid = request.args.get('uuid')
    task = Task.query.filter_by(uuid=uuid).first()
    return {
        'code': 1000,
        'data': {
            'title': task.title,
            'description': task.description,
            'start_date': task.start_date,
            'end_date': task.end_date,
            'start_time': task.start_time,
            'end_time': task.end_time,
            'location': task.location,
            'organizations': task.organizations,
            'partners': task.partners
        }
    }


@create_todos_bk.route('/modify_task', methods=['GET'])
def modify_task():
    # 替换党员和党组织列表
    uuid = request.args.get('uuid')
    task = Task.query.filter_by(uuid=uuid).first()
    organizations = json.loads(request.args.get('organizations'))
    if organizations:
        task.organizations = organizations
    partners = json.loads(request.args.get('partners'))
    if partners:
        task.partners = partners
    # 修改其他信息
    title = request.args.get('title')
    if title:
        task.title = title
    description = request.args.get('description')
    if description:
        task.description = description
    start_date = request.args.get('start_date')
    if start_date:
        task.start_date = start_date
    end_date = request.args.get('end_date')
    if end_date:
        task.end_date = end_date
    start_time = request.args.get('start_time')
    if start_time:
        task.start_time = start_time
    end_time = request.args.get('end_time')
    if end_time:
        task.end_time = end_time
    location = request.args.get('location')
    if location:
        task.location = location
    db.session.commit()
    # 组装提示词
    prompt = create_task_prompt(uuid)
    return {'data': {'prompt': prompt}}
