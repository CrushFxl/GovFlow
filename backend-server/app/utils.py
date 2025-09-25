from .models.Notice import Notice
from .models.Task import Task
from .models.Todo import Todo
from .models.Profile import Profile
from .models.Branch import Branch
from .models.Form import Form
from .models.System import System
from .models.User import User
from app.models import db
import uuid as Uuid
import requests

# 限制文本长度函数
def truncate_text(text, max_length=15):
    if not text:
        return '-'
    if isinstance(text, str) and len(text) > max_length:
        return text[:max_length] + '...'
    return text

# 任务频率映射函数
def get_frequency_text(frequency):
    frequency_map = {
        0: '一次性',
        1: '每周一次',
        2: '每月一次',
        3: '每季度一次',
        4: '每年一次'
    }
    return frequency_map.get(frequency, '未知')


def create_task_prompt(uuid):
    prompt = "\n\n---\n\n"
    todo = Notice.query.filter_by(uuid=uuid).first()
    if todo:
        o = '、'.join(todo.organizations)
        p = '、'.join(todo.partners)
        prompt += f"【{todo.title}】\n\n"
        prompt += f"{todo.description}\n\n"
        prompt += f"- 被通知党组：{o if o else '无'}\n"
        prompt += f"- 被通知党员：{p if p else '无'}\n"
    else:
        todo = Task.query.filter_by(uuid=uuid).first()
        frequency_str = {
            0: '一次性',
            1: '每周一次',
            2: '每月一次',
            3: '每季度一次',
            4: '每年一次'
        }.get(todo.frequency, '未知')
        o = '、'.join(todo.organizations)
        p = '、'.join(todo.partners)
        prompt += f"【日程任务】{todo.title}\n\n"
        prompt += f"{todo.description}\n\n"
        prompt += f"- 【开始时间】{todo.start_date}  {todo.start_time}\n"
        prompt += f"- 【结束时间】{todo.end_date}  {todo.end_time}\n"
        prompt += f"- 【日程地点】{todo.location}\n"
        prompt += f"- 【执行频次】{frequency_str}\n"
        prompt += f"- 【参与党组】{o if o else '无'}\n"
        prompt += f"- 【参与党员】{p if p else '无'}\n"
        prompt += f"- 【附件要求】{'无' if todo.need_attachment == 'false' else '**有**'}\n"
        if todo.need_attachment == 'true':
            form = Form.query.filter_by(id=todo.attachment_id).first()
            attachment_name = f'{form.name} (ID: {form.id})'
            prompt += f"  - **关联表单**：{attachment_name}\n"
    prompt += "\n---\n\n"
    return prompt


def get_user_todos_list_prompt(uid):
    count = 0
    prompt = "\n\n---\n\n"
    todos = Todo.query.filter_by(uid=int(uid), status=0).all()
    for t in todos:
        count += 1
        if t.type == 'notice':
            todo = Notice.query.filter_by(uuid=t.related_uuid).first()
            prompt += f"({count})【**待阅读**】{todo.title}\n"
        elif t.type == 'task':
            todo = Task.query.filter_by(uuid=t.related_uuid).first()
            prompt += f"({count})【**待完成**】{todo.title}\n"
        elif t.type == 'review':
            todo = Task.query.filter_by(uuid=t.related_uuid).first()
            types = '任务'
            if not todo:
                todo = Notice.query.filter_by(uuid=t.related_uuid).first()
                types = '通知'
            prompt += f"({count})【**待审核**】{types} {todo.title}\n"
    prompt += "\n---\n\n"
    return prompt, count


def add_todo_for_all_users(uuid):
    # 定位待办任务
    todo_type = 'notice'
    todo = Notice.query.filter_by(uuid=uuid).first()
    if not todo:
        todo = Task.query.filter_by(uuid=uuid).first()
        todo_type = 'task'
    users_uid = set()
    users_student_id = set()
    profiles = Profile.query.all()
    # 收集所有目标用户
    for p in profiles:
        real_name = p.real_name
        branches = [p.party_committee, p.party_subcommittee, p.party_branch]
        parties = [Branch.query.filter_by(value=b).first().name for b in branches]
        for party in todo.organizations:
            if party in parties:
                users_uid.add(p.uid)
                users_student_id.add(p.student_id)
                break
        for name in todo.partners:
            if name == real_name:
                users_uid.add(p.uid)
                users_student_id.add(p.student_id)
                break
    # 向所有目标用户添加待办事项
    for uid in users_uid:
        new_uuid = str(Uuid.uuid4())
        new_todo = Todo(uuid=new_uuid, type=todo_type, related_uuid=uuid, uid=uid)
        db.session.add(new_todo)
    db.session.commit()
    # 向所有用户发送钉钉数据中台消息
    title = '【GovFlow智慧党建】您有一个新待办'
    content = create_task_prompt(uuid)
    send_dingtalk_msg([str(i) for i in users_student_id], title, content)


def _get_access_token(app_key, app_secret):
    base_url = System.query.filter_by(key='dingtalk_url').first().value
    url = f"{base_url}:9088/accessSystem/getAccessToken"
    params = {
        "appKey": app_key,
        "appSecret": app_secret
    }
    response = requests.post(url, params=params)
    res = response.json()
    return res["data"]["accessToken"]


def send_dingtalk_msg(user_ids, title, content):
    # 向user_ids学工号列表中的所有用户发送title:content钉钉消息
    base_url = System.query.filter_by(key='dingtalk_url').first().value
    app_key = System.query.filter_by(key='dingtalk_appkey').first().value
    app_secret = System.query.filter_by(key='dingtalk_appsecret').first().value
    access_token = _get_access_token(app_key, app_secret)
    url = f"{base_url[:4] + 's'+ base_url[4:]}/msgInfo/pushMsgInfo"
    headers = {
        "token": access_token,
        "Content-Type": "application/json"
    }
    payload = {
        "channel": "DingTalk",
        "objScope": 1,
        "objIds": ",".join(user_ids),
        "mtype": 1,
        "sendStatus": 1,
        "title": title,
        "content": content
    }
    response = requests.post(url, headers=headers, json=payload, verify=False)
    result = response.json()
    return result


def filter_related_task_by_user(task_type, uid):
    """根据用户筛选出和用户相关的任务
    Args:
        task_type (str): 任务类型 (all 表示所有类型)
        uid (int): 用户UID
    Returns:
        list: 相关任务列表
    """
    profile = Profile.query.filter_by(uid=uid).first()
    if profile.admin_status == 1:
        # 管理员查询所有任务
        if task_type == 'all':
            tasks = Task.query.filter(Task.status != 0).all()
        else:
            tasks = Task.query.filter(Task.status != 0, Task.type == task_type).all()
        notices = Notice.query.filter(Notice.status != 0).all()
    else:
        # 普通用户查询自己创建的任务和需要自己完成的任务
        realname = profile.real_name
        if task_type == 'all':
            created_tasks = Task.query.filter(Task.created_uid == uid, Task.status != 0).all()
            _task = Task.query.filter(Task.status != 0).all()
        else:
            created_tasks = Task.query.filter(Task.created_uid == uid, Task.status != 0, Task.type == task_type).all()
            _task = Task.query.filter(Task.status != 0, Task.type == task_type).all()
        partner_tasks = []
        for t in _task:
            if realname in t.partners:
                partner_tasks.append(t)
        tasks = list(set(created_tasks + partner_tasks))
        # 普通用户查询自己创建的通知和需要自己查看的通知
        if task_type == 'all':
            created_notices = Notice.query.filter(Notice.created_uid == uid, Notice.status != 0).all()
            _notice = Notice.query.filter(Notice.status != 0).all()
        else:
            created_notices = Notice.query.filter(Notice.created_uid == uid, Notice.status != 0).all()
            _notice = Notice.query.filter(Notice.status != 0).all()
        partner_notices = []
        for n in _notice:
            if realname in n.partners:
                partner_notices.append(n)
        notices = list(set(created_notices + partner_notices))
    # 将通知和任务转化为统一形式JSON
    # 合并数据并转换为统一格式
    all_data = []
    # 处理Task数据
    for task in tasks:
        # 获取创建者信息
        creator = User.query.filter_by(uid=task.created_uid).first()
        creator_name = creator.nick if creator else '未知'
        all_data.append({
            'id': task.uuid,
            'type': 'task',  # 标记为任务类型
            'title': task.title,
            'description': truncate_text(task.description),
            'created_time': task.created_time,
            'partners': truncate_text("; ".join(task.partners)),
            'status': task.status,
            'creator': creator_name,
            'start_date': task.start_date,
            'start_time': task.start_time,
            'end_date': task.end_date,
            'end_time': task.end_time,
            'location': task.location,
            'frequency': get_frequency_text(task.frequency),
            'task_type': task.type
        })
    # 处理Notice数据
    for notice in notices:
        # 获取创建者信息
        creator = User.query.filter_by(uid=notice.created_uid).first()
        creator_name = creator.nick if creator else '未知'
        all_data.append({
            'id': notice.uuid,
            'type': 'notice',  # 标记为通知类型
            'title': notice.title,
            'description': truncate_text(notice.description),
            'created_time': notice.created_time,
            'partners': truncate_text("; ".join(notice.partners)),
            'status': notice.status,
            'creator': creator_name,
            'start_date': '',  # Notice表可能没有这些字段
            'start_time': '',
            'end_date': '',
            'end_time': '',
            'location': '',
            'task_type': '通知'
        })
    # 按创建时间倒序排序
    all_data.sort(key=lambda x: x['created_time'], reverse=True)
    return all_data

