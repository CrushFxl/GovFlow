import requests
import json
import os
from app.models import db
from app.models.Activity import Activity

from flask import Blueprint, request, session


activity_bk = Blueprint('activity', __name__, url_prefix='/activity')
JSON_AGENT_API_KEY = os.getenv('JSON_AGENT_API_KEY')

headers = {
    'Authorization': f'Bearer {JSON_AGENT_API_KEY}',
    'Content-Type': 'application/json'
}
json_agent_url = 'http://127.0.0.1/v1/workflows/run'


@activity_bk.post('/json')
def get_activity_json():
    content = request.form.get('content')
    data = {
        "inputs": {
            "user_content": content
        },
        "response_mode": "blocking",
        "user": "GovFlow-backend-server"
    }
    response = requests.post(json_agent_url, headers=headers, json=data)
    resp = response.json()
    result = resp['data']['outputs'].get('structured_output')
    print(resp)
    result['acid'] = resp['task_id']
    result['organizations'] = resp['data']['outputs']['real_organs']
    result['partners'] = resp['data']['outputs']['real_partners']
    activity = Activity(acid=result['acid'], raw=content)
    db.session.add(activity)
    db.session.commit()
    return {'code': 1000, 'msg': 'ok', 'data': result}


@activity_bk.post('/save')
def save_activity():
    req_data = request.get_json()
    data = req_data.get('data')
    acid = data['acid']
    activity = Activity.query.filter_by(acid=acid).first()
    if not activity:
        return {'code': 2000, 'msg': 'wrong acid', 'data': {'acid': acid}}
    activity.data = data
    activity.status = 300
    db.session.commit()
    return {'code': 1000, 'msg': 'ok', 'data': {'acid': acid}}


@activity_bk.post('/query')
def query_activities():
    activities = Activity.query.filter_by(status=300).all()
    data_list = []
    for activity in activities:
        data_list.append(activity.data)
    return {'code': 1000, 'msg': 'ok', 'data': data_list}







