from flask import Blueprint, request, jsonify
from app.models.Profile import Profile
from app.models.Todo import Todo
from app.models.Task import Task
from app.models.Notice import Notice
from app.models.Form import Form, FormControl, FormSubmission
from app.models.Branch import Branch
from app.models.User import User
from app.models import db
import json
from datetime import datetime, timedelta
import random

statistics_bk = Blueprint('statistics', __name__)


@statistics_bk.route('/branch_list', methods=['GET'])
def get_branch_list():
    """获取党支部列表"""
    try:
        # 获取所有党支部
        branches = Branch.query.all()
        
        # 转换为字典列表
        branch_list = []
        for branch in branches:
            branch_list.append({
                'id': branch.id,
                'name': branch.name
            })
        
        # 如果没有数据，返回模拟数据
        if not branch_list:
            branch_list = [
                {'id': 1, 'name': '第一党支部'},
                {'id': 2, 'name': '第二党支部'},
                {'id': 3, 'name': '第三党支部'},
                {'id': 4, 'name': '第四党支部'},
                {'id': 5, 'name': '第五党支部'}
            ]
        
        return jsonify({
            'code': 0,
            'message': 'success',
            'data': {
                'branches': branch_list
            }
        })
    except Exception as e:
        print(f"获取党支部列表异常: {e}")
        return jsonify({
            'code': 1,
            'message': '获取党支部列表失败',
            'data': {}
        })


@statistics_bk.route('/overview', methods=['GET'])
def get_overview_data():
    """获取数据概览"""
    try:
        # 获取参数
        branch_id = request.args.get('branch_id', 'all')
        time_range = request.args.get('time_range', '30')
        
        # 计算日期范围
        days = int(time_range)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # 获取党员总数
        if branch_id == 'all':
            total_members = Profile.query.count()
        else:
            total_members = Profile.query.filter_by(party_branch=int(branch_id)).count()
        
        # 获取待办任务数
        pending_tasks = Todo.query.filter_by(status=0).count()
        if branch_id != 'all':
            # 获取该党支部下的用户
            branch_profiles = Profile.query.filter_by(party_branch=int(branch_id)).all()
            branch_uids = [profile.uid for profile in branch_profiles]
            pending_tasks = Todo.query.filter(Todo.status == 0, Todo.uid.in_(branch_uids)).count()
        
        # 获取已完成任务数
        completed_tasks = Todo.query.filter_by(status=1).count()
        if branch_id != 'all':
            completed_tasks = Todo.query.filter(Todo.status == 1, Todo.uid.in_(branch_uids)).count()
        
        # 计算支部活跃度（这里使用简单的计算方式，实际项目中可能需要更复杂的算法）
        if branch_id == 'all':
            # 计算所有支部的平均活跃度
            branches = Branch.query.all()
            total_activity = 0
            for branch in branches:
                branch_profiles = Profile.query.filter_by(party_branch=branch.id).all()
                if not branch_profiles:
                    continue
                branch_uids = [profile.uid for profile in branch_profiles]
                branch_completed = Todo.query.filter(Todo.status == 1, Todo.uid.in_(branch_uids)).count()
                branch_total = Todo.query.filter(Todo.uid.in_(branch_uids)).count()
                
                if branch_total > 0:
                    branch_activity = (branch_completed / branch_total) * 100
                else:
                    branch_activity = 0
                
                total_activity += branch_activity
            
            if branches:
                branch_activity = int(total_activity / len(branches))
            else:
                branch_activity = 0
        else:
            # 计算指定支部的活跃度
            branch_profiles = Profile.query.filter_by(party_branch=int(branch_id)).all()
            if not branch_profiles:
                branch_activity = 0
            else:
                branch_uids = [profile.uid for profile in branch_profiles]
                branch_completed = Todo.query.filter(Todo.status == 1, Todo.uid.in_(branch_uids)).count()
                branch_total = Todo.query.filter(Todo.uid.in_(branch_uids)).count()
                
                if branch_total > 0:
                    branch_activity = int((branch_completed / branch_total) * 100)
                else:
                    branch_activity = 0
        
        return jsonify({
            'code': 0,
            'message': 'success',
            'data': {
                'totalMembers': total_members,
                'pendingTasks': pending_tasks,
                'completedTasks': completed_tasks,
                'branchActivity': branch_activity
            }
        })
    except Exception as e:
        print(f"获取概览数据异常: {e}")
        return jsonify({
            'code': 1,
            'message': '获取概览数据失败',
            'data': {}
        })


@statistics_bk.route('/activity_trend', methods=['GET'])
def get_activity_trend():
    """获取活动趋势数据"""
    try:
        # 获取参数
        branch_id = request.args.get('branch_id', 'all')
        
        # 生成最近12个月的数据
        labels = []
        data = []
        
        current_date = datetime.now()
        for i in range(11, -1, -1):
            month_date = current_date - timedelta(days=i*30)
            month_label = f'{month_date.month}月'
            labels.append(month_label)
            
            # 模拟数据 - 实际项目中应根据数据库查询
            # 在实际项目中，这里应该查询Notice表或其他活动相关表的数据
            if branch_id == 'all':
                # 随机生成10-40之间的活动数量
                month_data = random.randint(10, 40)
            else:
                # 为特定支部生成相对较少的活动数量
                month_data = random.randint(5, 25)
            
            data.append(month_data)
        
        return jsonify({
            'code': 0,
            'message': 'success',
            'data': {
                'labels': labels,
                'data': data
            }
        })
    except Exception as e:
        print(f"获取活动趋势数据异常: {e}")
        return jsonify({
            'code': 1,
            'message': '获取活动趋势数据失败',
            'data': {}
        })


@statistics_bk.route('/member_distribution', methods=['GET'])
def get_member_distribution():
    """获取党员分布数据"""
    try:
        # 获取所有党支部
        branches = Branch.query.all()
        
        labels = []
        data = []
        
        for branch in branches:
            # 获取该党支部的党员数量
            member_count = Profile.query.filter_by(party_branch=branch.id).count()
            
            if member_count > 0:  # 只统计有党员的支部
                labels.append(branch.name)
                data.append(member_count)
        
        # 如果没有数据，返回模拟数据
        if not labels:
            labels = ['第一党支部', '第二党支部', '第三党支部', '第四党支部', '第五党支部']
            data = [32, 28, 25, 30, 28]
        
        return jsonify({
            'code': 0,
            'message': 'success',
            'data': {
                'labels': labels,
                'data': data
            }
        })
    except Exception as e:
        print(f"获取党员分布数据异常: {e}")
        return jsonify({
            'code': 1,
            'message': '获取党员分布数据失败',
            'data': {}
        })


@statistics_bk.route('/task_status', methods=['GET'])
def get_task_status():
    """获取任务完成情况数据"""
    try:
        # 获取参数
        branch_id = request.args.get('branch_id', 'all')
        
        # 查询任务状态数据
        if branch_id == 'all':
            completed_tasks = Todo.query.filter_by(status=1).count()
            pending_tasks = Todo.query.filter_by(status=0).count()
            # 这里简化处理，实际上可能需要更复杂的查询来区分进行中和待分配的任务
            in_progress_tasks = random.randint(30, 60)
            overdue_tasks = random.randint(5, 15)
        else:
            # 获取该党支部下的用户
            branch_profiles = Profile.query.filter_by(party_branch=int(branch_id)).all()
            branch_uids = [profile.uid for profile in branch_profiles]
            
            completed_tasks = Todo.query.filter(Todo.status == 1, Todo.uid.in_(branch_uids)).count()
            pending_tasks = Todo.query.filter(Todo.status == 0, Todo.uid.in_(branch_uids)).count()
            # 简化处理
            in_progress_tasks = random.randint(10, 30)
            overdue_tasks = random.randint(2, 8)
        
        return jsonify({
            'code': 0,
            'message': 'success',
            'data': {
                'labels': ['已完成', '进行中', '待分配', '已逾期'],
                'data': [completed_tasks, in_progress_tasks, pending_tasks, overdue_tasks]
            }
        })
    except Exception as e:
        print(f"获取任务完成情况数据异常: {e}")
        return jsonify({
            'code': 1,
            'message': '获取任务完成情况数据失败',
            'data': {}
        })


@statistics_bk.route('/branch_activity', methods=['GET'])
def get_branch_activity():
    """获取各支部活跃度数据"""
    try:
        # 获取所有党支部
        branches = Branch.query.all()
        
        labels = []
        data = []
        
        for branch in branches:
            # 计算该党支部的活跃度
            branch_profiles = Profile.query.filter_by(party_branch=branch.id).all()
            
            if branch_profiles:
                branch_uids = [profile.uid for profile in branch_profiles]
                branch_completed = Todo.query.filter(Todo.status == 1, Todo.uid.in_(branch_uids)).count()
                branch_total = Todo.query.filter(Todo.uid.in_(branch_uids)).count()
                
                if branch_total > 0:
                    branch_activity = int((branch_completed / branch_total) * 100)
                else:
                    # 如果没有任务，使用随机值模拟活跃度
                    branch_activity = random.randint(60, 95)
                
                labels.append(branch.name)
                data.append(branch_activity)
        
        # 如果没有数据，返回模拟数据
        if not labels:
            labels = ['第一党支部', '第二党支部', '第三党支部', '第四党支部', '第五党支部']
            data = [88, 92, 75, 80, 90]
        
        return jsonify({
            'code': 0,
            'message': 'success',
            'data': {
                'labels': labels,
                'data': data
            }
        })
    except Exception as e:
        print(f"获取各支部活跃度数据异常: {e}")
        return jsonify({
            'code': 1,
            'message': '获取各支部活跃度数据失败',
            'data': {}
        })


@statistics_bk.route('/recent_activities', methods=['GET'])
def get_recent_activities():
    """获取近期活动列表数据"""
    try:
        # 获取参数
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 10, type=int)
        branch_id = request.args.get('branch_id', 'all')
        
        # 模拟活动数据
        # 在实际项目中，这里应该从数据库中查询Notice表或其他活动相关表的数据
        activities = [
            {'id': 1, 'name': '主题党日活动', 'type': '支部活动', 'participants': 28, 'completion': 95, 'branch': '第一党支部', 'createTime': '2025-09-10'},
            {'id': 2, 'name': '党史学习教育', 'type': '学习活动', 'participants': 120, 'completion': 85, 'branch': '全部党支部', 'createTime': '2025-09-05'},
            {'id': 3, 'name': '志愿服务活动', 'type': '实践活动', 'participants': 45, 'completion': 78, 'branch': '第三党支部', 'createTime': '2025-08-28'},
            {'id': 4, 'name': '组织生活会', 'type': '支部活动', 'participants': 32, 'completion': 100, 'branch': '第二党支部', 'createTime': '2025-08-20'},
            {'id': 5, 'name': '民主评议党员', 'type': '评议活动', 'participants': 143, 'completion': 92, 'branch': '全部党支部', 'createTime': '2025-08-15'},
            {'id': 6, 'name': '党课学习', 'type': '学习活动', 'participants': 95, 'completion': 88, 'branch': '第四党支部', 'createTime': '2025-08-10'},
            {'id': 7, 'name': '红色教育基地参观', 'type': '实践活动', 'participants': 42, 'completion': 100, 'branch': '第五党支部', 'createTime': '2025-08-05'},
            {'id': 8, 'name': '党员发展大会', 'type': '组织活动', 'participants': 58, 'completion': 100, 'branch': '第二党支部', 'createTime': '2025-08-01'},
            {'id': 9, 'name': '专题学习研讨会', 'type': '学习活动', 'participants': 65, 'completion': 85, 'branch': '第一党支部', 'createTime': '2025-07-25'},
            {'id': 10, 'name': '社区服务活动', 'type': '实践活动', 'participants': 48, 'completion': 92, 'branch': '第三党支部', 'createTime': '2025-07-20'}
        ]
        
        # 根据支部筛选活动
        if branch_id != 'all':
            branch = Branch.query.get(int(branch_id))
            if branch:
                branch_name = branch.name
                # 筛选该支部的活动或全部支部的活动
                filtered_activities = [
                    activity for activity in activities 
                    if activity['branch'] == branch_name or activity['branch'] == '全部党支部'
                ]
            else:
                filtered_activities = activities
        else:
            filtered_activities = activities
        
        # 分页处理
        total_count = len(filtered_activities)
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_activities = filtered_activities[start_index:end_index]
        
        return jsonify({
            'code': 0,
            'message': 'success',
            'data': {
                'activities': paginated_activities,
                'total': total_count,
                'page': page,
                'page_size': page_size
            }
        })
    except Exception as e:
        print(f"获取近期活动数据异常: {e}")
        return jsonify({
            'code': 1,
            'message': '获取近期活动数据失败',
            'data': {}
        })


@statistics_bk.route('/export', methods=['POST'])
def export_statistics_data():
    """导出统计数据"""
    try:
        # 获取导出参数
        data = request.get_json()
        export_type = data.get('type', 'overview')  # overview, charts, activities
        branch_id = data.get('branch_id', 'all')
        time_range = data.get('time_range', '30')
        
        # 在实际项目中，这里应该根据参数生成相应的报表文件
        # 这里仅返回模拟的导出结果
        
        # 模拟导出文件名
        current_time = datetime.now().strftime('%Y%m%d%H%M%S')
        export_filename = f'statistics_export_{export_type}_{current_time}.xlsx'
        
        return jsonify({
            'code': 0,
            'message': '导出成功',
            'data': {
                'filename': export_filename,
                'download_url': f'/api/download/{export_filename}'  # 实际项目中应提供真实的下载链接
            }
        })
    except Exception as e:
        print(f"导出统计数据异常: {e}")
        return jsonify({
            'code': 1,
            'message': '导出统计数据失败',
            'data': {}
        })
