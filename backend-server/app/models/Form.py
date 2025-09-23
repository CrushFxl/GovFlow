from datetime import datetime
from . import db


def form_description():
    text = """【表格名称】forms
    【表格描述】用于存储用户自定义的表格。
    【字段描述】
    - id, int, 主键, 自增
    - name, str, 表格名称
    - description, str, 表格描述
    - created_uid, int, 创建用户的UID
    - created_realname, str, 创建用户的真实姓名
    - created_at, datetime, 创建时间
    - updated_at, datetime, 更新时间
    - is_protected, int(0/1), 是否受保护，受保护的表格不可删除
    
    """
    return text


class Form(db.Model):
    __tablename__ = 'forms'

    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('name', db.String(100), nullable=False)
    description = db.Column('description', db.Text, nullable=True)
    created_uid = db.Column('created_uid', db.Integer, nullable=False)
    created_realname = db.Column('created_realname', db.String(50), nullable=True)
    created_at = db.Column('created_at', db.DateTime, default=datetime.now)
    updated_at = db.Column('updated_at', db.DateTime, default=datetime.now, onupdate=datetime.now)
    is_active = db.Column('is_active', db.Boolean, default=True)
    is_protected = db.Column('is_protected', db.Integer, default=0)

    # 与FormControl建立一对多关系
    controls = db.relationship('FormControl', backref='form', lazy=True, cascade='all, delete-orphan')


def from_contorl_description():
    text = """【表格名称】form_contorls
    【表格描述】用于存储用户自定义的表格中具体的控件。
    【字段描述】
    - id, int, 主键, 自增
    - form_id, int, 该控件所属的表格ID
    - type, str, 控件类型, 共有5种, 分别为select(多选), radio(单选), text(填空), textarea(文本)
    - label, str, 控件标题
    - placeholder, str, 控件提示说明
    - required, bool, 是否必填
    - options, str, 控件选项, 当type为select或radio时, 该字段为列表, 例如：['苹果', '香蕉', '菠萝']
    - order, int, 控件顺序, 用于确定一张表格中控件的排列顺序
    - default_value, str, 控件的默认值
    
    """
    return text


class FormControl(db.Model):
    __tablename__ = 'form_controls'

    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    form_id = db.Column('form_id', db.Integer, db.ForeignKey('forms.id'), nullable=False)
    related_uuid = db.Column('related_uuid', db.Text, nullable=True)
    type = db.Column('type', db.String(50), nullable=False)  # select, radio, text, etc.
    label = db.Column('label', db.String(100), nullable=False)
    placeholder = db.Column('placeholder', db.String(200), nullable=True)
    required = db.Column('required', db.Boolean, default=False)
    options = db.Column('options', db.Text, nullable=True)  # JSON格式存储选项
    order = db.Column('order', db.Integer, nullable=False, default=0)
    default_value = db.Column('default_value', db.Text, nullable=True)


def form_submission_description():
    text = """【表格名称】form_submissions
    【表格描述】用于存储用户自定义的表格的填写记录。
    【字段描述】
    - id, int, 主键, 自增
    - form_id, int, 该提交记录所属的表格ID
    - related_uuid, str, 该表格填写记录关联的Task UUID
    - user_id, int, 提交用户的UID
    - data, str, 提交的数据, 格式为JSON, 例如：{"姓名": "张三", "学号": "6401230103"}, 键为表格控件的label
    - status, int, 提交状态（此字段已弃用）
    - created_at, datetime, 提交时间
    """
    return text


class FormSubmission(db.Model):
    __tablename__ = 'form_submissions'

    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    form_id = db.Column('form_id', db.Integer, db.ForeignKey('forms.id'), nullable=False)
    user_id = db.Column('user_id', db.Integer, nullable=False)
    data = db.Column('data', db.Text, nullable=False)  # JSON格式存储表单数据
    status = db.Column('status', db.Integer, default=0)  # 0: 待处理, 1: 已同意, 2: 已拒绝
    created_at = db.Column('created_at', db.DateTime, default=datetime.now)

    # 与Form建立多对一关系
    form = db.relationship('Form', backref='submissions', lazy=True)


def init_forms():
    if not Form.query.first():
        default_forms = [
            Form(name='党员发展申请表', description='用于入党积极分子、发展对象和预备党员的培养。',
                 created_uid=101, created_realname='系统管理员', is_protected=1),
            Form(name='党费缴纳信息表', description='党员缴纳党费后需填写此回执。',
                 created_uid=101, created_realname='系统管理员', is_protected=1),
            Form(name='民主评议评价表', description='此表用于收集党内成员评价。',
                 created_uid=101, created_realname='系统管理员', is_protected=1),
            Form(name='三会一课记录表', description='支部党员大会、支部委员会、党小组会和党课的召开记录。',
                 created_uid=101, created_realname='系统管理员', is_protected=1),
            Form(name='主题党日心得收集表', description='主题党日心得收集表，一般不少于200字',
                 created_uid=101, created_realname='系统管理员', is_protected=1),

        ]
        db.session.bulk_save_objects(default_forms)
        print("初始化表格完成.")

    if not FormControl.query.first():
        default_controls = [
            FormControl(form_id=1, type='text', label='培养人姓名', placeholder='例如：冯小二', required=1, order=0),
            FormControl(form_id=1, type='text', label='培养人学号', placeholder='例如：6401XXXX03', required=1, order=1),
            FormControl(form_id=1, type='radio', label='发展阶段', required=1, order=2, options='["入党积极分子", "发展对象", "预备党员", "普通正式党员"]'),
            FormControl(form_id=1, type='text', label='确定发展时间', required=1, order=3, placeholder='格式：YYYY-MM-DD'),
            FormControl(form_id=1, type='textarea', label='附件或材料说明', placeholder='须详细描述培养人的基本情况、动机、组织谈话，以及必要的审批材料附件、审批意见。', required=1, order=4),
            FormControl(form_id=2, type='text', label='姓名', placeholder='请输入姓名', required=1, order=0),
            FormControl(form_id=2, type='text', label='缴纳党费金额', placeholder='例如：300.00，精确到小数点后两位。', required=1, order=1),
            FormControl(form_id=2, type='text', label='缴纳月份', required=1, order=2),
            FormControl(form_id=2, type='textarea', label='回执或截图材料', placeholder='材料可直接粘贴到此处', required=1, order=3),
            FormControl(form_id=3, type='text', label='被评议人姓名', placeholder='请输入评议要求中的被评议人姓名', required=1, order=0),
            FormControl(form_id=3, type='radio', label='评议结果', options='["优秀", "合格", "不合格"]', required=1, order=1),
            FormControl(form_id=3, type='textarea', label='该同志的评价', placeholder='请总结评价该同志，100字左右。', required=1, order=2),
            FormControl(form_id=4, type='text', label='会议标题', placeholder='请输入会议标题', required=1, order=0),
            FormControl(form_id=4, type='radio', label='会议类型', options='["支部党员大会", "支部委员会", "党小组会", "党课"]', required=1, order=1),
            FormControl(form_id=4, type='textarea', label='会议纪要', placeholder='请输入会议纪要', required=1, order=2),
            FormControl(form_id=5, type='text', label='主题党日活动名称', placeholder='请输入主题党日活动名称', required=1, order=0),
            FormControl(form_id=5, type='text', label='姓名', placeholder='请输入姓名', required=1, order=1),
            FormControl(form_id=5, type='textarea', label='心得内容', placeholder='请输入详细心得内容，不少于200字。', required=1, order=2)
        ]
        db.session.bulk_save_objects(default_controls)
        print("初始化表格组件完成.")

    if not FormSubmission.query.first():
        default_submissions = [
            FormSubmission(form_id=1, user_id=143,
                           data="{\"培养人姓名\": \"冯小二\", \"培养人学号\": \"6401230103\", \"申请发展的政治面貌\": \"入党积极分子\", \"附件或材料说明\": \"上级意见：同意\"}"),
            FormSubmission(form_id=1, user_id=143,
                           data="{\"培养人姓名\": \"冯小二\", \"培养人学号\": \"6401230103\", \"申请发展的政治面貌\": \"发展对象\", \"附件或材料说明\": \"上级意见：同意，材料另送\"}"),
            FormSubmission(form_id=1, user_id=132,
                           data="{\"培养人姓名\": \"唐小二\", \"培养人学号\": \"4003230303\", \"申请发展的政治面貌\": \"发展对象\", \"附件或材料说明\": \"上级意见：同意\"}"),
            FormSubmission(form_id=1, user_id=137,
                           data="{\"培养人姓名\": \"蒋小二\", \"培养人学号\": \"4003230117\", \"申请发展的政治面貌\": \"预备党员\", \"附件或材料说明\": \"上级意见：讨论通过\"}"),
            FormSubmission(form_id=1, user_id=138,
                           data="{\"培养人姓名\": \"王小二\", \"培养人学号\": \"4003230228\", \"申请发展的政治面貌\": \"普通正式党员\", \"附件或材料说明\": \"上级意见：讨论通过\"}"),
            FormSubmission(form_id=2, user_id=101,
                           data="{\"姓名\": \"杨小二\", \"缴纳党费金额\": \"312.00\", \"缴纳月份\": \"9\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=101,
                           data="{\"姓名\": \"杨小二\", \"缴纳党费金额\": \"159.00\", \"缴纳月份\": \"9\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=143,
                           data="{\"姓名\": \"冯小二\", \"缴纳党费金额\": \"112.00\", \"缴纳月份\": \"8\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=132,
                           data="{\"姓名\": \"唐小二\", \"缴纳党费金额\": \"56.00\", \"缴纳月份\": \"7\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=137,
                           data="{\"姓名\": \"蒋小二\", \"缴纳党费金额\": \"400.00\", \"缴纳月份\": \"4\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=138,
                           data="{\"姓名\": \"王小二\", \"缴纳党费金额\": \"178.00\", \"缴纳月份\": \"2\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=3, user_id=138,
                           data="{\"被评议人姓名\": \"王小二\", \"评议结果\": \"优秀\",  \"该同志的评价\": \"该同志政治素养高，业务能力精湛，是团队的核心骨干。在重点项目中主动担当，攻坚克难，出色地完成了任务，起到了极强的模范带头作用。\"}",
                           created_at=datetime(2019, 1, 1)),
            FormSubmission(form_id=3, user_id=138,
                           data="{\"被评议人姓名\": \"王小二\", \"评议结果\": \"优秀\",  \"该同志的评价\": \"该同志工作态度端正，做事认真踏实，能较好地完成本职工作和领导交办的各项任务。遵守纪律，服从安排，是一名可靠的员工。\"}",
                           created_at=datetime(2020, 1, 1)),
            FormSubmission(form_id=3, user_id=138,
                           data="{\"被评议人姓名\": \"王小二\", \"评议结果\": \"合格\",  \"该同志的评价\": \" 该同志工作表现平稳，学习能力良好。能按时完成常规工作任务，与同事关系融洽。希望在工作的创新性和主动性上继续加强。\"}",
                           created_at=datetime(2021, 1, 1)),
            FormSubmission(form_id=3, user_id=138,
                           data="{\"被评议人姓名\": \"王小二\", \"评议结果\": \"合格\",  \"该同志的评价\": \"该同志基本能履行岗位职责，保证工作的正常运转。但在处理复杂任务时稍显吃力，工作效率和质量有进一步提升的空间，需加强学习。\"}",
                           created_at=datetime(2022, 1, 1)),
            FormSubmission(form_id=3, user_id=138,
                           data="{\"被评议人姓名\": \"王小二\", \"评议结果\": \"合格\",  \"该同志的评价\": \"该同志大局意识强，富有奉献精神。不仅自身工作扎实，更乐于分享经验，积极协助同事共同成长，为营造团结向上的团队氛围作出了突出贡献。\"}",
                           created_at=datetime(2023, 1, 1)),
            FormSubmission(form_id=3, user_id=138,
                           data="{\"被评议人姓名\": \"王小二\", \"评议结果\": \"不合格\", \"该同志的评价\": \"该同志工作责任心欠缺，多次未能达到基本的工作要求和考核标准。经多次提醒与帮助仍无改进，对团队工作造成了负面影响，表现不合格。\"}",
                           created_at=datetime(2024, 1, 1)),
            FormSubmission(form_id=4, user_id=138,
                           data="{\"会议标题\": \"讨论社团财务报销拨款事宜\", \"会议类型\": \"党小组会\", \"会议纪要\": \"审议通过关于拨款给医学信息与智能协会的下一年度财务计划。\"}"),
            FormSubmission(form_id=5, user_id=143,
                           data="{\"主题党日活动名称\": \"激扬文化自信\", \"姓名\": \"冯洋一\", \"心得内容\": \"通过系统学习习近平文化思想，理解两个结合的重大意义，增强对中华文化的认同感和自豪感。\"}"),
        ]
        db.session.bulk_save_objects(default_submissions)
        print("初始化表格提交记录完成.")
    db.session.commit()
