import os

class ProductionConfig:
    BACKEND_SERVER_DOMAIN = "http://10.112.101.34:15262"
    IFRAME_URL_KNOWLEDGE_MANAGE_PARAM = "http://10.112.101.48/"         # 嵌入RAG-Flow主页URL
    IFRAME_URL_LLM_MANAGE_PARAM = "http://10.112.101.34/"               # 嵌入Dify主页URL
    IFRAME_URL_PARAM = os.getenv('IFRAME_URL_PARAM')                    # 嵌入DIFY iframe参数(工作台)
    CHERRYPY = {
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 15261,
    }


class DevelopmentConfig:
    BACKEND_SERVER_DOMAIN = "http://127.0.0.1:15262"
    IFRAME_URL_KNOWLEDGE_MANAGE_PARAM = "http://127.0.0.1:8000/"
    IFRAME_URL_LLM_MANAGE_PARAM = "http://127.0.0.1/"
    IFRAME_URL_PARAM = "7UStbWTMDyO4e1Qx"                               # 嵌入Dify iframe参数(工作台)
    CHERRYPY = {
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 15261,
    }


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig
}
