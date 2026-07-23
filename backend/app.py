from flask import Flask, jsonify
from flask_socketio import SocketIO

app = Flask(__name__)
app.config.from_object('config.Config')

socketio = SocketIO(app, cors_allowed_origins="*")

# We will register blueprints later
# app.register_blueprint(projects_bp, url_prefix='/api/projects')

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "service": "Factory Core Engine"})

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
