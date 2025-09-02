from . import db
import enum

class Todo(db.Model):
    __tablename__ = 'todos'
    
    uuid = db.Column('uuid', db.Integer, primary_key=True, unique=True, index=True, nullable=False)
    type = db.Column('type', db.Text, nullable=False, default='notice')
    related_uuid = db.Column('related_uuid', db.Integer, nullable=True)
    uid = db.Column('uid', db.Integer, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)