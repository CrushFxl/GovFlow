from . import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = 'tasks'
    
    uuid = db.Column('uuid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    title = db.Column('title', db.Text, nullable=False)
    description = db.Column('description', db.Text, nullable=False)
    date = db.Column('date', db.Text, nullable=False)
    start_time = db.Column('start_time', db.Text, nullable=False, default='00:00')
    end_time = db.Column('end_time', db.Text, nullable=False, default='23:59')
    location = db.Column('location', db.Text, nullable=True)
    partners = db.Column('partners_real_name', db.JSON, nullable=False)
    organizations = db.Column('organizations', db.JSON, nullable=False)
    created_uid = db.Column('created_uid', db.Integer, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)

    need_attachment = db.Column('need_attachment', db.Text, nullable=False, default='false')
    attachment_uuid = db.Column('attachment_uuid', db.Text, nullable=True)