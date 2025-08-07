import os
import cherrypy

from app import create_app

ENV = os.getenv('ENV') or 'production'  # 设置上线环境

app = create_app(ENV)
conf = dict(app.config.items())

if __name__ == '__main__':
    cherrypy.tree.graft(app.wsgi_app, '/')
    cherrypy.config.update(conf['CHERRYPY'])
    cherrypy.engine.start()
