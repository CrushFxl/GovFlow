from . import db


class Branch(db.Model):
    __tablename__ = 'branches'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('name', db.Text, nullable=False)
    parent_id = db.Column('parent_id', db.Integer, db.ForeignKey('branches.id'), nullable=True)
    level = db.Column('level', db.Integer, nullable=False)  # 1表示党总支，2表示党支部
    value = db.Column('value', db.Text, unique=True, nullable=False)

    # 自引用关系，用于构建树状结构
    children = db.relationship('Branch', backref=db.backref('parent', remote_side=[id]))

    def __repr__(self):
        return f'<Branch {self.name}>'


# 初始化函数，用于添加组织结构数据
def init_branches():
    # 检查是否已存在数据
    if Branch.query.count() == 0:
        # 添加党总支数据
        committee1 = Branch(
            name='计算机学院党总支',
            parent_id=None,
            level=1,
            value='committee1'
        )
        committee2 = Branch(
            name='经济学院党总支',
            parent_id=None,
            level=1,
            value='committee2'
        )
        committee3 = Branch(
            name='文学院党总支',
            parent_id=None,
            level=1,
            value='committee3'
        )
        committee4 = Branch(
            name='理学院党总支',
            parent_id=None,
            level=1,
            value='committee4'
        )

        # 添加党支部数据
        branch11 = Branch(
            name='计算机系党支部',
            parent_id=1,  # 注意：这里的ID需要根据实际插入顺序调整
            level=2,
            value='branch11'
        )
        branch12 = Branch(
            name='软件学院党支部',
            parent_id=1,
            level=2,
            value='branch12'
        )
        branch13 = Branch(
            name='网络工程党支部',
            parent_id=1,
            level=2,
            value='branch13'
        )
        branch21 = Branch(
            name='会计系党支部',
            parent_id=2,
            level=2,
            value='branch21'
        )
        branch22 = Branch(
            name='金融系党支部',
            parent_id=2,
            level=2,
            value='branch22'
        )
        branch31 = Branch(
            name='中国文学党支部',
            parent_id=3,
            level=2,
            value='branch31'
        )
        branch32 = Branch(
            name='外国语言党支部',
            parent_id=3,
            level=2,
            value='branch32'
        )
        branch41 = Branch(
            name='数学系党支部',
            parent_id=4,
            level=2,
            value='branch41'
        )
        branch42 = Branch(
            name='物理系党支部',
            parent_id=4,
            level=2,
            value='branch42'
        )

        # 添加所有数据
        db.session.add_all([
            committee1, committee2, committee3, committee4,
            branch11, branch12, branch13, branch21, branch22,
            branch31, branch32, branch41, branch42
        ])
        db.session.commit()