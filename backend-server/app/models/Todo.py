from . import db


def todo_description():
    text = f"""【表格名称】todos
    【表格描述】用于存储用户待办事项信息。
    【字段描述】
    - uuid, str, 待办事项的唯一标识符
    - type, str, 待办事项类型, 共三类, notice: 通知, task: 任务, review: 审核
    - form_submit_id, str, 关联的form_submissions表中的填写记录ID
    - related_uuid, str, 关联的任务或通知的UUID
    - uid, int, 创建待办事项的用户UID
    - status, int, 待办事项状态, 0: 待完成, 1: 已完成
    
    """
    return text


class Todo(db.Model):
    __tablename__ = 'todos'
    
    uuid = db.Column('uuid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    type = db.Column('type', db.Text, nullable=False, default='notice')
    form_submit_id = db.Column('form_submit_id', db.Text, nullable=True)
    related_uuid = db.Column('related_uuid', db.Text, nullable=True)
    uid = db.Column('uid', db.Integer, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)

