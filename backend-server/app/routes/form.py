from flask import Blueprint, request, jsonify, current_app
from ..models.Form import Form, FormControl
from ..models import db
from flask_cors import cross_origin
import json

form_bk = Blueprint('form', __name__, url_prefix='/api/form')


@form_bk.route('/list', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_form_list():
    """获取所有表单列表"""
    try:
        # 从查询参数中获取creator_id
        creator_id = request.args.get('creator_id', type=int)
        
        # 构建查询条件
        query = Form.query
        if creator_id:
            query = query.filter_by(creator_id=creator_id)
            
        # 查询所有表单并按创建时间降序排列
        forms = query.order_by(Form.created_at.desc()).all()
        
        # 转换为JSON格式
        result = []
        for form in forms:
            result.append({
                'id': form.id,
                'name': form.name,
                'description': form.description,
                'creator_id': form.creator_id,
                'created_at': form.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': form.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
                'is_active': form.is_active
            })
        
        return jsonify({'code': 200, 'data': result, 'msg': 'success'})
    except Exception as e:
        current_app.logger.error(f'获取表单列表失败: {str(e)}')
        return jsonify({'code': 500, 'data': None, 'msg': f'获取表单列表失败: {str(e)}'})


@form_bk.route('/detail/<int:form_id>', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_form_detail(form_id):
    """获取表单详情"""
    try:
        # 查询表单
        form = Form.query.get_or_404(form_id)
        
        # 查询表单控件
        controls = FormControl.query.filter_by(form_id=form_id).order_by(FormControl.order).all()
        
        # 转换控件为JSON格式
        controls_result = []
        for control in controls:
            controls_result.append({
                'id': control.id,
                'type': control.type,
                'label': control.label,
                'placeholder': control.placeholder,
                'required': control.required,
                'options': json.loads(control.options) if control.options else None,
                'order': control.order,
                'default_value': control.default_value
            })
        
        # 构建返回结果
        result = {
            'id': form.id,
            'name': form.name,
            'description': form.description,
            'creator_id': form.creator_id,
            'created_at': form.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': form.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'is_active': form.is_active,
            'controls': controls_result
        }
        
        return jsonify({'code': 200, 'data': result, 'msg': 'success'})
    except Exception as e:
        current_app.logger.error(f'获取表单详情失败: {str(e)}')
        return jsonify({'code': 500, 'data': None, 'msg': f'获取表单详情失败: {str(e)}'})


@form_bk.route('/create', methods=['POST'])
@cross_origin(supports_credentials=True)
def create_form():
    """创建新表单"""
    try:
        # 获取请求数据
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        creator_id = data.get('creator_id')
        controls = data.get('controls', [])
        
        # 验证必填字段
        if not name or not creator_id:
            return jsonify({'code': 400, 'data': None, 'msg': '表单名称和创建者ID不能为空'})
        
        # 创建表单
        form = Form(name=name, description=description, creator_id=creator_id)
        db.session.add(form)
        db.session.flush()  # 获取form.id
        
        # 创建表单控件
        for i, control in enumerate(controls):
            type = control.get('type')
            label = control.get('label')
            placeholder = control.get('placeholder')
            required = control.get('required', False)
            options = json.dumps(control.get('options', [])) if control.get('options') else None
            order = i
            default_value = control.get('default_value')
            
            if not type or not label:
                continue  # 跳过必填字段为空的控件
            
            form_control = FormControl(
                form_id=form.id,
                type=type,
                label=label,
                placeholder=placeholder,
                required=required,
                options=options,
                order=order,
                default_value=default_value
            )
            db.session.add(form_control)
        
        # 提交事务
        db.session.commit()
        
        return jsonify({'code': 200, 'data': {'form_id': form.id}, 'msg': '表单创建成功'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'创建表单失败: {str(e)}')
        return jsonify({'code': 500, 'data': None, 'msg': f'创建表单失败: {str(e)}'})


@form_bk.route('/update/<int:form_id>', methods=['PUT'])
@cross_origin(supports_credentials=True)
def update_form(form_id):
    """更新表单"""
    try:
        # 获取请求数据
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        controls = data.get('controls', [])
        
        # 查询表单
        form = Form.query.get_or_404(form_id)
        
        # 更新表单基本信息
        if name:
            form.name = name
        if description is not None:
            form.description = description
        
        # 更新表单控件（先删除旧控件，再添加新控件）
        if controls:
            # 删除旧控件
            FormControl.query.filter_by(form_id=form_id).delete()
            
            # 添加新控件
            for i, control in enumerate(controls):
                type = control.get('type')
                label = control.get('label')
                placeholder = control.get('placeholder')
                required = control.get('required', False)
                options = json.dumps(control.get('options', [])) if control.get('options') else None
                order = i
                default_value = control.get('default_value')
                
                if not type or not label:
                    continue  # 跳过必填字段为空的控件
                
                form_control = FormControl(
                    form_id=form.id,
                    type=type,
                    label=label,
                    placeholder=placeholder,
                    required=required,
                    options=options,
                    order=order,
                    default_value=default_value
                )
                db.session.add(form_control)
        
        # 提交事务
        db.session.commit()
        
        return jsonify({'code': 200, 'data': None, 'msg': '表单更新成功'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'更新表单失败: {str(e)}')
        return jsonify({'code': 500, 'data': None, 'msg': f'更新表单失败: {str(e)}'})


@form_bk.route('/delete/<int:form_id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
def delete_form(form_id):
    """删除表单"""
    try:
        # 查询表单
        form = Form.query.get_or_404(form_id)
        
        # 删除表单（会级联删除相关的控件）
        db.session.delete(form)
        db.session.commit()
        
        return jsonify({'code': 200, 'data': None, 'msg': '表单删除成功'})
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'删除表单失败: {str(e)}')
        return jsonify({'code': 500, 'data': None, 'msg': f'删除表单失败: {str(e)}'})