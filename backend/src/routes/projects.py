from flask import Blueprint, jsonify, request
from src.models.project import Project

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['GET'])
def get_projects():
    # Mocking data if MongoDB is empty for UI showcase
    projects = Project.get_all()
    if not projects:
        projects = [
            {"_id": "1", "name": "Frontend Web App", "description": "Main React Application", "status": "SUCCESS"},
            {"_id": "2", "name": "Auth Service", "description": "Go Microservice", "status": "FAILED"},
            {"_id": "3", "name": "Data Pipeline", "description": "Python ETL Job", "status": "RUNNING"}
        ]
    return jsonify(projects)

@projects_bp.route('/', methods=['POST'])
def create_project():
    data = request.json
    pid = Project.create(data.get('name'), data.get('description'), data.get('owner_id'))
    return jsonify({"id": pid}), 201
