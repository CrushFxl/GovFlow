import os

class ProductionConfig:
    BACKEND_SERVER_DOMAIN = "http://10.112.101.34:15262"
    IFRAME_URL_PARAM = os.getenv('IFRAME_URL_PARAM')  # 嵌入DIFY iframe URL参数
    CHERRYPY = {
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 15261,
    }


class DevelopmentConfig:
    BACKEND_SERVER_DOMAIN = "http://127.0.0.1:15262"
    IFRAME_URL_PARAM = "lmoe7tN1xyYKSr3j"  # 嵌入DIFY iframe URL参数
    CHERRYPY = {
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 15261,
    }


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig
}
