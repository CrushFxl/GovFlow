from datetime import datetime
from . import db


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


class FormControl(db.Model):
    __tablename__ = 'form_controls'

    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    form_id = db.Column('form_id', db.Integer, db.ForeignKey('forms.id'), nullable=False)
    type = db.Column('type', db.String(50), nullable=False)  # select, radio, text, etc.
    label = db.Column('label', db.String(100), nullable=False)
    placeholder = db.Column('placeholder', db.String(200), nullable=True)
    required = db.Column('required', db.Boolean, default=False)
    options = db.Column('options', db.Text, nullable=True)  # JSON格式存储选项
    order = db.Column('order', db.Integer, nullable=False, default=0)
    default_value = db.Column('default_value', db.Text, nullable=True)


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
        ]
        db.session.bulk_save_objects(default_forms)
        print("初始化表格完成.")

    if not FormControl.query.first():
        default_controls = [
            FormControl(form_id=1, type='text', label='培养人姓名', placeholder='例如：冯洋一', required=1, order=0),
            FormControl(form_id=1, type='text', label='培养人学号', placeholder='例如：6401230103', required=1, order=1),
            FormControl(form_id=1, type='radio', label='申请发展的政治面貌', required=1, order=2, options='["入党积极分子", "发展对象", "预备党员", "普通正式党员"]'),
            FormControl(form_id=1, type='textarea', label='附件或材料说明', placeholder='须详细描述培养人的基本情况、动机、组织谈话，以及必要的审批材料附件、审批意见。', required=1, order=3),
            FormControl(form_id=2, type='text', label='姓名', placeholder='请输入姓名', required=1, order=0),
            FormControl(form_id=2, type='text', label='缴纳党费金额', placeholder='例如：300.00，精确到小数点后两位。', required=1, order=1),
            FormControl(form_id=2, type='text', label='缴纳月份', required=1, order=2),
            FormControl(form_id=2, type='textarea', label='回执或截图材料', placeholder='材料可直接粘贴到此处', required=1, order=3),
            FormControl(form_id=3, type='text', label='被评议人姓名', placeholder='请输入评议要求中的被评议人姓名', required=1, order=0),
            FormControl(form_id=3, type='radio', label='（1-5评分）政治立场和理想信念', placeholder='', required=1, order=1),
            FormControl(form_id=3, type='radio', label='（1-5评分）工作作风和履职尽责', placeholder='', required=1, order=2),
            FormControl(form_id=3, type='radio', label='（1-5评分）道德品行和生活作风', placeholder='', required=1, order=3),
            FormControl(form_id=3, type='textarea', label='你对该同志其他评价', placeholder='请输入详细评价内容，可选。', required=1, order=4),
        ]
        db.session.bulk_save_objects(default_controls)
        print("初始化表格组件完成.")

    if not FormSubmission.query.first():
        default_submissions = [
            FormSubmission(form_id=1, user_id=143,
                           data="{\"培养人姓名\": \"冯洋一\", \"培养人学号\": \"6401230103\", \"申请发展的政治面貌\": \"入党积极分子\", \"附件或材料说明\": \"上级意见：同意\"}"),
            FormSubmission(form_id=1, user_id=143,
                           data="{\"培养人姓名\": \"冯洋一\", \"培养人学号\": \"6401230103\", \"申请发展的政治面貌\": \"发展对象\", \"附件或材料说明\": \"上级意见：同意，材料另送\"}"),
            FormSubmission(form_id=1, user_id=132,
                           data="{\"培养人姓名\": \"唐佳良\", \"培养人学号\": \"4003230303\", \"申请发展的政治面貌\": \"发展对象\", \"附件或材料说明\": \"上级意见：同意\"}"),
            FormSubmission(form_id=1, user_id=137,
                           data="{\"培养人姓名\": \"蒋伟祺\", \"培养人学号\": \"4003230117\", \"申请发展的政治面貌\": \"预备党员\", \"附件或材料说明\": \"上级意见：讨论通过\"}"),
            FormSubmission(form_id=1, user_id=138,
                           data="{\"培养人姓名\": \"王语佳\", \"培养人学号\": \"4003230228\", \"申请发展的政治面貌\": \"普通正式党员\", \"附件或材料说明\": \"上级意见：讨论通过\"}"),
            FormSubmission(form_id=2, user_id=101,
                           data="{\"姓名\": \"杨天化\", \"缴纳党费金额\": \"312.00\", \"缴纳月份\": \"9\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=101,
                           data="{\"姓名\": \"杨天化\", \"缴纳党费金额\": \"159.00\", \"缴纳月份\": \"9\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=143,
                           data="{\"姓名\": \"冯洋一\", \"缴纳党费金额\": \"112.00\", \"缴纳月份\": \"8\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=132,
                           data="{\"姓名\": \"唐佳良\", \"缴纳党费金额\": \"56.00\", \"缴纳月份\": \"7\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=137,
                           data="{\"姓名\": \"蒋伟祺\", \"缴纳党费金额\": \"400.00\", \"缴纳月份\": \"4\", \"回执或截图材料\": \"无\"}"),
            FormSubmission(form_id=2, user_id=138,
                           data="{\"姓名\": \"王语佳\", \"缴纳党费金额\": \"178.00\", \"缴纳月份\": \"2\", \"回执或截图材料\": \"无\"}"),
        ]
        db.session.bulk_save_objects(default_submissions)
        print("初始化表格提交记录完成.")
    db.session.commit()
