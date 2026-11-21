"""
Deterministic Natural Language Task Parser.
Extracts deadlines, times, priority, categories, and tags from unstructured text.
Runs 100% offline with zero cloud API dependencies.
"""
import re
from datetime import datetime, timedelta
from typing import Optional
from schemas.models import NLPTaskParseResponse

class NaturalLanguageTaskParser:
    """Parses natural strings like 'Submit ML experiment tomorrow at 5pm #academics !high'."""

    PRIORITY_MAP = {
        "!critical": "critical",
        "!p1": "critical",
        "!urgent": "critical",
        "!high": "high",
        "!p2": "high",
        "!medium": "medium",
        "!p3": "medium",
        "!low": "low",
        "!p4": "low",
    }

    WEEKDAYS = {
        "monday": 0, "mon": 0,
        "tuesday": 1, "tue": 1,
        "wednesday": 2, "wed": 2,
        "thursday": 3, "thu": 3,
        "friday": 4, "fri": 4,
        "saturday": 5, "sat": 5,
        "sunday": 6, "sun": 6,
    }

    def parse(self, text: str) -> NLPTaskParseResponse:
        original_text = text.strip()
        working_text = original_text
        
        # 1. Extract Priority (!critical, !high, !medium, !low)
        priority = "medium"
        for token, prio_val in self.PRIORITY_MAP.items():
            pattern = rf"(?:^|\s)({re.escape(token)})(?:\s|$)"
            if re.search(pattern, working_text, re.IGNORECASE):
                priority = prio_val
                working_text = re.sub(pattern, " ", working_text, flags=re.IGNORECASE).strip()
                break

        # 2. Extract Category & Tags (#finance, #academics, #fitness, #work)
        tags = []
        category = "General"
        tag_matches = re.findall(r"#([a-zA-Z0-9_-]+)", working_text)
        if tag_matches:
            tags = tag_matches
            category = tag_matches[0].capitalize()
            working_text = re.sub(r"#[a-zA-Z0-9_-]+", " ", working_text).strip()

        # 3. Extract Time (e.g. at 5pm, 5:30pm, at 14:30, 10am)
        due_time: Optional[str] = None
        # Must have am/pm, a colon HH:MM, or be prefixed with 'at <num>'
        time_match = re.search(r"\b(?:at\s+(\d{1,2}(?::\d{2})?)|(\d{1,2}(?::\d{2})?\s*(?:am|pm))|(\d{1,2}:\d{2}))\b", working_text, re.IGNORECASE)
        if time_match:
            raw_time_str = (time_match.group(1) or time_match.group(2) or time_match.group(3)).lower().strip()
            try:
                if "am" in raw_time_str or "pm" in raw_time_str:
                    clean_time = raw_time_str.replace(" ", "")
                    if ":" in clean_time:
                        dt = datetime.strptime(clean_time, "%I:%M%p")
                    else:
                        dt = datetime.strptime(clean_time, "%I%p")
                    due_time = dt.strftime("%H:%M")
                elif ":" in raw_time_str:
                    due_time = raw_time_str
                elif time_match.group(1): # 'at 5'
                    val = int(time_match.group(1))
                    due_time = f"{val:02d}:00"
                working_text = re.sub(re.escape(time_match.group(0)), " ", working_text, flags=re.IGNORECASE).strip()
            except Exception:
                pass

        # 4. Extract Due Date (today, tomorrow, in N days, next monday)
        due_date: Optional[str] = None
        is_today = False
        today = datetime.now()

        if re.search(r"\btoday\b", working_text, re.IGNORECASE):
            due_date = today.strftime("%Y-%m-%d")
            is_today = True
            working_text = re.sub(r"\btoday\b", "", working_text, flags=re.IGNORECASE).strip()
        elif re.search(r"\btomorrow\b", working_text, re.IGNORECASE):
            due_date = (today + timedelta(days=1)).strftime("%Y-%m-%d")
            working_text = re.sub(r"\btomorrow\b", "", working_text, flags=re.IGNORECASE).strip()
        else:
            # Check for "in X days"
            in_days_match = re.search(r"\bin\s+(\d+)\s+days?\b", working_text, re.IGNORECASE)
            if in_days_match:
                days_offset = int(in_days_match.group(1))
                due_date = (today + timedelta(days=days_offset)).strftime("%Y-%m-%d")
                working_text = re.sub(r"\bin\s+\d+\s+days?\b", "", working_text, flags=re.IGNORECASE).strip()
            else:
                # Check for weekdays (e.g. "on friday", "next monday")
                for w_name, w_idx in self.WEEKDAYS.items():
                    if re.search(rf"\b(?:on\s+|next\s+)?{w_name}\b", working_text, re.IGNORECASE):
                        current_w_idx = today.weekday()
                        days_ahead = (w_idx - current_w_idx + 7) % 7
                        if days_ahead == 0:
                            days_ahead = 7
                        due_date = (today + timedelta(days=days_ahead)).strftime("%Y-%m-%d")
                        working_text = re.sub(rf"\b(?:on\s+|next\s+)?{w_name}\b", "", working_text, flags=re.IGNORECASE).strip()
                        break

        # 5. Clean Title (remove dangling prepositions like "at", "due", "by")
        clean_title = re.sub(r"\b(?:by|at|due|on)\s*$", "", working_text, flags=re.IGNORECASE).strip()
        clean_title = re.sub(r"\s+", " ", clean_title)
        if not clean_title:
            clean_title = original_text

        return NLPTaskParseResponse(
            title=clean_title,
            due_date=due_date,
            due_time=due_time,
            priority=priority,
            category=category,
            is_scheduled_today=is_today,
            raw_prompt=original_text,
            tags=tags,
            confidence=0.95
        )

nlp_parser = NaturalLanguageTaskParser()
