from flask import Blueprint, request, jsonify
import json
from datetime import datetime
from app.models import db
from app.models.Profile import Profile
from app.models.Form import FormSubmission
from app.models.Branch import Branch

review_bk = Blueprint('review', __name__)

@review_bk.route('/get_review_records', methods=['GET'])
def get_review_records():
    # 获取请求参数
    uid = request.args.get('uid', '')
    keyword = request.args.get('keyword', '').strip()
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)
    # 构建查询，筛选form_id=3的记录
    query = FormSubmission.query.filter_by(form_id=3)
    # 如果有关键词搜索，按被评议人姓名筛选
    if keyword:
        def filter_by_keyword(submission):
            try:
                data = json.loads(submission.data)
                name = data.get('被评议人姓名', '')
                return keyword in name
            except (json.JSONDecodeError, TypeError):
                return False
        # 先获取所有符合form_id=3的记录，再应用关键词过滤
        all_submissions = query.all()
        filtered_submissions = [s for s in all_submissions if filter_by_keyword(s)]
    else:
        # 没有关键词，直接获取所有记录
        filtered_submissions = query.all()
    # 格式化数据
    formatted_records = []
    for submission in filtered_submissions:
        # 解析data字段
        data = json.loads(submission.data)
        # 提取年份（从created_at字段提取）
        year = ''
        if submission.created_at:
            year = submission.created_at.strftime('%Y')
        # 构建记录对象
        profile = Profile.query.filter_by(uid=uid).first()
        party_branch_name = Branch.query.filter_by(value=profile.party_branch).first().name
        record = {
            'id': submission.id,
            'name': data.get('被评议人姓名', ''),
            'branch': party_branch_name,
            'other_comments': data.get('该同志的评价', ''),
            'result': data.get('评议结果', '合格'),
            'year': year,
            'created_at': submission.created_at.strftime('%Y-%m-%d %H:%M:%S') if submission.created_at else ''
        }
        formatted_records.append(record)
    # 排序：按年份倒序，相同年份按创建时间倒序
    formatted_records.sort(key=lambda x: (x['year'] or '0', x['created_at']), reverse=True)
    # 分页处理
    total_records = len(formatted_records)
    total_pages = (total_records + page_size - 1) // page_size
    start_index = (page - 1) * page_size
    end_index = min(start_index + page_size, total_records)
    paginated_records = formatted_records[start_index:end_index]
    # 返回结果
    return jsonify({
        'code': 200,
        'message': '获取成功',
        'data': {
            'records': paginated_records,
            'total_records': total_records,
            'total_pages': total_pages,
            'current_page': page,
            'page_size': page_size
        }
    })

@review_bk.route('/delete_review_record', methods=['POST'])
def delete_review_record():
    try:
        # 获取记录ID
        record_id = request.form.get('id')
        
        # 验证参数
        if not record_id:
            return jsonify({
                'code': 400,
                'message': '缺少记录ID'
            })
        
        # 查找记录
        record = FormSubmission.query.filter_by(id=record_id, form_id=3).first()
        
        if not record:
            return jsonify({
                'code': 404,
                'message': '记录不存在'
            })
        
        # 删除记录
        db.session.delete(record)
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'message': '删除成功'
        })
    except Exception as e:
        # 发生错误时回滚事务
        db.session.rollback()
        return jsonify({
            'code': 500,
            'message': '删除失败：' + str(e)
        })