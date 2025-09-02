from . import db


class Branch(db.Model):
    __tablename__ = 'branches'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('name', db.Text, nullable=False)
    parent_id = db.Column('parent_id', db.Integer, db.ForeignKey('branches.id'), nullable=True)
    level = db.Column('level', db.Integer, nullable=False)  # 1表示党总委，2表示二级党组织，3表示基层党支部
    value = db.Column('value', db.Text, unique=True, nullable=False)

    # 自引用关系，用于构建树状结构
    children = db.relationship('Branch', backref=db.backref('parent', remote_side=[id]))

    def __repr__(self):
        return f'<Branch {self.name}>'


# 初始化函数，用于添加组织结构数据
def init_branches():
    if Branch.query.count() == 0:
        committees = [
            Branch(name='杭州医学院党总委', parent_id=None, level=1, value='committee1'),
            Branch(name='信息工程学院党组织', parent_id=1, level=2, value='subcommittee11'),
            Branch(name='公共卫生学院党组织', parent_id=1, level=2, value='subcommittee12'),
            Branch(name='护理学院党组织', parent_id=1, level=2, value='subcommittee13'),
            Branch(name='临床医学院党组织', parent_id=1, level=2, value='subcommittee14'),
            Branch(name='第一教师党支部', parent_id=2, level=3, value='branch111'),
            Branch(name='第一学生党支部', parent_id=2, level=3, value='branch112'),
            Branch(name='第二学生党支部', parent_id=2, level=3, value='branch113'),
            Branch(name='第一教师党支部', parent_id=3, level=3, value='branch121'),
            Branch(name='第一教师党支部', parent_id=4, level=3, value='branch131'),
            Branch(name='第一教师党支部', parent_id=5, level=3, value='branch141')
        ]
        db.session.add_all(committees)
        db.session.commit()
        print('初始化党组织结构完成.')