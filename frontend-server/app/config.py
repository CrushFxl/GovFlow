class ProductionConfig:
    BACKEND_SERVER_DOMAIN = "https://api.weactive.online"
    CHERRYPY = {
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 15261,
    }


class DevelopmentConfig:
    BACKEND_SERVER_DOMAIN = "http://127.0.0.1:15262"
    CHERRYPY = {
        'server.socket_host': '0.0.0.0',
        'server.socket_port': 80,
    }


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig
}
