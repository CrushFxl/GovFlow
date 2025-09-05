from flask import Blueprint, request, jsonify
from app.models.Profile import Profile
from app.models.Todo import Todo
from app.models.Task import Task
from app.models.Notice import Notice
from app.models.Form import Form, FormControl
from app.models import db
import json

from app.utils import create_task_prompt, get_user_todos_list_prompt, add_todo_for_all_users

solve_todos_bk = Blueprint('solve_todos', __name__)


def number_to_uuid(uid, number):
    # 根据用户uid和待办临时编号反查Todo的UUID和类型
    todos = Todo.query.filter_by(uid=uid, status=0).all()
    count = 0
    for t in todos:
        count += 1
        if t.type == 'notice' and count == number:
            return t.uuid, 'notice'
        if t.type == 'task' and count == number:
            return t.uuid, 'task'
        if t.type == 'review' and count == number:
            return t.uuid, 'review'
    return None


@solve_todos_bk.route('/todo_info', methods=['GET'])
def get_todo_info():
    uid = request.args.get('uid')
    choose_num = int(request.args.get('choose_num'))
    uuid, todo_type = number_to_uuid(uid, choose_num)
    todo = Todo.query.filter_by(uuid=uuid).first()
    prompt = ""

    if todo_type == 'review':
        inner_todo = Task.query.filter_by(uuid=todo.related_uuid).first()
        if not inner_todo:
            inner_todo = Notice.query.filter_by(uuid=todo.related_uuid).first()
            created_username = Profile.query.filter_by(uid=inner_todo.created_uid).first().real_name
            prompt += f'**党员用户【{created_username}】请求发布一则通知，需要您审核**，以下是通知内容。'
        else:
            inner_todo = Task.query.filter_by(uuid=todo.related_uuid).first()
            created_username = Profile.query.filter_by(uid=inner_todo.created_uid).first().real_name
            prompt += f"**党员用户【{created_username}】请求发布任务，需要您审核**，以下是任务内容。"
        prompt += create_task_prompt(inner_todo.uuid)
        prompt += f'审核发起时间：{inner_todo.created_time}\n请决定是否审核通过，输入**同意**或**拒绝**来完成该审核，可附加理由。'

    elif todo_type == 'notice':
        notice = Notice.query.filter_by(uuid=todo.related_uuid).first()
        created_username = Profile.query.filter_by(uid=notice.created_uid).first().real_name
        todo.status = 1
        db.session.commit()
        prompt += f'**党员用户【{created_username}】向你发送了一条通知**，需要您知悉。'
        prompt += create_task_prompt(notice.uuid)
        prompt += '此通知被标记为**已读**状态，您已完成此待办事项。'
        todo_list_prompt, count = get_user_todos_list_prompt(uid)
        if count:
            prompt += "\n\n\n接下来您还可以处理："
            prompt += get_user_todos_list_prompt(uid)
            prompt += "输入括号内对应的数字，以继续处理待办。"
        else:
            prompt += '\n\n**好耶！您已完成所有待办事项！**'

    elif todo_type == 'task':
        task = Task.query.filter_by(uuid=todo.related_uuid).first()
        created_username = Profile.query.filter_by(uid=task.created_uid).first().real_name
        prompt += f'党员用户【{created_username}】于{task.created_time}发布此任务，**需要您完成**。'
        prompt += create_task_prompt(task.uuid)
        if task.need_attachment == 'false':
            prompt += '此任务**无需提交附件或表格**，是否标记为完成？输入**同意**标记为完成，输入**拒绝**以暂时跳过处理。'
        else:
            prompt += '此任务**需要您提交附件**，是否现在开始填写？输入**同意**以开始处理，输入**拒绝**以暂时跳过。'

    return jsonify({'data': {'prompt': prompt, 'todo_type': todo.type}})


@solve_todos_bk.route('/cancel_solve', methods=['GET'])
def cancel_solve():
    uid = int(request.args.get('uid'))
    number = int(request.args.get('choose_number'))
    uuid, todo_type = number_to_uuid(uid, number)
    todo = Todo.query.filter_by(uuid=uuid).first()
    if todo_type == 'review':
        todo.status = 1
        inner_todo = Task.query.filter_by(uuid=todo.related_uuid).first()
        if not inner_todo:
            inner_todo = Notice.query.filter_by(uuid=todo.related_uuid).first()
        inner_todo.status = -1
        db.session.commit()
        prompt = '您**已拒绝**该审核申请，此待办处理完毕。\n\n'
        todo_list_prompt, count = get_user_todos_list_prompt(uid)
        if count:
            prompt += '接下来您还可以继续处理：'
            prompt += todo_list_prompt
            prompt += '输入对应的数字，以继续处理待办事项。'
        else:
            prompt += "好耶！**您已完成所有待办事项**，没有什么需要做的啦！"
        return {'data': {'prompt': prompt}}
    elif todo_type == 'task':
        prompt = '您**暂时跳过处理**此待办。接下来您还可以继续处理：'
        db.session.commit()
        todo_list_prompt, count = get_user_todos_list_prompt(uid)
        prompt += todo_list_prompt
        prompt += '输入对应的数字，以继续处理待办事项。'
        return {'data': {'prompt': prompt}}


def form2html(form_id):
    html_list = ['<form data-format="json">']
    controls = FormControl.query.filter_by(form_id=form_id).order_by(FormControl.order).all()
    for c in controls:
        if c.type == 'text':
            html_list.append(f'  <label for="{c.label}">填空：{c.label}</label>')
            html_list.append(f'  <input type="text" name="{c.label}" placeholder="{c.placeholder}" value=""/>')
        elif c.type == 'radio':
            html_list.append(f'  <label for="{c.label}">单选：{c.label} (下拉选择)</label>')
            html_list.append(f'  <input type="select" name="{c.label}" data-options=\'{c.options}\'/>')
        elif c.type == 'checkbox':
            html_list.append(f'  <label for="{c.label}">多选：{c.label}</label>')
            for i in json.loads(c.options):
                html_list.append(f'  <input type="checkbox" name="{i}" data-tip="{i}"/>')
        elif c.type == 'textarea':
            html_list.append(f'  <label for="{c.label}">文本：{c.label}</label>')
            html_list.append(f'  <textarea name="{c.label}" placeholder="{c.placeholder}"></textarea>')
        else:
            html_list.append('ERROR: Unknown type of form:' + c.type)
    html_list.append('  <button data-size="medium" data-variant="primary">提交</button>')
    html_list.append('</form>')
    return ''.join(html_list)


@solve_todos_bk.route('/accept_solve', methods=['GET'])
def accept_solve():
    uid = int(request.args.get('uid'))
    number = int(request.args.get('choose_number'))
    uuid, todo_type = number_to_uuid(uid, number)
    todo = Todo.query.filter_by(uuid=uuid).first()
    if todo_type == 'review':
        todo.status = 1
        inner_todo = Task.query.filter_by(uuid=todo.related_uuid).first()
        if not inner_todo:
            inner_todo = Notice.query.filter_by(uuid=todo.related_uuid).first()
        inner_todo.status = 2
        add_todo_for_all_users(inner_todo.uuid)  # 审核成功后下发给指定党员
        db.session.commit()
        prompt = '您**已同意**该审核申请，将下发此通知或任务给指定的党员，此待办处理完毕。\n\n'
        todo_list_prompt, count = get_user_todos_list_prompt(uid)
        if count:
            prompt += '接下来您还可以继续处理：'
            prompt += todo_list_prompt
            prompt += '输入对应的数字，以继续处理待办事项。'
        else:
            prompt += "好耶！**您已完成所有待办事项**，没有什么需要做的啦！"
        return {'data': {'prompt': prompt, 'todo_type': 'review', 'form_html': ''}}
    elif todo_type == 'task':
        inner_todo = Task.query.filter_by(uuid=todo.related_uuid).first()
        if inner_todo.need_attachment == 'false':
            todo.status = 1
            db.session.commit()
            prompt = '您已将**此任务标记为完成**。\n\n'
            todo_list_prompt, count = get_user_todos_list_prompt(uid)
            if count:
                prompt += '接下来您还可以继续处理：'
                prompt += todo_list_prompt
                prompt += '输入对应的数字，以继续处理待办事项。'
            else:
                prompt += "好耶！**您已完成所有待办事项**，没有什么需要做的啦！"
            return {'data': {'prompt': prompt, 'todo_type': 'notice', 'form_html': ''}}
        else:
            prompt = '请填写以下表单：\n\n'
            form = Form.query.filter_by(id=inner_todo.attachment_id).first()
            form_html = form2html(form.id)
            return {'data': {'prompt': prompt, 'todo_type': 'task', 'form_html': form_html}}
