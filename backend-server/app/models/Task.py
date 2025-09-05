from . import db
from datetime import datetime

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
    partners = db.Column('partners_real_name', db.JSON, nullable=False)
    organizations = db.Column('organizations', db.JSON, nullable=False)
    created_uid = db.Column('created_uid', db.Integer, nullable=False)
    created_time = db.Column('created_time', db.Text, nullable=False)
    next_uid = db.Column('next_uid', db.Integer, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)

    need_attachment = db.Column('need_attachment', db.Text, nullable=False, default='false')
    attachment_id = db.Column('attachment_id', db.Integer, nullable=True)