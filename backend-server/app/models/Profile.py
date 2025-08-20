from . import db


class Profile(db.Model):
    __tablename__ = 'profiles'
    uid = db.Column('uid', db.Integer, db.ForeignKey('users.uid'), primary_key=True, unique=True, index=True, nullable=False)
    real_name = db.Column('real_name', db.Text, nullable=False)
    alias = db.Column('alias', db.Text, nullable=True)
    gender = db.Column('gender', db.Text, nullable=True)
    birth_date = db.Column('birth_date', db.Text, nullable=True)
    native_place = db.Column('native_place', db.Text, nullable=True)
    education = db.Column('education', db.Text, nullable=True)
    position = db.Column('position', db.Text, nullable=True)
    contact = db.Column('contact', db.Text, nullable=True)
    address = db.Column('address', db.Text, nullable=True)  # 备注字段
    party_committee = db.Column('party_committee', db.Text, nullable=True)
    party_branch = db.Column('party_branch', db.Text, nullable=True)
    party_status = db.Column('party_status', db.Text, nullable=True)
    join_date = db.Column('join_date', db.Text, nullable=True)

    # 建立与User模型的关系
    user = db.relationship('User', backref=db.backref('profile', uselist=False))