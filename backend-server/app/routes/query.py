from flask import Blueprint, request, jsonify, session
from app.models import db
from app.models.Branch import Branch
from app.models.Profile import Profile
from app.models.Form import Form, FormControl
from flask import Blueprint, jsonify, request

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
    branches = Branch.query.filter_by().all()
    # 获取党组织名称列表
    organizations_list = [branch.name for branch in branches]
    return jsonify({'code': 0, 'message': 'success', 'data': organizations_list})

@query_bk.route('/form_list', methods=['GET'])
def get_form_list():
    prompt = ""
    forms = Form.query.filter_by(is_active=1).all()
    for f in forms:
        prompt += f'表单ID: {f.id}  名称: {f.name}  描述: {f.description}\n '
    return {'data': {'form_list': prompt}}


@query_bk.route('/form_preview/<int:form_id>', methods=['GET'])
def form_preview(form_id):
    """
    获取表单预览数据
    参数：
    - form_id: 表单ID
    """
    try:
        # 查询表单信息
        form = Form.query.get(form_id)
        if not form:
            return jsonify({'code': -1, 'message': '表单不存在', 'data': None})
        
        # 查询表单控件
        controls = FormControl.query.filter_by(form_id=form_id).order_by(FormControl.order).all()
        
        # 格式化返回数据
        form_data = {
            'id': form.id,
            'name': form.name,
            'description': form.description,
            'created_realname': form.created_realname,
            'created_at': form.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': form.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'controls': []
        }
        
        for control in controls:
            control_data = {
                'id': control.id,
                'type': control.type,
                'label': control.label,
                'placeholder': control.placeholder,
                'required': control.required,
                'order': control.order,
                'default_value': control.default_value
            }
            
            # 解析选项（如果有）
            if control.options:
                try:
                    control_data['options'] = json.loads(control.options)
                except json.JSONDecodeError:
                    control_data['options'] = []
            else:
                control_data['options'] = []
            
            form_data['controls'].append(control_data)
        
        return jsonify({'code': 0, 'message': '查询成功', 'data': form_data})
        
    except Exception as e:
        return jsonify({'code': -1, 'message': f'查询失败: {str(e)}', 'data': None})


@query_bk.route('/get_all_party_members', methods=['GET'])
def get_all_party_members():
    # 查询所有党员信息
    members = Profile.query.all()
    result = []
    for member in members:
        result.append({
            'id': member.uid,
            'real_name': member.real_name,
            'gender': '男' if member.gender == 'male' else '女',
            'party_status': member.party_status,
            'student_id': member.student_id,
            'contact': member.contact,
            'party_branch': Branch.query.filter_by(value=member.party_branch).first().name,
            'position': member.position,
        })
    return jsonify({'code': 1000, 'message': '查询成功', 'data': result})


@query_bk.route('/get_party_member_detail/<int:member_id>', methods=['GET'])
def get_party_member_detail(member_id):
    """
    获取单个党员的详细信息
    参数：
    - member_id: 党员ID
    """
    member = Profile.query.filter_by(uid=member_id).first()
    # 格式化返回详细信息
    detail_info = {
        'id': member.uid,
        'name': member.real_name,
        'gender': '男' if member.gender == 'male' else '女',
        'birth_date': member.birth_date,
        'native_place': member.native_place,
        'education': member.education,
        'position': member.position,
        'student_id': member.student_id,
        'contact': member.contact,
        'party_committee': Branch.query.filter_by(value=member.party_committee).first().name,
        'party_subcommittee': Branch.query.filter_by(value=member.party_subcommittee).first().name,
        'party_branch': Branch.query.filter_by(value=member.party_branch).first().name,
        'party_status': member.party_status,
        'join_date': member.join_date,
        'address': member.address
    }
    return jsonify({'code': 1000, 'message': '查询成功', 'data': detail_info})
