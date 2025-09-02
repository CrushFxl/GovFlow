from . import db
from datetime import datetime

class Review(db.Model):
    __tablename__ = 'reviews'
    
    uuid = db.Column('uuid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    title = db.Column('title', db.Text, nullable=False)
    description = db.Column('description', db.Text, nullable=False)
    url = db.Column('url', db.Text, nullable=True)                          # 请求完成的url
    data = db.Column('data', db.JSON, nullable=True)                        # 完成请求所需的参数
    created_uid = db.Column('created_uid', db.Integer, nullable=False)      # 审核发起人
    next_uid = db.Column('next_uid', db.Integer, nullable=False)            # 下一步审核人
    status = db.Column('status', db.Integer, nullable=False, default=0)