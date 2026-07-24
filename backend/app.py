from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
from src.routes.projects import projects_bp

app = Flask(__name__)
app.config.from_object('config.Config')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

app.register_blueprint(projects_bp, url_prefix='/api/projects')

# Simple in-memory queue for the Master-Agent architecture
job_queue = []

# --- Frontend triggers a build ---
@app.route('/api/pipelines/<run_id>/trigger', methods=['POST'])
def trigger_pipeline(run_id):
    git_url = request.args.get('git_url', 'https://github.com/manoj-chavan-13/Factory-.git')
    # Add to queue instead of running locally
    job_queue.append({
        "run_id": run_id,
        "git_url": git_url
    })
    socketio.emit('pipeline_status', {'run_id': run_id, 'status': 'QUEUED'})
    return jsonify({"message": f"Pipeline {run_id} queued"}), 202

# --- Agent (Worker) Endpoints ---
@app.route('/api/agent/jobs', methods=['GET'])
def get_job():
    if job_queue:
        return jsonify(job_queue.pop(0))
    return jsonify({"status": "empty"}), 200

@app.route('/api/agent/logs', methods=['POST'])
def receive_logs():
    data = request.json
    socketio.emit('pipeline_log', data)
    return jsonify({"status": "ok"}), 200

@app.route('/api/agent/status', methods=['POST'])
def update_status():
    data = request.json
    if 'stage' in data:
        socketio.emit('stage_update', data)
    else:
        socketio.emit('pipeline_status', data)
    return jsonify({"status": "ok"}), 200

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "service": "Factory Master Engine"})

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
