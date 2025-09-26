from flask import Blueprint, request, jsonify, session
from app.models import db
from app.models.Profile import Profile
from app.models.User import User
from app.models.Branch import Branch
from app.models import to_json
from app.models.Form import Form, FormControl, FormSubmission
from ..utils import filter_related_task_by_user

partyday_bk = Blueprint('partyday', __name__, url_prefix='/party_day')


@partyday_bk.route('/get_records', methods=['GET', 'POST', 'PUT'])
def get_party_day_records():
    uid = int(request.form.get('uid'))
    all_records = filter_related_task_by_user('主题党日', uid, mode='private')
    for data in all_records:
        if data.get('need_attachment') == 'true':
            form_name = Form.query.filter_by(id=int(data['attachment_id'])).first().name
            data['attachment_name'] = form_name
    return jsonify({'code': 1000, 'data': all_records})


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
