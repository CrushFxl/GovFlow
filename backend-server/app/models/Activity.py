from . import db


class Activity(db.Model):
    __tablename__ = 'activities'
    acid = db.Column('acid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    raw = db.Column('raw', db.Text, nullable=False)
    data = db.Column('data', db.JSON, nullable=True)
    status = db.Column('status', db.Integer, nullable=False, default=0)
