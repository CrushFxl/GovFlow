from flask import Blueprint, request, jsonify, session
from app.models import db
from app.models.Profile import Profile
from app.models.User import User
from app.models.Branch import Branch
from app.models import to_json



profile_bk = Blueprint('profile', __name__, url_prefix='/profile')


@profile_bk.route('/modify', methods=['POST', 'PUT'])
def modify_or_add_profile():
    try:
        user_id = session.get('uid')
        data = request.get_json()
        profile = Profile.query.filter_by(uid=user_id).first()
        if profile:
            for key, value in data.items():
                if hasattr(profile, key):
                    setattr(profile, key, value)
        else:
            data['uid'] = user_id
            # 对有职级人员授予权限
            if data['party_status'] not in ['普通正式党员', '预备党员']:
                data['admin_status'] = 1
            profile = Profile(**data)
            db.session.add(profile)
        # 提交更改
        db.session.commit()
        return jsonify({'code': 1000, 'msg': '成功', 'data': to_json(profile)})
    except Exception as e:
        db.session.rollback()
        return jsonify({'code': 500, 'msg': f'服务器错误: {str(e)}'})


@profile_bk.route('/get', methods=['GET'])
def get_profile():
    try:
        user_id = session.get('uid')
        if not user_id:
            return jsonify({'code': 401, 'msg': '未登录'})
        profile = Profile.query.filter_by(uid=user_id).first()
        if profile:
            # 获取profile数据
            profile_data = to_json(profile)
            # 如果存在党支部ID，获取党支部名称
            if profile_data.get('party_branch'):
                branch = Branch.query.filter_by(value=profile_data['party_branch']).first()
                if branch:
                    profile_data['party_branch_name'] = branch.name
            return jsonify({'code': 1000, 'msg': '成功', 'data': profile_data})
        else:
            return jsonify({'code': 2000, 'msg': '未找到档案数据'})
    except Exception as e:
        return jsonify({'code': 500, 'msg': f'服务器错误: {str(e)}'})


@profile_bk.route('/branches', methods=['GET'])
def get_branches():
    try:
        # 获取所有党总委
        committees = Branch.query.filter_by(level=1).all()
        committees_data = []
        for committee in committees:
            committee_info = to_json(committee)
            
            # 获取该党总委下的所有二级党组织
            subcommittees = Branch.query.filter_by(parent_id=committee.id).all()
            committee_info['subcommittees'] = []
            
            for subcommittee in subcommittees:
                subcommittee_info = to_json(subcommittee)
                
                # 获取该二级党组织下的所有基层党支部
                branches = Branch.query.filter_by(parent_id=subcommittee.id).all()
                subcommittee_info['branches'] = to_json(branches)
                
                committee_info['subcommittees'].append(subcommittee_info)
            
            committees_data.append(committee_info)
        return jsonify({'code': 1000, 'msg': '成功', 'data': committees_data})
    except Exception as e:
        return jsonify({'code': 500, 'msg': f'服务器错误: {str(e)}'})
