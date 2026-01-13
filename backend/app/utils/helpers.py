"""
MedTech AI Backend - Utilities

Common utility functions.
"""

from datetime import datetime, date, timedelta
from typing import Optional, Any
import re


def calculate_age(date_of_birth: date) -> int:
    """Calculate age from date of birth."""
    today = date.today()
    age = today.year - date_of_birth.year
    
    # Adjust if birthday hasn't occurred this year
    if (today.month, today.day) < (date_of_birth.month, date_of_birth.day):
        age -= 1
    
    return age


def format_phone(phone: str) -> str:
    """Normalize phone number format."""
    # Remove all non-numeric characters except +
    cleaned = re.sub(r'[^\d+]', '', phone)
    return cleaned


def is_valid_email(email: str) -> bool:
    """Basic email validation."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def get_date_range(
    period: str,
    end_date: Optional[date] = None,
) -> tuple[date, date]:
    """
    Get date range for a period.
    
    Args:
        period: One of 'today', 'week', 'month', 'year'
        end_date: End date (defaults to today)
        
    Returns:
        Tuple of (start_date, end_date)
    """
    end = end_date or date.today()
    
    if period == "today":
        return end, end
    elif period == "week":
        start = end - timedelta(days=7)
        return start, end
    elif period == "month":
        start = end - timedelta(days=30)
        return start, end
    elif period == "year":
        start = end - timedelta(days=365)
        return start, end
    else:
        return end, end


def safe_json_get(data: Optional[dict], *keys: str, default: Any = None) -> Any:
    """Safely get nested value from dict."""
    if not data:
        return default
    
    current = data
    for key in keys:
        if isinstance(current, dict):
            current = current.get(key)
        else:
            return default
        
        if current is None:
            return default
    
    return current


def truncate_string(s: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate string to max length with suffix."""
    if len(s) <= max_length:
        return s
    return s[:max_length - len(suffix)] + suffix
