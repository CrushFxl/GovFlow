from app.config import config
import os
import requests
from flask import Blueprint, request, current_app, jsonify

ragflow_bk = Blueprint('ragflow', __name__, url_prefix='/ragflow')
ENV = os.getenv('ENV') or 'development'

@ragflow_bk.route('/upload', methods=['POST'])
def upload_file():
    dataset_id = config[ENV].RAGFLOW_DATASET_ID
    if 'file' not in request.files:
        return jsonify({'code': 400, 'data': None, 'msg': '缺少文件参数'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'code': 400, 'data': None, 'msg': '未选择文件'}), 400
    # 保存文件
    upload_dir = os.path.join(current_app.root_path, '..', 'instance', 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    file.save(file_path)
    base_url = config[ENV].RAGFLOW_API_URL.rstrip('/')
    url = f"{base_url}/api/v1/datasets/{dataset_id}/documents"
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(url, files=files, headers={'Authorization': f'Bearer {config[ENV].RAGFLOW_TOKEN}'})
        if response.status_code != 200:
            return jsonify({'code': response.status_code, 'data': {'prompt': '由于内部错误，文件上传失败。'}}), response.status_code
        prompt = f"\n文件上传成功，文档{file.filename}已添加到RAGFlow知识库，您可在知识库管理页面查看详细内容。\n"
        return jsonify({'code': 200, 'data': {'prompt': prompt}}), 200

@ragflow_bk.route('/chat', methods=['POST'])
def chat():
    pass