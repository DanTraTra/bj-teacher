from backend.models.models import db, UserScore

# Create tables
db.connect()

# Drop the tables if they exist
# db.drop_tables([UserScore], safe=True, cascade=True)
db.create_tables([UserScore])
