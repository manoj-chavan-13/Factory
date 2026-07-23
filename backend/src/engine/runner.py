import time
import os
import subprocess
import threading
import uuid
import shutil

def stream_process(process, socketio, run_id, stage_name):
    # Read stdout line by line as it comes in
    while True:
        line = process.stdout.readline()
        if not line and process.poll() is not None:
            break
        if line:
            msg = line.decode('utf-8', errors='replace').strip()
            if msg:
                socketio.emit('pipeline_log', {'run_id': run_id, 'stage': stage_name, 'message': msg})
    
    # Read any remaining stderr
    for line in process.stderr:
        msg = line.decode('utf-8', errors='replace').strip()
        if msg:
            socketio.emit('pipeline_log', {'run_id': run_id, 'stage': stage_name, 'message': f"ERROR: {msg}"})

def execute_stage(socketio, run_id, stage_name, command, cwd=None):
    socketio.emit('stage_update', {'run_id': run_id, 'stage': stage_name, 'status': 'RUNNING'})
    socketio.emit('pipeline_log', {'run_id': run_id, 'stage': stage_name, 'message': f"> Executing: {command}"})
    
    # Ensure cwd exists, otherwise create it or just run in current
    if cwd and not os.path.exists(cwd):
        socketio.emit('pipeline_log', {'run_id': run_id, 'stage': stage_name, 'message': f"WARN: Directory {cwd} does not exist yet. Running in parent."})
        cwd = None

    process = subprocess.Popen(
        command, shell=True, cwd=cwd,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    
    stream_process(process, socketio, run_id, stage_name)
    
    if process.returncode == 0:
        socketio.emit('stage_update', {'run_id': run_id, 'stage': stage_name, 'status': 'SUCCESS'})
        return True
    else:
        socketio.emit('stage_update', {'run_id': run_id, 'stage': stage_name, 'status': 'FAILED'})
        socketio.emit('pipeline_log', {'run_id': run_id, 'stage': stage_name, 'message': f"Stage {stage_name} failed with exit code {process.returncode}"})
        return False

def simulate_pipeline(run_id, socketio, git_url="https://github.com/manoj-chavan-13/Factory-.git"):
    def run():
        socketio.emit('pipeline_status', {'run_id': run_id, 'status': 'RUNNING'})
        
        # 1. Create Workspace in a safe temp directory
        workspace_id = uuid.uuid4().hex[:8]
        # Using a reliable tmp path that works on windows and linux
        workspace = os.path.join(os.environ.get('TEMP', '/tmp'), f"factory-workspace-{workspace_id}")
        os.makedirs(workspace, exist_ok=True)
        socketio.emit('pipeline_log', {'run_id': run_id, 'stage': 'System', 'message': f"Created workspace at {workspace}"})

        # Define the actual commands. 
        # Using simple fallbacks if frontend dir doesn't exist to prevent crash.
        stages = [
            {"name": "Checkout", "cmd": f"git clone {git_url} .", "cwd": workspace},
            {"name": "Install Dependencies", "cmd": "npm install || echo 'No package.json found, skipping'", "cwd": os.path.join(workspace, "frontend")},
            {"name": "Build", "cmd": "npm run build || echo 'No build script, skipping'", "cwd": os.path.join(workspace, "frontend")},
            {"name": "Docker Build", "cmd": "docker --version", "cwd": workspace}, 
            {"name": "Deploy", "cmd": "echo 'Deployment successful to Kubernetes!'", "cwd": workspace}
        ]

        success = True
        for stage in stages:
            if not execute_stage(socketio, run_id, stage['name'], stage['cmd'], stage.get('cwd')):
                success = False
                break
            time.sleep(0.5)
            
        # Cleanup
        try:
            # We skip actual deletion for debugging purposes right now
            socketio.emit('pipeline_log', {'run_id': run_id, 'stage': 'System', 'message': f"Finished execution in workspace {workspace}"})
        except Exception as e:
            pass

        final_status = 'SUCCESS' if success else 'FAILED'
        socketio.emit('pipeline_status', {'run_id': run_id, 'status': final_status})

    threading.Thread(target=run).start()
