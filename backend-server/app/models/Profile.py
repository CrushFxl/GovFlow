from email.policy import default

from . import db


class Profile(db.Model):
    __tablename__ = 'profiles'
    uid = db.Column('uid', db.Integer, db.ForeignKey('users.uid'), primary_key=True, unique=True, index=True, nullable=False)
    real_name = db.Column('real_name', db.Text, nullable=False)
    alias = db.Column('alias', db.Text, nullable=True, default='')
    gender = db.Column('gender', db.Text, nullable=True, default='male')
    birth_date = db.Column('birth_date', db.Text, nullable=True)
    native_place = db.Column('native_place', db.Text, nullable=True)
    education = db.Column('education', db.Text, nullable=True, default='bachelor')
    position = db.Column('position', db.Text, nullable=True)
    contact = db.Column('contact', db.Text, nullable=True)
    address = db.Column('address', db.Text, nullable=True)  # 备注字段
    party_committee = db.Column('party_committee', db.Text, nullable=True)
    party_subcommittee = db.Column('party_subcommittee', db.Text, nullable=True)
    party_branch = db.Column('party_branch', db.Text, nullable=True)
    party_status = db.Column('party_status', db.Text, nullable=True)
    join_date = db.Column('join_date', db.Text, nullable=True)
    admin_status = db.Column('admin_status', db.Integer, nullable=False, default=0)
    # 建立与User模型的关系
    user = db.relationship('User', backref=db.backref('profile', uselist=False))


def init_profiles():
    # 初始化测试用户档案
    if not Profile.query.first():
        default_profile = [
            Profile(uid=101, real_name='冯洋一', alias='fyy', gender='male',
                    birth_date='2004-06-20', native_place='浙江宁波', position='学生',
                    contact='18768594590', address='擅长计算机技术',
                    party_committee='committee1', party_subcommittee='subcommittee11',
                    party_branch='branch111', party_status='普通正式党员',
                    join_date='2024-01-01', admin_status=0),
            Profile(uid=102, real_name='唐佳良', alias='tjl', gender='male',
                    birth_date='2003-07-21', native_place='浙江金华', position='学生',
                    contact='13276702536', address='擅长吉他',
                    party_committee='committee1', party_subcommittee='subcommittee11',
                    party_branch='branch111', party_status='普通正式党员',
                    join_date='2022-03-12', admin_status=0),
            Profile(uid=103, real_name='王语佳', alias='wyj', gender='female',
                    birth_date='2005-02-25', native_place='浙江杭州', position='学生',
                    contact='15624237489', address='无',
                    party_committee='committee1', party_subcommittee='subcommittee11',
                    party_branch='branch111', party_status='支部书记',
                    join_date='2020-06-05', admin_status=1),
            Profile(uid=104, real_name='蒋伟祺', alias='jwq', gender='male',
                    birth_date='2014-03-28', native_place='浙江宁波', position='学生',
                    contact='13858382597', address='无',
                    party_committee='committee1', party_subcommittee='subcommittee12',
                    party_branch='branch121', party_status='普通正式党员',
                    join_date='2023-05-01', admin_status=0),
        ]
        db.session.bulk_save_objects(default_profile)
        db.session.commit()
        print("初始化测试用户档案完成.")