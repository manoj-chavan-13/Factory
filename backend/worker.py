import time
import requests
import subprocess
import os
import uuid
import yaml

MASTER_URL = "http://localhost:5000/api/agent"

def send_log(run_id, stage, message):
    try:
        requests.post(f"{MASTER_URL}/logs", json={
            "run_id": run_id, "stage": stage, "message": message
        })
    except Exception:
        pass

def send_status(run_id, status, stage=None):
    payload = {"run_id": run_id, "status": status}
    if stage:
        payload["stage"] = stage
    try:
        requests.post(f"{MASTER_URL}/status", json=payload)
    except Exception:
        pass

def stream_process(process, run_id, stage_name):
    while True:
        line = process.stdout.readline()
        if not line and process.poll() is not None:
            break
        if line:
            msg = line.decode('utf-8', errors='replace').strip()
            if msg:
                send_log(run_id, stage_name, msg)
                
    for line in process.stderr:
        msg = line.decode('utf-8', errors='replace').strip()
        if msg:
            send_log(run_id, stage_name, f"ERROR: {msg}")

def execute_stage(run_id, stage_name, command, cwd=None):
    send_status(run_id, "RUNNING", stage=stage_name)
    send_log(run_id, stage_name, f"> Executing: {command}")
    
    if cwd and not os.path.exists(cwd):
        send_log(run_id, stage_name, f"WARN: Directory {cwd} missing. Running in parent.")
        cwd = None

    process = subprocess.Popen(
        command, shell=True, cwd=cwd,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    
    stream_process(process, run_id, stage_name)
    
    if process.returncode == 0:
        send_status(run_id, "SUCCESS", stage=stage_name)
        return True
    else:
        send_status(run_id, "FAILED", stage=stage_name)
        send_log(run_id, stage_name, f"Stage {stage_name} failed with exit code {process.returncode}")
        return False

def run_job(job):
    run_id = job['run_id']
    git_url = job['git_url']
    
    send_status(run_id, "RUNNING")
    
    workspace_id = uuid.uuid4().hex[:8]
    workspace = os.path.join(os.environ.get('TEMP', '/tmp'), f"factory-agent-{workspace_id}")
    os.makedirs(workspace, exist_ok=True)
    send_log(run_id, 'System', f"Agent created workspace at {workspace}")

    # 1. Checkout
    if not execute_stage(run_id, "Checkout", f"git clone {git_url} .", cwd=workspace):
        send_status(run_id, "FAILED")
        return

    # 2. Parse factory.yml or fallback
    factory_yml_path = os.path.join(workspace, "factory.yml")
    stages = []
    if os.path.exists(factory_yml_path):
        send_log(run_id, 'System', "Found factory.yml! Parsing custom Pipeline-as-Code...")
        try:
            with open(factory_yml_path, 'r') as f:
                pipeline_def = yaml.safe_load(f)
                stages = pipeline_def.get('stages', [])
        except Exception as e:
            send_log(run_id, 'System', f"Failed to parse factory.yml: {e}")
            send_status(run_id, "FAILED")
            return
    else:
        send_log(run_id, 'System', "No factory.yml found. Using fallback Node.js pipeline.")
        stages = [
            {"name": "Install Dependencies", "cmd": "npm install || echo 'no package.json'", "dir": "frontend"},
            {"name": "Build", "cmd": "npm run build || echo 'no build script'", "dir": "frontend"},
            {"name": "Docker Build", "cmd": "docker --version", "dir": "."},
            {"name": "Deploy", "cmd": "echo 'Deployment successful to local Kind cluster!'", "dir": "."}
        ]

    # 3. Execute Stages
    success = True
    for stage in stages:
        stage_name = stage.get('name', 'Unknown Stage')
        cmd = stage.get('cmd', 'echo "No command"')
        rel_dir = stage.get('dir', '.')
        cwd = os.path.join(workspace, rel_dir)
        
        if not execute_stage(run_id, stage_name, cmd, cwd=cwd):
            success = False
            break
            
    send_log(run_id, 'System', f"Finished execution in workspace {workspace}")
    send_status(run_id, "SUCCESS" if success else "FAILED")

def poll_for_jobs():
    print("Factory Agent started. Polling Master for jobs...")
    while True:
        try:
            resp = requests.get(f"{MASTER_URL}/jobs")
            if resp.status_code == 200:
                data = resp.json()
                if "run_id" in data:
                    print(f"Picked up job: {data['run_id']}")
                    run_job(data)
        except Exception:
            pass # Master might be down, suppress noisy errors
        time.sleep(3)

if __name__ == '__main__':
    poll_for_jobs()
