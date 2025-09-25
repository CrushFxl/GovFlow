from flask import Blueprint, request, jsonify
import json
from datetime import datetime
from app.models import db
from app.models.Profile import Profile
from app.models.Form import FormSubmission
from app.models.Branch import Branch
from ..utils import filter_related_task_by_user

review_bk = Blueprint('review', __name__)

@review_bk.route('/get_review_records', methods=['GET', 'POST'])
def get_review_records():
    uid = int(request.form.get('uid'))
    all_records = filter_related_task_by_user('民主评议', uid)
    return jsonify({'code': 1000, 'data': all_records})


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