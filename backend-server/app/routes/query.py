from flask import Blueprint, request, jsonify, session
from app.models import db
from app.models.Branch import Branch
from app.models.Profile import Profile
from app.models.Form import Form, FormControl, FormSubmission
from app.models.Task import Task
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
    获取表单基础预览数据
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

@query_bk.route('/form_get', methods=['GET'])
def form_get():
    """
    获取指定表单ID的表格结构，用于前端渲染
    参数：
    - form_id: 表单ID
    """
    # 获取请求参数
    form_id = int(request.args.get('form_id'))    
    form = Form.query.filter_by(id=form_id).first()
    # 查询表单控件
    controls = FormControl.query.filter_by(form_id=form_id).order_by(FormControl.order).all()
    # 组装返回数据
    data = {}
    for c in controls:
        record = {}
        record['type'] = c.type
        record['label'] = c.label
        record['placeholder'] = c.placeholder
        record['required'] = c.required
        record['default_value'] = c.default_value
        # 如果是单选题，增加options列表
        if c.type == 'select' or c.type == 'radio' or c.type == 'checkbox':
            record['options'] = json.loads(c.options) if c.options else []
        data[c.id] = record
    return jsonify({'code': 0, 'message': 'success', 'data': data})

@query_bk.route('/submit_form_data', methods=['POST'])
def submit_form_data():
    """
    提交表单数据到FormSubmission表
    参数：
    - form_id: 表单ID
    - form_data: 表单数据（JSON格式字符串）
    - uid: 用户ID
    - task_uuid: 关联任务UUID（可选）
    """
    # 获取请求参数
    form_id = int(request.form.get('form_id'))
    form_data_str = request.form.get('form_data')
    user_id = int(request.form.get('uid'))
    task_uuid = request.form.get('task_uuid')  # 新增：获取关联任务UUID
    # 验证参数
    if not form_id or not form_data_str or not user_id:
        return jsonify({'code': 400, 'message': '参数不完整', 'data': None})
    # 检查表单是否存在
    form = Form.query.filter_by(id=form_id).first()
    if not form:
        return jsonify({'code': 404, 'message': '表单不存在', 'data': None})
    # 解析表单数据
    try:
        form_data = json.loads(form_data_str)
    except json.JSONDecodeError:
        return jsonify({'code': 400, 'message': '表单数据格式错误', 'data': None})
    
    # # 验证必填字段
    # controls = FormControl.query.filter_by(form_id=form_id, required=True).all()
    # missing_fields = []
    # for control in controls:
    #     if control.label not in form_data or not form_data[control.label]:
    #         missing_fields.append(control.label)
    # if missing_fields:
    #     return jsonify({'code': 400, 'message': f'缺少必填字段：{', '.join(missing_fields)}', 'data': None})
    
    submission = FormSubmission(
        form_id=form_id,
        user_id=user_id,
        data=json.dumps(form_data),
        task_uuid=task_uuid  # 新增：保存关联任务UUID
    )
    db.session.add(submission)
    db.session.commit()
    return jsonify({'code': 200, 'message': '提交成功', 'data': {'id': submission.id}})

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


@query_bk.route('/get_task_list', methods=['GET'])
def get_task_list():
    """
    获取任务列表，用于前端弹窗的关联任务下拉列表
    返回：任务ID和任务标题的列表
    """
    try:
        # 查询所有任务
        tasks = Task.query.all()
        
        # 格式化返回数据，只包含必要的信息用于下拉列表
        task_list = []
        for task in tasks:
            task_list.append({
                'uuid': task.uuid,
                'title': task.title
            })
        
        return jsonify({'code': 0, 'message': '查询成功', 'data': task_list})
    except Exception as e:
        return jsonify({'code': -1, 'message': f'查询失败: {str(e)}', 'data': None})


@query_bk.route('/get_task_detail/<string:task_uuid>', methods=['GET'])
def get_task_detail(task_uuid):
    """
    获取任务详情信息
    参数：
    - task_uuid: 任务的唯一标识符
    返回：任务的详细信息，包括参与党组、参与党员、时间、地点等
    """
    try:
        # 查询指定UUID的任务
        task = Task.query.filter_by(uuid=task_uuid).first()
        
        if not task:
            return jsonify({'code': -1, 'message': '任务不存在', 'data': None})
        
        # 格式化返回任务详情，包含所有需要在前端显示的字段
        task_detail = {
            'uuid': task.uuid,
            'title': task.title,
            'description': task.description,
            'start_date': task.start_date,
            'start_time': task.start_time,
            'end_date': task.end_date,
            'end_time': task.end_time,
            'location': task.location,
            'partners': task.partners,  # 参与党员列表
            'organizations': task.organizations  # 参与党组织列表
        }
        
        return jsonify({'code': 0, 'message': '查询成功', 'data': task_detail})
    except Exception as e:
        return jsonify({'code': -1, 'message': f'查询失败: {str(e)}', 'data': None})
