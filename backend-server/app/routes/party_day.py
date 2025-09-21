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
