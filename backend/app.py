from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from src.routes.projects import projects_bp

app = Flask(__name__)
app.config.from_object('config.Config')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

app.register_blueprint(projects_bp, url_prefix='/api/projects')

@app.route('/api/pipelines/<run_id>/trigger', methods=['POST'])
def trigger_pipeline(run_id):
    from src.engine.runner import simulate_pipeline
    git_url = request.args.get('git_url', 'https://github.com/manoj-chavan-13/Factory-.git')
    simulate_pipeline(run_id, socketio, git_url)
    return jsonify({"message": f"Pipeline {run_id} started"}), 202

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "service": "Factory Core Engine"})

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
