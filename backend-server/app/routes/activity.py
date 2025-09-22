import json
import os
import datetime
from datetime import datetime
from app.models import db
from app.models.Task import Task
from app.models.Notice import Notice
from app.models.User import User
from app.models.Branch import Branch
from app.models.Profile import Profile
import uuid as Uuid
from flask import Blueprint, request, session, jsonify


activity_bk = Blueprint('activity', __name__, url_prefix='/activity')


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


# 任务下发页面表格拉取接口
@activity_bk.route('/query', methods=['POST'])
def query_tasks():
    try:
        # 从Task表和Notice表中获取数据，排除status=0的记录
        tasks = Task.query.filter(Task.status != 0).all()
        notices = Notice.query.filter(Notice.status != 0).all()
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
                'frequency': get_frequency_text(task.frequency)
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
                'location': ''
            })
        
        # 按创建时间倒序排序
        all_data.sort(key=lambda x: x['created_time'], reverse=True)
        
        return jsonify({
            'code': 1000,
            'data': all_data,
            'message': '查询成功'
        })
    except Exception as e:
        return jsonify({
            'code': 1001,
            'data': [],
            'message': f'查询失败：{str(e)}'
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







