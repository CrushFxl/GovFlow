import os

from .. import config
from .index import index_ft
from .home import home_ft


# 注册的蓝图列表
routes = [
    index_ft,
    home_ft
]


# 注入全局模板变量
URL = config[os.getenv('ENV') or 'production'].BACKEND_SERVER_DOMAIN
for route in routes:
    @route.context_processor
    def inject():
        return {'URL': URL}
