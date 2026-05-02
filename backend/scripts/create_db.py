import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        con = psycopg2.connect(dbname='postgres', user='postgres', host='localhost', password='NewPassword123')
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        cur.execute('CREATE DATABASE distress_db')
        print("Database distress_db created successfully!")
        cur.close()
        con.close()
    except psycopg2.Error as e:
        if "already exists" in str(e):
            print("Database distress_db already exists.")
        else:
            print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
