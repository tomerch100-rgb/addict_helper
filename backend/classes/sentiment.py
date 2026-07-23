# backend/classes/sentiment.py
"""
Maps the free-text sentiment tags stored on chat Messages to a 0-100 mood score
used for the "Mental Weather" chart and AI insight heuristics.

TODO: once the local Ollama sentiment pipeline is wired up (see project spec,
Phase 3), replace these hand-picked tags with the raw numeric score Ollama
returns per message and drop this lookup table.
"""

SENTIMENT_SCORE_MAP = {
    "high_risk": 10,
    "very_negative": 15,
    "negative": 30,
    "low": 30,
    "neutral": 50,
    "supportive": 65,
    "positive": 75,
    "good": 75,
    "improving": 80,
    "very_positive": 90,
    "great": 90,
}

DEFAULT_SCORE = 50


def sentiment_to_score(sentiment: str | None) -> int:
    if not sentiment:
        return DEFAULT_SCORE
    return SENTIMENT_SCORE_MAP.get(sentiment.lower(), DEFAULT_SCORE)
