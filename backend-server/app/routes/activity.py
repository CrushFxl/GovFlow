import json
import os
from datetime import datetime
from app.models import db
from app.models.Task import Task
from app.models.Notice import Notice
from app.models.User import User
from flask import Blueprint, request, session, jsonify


activity_bk = Blueprint('activity', __name__, url_prefix='/activity')


# 限制文本长度函数
def truncate_text(text, max_length=15):
    if not text:
        return '-'
    if isinstance(text, str) and len(text) > max_length:
        return text[:max_length] + '...'
    return text


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
                'location': task.location
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









