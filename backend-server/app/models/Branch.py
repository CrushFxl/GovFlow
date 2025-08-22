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
    # 检查是否已存在数据
    if Branch.query.count() == 0:
        # 添加党总委数据
        committee1 = Branch(
            name='计算机学院党总委',
            parent_id=None,
            level=1,
            value='committee1'
        )
        committee2 = Branch(
            name='经济学院党总委',
            parent_id=None,
            level=1,
            value='committee2'
        )
        committee3 = Branch(
            name='文学院党总委',
            parent_id=None,
            level=1,
            value='committee3'
        )
        committee4 = Branch(
            name='理学院党总委',
            parent_id=None,
            level=1,
            value='committee4'
        )

        # 添加二级党组织数据
        subcommittee11 = Branch(
            name='计算机系',
            parent_id=1,  # 注意：这里的ID需要根据实际插入顺序调整
            level=2,
            value='subcommittee11'
        )
        subcommittee12 = Branch(
            name='软件工程系',
            parent_id=1,
            level=2,
            value='subcommittee12'
        )
        subcommittee21 = Branch(
            name='会计系',
            parent_id=2,
            level=2,
            value='subcommittee21'
        )
        subcommittee22 = Branch(
            name='金融系',
            parent_id=2,
            level=2,
            value='subcommittee22'
        )

        # 添加基层党支部数据
        branch111 = Branch(
            name='计算机系教师党支部',
            parent_id=5,  # 对应subcommittee11的id
            level=3,
            value='branch111'
        )
        branch112 = Branch(
            name='计算机系学生第一党支部',
            parent_id=5,
            level=3,
            value='branch112'
        )
        branch113 = Branch(
            name='计算机系学生第二党支部',
            parent_id=5,
            level=3,
            value='branch113'
        )
        branch121 = Branch(
            name='软件工程系教师党支部',
            parent_id=6,
            level=3,
            value='branch121'
        )
        branch122 = Branch(
            name='软件工程系学生党支部',
            parent_id=6,
            level=3,
            value='branch122'
        )
        branch211 = Branch(
            name='会计系教师党支部',
            parent_id=7,
            level=3,
            value='branch211'
        )
        branch212 = Branch(
            name='会计系学生党支部',
            parent_id=7,
            level=3,
            value='branch212'
        )
        branch221 = Branch(
            name='金融系教师党支部',
            parent_id=8,
            level=3,
            value='branch221'
        )
        branch222 = Branch(
            name='金融系学生党支部',
            parent_id=8,
            level=3,
            value='branch222'
        )

        # 添加所有数据
        db.session.add_all([
            committee1, committee2, committee3, committee4,
            subcommittee11, subcommittee12, subcommittee21, subcommittee22,
            branch111, branch112, branch113, branch121, branch122,
            branch211, branch212, branch221, branch222
        ])
        db.session.commit()