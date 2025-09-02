from . import db


class Activity(db.Model):
    __tablename__ = 'activities'
    acid = db.Column('acid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    raw = db.Column('raw', db.Text, nullable=False)
    data = db.Column('data', db.JSON, nullable=True)
    status = db.Column('status', db.Integer, nullable=False, default=0)
    # 是否需要附件
    need_attachment = db.Column('need_attachment', db.Boolean, nullable=False, default=False)
    # 关联的文件id
    file_id = db.Column('file_id', db.Integer, nullable=True)
    # activity类型
    type = db.Column('type', db.String(50), nullable=False, default='notice')
