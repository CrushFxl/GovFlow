from . import db
from datetime import datetime

class Notice(db.Model):
    __tablename__ = 'notices'
    
    uuid = db.Column('uuid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    title = db.Column('title', db.Text, nullable=False)
    description = db.Column('description', db.Text, nullable=False)
    partners = db.Column('partners_real_name', db.JSON, nullable=False)
    organizations = db.Column('organizations', db.JSON, nullable=False)
    created_uid = db.Column('created_uid', db.Integer, nullable=False)
    created_time = db.Column('created_time', db.Text, nullable=False)
    next_uid = db.Column('next_uid', db.Text, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)