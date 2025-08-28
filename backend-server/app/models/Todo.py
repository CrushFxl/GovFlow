from . import db
import enum

class Todo(db.Model):
    __tablename__ = 'todos'
    
    id = db.Column('id', db.Integer, primary_key=True, unique=True, index=True, nullable=False, autoincrement=True)
    type = db.Column('type', db.Text, nullable=False, default='notice')
    title = db.Column('title', db.Text, nullable=False)
    relate = db.Column('relate', db.Integer, nullable=True)
    create_user_uid = db.Column('create_user_uid', db.Integer, nullable=False)
    accept_user_uid = db.Column('accept_user_uid', db.Integer, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)