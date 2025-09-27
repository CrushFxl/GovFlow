from re import sub
from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
import json
from datetime import datetime
from flask import request, jsonify
from app.models import db
from app.models.Profile import Profile
from app.models.Form import FormSubmission, Form
from app.models.User import User
from ..utils import filter_related_task_by_user


fee_bk = Blueprint('fee', __name__)


@fee_bk.route('/get_fee_records', methods=['GET', 'POST'])
def get_fee_records():
    uid = int(request.form.get('uid'))
    all_data = filter_related_task_by_user('党费缴纳', uid, mode='private')
    # 添加附件名称
    for data in all_data:
        if data.get('need_attachment') == 'true':
            form_name = Form.query.filter_by(id=int(data['attachment_id'])).first().name
            data['attachment_name'] = form_name
    return jsonify({'code': 200, 'msg': '查询成功', 'data': all_data})


@fee_bk.route('/delete_record', methods=['POST'])
def delete_fee_record():
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