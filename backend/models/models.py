from peewee import *
from playhouse.postgres_ext import BinaryJSONField

# Connect to your PostgreSQL database
db = PostgresqlDatabase(
    'ebdb',
    user='bjteacher',
    password='7<`X15c#2rtS',
    host='awseb-e-ae4hy35gm2-stack-awsebrdsdatabase-hj9pirul4rvz.cl2wg0ma2r6v.ap-southeast-2.rds.amazonaws.com',
    port=5432,
)


# Define your Peewee model
class UserScore(Model):
    id = AutoField(null=False)
    username = CharField()
    game_log_data = BinaryJSONField(null=True)

    class Meta:
        database = db

