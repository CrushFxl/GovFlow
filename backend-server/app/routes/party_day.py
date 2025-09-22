from flask import Blueprint, request, jsonify, session
from app.models import db
from app.models.Profile import Profile
from app.models.User import User
from app.models.Branch import Branch
from app.models import to_json
from app.models.Form import Form, FormControl, FormSubmission



partyday_bk = Blueprint('partyday', __name__, url_prefix='/party_day')


@partyday_bk.route('/get_records', methods=['GET', 'POST', 'PUT'])
def get_party_day_records():
    # 获取查询参数
    activity_type = request.args.get('type', 'all')
    keyword = request.args.get('keyword', '')
    # 筛选form_submmisions 表格中form_id为5的所有记录
    records = FormSubmission.query.filter_by(form_id=5)
    # 根据关键词筛选
    if keyword:
        records = records.filter(FormSubmission.data.like(f'%{keyword}%'))
    
    # 执行查询并返回结果
    records = records.all()
    return jsonify({'code': 200, 'data': [to_json(record) for record in records]})


@partyday_bk.route('/delete_record', methods=['POST'])
def delete_party_day_record():
    # 获取记录ID
    record_id = request.form.get('id')
    if not record_id:
        return jsonify({'code': 400, 'msg': '缺少记录ID'})
    
    try:
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
