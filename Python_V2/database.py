import mysql.connector
from mysql.connector import Error


class Database:

    def __init__(self):

        self.host = "127.0.0.1"
        self.port = 3307
        self.user = "root"
        self.password = "Ashok"
        self.database = "ai_tutor"

        self.connection = None
        self.cursor = None

        self.connect()

    # ----------------------------------
    # Connect
    # ----------------------------------

    def connect(self):

        try:

            if self.connection and self.connection.is_connected():
                return

            self.connection = mysql.connector.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database
            )

            self.cursor = self.connection.cursor(dictionary=True)

            print("✅ Connected to MySQL")

        except Error as e:

            print("❌ Database Error:", e)

            self.connection = None
            self.cursor = None

    # ----------------------------------
    # Ensure Connection
    # ----------------------------------

    def ensure_connection(self):

        if self.connection is None:

            self.connect()

            return

        if not self.connection.is_connected():

            self.connect()

    # ----------------------------------
    # Disconnect
    # ----------------------------------

    def disconnect(self):

        try:

            if self.cursor:
                self.cursor.close()

            if self.connection:
                self.connection.close()

        except:

            pass

        self.cursor = None
        self.connection = None

        print("Database Closed")

    # ----------------------------------
    # Execute
    # ----------------------------------

    def execute(self, query, values=None):

        self.ensure_connection()

        try:

            if values:
                self.cursor.execute(query, values)
            else:
                self.cursor.execute(query)

            self.connection.commit()

            return True

        except Error as e:

            print(e)

            return False

    # ----------------------------------
    # Fetch One
    # ----------------------------------

    def fetchone(self, query, values=None):

        self.ensure_connection()

        try:

            if values:
                self.cursor.execute(query, values)
            else:
                self.cursor.execute(query)

            return self.cursor.fetchone()

        except Error as e:

            print(e)

            return None

    # ----------------------------------
    # Fetch All
    # ----------------------------------

    def fetchall(self, query, values=None):

        self.ensure_connection()

        try:

            if values:
                self.cursor.execute(query, values)
            else:
                self.cursor.execute(query)

            return self.cursor.fetchall()

        except Error as e:

            print(e)

            return []

    # ----------------------------------
    # Insert Document
    # ----------------------------------

    def insert_document(
        self,
        topic,
        title,
        file_name,
        page_number,
        chunk_index,
        content,
        embedding
    ):

        sql = """
        INSERT INTO documents
        (
            topic,
            title,
            file_name,
            page_number,
            chunk_index,
            content,
            embedding
        )
        VALUES
        (
            %s,%s,%s,%s,%s,%s,%s
        )
        """

        return self.execute(
            sql,
            (
                topic,
                title,
                file_name,
                page_number,
                chunk_index,
                content,
                embedding
            )
        )

    # ----------------------------------
    # Get All Documents
    # ----------------------------------

    def get_all_documents(self):

        sql = """
        SELECT *
        FROM documents
        """

        return self.fetchall(sql)

    # ----------------------------------
    # Get One Document
    # ----------------------------------

    def get_document(self, doc_id):

        sql = """
        SELECT *
        FROM documents
        WHERE id=%s
        """

        return self.fetchone(sql, (doc_id,))

    # ----------------------------------
    # Search Topic
    # ----------------------------------

    def search_topic(self, topic):

        sql = """
        SELECT *
        FROM documents
        WHERE topic LIKE %s
        """

        return self.fetchall(
            sql,
            ("%" + topic + "%",)
        )

    # ----------------------------------
    # Search Keyword
    # ----------------------------------

    def search_keyword(self, keyword):

        sql = """
        SELECT *
        FROM documents
        WHERE content LIKE %s
        """

        return self.fetchall(
            sql,
            ("%" + keyword + "%",)
        )

    # ----------------------------------
    # Get Documents By File
    # ----------------------------------

    def get_documents_by_file(self, file_name):

        sql = """
        SELECT *
        FROM documents
        WHERE file_name=%s
        """

        return self.fetchall(sql, (file_name,))

    # ----------------------------------
    # Get Page
    # ----------------------------------

    def get_page(self, file_name, page_number):

        sql = """
        SELECT *
        FROM documents
        WHERE file_name=%s
        AND page_number=%s
        """

        return self.fetchall(
            sql,
            (
                file_name,
                page_number
            )
        )

    # ----------------------------------
    # Document Count
    # ----------------------------------

    def document_count(self):

        sql = """
        SELECT COUNT(*) AS total
        FROM documents
        """

        result = self.fetchone(sql)

        if result:

            return result["total"]

        return 0

    # ----------------------------------
    # Delete One Document
    # ----------------------------------

    def delete_document(self, doc_id):

        sql = """
        DELETE FROM documents
        WHERE id=%s
        """

        return self.execute(sql, (doc_id,))

    # ----------------------------------
    # Delete PDF
    # ----------------------------------

    def delete_pdf(self, file_name):

        sql = """
        DELETE FROM documents
        WHERE file_name=%s
        """

        return self.execute(sql, (file_name,))

    # ----------------------------------
    # Clear Database
    # ----------------------------------

    def clear_database(self):

        sql = """
        DELETE FROM documents
        """

        return self.execute(sql)


db = Database()