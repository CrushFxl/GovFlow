import os

from .. import config
from .index import index_ft
from .home import home_ft
from .register import register_ft


routes = [
    index_ft,
    home_ft,
    register_ft
]


URL = config[os.getenv('ENV') or 'production'].BACKEND_SERVER_DOMAIN
for route in routes:
    @route.context_processor
    def inject():
        return {'URL': URL}
