from . import db
import json


def branch_description():
    text = f"""【表格名称】branches
    【表格描述】该表格用于存储组织架构中的党支部信息。
    【字段描述】
    - id, int, 主键, 自增
    - name, str, 党支部名称
    - parent_id, int, 外键, 指向父节点的id, 用于构建树状结构
    - level, int, 等级, 1表示党总委, 2表示二级党组织, 3表示基层党支部
    - value, str, 唯一值, 用于标识党支部, 例如'committee1', 'subcommittee11', 'branch111'等

    """
    return text


def branch_records_example():
    branches = Branch.query.limit(10).all()
    records = []
    for branch in branches:
        record = {
            'id': branch.id,
            'name': branch.name,
            'parent_id': branch.parent_id,
            'level': branch.level,
            'value': branch.value
        }
        records.append(record)
    return json.dumps(records, ensure_ascii=False)
    


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
            Branch(name='灵创大学党委', parent_id=None, level=1, value='committee1'),
            Branch(name='灵创信息工程学院党总支部', parent_id=1, level=2, value='subcommittee11'),
            Branch(name='灵创信息工程学院教工党支部', parent_id=2, level=3, value='branch111'),
            Branch(name='灵创信息工程学院学生党支部', parent_id=2, level=3, value='branch112')
        ]
        db.session.add_all(committees)
        db.session.commit()
        print('初始化党组织结构完成.')