from re import sub
from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
import json
from datetime import datetime
from flask import request, jsonify
from app.models import db
from app.models.Profile import Profile
from app.models.Form import FormSubmission
from app.models.User import User


fee_bk = Blueprint('fee', __name__)


@fee_bk.route('/get_fee_records', methods=['GET'])
def get_fee_records():
    """
    获取党费缴纳记录
    参数:
        month: 筛选月份，默认为全部
        keyword: 搜索关键词，默认为空
    返回:
        党费缴纳记录列表
    """
    try:
        # 获取请求参数
        month = request.args.get('month', '')
        keyword = request.args.get('keyword', '')
        # 构建查询，获取form_id=2的表单提交记录
        query = FormSubmission.query.filter_by(form_id=2)
        # 筛选月份
        if month and month != 'all':
            # 自定义过滤器函数用于从JSON数据中筛选月份
            def filter_month(submission):
                data = json.loads(submission.data)
                return str(data.get('缴纳月份', '')) == str(month)
            # 执行查询并应用自定义过滤器
            submissions = [s for s in query.all() if filter_month(s)]
        else:
            submissions = query.all()
        # 搜索关键词
        if keyword:
            keyword = keyword.lower()
            def filter_keyword(submission):
                data = json.loads(submission.data)
                name = data.get('姓名', '').lower()
                return keyword in name
            submissions = [s for s in submissions if filter_keyword(s)]
        # 格式化返回数据
        result = []
        for submission in submissions:
            data = json.loads(submission.data)
            result.append({
                'id': submission.id,
                'name': data.get('姓名', ''),
                'month': data.get('缴纳月份', ''),
                'amount': data.get('缴纳党费金额', 0),
                'receipt': data.get('回执或截图材料', ''),
                'created_at': submission.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        # 根据月份和创建时间排序
        result.sort(key=lambda x: (x['month'], x['created_at']), reverse=True)
        
        return jsonify({'code': 200, 'msg': 'success', 'data': result})
    except Exception as e:
        return jsonify({'code': 500, 'msg': str(e), 'data': []})


@fee_bk.route('/delete_record', methods=['POST'])
def delete_fee_record():
    """
    删除党费缴纳记录
    参数:
        id: 记录ID
    返回:
        删除结果
    """
    try:
        # 获取请求参数
        record_id = request.form.get('id')
        if not record_id:
            return jsonify({'code': 400, 'msg': '缺少记录ID', 'data': {}})
        
        # 查找记录
        record = FormSubmission.query.filter_by(id=record_id).first()
        if not record:
            return jsonify({'code': 404, 'msg': '记录不存在', 'data': {}})
        
        # 删除记录
        db.session.delete(record)
        db.session.commit()
        
        return jsonify({'code': 200, 'msg': '删除成功', 'data': {}})
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'msg': str(e), 'data': {}})