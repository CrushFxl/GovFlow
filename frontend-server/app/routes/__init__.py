import os

from .. import config
from .index import index_ft
from .home import home_ft
from .register import register_ft


# ע�����ͼ�б�
routes = [
    index_ft,
    home_ft,
    register_ft
]


# ע��ȫ��ģ�����
URL = config[os.getenv('ENV') or 'production'].BACKEND_SERVER_DOMAIN
for route in routes:
    @route.context_processor
    def inject():
        return {'URL': URL}
