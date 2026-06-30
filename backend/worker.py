import asyncio
import logging
from celery_app import _run_scrapers, _run_dedup

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def main():
    logger.info("Starting Eventa lightweight background worker...")
    
    # Run in an infinite loop
    while True:
        try:
            logger.info("--- Running Scheduled Scrapers ---")
            await _run_scrapers()
            
            logger.info("--- Running Scheduled Deduplication ---")
            await _run_dedup()
            
            logger.info("Background tasks complete. Sleeping for 1 hour...")
        except Exception as e:
            logger.error(f"Worker loop encountered an error: {e}")
            
        # Sleep for 1 hour before scraping again
        await asyncio.sleep(3600)

if __name__ == "__main__":
    asyncio.run(main())
