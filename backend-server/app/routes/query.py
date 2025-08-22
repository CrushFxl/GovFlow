from flask import Blueprint, request, jsonify, session
from app.models import db
from app.models.Branch import Branch
from app.models.Profile import Profile
from app.models.Todo import Todo
from app.models.Activity import Activity
from app.models.Notice import Notice



query_bk = Blueprint('query', __name__)


@query_bk.route('/partners_list', methods=['GET'])
def get_partners_list():
    try:
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
    except Exception as e:
        return jsonify({'code': -1, 'message': f'获取档案列表失败: {str(e)}'})


@query_bk.route('/organizations_list', methods=['GET'])
def get_organizations_list():
    try:
        # 查询所有党支部（level=2）
        branches = Branch.query.filter_by(level=2).all()
        # 获取支部名称列表
        organizations_list = [branch.name for branch in branches]
        return jsonify({'code': 0, 'message': 'success', 'data': organizations_list})
    except Exception as e:
        return jsonify({'code': -1, 'message': f'获取支部列表失败: {str(e)}'})


# 根据用户选择的待完成事项，联表查询返回事项的详细信息
@query_bk.route('/todo_info', methods=['GET'])
def get_todo_info():
    uid = request.args.get('uid')
    choose_num = int(request.args.get('choose_num'))
    idx = int(choose_num)
    # 获取用户的所有待办事项，与get_user_info()保持一致
    todos = Todo.query.filter_by(accept_user_uid=uid).all()
    # 检查idx是否在有效范围内
    # if idx < 1 or idx > len(todos):
    #     return jsonify({'code': -1, 'message': '选择的序号不存在'})
    # 根据idx获取对应的todo对象
    todo = todos[idx - 1]
    prompt = ''
    # 根据类型查询详细信息
    if todo.type == 'task' and todo.relate:
        # 查询Activity表（任务类型表，需要填表）
        activity = Activity.query.filter_by(acid=todo.relate).first()
        if activity:
            pass
    elif todo.type == 'notice' and todo.relate:
        # 查询Notice表（通知表）
        notice = Notice.query.filter_by(id=todo.relate).first()
        user_real_name = Profile.query.filter_by(uid=notice.create_user_uid).first().real_name
        if notice:
            prompt += f'通知：{notice.title}\n\n{notice.content}\n\n'
            prompt += '发起人：' + user_real_name
            prompt += '\n\n发送”确认“将此条通知标记为已读。'
    elif todo.type == 'review' or todo.type == 'other':
        # other和review类型表格逻辑先留空
        pass
    
    return jsonify({
        'code': 1000,
        'message': 'ok',
        'data':{
            'prompt': prompt,
            'todo_type': todo.type
        }
    })
