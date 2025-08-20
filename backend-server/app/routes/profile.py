from flask import Blueprint, request, jsonify, session
from app.models import db
from app.models.Profile import Profile
from app.models.User import User
from app.models import to_json



profile_bk = Blueprint('profile', __name__, url_prefix='/profile')


@profile_bk.route('/modify', methods=['POST', 'PUT'])
def modify_or_add_profile():
    try:
        # 获取当前登录用户的uid
        user_id = session.get('uid')
        if not user_id:
            return jsonify({'code': 401, 'msg': '未登录'})
        # 获取请求数据
        data = request.get_json()
        if not data:
            return jsonify({'code': 400, 'msg': '请求数据为空'})
        # 查找当前用户的profile
        profile = Profile.query.filter_by(uid=user_id).first()
        if profile:
            # 更新现有profile
            for key, value in data.items():
                if hasattr(profile, key):
                    setattr(profile, key, value)
        else:
            # 创建新profile
            data['uid'] = user_id
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
            return jsonify({'code': 1000, 'msg': '成功', 'data': to_json(profile)})
        else:
            return jsonify({'code': 2000, 'msg': '未找到档案数据'})
    except Exception as e:
        return jsonify({'code': 500, 'msg': f'服务器错误: {str(e)}'})
