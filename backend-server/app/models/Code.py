from . import db


class Code(db.Model):
    __tablename__ = 'codes'
    cid = db.Column('cid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    code = db.Column('code', db.Text, nullable=False)
    ctime = db.Column('ctime', db.Text, nullable=False)
