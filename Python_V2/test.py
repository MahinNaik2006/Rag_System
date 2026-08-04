import mysql.connector

try:
    conn = mysql.connector.connect(
        host="127.0.0.1",
        port=3307,
        user="root",
        password="Ashok",
        database="ai_tutor"
    )

    print("✅ Connected to MySQL")

    cursor = conn.cursor(dictionary=True)

    # Count documents
    cursor.execute("SELECT COUNT(*) AS total FROM documents")
    result = cursor.fetchone()

    print(f"\n📄 Total Chunks : {result['total']}")

    # Show one sample
    cursor.execute("""
        SELECT
            id,
            topic,
            file_name,
            page_number,
            chunk_index
        FROM documents
        LIMIT 1
    """)

    row = cursor.fetchone()

    print("\nSample Document")
    print("---------------------------")

    if row:
        for key, value in row.items():
            print(f"{key}: {value}")

    conn.close()

    print("\n✅ Database Test Successful")

except Exception as e:

    print("❌ Database Test Failed")
    print(e)