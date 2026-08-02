FROM python:3.13-slim

# Copy uv binary from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install essential system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Enable bytecode compilation and disable uv caching inside docker build to save space
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies (without installing the root package itself)
RUN uv sync --frozen --no-install-project --no-dev

# Copy the application source code
COPY . .

# Sync project (installs the root app package in editable/regular mode as defined)
RUN uv sync --frozen --no-dev

# Add virtual environment to PATH so we don't have to call 'uv run'
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
