from app.services.feed_sources.base import FeedSource
from app.services.feed_sources.rss_source import RSSFeedSource


def get_feed_sources() -> list[FeedSource]:
    return [
        RSSFeedSource(
            name="ESPNcricinfo",
            url="https://www.espncricinfo.com/rss/content/story/feeds/0.xml",
            category="world_cricket",
        ),
        RSSFeedSource(
            name="BBC Cricket",
            url="https://feeds.bbci.co.uk/sport/cricket/rss.xml",
            category="world_cricket",
        ),
    ]