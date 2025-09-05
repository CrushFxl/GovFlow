from flask import Blueprint, request, jsonify, session
from app.models import db
from app.models.Branch import Branch
from app.models.Profile import Profile
from app.models.Form import Form

import json


query_bk = Blueprint('query', __name__)


@query_bk.route('/partners_list', methods=['GET'])
def get_partners_list():
    # 查询所有档案
    profiles = Profile.query.all()
    # 获取所有信息并全部转化为字符串
    partners_list = []
    for profile in profiles:
        # 获取所有字段的值并转换为字符串
        profile_info = []
        for col in profile.__table__.columns:
            value = getattr(profile, col.name)
            profile_info.append(f"{col.name}: {str(value) if value else 'None'}")
        # 将该档案的所有信息合并为一个字符串
        partners_list.append('; '.join(profile_info))
    return jsonify({'code': 0, 'message': 'success', 'data': partners_list})


@query_bk.route('/organizations_list', methods=['GET'])
def get_organizations_list():
    # 查询所有党支部（level=2）
    branches = Branch.query.filter_by(level=2).all()
    # 获取支部名称列表
    organizations_list = [branch.name for branch in branches]
    return jsonify({'code': 0, 'message': 'success', 'data': organizations_list})

@query_bk.route('/form_list', methods=['GET'])
def get_form_list():
    prompt = ""
    forms = Form.query.filter_by(is_active=1).all()
    for f in forms:
        prompt += f'表单ID: {f.id}  名称: {f.name}  描述: {f.description}\n '
    return {'data': {'form_list': prompt}}
