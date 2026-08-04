import os
import json
import fitz
from tqdm import tqdm

from database import db
from embedding import embedding_model


DATA_FOLDER = "data_content"

CHUNK_SIZE = 500
OVERLAP = 100


# ----------------------------------
# Split text into chunks
# ----------------------------------

def chunk_text(text, chunk_size=CHUNK_SIZE, overlap=OVERLAP):

    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


# ----------------------------------
# Process One PDF
# ----------------------------------

def process_pdf(pdf_path):

    pdf_name = os.path.basename(pdf_path)

    topic = os.path.splitext(pdf_name)[0]

    print(f"\n Processing: {pdf_name}")

    # Skip if already ingested
    existing = db.get_documents_by_file(pdf_name)

    if existing:
        print(" Already exists. Skipping.")
        return 0

    document = fitz.open(pdf_path)

    inserted = 0

    try:

        for page_number in tqdm(range(len(document))):

            page = document.load_page(page_number)

            text = page.get_text()

            if not text.strip():
                continue

            chunks = chunk_text(text)

            for chunk_index, chunk in enumerate(chunks):

                embedding = embedding_model.get_embedding(chunk)

                if embedding is None:
                    continue

                db.insert_document(
                    topic=topic,
                    title=f"{pdf_name} Page {page_number + 1}",
                    file_name=pdf_name,
                    page_number=page_number + 1,
                    chunk_index=chunk_index,
                    content=chunk,
                    embedding=json.dumps(embedding)
                )

                inserted += 1

    finally:

        document.close()

    print(f" Inserted {inserted} chunks.")

    return inserted


# ----------------------------------
# Main Ingestion
# ----------------------------------

def ingest():

    pdfs = []

    for file in os.listdir(DATA_FOLDER):

        if file.lower().endswith(".pdf"):

            pdfs.append(
                os.path.join(DATA_FOLDER, file)
            )

    print(f"\nFound {len(pdfs)} PDF(s)\n")

    total_chunks = 0

    for pdf in pdfs:

        total_chunks += process_pdf(pdf)

    print("\n==============================")
    print("INGESTION COMPLETED")
    print("==============================")
    print(f"PDFs Processed : {len(pdfs)}")
    print(f"Chunks Inserted: {total_chunks}")
    print("==============================")

    print(
        "Total Documents In Database:",
        db.document_count()
    )


if __name__ == "__main__":

    ingest()