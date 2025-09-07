from .models.Notice import Notice
from .models.Task import Task
from .models.Todo import Todo
from .models.Profile import Profile
from .models.Branch import Branch
from .models.Form import Form
from .models.System import System
from app.models import db
import uuid as Uuid
import requests


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
        o = '、'.join(todo.organizations)
        p = '、'.join(todo.partners)
        prompt += f"【日程任务】{todo.title}\n\n"
        prompt += f"{todo.description}\n\n"
        prompt += f"- 【开始时间】{todo.start_date}  {todo.start_time}\n"
        prompt += f"- 【结束时间】{todo.end_date}  {todo.end_time}\n"
        prompt += f"- 【日程地点】{todo.location}\n"
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


