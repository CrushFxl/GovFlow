import datetime
import json

from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
import uuid
from app.models import db
from app.models.Branch import Branch
from app.models.Profile import Profile
from app.models.Todo import Todo
from app.models.Activity import Activity
from app.models.Notice import Notice



create_todos_bk = Blueprint('create_todos', __name__)


@create_todos_bk.route('/create_notice', methods=['GET'])
def create_notice():
    uid = int(request.args.get('uid'))
    data = json.loads(request.args.get('data'))
    organizations = json.loads(request.args.get('organizations'))
    partners = json.loads(request.args.get('partners'))
    data['organizations'] = organizations
    data['partners'] = partners
    data['created_uid'] = uid
    data['uuid'] = str(uuid.uuid4())
    data['created_time'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    
    # 组装提示词
    prompt = f"""您正在创建一个通知，以下是通知内容。
    ---------------------------
    通知标题：{data['title']}

    {data['description']}

    被通知党组：{[i + "; " for i in data['organizations']]}
    被通知人员：{[i + "; " for i in data['partners']]}
    ---------------------------
    """
    # 确定下一步审核人
    my_profile = Profile.query.filter_by(uid=uid).first()
    if my_profile.admin_status == 0:
        my_branch = my_profile.party_branch
        admin_profile = Profile.query.filter_by(admin_status=1, party_branch=my_branch).first()
        data['next_uid'] = admin_profile.uid
        prompt += f"此通知需要先交由{admin_profile.party_status}【{admin_profile.real_name}】审核后才能发布，回答‘确定’以提交创建通知的申请。"
    else:
        data['next_uid'] = str(uid)
        prompt += f"由于您是职级人员，因此无需上级审核。回答‘确定’以发布此通知。"
    
    # 向Notice表添加对象
    notice = Notice(**data)
    db.session.add(notice)
    db.session.commit()

    return {
        'code': 1000, 
        'msg': 'ok', 
        'data': {
            'prompt': prompt,
            'uuid': data['uuid']
        }
    }