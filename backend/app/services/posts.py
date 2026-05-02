import re
from supabase import Client


def count_words_in_markdown(text: str) -> int:
    stripped = re.sub(r"[#*_~`>\[\]()!|]", "", text)
    stripped = re.sub(r"\s+", " ", stripped).strip()
    if not stripped:
        return 0
    return len(stripped.split(" "))


def calculate_word_count(db: Client, post_id: str) -> int:
    result = (
        db.table("blocks")
        .select("content")
        .eq("post_id", post_id)
        .eq("type", "markdown")
        .is_("parent_block_id", "null")
        .execute()
    )
    total = 0
    for block in result.data or []:
        content = block.get("content", {})
        total += count_words_in_markdown(content.get("markdown", ""))
    return total
