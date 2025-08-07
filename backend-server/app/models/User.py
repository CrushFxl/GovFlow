from . import db


class User(db.Model):
    __tablename__ = 'users'
    uid = db.Column('uid', db.Integer, primary_key=True, unique=True, index=True, nullable=False)
    nick = db.Column('nick', db.Text, nullable=True, default='无名小卒')
    status = db.Column('status', db.Integer, nullable=False, default=0)
    mob = db.Column('mob', db.Text, unique=True, nullable=False)
    pwd = db.Column('pwd', db.Text, nullable=False)
