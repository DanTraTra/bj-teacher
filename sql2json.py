import psycopg2
import json

# Replace these with your actual database credentials
db_config = {
    'dbname': 'ebdb',
    'user': 'bjteacher',
    'password': '7<`X15c#2rtS',
    'host': 'awseb-e-ae4hy35gm2-stack-awsebrdsdatabase-hj9pirul4rvz.cl2wg0ma2r6v.ap-southeast-2.rds.amazonaws.com',
    'port': '5432'
}

def fetch_data_from_sql():
    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor()

        # Define your SQL query to fetch data
        cur.execute("SELECT id, username, game_log_data FROM public.userscore;")
        rows = cur.fetchall()

        # Convert to JSON format
        data = []
        for row in rows:
            record = {
                'id': row[0],
                'username': row[1],
                'game_log_data': row[2]
            }
            data.append(record)

        cur.close()
        conn.close()
        return data

    except Exception as e:
        print(f"Error: {e}")
        return []

def save_to_json(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=4)

def main():
    data = fetch_data_from_sql()
    if data:
        save_to_json(data, 'output.json')
        print("Data successfully converted to JSON and saved as output.json")
    else:
        print("No data fetched from the database.")

if __name__ == "__main__":
    main()
