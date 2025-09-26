from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
import json
from datetime import datetime
from app.models import db
from app.models.Profile import Profile
from app.models.Form import FormSubmission
from app.models.User import User
from app.utils import filter_related_task_by_user


meeting_bk = Blueprint('meeting', __name__)


@meeting_bk.route('/get_meeting_records', methods=['POST', 'GET', 'PUT'])
def get_meeting_records():
    uid = int(request.form.get('uid'))
    meeting_type = request.form.get('type', 'all')  # 获取会议类型参数，默认为'all'
    keyword = request.form.get('keyword', '')  # 获取关键词参数，默认为空字符串
    
    # 根据会议类型筛选记录
    if meeting_type == 'all':
        # 获取所有类型的会议记录
        records1 = filter_related_task_by_user('支部党员大会', uid)
        records2 = filter_related_task_by_user('支部委员会', uid)
        records3 = filter_related_task_by_user('党小组会', uid)
        records4 = filter_related_task_by_user('党课', uid)
        # 合并所有记录
        all_records = records1 + records2 + records3 + records4
    else:
        # 只获取指定类型的会议记录
        all_records = filter_related_task_by_user(meeting_type, uid)
    
    # 如果有关键词，进行标题搜索筛选
    if keyword:
        all_records = [record for record in all_records if keyword in record.get('title', '')]
    
    # 去重
    unique_records = []
    seen_ids = set()
    for record in all_records:
        record_id = record.get('id')
        if record_id and record_id not in seen_ids:
            seen_ids.add(record_id)
            unique_records.append(record)
    all_records = unique_records
    return jsonify({'code': 1000, 'data': all_records})


@meeting_bk.route('/delete_record', methods=['POST'])
def delete_meeting_record():
    """
    删除三会一课记录
    参数:
        id: 记录ID
    返回:
        删除结果
    """
    try:
        # 获取记录ID
        record_id = request.form.get('id')
        if not record_id:
            return jsonify({'code': 400, 'msg': '缺少记录ID'})
        
        # 在数据库中查找记录
        record = FormSubmission.query.get(record_id)
        if not record:
            return jsonify({'code': 404, 'msg': '记录不存在'})
        
        # 删除记录
        db.session.delete(record)
        db.session.commit()
        
        return jsonify({'code': 200, 'msg': '删除成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'msg': f'删除失败: {str(e)}'})


@meeting_bk.route('/get_meeting_types', methods=['GET'])
def get_meeting_types():
    """
    获取所有会议类型
    返回:
        会议类型列表
    """
    try:
        # 定义会议类型选项
        meeting_types = ["支部党员大会", "支部委员会", "党小组会", "党课"]
        
        return jsonify({'code': 200, 'msg': 'success', 'data': meeting_types})
    except Exception as e:
        return jsonify({'code': 500, 'msg': str(e), 'data': []})