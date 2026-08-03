import asyncio
from collections.abc import AsyncGenerator
from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import get_db_session
from app.main import app
from app.models.base import Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, future=True)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session")
def event_loop():
    """Create and yield a single event loop for the testing session."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def initialize_db() -> AsyncGenerator[None]:
    """Auto-initialize database tables in memory before each test function."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession]:
    """Yield a database session bound to the in-memory test database."""
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient]:
    """Return an HTTPX AsyncClient yielding requests against the overridden app."""

    async def override_get_db_session() -> AsyncGenerator[AsyncSession]:
        yield db_session

    # Override dependencies
    app.dependency_overrides[get_db_session] = override_get_db_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as ac:
        yield ac

    # Clean up overrides
    app.dependency_overrides.clear()


class MockRedisPipeline:
    def __init__(self, mock_redis) -> None:
        self.mock_redis = mock_redis
        self.commands = []

    def incr(self, key: str):
        self.commands.append(("incr", key))
        return self

    def expire(self, key: str, seconds: int):
        self.commands.append(("expire", key, seconds))
        return self

    async def execute(self) -> list[Any]:
        results = []
        for cmd, *args in self.commands:
            if cmd == "incr":
                key = args[0]
                val = int(self.mock_redis.store.get(key, 0)) + 1
                self.mock_redis.store[key] = str(val)
                results.append(val)
            elif cmd == "expire":
                results.append(True)
        return results


class MockRedis:
    def __init__(self) -> None:
        self.store = {}

    async def ping(self) -> bool:
        return True

    async def get(self, key: str) -> str | None:
        return self.store.get(key)

    async def setex(self, key: str, _time: int, value: str) -> None:
        self.store[key] = str(value)

    async def delete(self, *keys: str) -> None:
        for key in keys:
            self.store.pop(key, None)

    async def close(self) -> None:
        pass

    def pipeline(self):
        return MockRedisPipeline(self)


@pytest.fixture(autouse=True)
def mock_redis(monkeypatch) -> MockRedis:
    mock = MockRedis()
    monkeypatch.setattr("app.redis_client.redis_client", mock)
    monkeypatch.setattr("app.core.rate_limiter.redis_client", mock)
    monkeypatch.setattr("app.services.auth.redis_client", mock)
    monkeypatch.setattr("app.api.v1.auth.redis_client", mock)
    return mock
