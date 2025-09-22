from . import db
from datetime import datetime


def task_description():
    text = """【表格名称】tasks
    【表格描述】用于存储用户下发的任务信息。
    【字段描述】
    - uuid, str, 任务的唯一标识符
    - title, str, 任务标题
    - description, str, 任务描述
    - start_date, str, 任务开始日期, 格式为YYYY-MM-DD
    - start_time, str, 任务开始时间, 格式为HH:MM
    - end_date, str, 任务结束日期, 格式为YYYY-MM-DD
    - end_time, str, 任务结束时间, 格式为HH:MM
    - location, str, 任务地点
    - frequency, int, 任务频率, 0表示一次性任务, 1表示每周任务, 2表示每月任务, 3表示每季度任务, 4表示每年任务
    - partners, json, 参与该任务的党员，列表，每个元素为参与者的真实姓名
    - organizations, json, 参与该任务的党组织，列表，每个元素为党组织的名称
    - created_uid, int, 创建任务的用户UID
    - created_time, str, 创建任务的时间
    - next_uid, int, 需要审核该任务的用户UID
    - status, int, 任务状态, 0: 待发布, 1: 待审核, 2: 审核通过, 3: 已完成, 4:审核拒绝
    - need_attachment, str, 'true'或'false', 表示是否关联了表格, 关联表格后, 所有参与该任务的组织成员或个人都须填写
    - attachment_id, int, 关联的表格ID
    
    """
    return text


class Task(db.Model):
    __tablename__ = 'tasks'
    
    uuid = db.Column('uuid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    title = db.Column('title', db.Text, nullable=False)
    description = db.Column('description', db.Text, nullable=False)
    start_date = db.Column('start_date', db.Text, nullable=False)
    start_time = db.Column('start_time', db.Text, nullable=False, default='00:00')
    end_date = db.Column('end_date', db.Text, nullable=False)
    end_time = db.Column('end_time', db.Text, nullable=False, default='23:59')
    location = db.Column('location', db.Text, nullable=True, default='不限')
    frequency = db.Column('frequency', db.Integer, nullable=False, default=0)
    partners = db.Column('partners_real_name', db.JSON, nullable=False)
    organizations = db.Column('organizations', db.JSON, nullable=False)
    created_uid = db.Column('created_uid', db.Integer, nullable=False)
    created_time = db.Column('created_time', db.Text, nullable=False)
    next_uid = db.Column('next_uid', db.Integer, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)

    need_attachment = db.Column('need_attachment', db.Text, nullable=False, default='false')
    attachment_id = db.Column('attachment_id', db.Integer, nullable=True)

