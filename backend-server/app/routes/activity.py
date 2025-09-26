import json
import os
import datetime
from datetime import datetime
from turtle import st
from app.models import db
from app.models.Task import Task
from app.models.Notice import Notice
from app.models.User import User
from app.models.Branch import Branch
from app.models.Form import Form
from app.models.Profile import Profile
import uuid as Uuid
from flask import Blueprint, request, session, jsonify
from ..utils import filter_related_task_by_user


activity_bk = Blueprint('activity', __name__, url_prefix='/activity')

frequency_map = {
    '一次性': 0,
    '每周': 1,
    '每月': 2,
    '每季度': 3,
    '每年': 4
}


# 任务下发页面表格拉取接口
@activity_bk.route('/query', methods=['POST'])
def query_tasks():
    uid = int(request.form.get('uid'))
    all_records = filter_related_task_by_user('all', uid)
    return jsonify({
        'code': 1000,
        'data': all_records,
        'message': '查询成功'
    })


# 标记任务完成接口
@activity_bk.route('/mark_complete', methods=['POST'])
def mark_complete():
    try:
        data = request.json.get('data', {})
        item_id = data.get('id')
        item_type = data.get('type')
        if not item_id or not item_type:
            return jsonify({'code': 1001, 'message': '参数不完整'})
        # 根据类型更新对应表中的状态
        if item_type == 'task':
            task = Task.query.filter(Task.uuid == item_id, Task.status != 0).first()
            if task:
                task.status = 3  # 标记为已完成
        elif item_type == 'notice':
            notice = Notice.query.filter(Notice.uuid == item_id, Notice.status != 0).first()
            if notice:
                notice.status = 3  # 标记为已完成
        else:
            return jsonify({'code': 1001, 'message': '类型错误'})
        db.session.commit()
        return jsonify({'code': 1000, 'message': '标记成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 1001,
            'message': f'标记失败：{str(e)}'
        })


# 删除任务接口
@activity_bk.route('/delete', methods=['POST'])
def delete_item():
    try:
        data = request.json.get('data', {})
        item_id = data.get('id')
        item_type = data.get('type')

        if not item_id or not item_type:
            return jsonify({'code': 1001, 'message': '参数不完整'})
        # 根据类型更新对应表中的状态为0（删除）
        if item_type == 'task':
            task = Task.query.filter(Task.uuid == item_id, Task.status != 0).first()
            if task:
                task.status = 0  # 标记为已删除
        elif item_type == 'notice':
            notice = Notice.query.filter(Notice.uuid == item_id, Notice.status != 0).first()
            if notice:
                notice.status = 0  # 标记为已删除
        else:
            return jsonify({'code': 1001, 'message': '类型错误'})
        db.session.commit()
        return jsonify({'code': 1000, 'message': '删除成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 1001,
            'message': f'删除失败：{str(e)}'
        })


@activity_bk.route('/save', methods=['POST'])
def save_task():
    data = request.json.get('data', {})
    # 获取表单数据
    uid = int(data.get('uid'))
    item_id = data.get('id')
    title = data.get('title')
    description = data.get('description')
    organizations = data.get('organizations', [])
    partners = data.get('partners', [])
    initiator = data.get('initiator')
    start_date = data.get('start_date')
    start_time = data.get('start_time')
    end_date = data.get('end_date')
    end_time = data.get('end_time')
    location = data.get('location')
    frequency = data.get('frequency', 0)  # 默认频率为一次性

    # 检查必要参数
    if not title or not initiator:
        return jsonify({'code': 1001, 'message': '标题和发起人参数不能为空'})

    # 确定下一步审核人
    my_profile = Profile.query.filter_by(uid=uid).first()
    my_branch = my_profile.party_branch
    admin = Profile.query.filter_by(admin_status=1, party_branch=my_branch).first()

    new_task = Task(
        uuid=str(Uuid.uuid4()),
        title=title,
        description=description,
        organizations=organizations,
        partners=partners,
        created_uid=initiator,
        start_date=start_date,
        start_time=start_time,
        end_date=end_date,
        end_time=end_time,
        location=location,
        frequency=frequency,
        status=1,
        created_time=datetime.now().strftime('%Y-%m-%d %H:%M'),
        next_uid=uid if my_profile.admin_status else admin.uid
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify({'code': 1000, 'message': '保存成功'})


@activity_bk.route('/submit', methods=['POST'])
def submit_activity():
    # 从前端接收JSON数据
    data = request.get_json()
    
    # 提取必要的字段
    uid = data.get('uid')
    title = data.get('title')
    task_type = data.get('type')
    description = data.get('description')
    location = data.get('location')
    organizations = data.get('organizations', [])
    partners = data.get('partners', [])
    frequency = data.get('frequency')
    attachment = data.get('attachment')

    if task_type == '通知':
        new = Notice(
            uuid=str(Uuid.uuid4()),
            title=title,
            description=description,
            organizations=organizations,
            partners=partners,
            created_uid=uid,
            next_uid=uid,
            status=2,
            created_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
    else:
        if attachment == '无':
            need_attachment = 'false'
            attachment_id = ''
        else:
            need_attachment = 'true'
            attachment_id = Form.query.filter_by(name=attachment).first().id
        #解析start_date/start_time/end_date/end_time
        st_date = data.get('startTime')
        ed_date = data.get('endTime')
        if st_date:
            start_date = st_date.split('T')[0]
            start_time = st_date.split('T')[1].split('.')[0]
        else:
            start_date = ''
            start_time = ''

        if ed_date:
            end_date = ed_date.split('T')[0]
            end_time = ed_date.split('T')[1].split('.')[0]
        else:
            end_date = ''
            end_time = ''
        pass
        # 创建新任务
        new = Task(
            uuid=str(Uuid.uuid4()),
            title=title,
            description=description,
            type=task_type,
            organizations=organizations,
            partners=partners,
            created_uid=uid,
            next_uid=uid,
            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,
            location=location,
            frequency=frequency_map.get(frequency, 0),
            status=2,
            need_attachment=need_attachment,
            attachment_id=attachment_id,
            created_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
    
    db.session.add(new)
    db.session.commit()
    return jsonify({'success': True, 'message': '任务创建成功'})







