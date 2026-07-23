import time
from threading import Thread

def simulate_pipeline(run_id, socketio):
    def run():
        stages = [
            {"name": "Checkout", "duration": 2, "logs": ["git clone https://github.com/...", "Resolving deltas... 100%", "Checkout complete."]},
            {"name": "Install Dependencies", "duration": 3, "logs": ["npm install", "added 124 packages in 3s", "audited 125 packages"]},
            {"name": "Build", "duration": 4, "logs": ["npm run build", "vite v5.0.0 building for production...", "✓ 34 modules transformed.", "build complete."]},
            {"name": "Docker Build", "duration": 3, "logs": ["docker build -t app:latest .", "Step 1/5 : FROM node:18", "Step 2/5 : COPY . .", "Successfully built e4b5c6"]},
            {"name": "Deploy", "duration": 2, "logs": ["kubectl apply -f k8s/", "deployment.apps/app created", "Waiting for rollout to finish...", "Deployment successful."]}
        ]
        
        socketio.emit('pipeline_status', {'run_id': run_id, 'status': 'RUNNING'})
        time.sleep(1)

        for stage in stages:
            socketio.emit('stage_update', {'run_id': run_id, 'stage': stage['name'], 'status': 'RUNNING'})
            for log in stage['logs']:
                socketio.emit('pipeline_log', {'run_id': run_id, 'stage': stage['name'], 'message': log})
                time.sleep(stage['duration'] / len(stage['logs']))
            socketio.emit('stage_update', {'run_id': run_id, 'stage': stage['name'], 'status': 'SUCCESS'})
            time.sleep(0.5)
            
        socketio.emit('pipeline_status', {'run_id': run_id, 'status': 'SUCCESS'})

    Thread(target=run).start()
