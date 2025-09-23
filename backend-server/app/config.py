import os
from datetime import timedelta


class BaseConfig:
    PERMANENT_SESSION_LIFETIME = timedelta(days=365)
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class ProductionConfig(BaseConfig):
    CHERRYPY = {
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 15262,
    }
    FRONTEND_SERVER_DOMAIN = "http://10.112.101.34:15261"
    RAGFLOW_API_URL = "http://10.112.101.48"                # RAG-Flow URL
    RAGFLOW_TOKEN = os.getenv('RAGFLOW_TOKEN')              # RAG-Flow 访问令牌
    RAGFLOW_DATASET_ID = os.getenv('RAGFLOW_DATASET_ID')    # RAG-Flow 上传指定的数据库ID
    # SESSION_COOKIE_DOMAIN = ".weactive.online"
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_ECHO = False
    DINGTALK_APPSECRET = os.getenv('DINGTALK_APPSECRET')


class DevelopmentConfig(BaseConfig):
    CHERRYPY = {
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 15262,
        'engine.autoreload.on': True
    }
    FRONTEND_SERVER_DOMAIN = "http://127.0.0.1:15261"
    RAGFLOW_API_URL = "http://127.0.0.1:8000"                           # RAG-Flow URL
    RAGFLOW_TOKEN = "ragflow-FmN2NlNTcwOTgzODExZjBhZjBmOGU5OD"          # RAG-Flow 访问令牌
    RAGFLOW_DATASET_ID = "b5a441ea983a11f0af3ffac0894185ad"             # RAG-Flow 上传指定的数据库ID
    SQLALCHEMY_DATABASE_URI = "sqlite:///./gov.db"
    SECRET_KEY = 'WeactiveKey2023'
    SQLALCHEMY_ECHO = False
    DINGTALK_APPSECRET = os.getenv('DINGTALK_APPSECRET')


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig
}
