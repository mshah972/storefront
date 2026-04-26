FROM python:3.11-slim

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential default-libmysqlclient-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
# Retry seed up to ~60s in case MySQL is still finalizing first-run init.
CMD ["sh", "-c", "for i in $(seq 1 30); do python seed.py && break || (echo \"db not ready, retry $i/30\"; sleep 2); done && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
