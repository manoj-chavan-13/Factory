from pymongo import MongoClient
from bson.objectid import ObjectId
from config import Config
from datetime import datetime

client = MongoClient(Config.MONGO_URI)
db = client.get_default_database()

class Project:
    collection = db['projects']

    @staticmethod
    def create(name, description, owner_id):
        project = {
            "name": name,
            "description": description,
            "owner_id": ObjectId(owner_id) if owner_id else None,
            "created_at": datetime.utcnow()
        }
        result = Project.collection.insert_one(project)
        return str(result.inserted_id)

    @staticmethod
    def get_all():
        projects = list(Project.collection.find({}))
        for p in projects:
            p['_id'] = str(p['_id'])
            if 'owner_id' in p and p['owner_id']: 
                p['owner_id'] = str(p['owner_id'])
        return projects
