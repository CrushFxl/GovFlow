from . import db


class User(db.Model):
    __tablename__ = 'users'
    uid = db.Column('uid', db.Integer, primary_key=True, unique=True, index=True, nullable=False)
    nick = db.Column('nick', db.Text, nullable=True, default='无名小卒')
    status = db.Column('status', db.Integer, nullable=False, default=0)
    mob = db.Column('mob', db.Text, unique=True, nullable=False)
    pwd = db.Column('pwd', db.Text, nullable=False)


def init_users():
    if not User.query.first():
        default_users = [
            User(uid=101, nick='测试账号101', mob='1', pwd='1'),
            User(uid=102, nick='测试账号102', mob='2', pwd='2'),
            User(uid=103, nick='测试账号103', mob='3', pwd='3'),
            User(uid=104, nick='测试账号104', mob='4', pwd='4'),
        ]
        db.session.bulk_save_objects(default_users)
        db.session.commit()
        print("初始化测试用户完成.")
