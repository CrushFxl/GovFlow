from . import db
from datetime import datetime

class Notice(db.Model):
    __tablename__ = 'notices'
    
    id = db.Column('id', db.Integer, primary_key=True, unique=True, index=True, nullable=False, autoincrement=True)
    title = db.Column('title', db.Text, nullable=False)
    content = db.Column('content', db.Text, nullable=False)
    create_user_uid = db.Column('create_user_uid', db.Integer, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)
    
    def __repr__(self):
        return f'<Notice {self.id}: {self.title}>'