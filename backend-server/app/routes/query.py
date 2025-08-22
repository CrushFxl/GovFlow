from flask import Blueprint, request, jsonify, session
from app.models import db
from app.models.Branch import Branch
from app.models.Profile import Profile



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
