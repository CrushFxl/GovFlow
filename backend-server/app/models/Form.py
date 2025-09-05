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

    def __init__(self, name, description, created_uid, created_realname=None):
        self.name = name
        self.description = description
        self.created_uid = created_uid
        self.created_realname = created_realname


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

    def __init__(self, form_id, type, label, order, placeholder=None, required=False, options=None, default_value=None):
        self.form_id = form_id
        self.type = type
        self.label = label
        self.placeholder = placeholder
        self.required = required
        self.options = options
        self.order = order
        self.default_value = default_value


class FormSubmission(db.Model):
    __tablename__ = 'form_submissions'
    
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    form_id = db.Column('form_id', db.Integer, db.ForeignKey('forms.id'), nullable=False)
    user_id = db.Column('user_id', db.Integer, nullable=False)
    user_realname = db.Column('user_realname', db.String(50), nullable=True)
    data = db.Column('data', db.Text, nullable=False)  # JSON格式存储表单数据
    created_at = db.Column('created_at', db.DateTime, default=datetime.now)
    
    # 与Form建立多对一关系
    form = db.relationship('Form', backref='submissions', lazy=True)
    
    def __init__(self, form_id, user_id, data, user_realname=None, status=0):
        self.form_id = form_id
        self.user_id = user_id
        self.data = data
        self.user_realname = user_realname
        self.status = status