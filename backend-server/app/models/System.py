from . import db
import os
from app.config import config

class System(db.Model):
    __tablename__ = 'system_settings'
    
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    key = db.Column('key', db.String(50), unique=True, nullable=False)
    value = db.Column('value', db.Text, nullable=True)
    description = db.Column('description', db.String(200), nullable=True)
    
    def __init__(self, key, value=None, description=None):
        self.key = key
        self.value = value
        self.description = description

    def to_dict(self):
        return {
            'key': self.key,
            'value': self.value,
            'description': self.description,
        }

def init_system_settings():
    ENV = os.getenv('ENV') or 'production'
    if not System.query.first():
        default_settings = [
            System(key='system_password', value='123456', description='系统设置访问密码'),
            System(key='dingtalk_url', value='http://xxdb.hmc.edu.cn:9088', description='钉钉App URL'),
            System(key='dingtalk_appkey', value='98e55883-323b-42da-86b2-ff96f0024ecd', description='钉钉App Key'),
            System(key='dingtalk_appsecret', value=config[ENV].DINGTALK_APPSECRET, description='钉钉App Secret(敏感)'),
        ]
        db.session.bulk_save_objects(default_settings)
        db.session.commit()
        print("初始化系统设置完成.")
