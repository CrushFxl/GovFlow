from . import db
from datetime import datetime


def notice_description():
    text = """【表格名称】notices
    【表格描述】用于存储通知信息。
    【字段描述】
    - title, str, 通知标题
    - description, str, 通知描述
    - partners, json, 参与的党员，列表，每个元素为党员的真实姓名
    - organizations, json, 参与的党组织，列表，每个元素为党组织的真实名称
    - created_uid, int, 通知创建者的UID
    - created_time, str, 通知创建时间, 格式为YYYY-MM-DD HH:MM
    - next_uid, int, 需要审核该通知的用户UID
    - status, int, 通知状态, 0: 待发布, 1: 待审核, 2: 审核通过, 3: 已完成, 4:审核拒绝
    """
    return text


class Notice(db.Model):
    __tablename__ = 'notices'
    task_type = db.Column('task_type', db.Text, nullable=False, default='通知')
    uuid = db.Column('uuid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    title = db.Column('title', db.Text, nullable=False)
    description = db.Column('description', db.Text, nullable=False)
    partners = db.Column('partners_real_name', db.JSON, nullable=False)
    organizations = db.Column('organizations', db.JSON, nullable=False)
    created_uid = db.Column('created_uid', db.Integer, nullable=False)
    created_time = db.Column('created_time', db.Text, nullable=False)
    next_uid = db.Column('next_uid', db.Integer, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)

