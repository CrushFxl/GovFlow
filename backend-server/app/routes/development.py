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


development_bk = Blueprint('development', __name__)


@development_bk.route('/search_user', methods=['POST'])
def search_user():
    """根据学工号或姓名查询用户的党员发展情况"""
    try:
        data = request.json
        keyword = data.get('keyword', '').strip()
        
        if not keyword:
            return jsonify({'code': 400, 'msg': '搜索关键词不能为空'})
        
        # 根据学工号或姓名查询用户
        query = Profile.query.join(User, User.uid == Profile.uid)
        
        # 尝试将关键词转换为数字作为学工号查询
        try:
            student_id = int(keyword)
            query = query.filter(Profile.student_id == student_id)
        except ValueError:
            # 作为姓名查询
            query = query.filter(Profile.real_name.like(f'%{keyword}%'))
        
        profiles = query.all()
        
        if not profiles:
            return jsonify({'code': 404, 'msg': '未找到匹配的用户'})
        
        # 查询用户的党员发展记录
        results = []
        for profile in profiles:
            # 获取用户的最新发展记录
            latest_submission = FormSubmission.query.filter(
                FormSubmission.form_id == 1,  # 党员发展申请表
                FormSubmission.user_id == profile.uid,
                FormSubmission.status == 1  # 已同意的记录
            ).order_by(FormSubmission.id.desc()).first()
            
            political_status = "群众"  # 默认政治面貌
            if latest_submission:
                try:
                    submission_data = json.loads(latest_submission.data)
                    political_status = submission_data.get('申请发展的政治面貌', '群众')
                except json.JSONDecodeError:
                    pass
            
            results.append({
                'user_id': profile.uid,
                'real_name': profile.real_name,
                'student_id': profile.student_id,
                'political_status': political_status
            })
        
        return jsonify({'code': 200, 'data': results})
    except Exception as e:
        return jsonify({'code': 500, 'msg': f'查询失败: {str(e)}'})


@development_bk.route('/get_development_records', methods=['GET', 'POST'])
def get_development_records():
    """获取处于不同阶段的党员发展情况记录"""
    status_filter = request.args.get('status', 'all')  # 可选：all, 群众, 入党积极分子, 发展对象, 预备党员, 普通正式党员
    keyword = request.args.get('keyword', None)
    query = FormSubmission.query.filter_by(form_id=1)
    # 按政治面貌筛选
    if status_filter != 'all':
        submissions = query.all()
        filtered_submissions = []
        for submission in submissions:
            data = json.loads(submission.data)
            if data.get('申请发展的政治面貌') == status_filter:
                filtered_submissions.append(submission)
        submissions = filtered_submissions
    else:
        submissions = query.all()
    # 提取构建结果
    results = []
    for submission in submissions:
        data = json.loads(submission.data)
        # 按关键词筛选
        profile = Profile.query.filter_by(real_name=data.get('培养人姓名')).first()
        if not keyword or profile.real_name == keyword or profile.student_id == keyword:
            results.append({
                'id': submission.id,
                'user_id': profile.uid,
                'real_name': profile.real_name,
                'student_id': profile.student_id,
                'political_status': data.get('申请发展的政治面貌', '群众'),
                'contact': profile.contact,
                'description': data.get('附件或材料说明', ''),
                'created_at': submission.created_at.strftime('%Y-%m-%d %H:%M:%S') if submission.created_at else '',
                'trainer_student_id': data.get('培养人学号', '')
            })
    # 按政治面貌排序
    status_order = {'群众': 0, '入党积极分子': 1, '发展对象': 2, '预备党员': 3, '普通正式党员': 4}
    results.sort(key=lambda x: status_order.get(x['political_status'], 999))
    return jsonify({'code': 200, 'data': results})


@development_bk.route('/get_all_political_statuses', methods=['GET'])
def get_all_political_statuses():
    """获取所有政治面貌选项"""
    try:
        statuses = ['群众', '入党积极分子', '发展对象', '预备党员', '普通正式党员']
        return jsonify({'code': 200, 'data': statuses})
    except Exception as e:
        return jsonify({'code': 500, 'msg': f'获取政治面貌选项失败: {str(e)}'})


@development_bk.route('/delete_record', methods=['POST'])
def delete_development_record():
    """
    删除党员发展记录
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
        record = FormSubmission.query.filter_by(id=record_id, form_id=1).first()
        if not record:
            return jsonify({'code': 404, 'msg': '记录不存在', 'data': {}})
        
        # 删除记录
        db.session.delete(record)
        db.session.commit()
        
        return jsonify({'code': 200, 'msg': '删除成功', 'data': {}})
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'msg': str(e), 'data': {}})