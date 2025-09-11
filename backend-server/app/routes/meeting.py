from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
import json
from datetime import datetime
from app.models import db
from app.models.Profile import Profile
from app.models.Form import FormSubmission
from app.models.User import User


meeting_bk = Blueprint('meeting', __name__)


@meeting_bk.route('/get_meeting_records', methods=['GET'])
def get_meeting_records():
    """
    获取三会一课记录
    参数:
        type: 筛选会议类型，默认为全部
        keyword: 搜索关键词，默认为空
    返回:
        三会一课记录列表
    """
    try:
        # 获取请求参数
        meeting_type = request.args.get('type', '')
        keyword = request.args.get('keyword', '')
        
        # 构建查询，获取form_id=4的表单提交记录
        query = FormSubmission.query.filter_by(form_id=4)
        
        # 筛选会议类型
        if meeting_type and meeting_type != 'all':
            # 自定义过滤器函数用于从JSON数据中筛选会议类型
            def filter_type(submission):
                data = json.loads(submission.data)
                return str(data.get('会议类型', '')) == str(meeting_type)
            # 执行查询并应用自定义过滤器
            submissions = [s for s in query.all() if filter_type(s)]
        else:
            submissions = query.all()
        
        # 搜索关键词
        if keyword:
            keyword = keyword.lower()
            def filter_keyword(submission):
                data = json.loads(submission.data)
                title = data.get('会议标题', '').lower()
                return keyword in title
            submissions = [s for s in submissions if filter_keyword(s)]
        
        # 格式化返回数据
        result = []
        for submission in submissions:
            data = json.loads(submission.data)
            result.append({
                'id': submission.id,
                'title': data.get('会议标题', ''),
                'type': data.get('会议类型', ''),
                'summary': data.get('会议纪要', ''),
                'created_at': submission.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        # 根据创建时间排序（最新的在前）
        result.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({'code': 200, 'msg': 'success', 'data': result})
    except Exception as e:
        return jsonify({'code': 500, 'msg': str(e), 'data': []})


@meeting_bk.route('/get_meeting_types', methods=['GET'])
def get_meeting_types():
    """
    获取所有会议类型
    返回:
        会议类型列表
    """
    try:
        # 定义会议类型选项
        meeting_types = ["支部党员大会", "支部委员会", "党小组会", "团课"]
        
        return jsonify({'code': 200, 'msg': 'success', 'data': meeting_types})
    except Exception as e:
        return jsonify({'code': 500, 'msg': str(e), 'data': []})