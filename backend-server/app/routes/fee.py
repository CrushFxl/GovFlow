from re import sub
from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
import json
from datetime import datetime
from flask import request, jsonify
from app.models import db
from app.models.Profile import Profile
from app.models.Form import FormSubmission
from app.models.User import User


fee_bk = Blueprint('fee', __name__)


@fee_bk.route('/xxxxx', methods=['GET', 'POST'])
def xxxxx():
    pass