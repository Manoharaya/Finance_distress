# Financial Distress Intelligence Platform

A production-ready intelligence platform to identify and monitor financially distressed Australian companies.

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: FastAPI (Python), PostgreSQL, SQLAlchemy, Celery, Redis
- **Scraping**: Playwright, BeautifulSoup
- **Infrastructure**: Docker, Docker Compose

## Project Structure
- `/frontend`: Next.js application
- `/backend`: FastAPI REST API
- `/scrapers`: Playwright-based web scrapers
- `/workers`: Celery workers for background tasks
- `/shared`: Shared models and utilities
- `/docker`: Docker configuration files

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+

### Installation
1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run `make dev` to start the development environment

## Development
- `make build`: Build all services
- `make up`: Start all services
- `make down`: Stop all services
- `make logs`: View logs
