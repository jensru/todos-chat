#!/bin/bash

# Front Matter Parser für Markdown-Tasks mit Mistral-Integration
# Usage: ./mistral-frontmatter-parser.sh [markdown-file]

MARKDOWN_FILE="${1:-core/Dashboard - Strukturierte To-do-Übersicht.md}"

echo "🔍 Front Matter Parser für $MARKDOWN_FILE..."

# Python-Script für Front Matter Parsing
PYTHON_FRONTMATTER_SCRIPT='
import re
import json
import sys
from datetime import datetime

def parse_markdown_with_frontmatter(content):
    """Parse Markdown mit Front Matter Unterstützung"""
    tasks = []
    
    # Front Matter Pattern (YAML zwischen ---)
    frontmatter_pattern = r"^---\n(.*?)\n---\n(.*)$"
    frontmatter_match = re.match(frontmatter_pattern, content, re.DOTALL)
    
    if frontmatter_match:
        frontmatter_content = frontmatter_match.group(1)
        markdown_content = frontmatter_match.group(2)
        
        # YAML Front Matter parsen (einfach)
        frontmatter = {}
        for line in frontmatter_content.split("\n"):
            if ":" in line:
                key, value = line.split(":", 1)
                key = key.strip()
                value = value.strip().strip("\"'"")
                frontmatter[key] = value
    else:
        markdown_content = content
        frontmatter = {}
    
    # Tasks aus Markdown extrahieren
    task_pattern = r"^- \[ \] (.+)$"
    for match in re.finditer(task_pattern, markdown_content, re.MULTILINE):
        task_text = match.group(1)
        
        # Task-ID generieren
        task_id = f"task_{datetime.now().strftime(\"%Y%m%d_%H%M%S\")}_{hash(task_text) % 10000}"
        
        # Tags aus Front Matter oder Task-Text extrahieren
        tags = []
        if "tags" in frontmatter:
            tags = [tag.strip() for tag in frontmatter["tags"].split(",")]
        
        # Priorität aus Front Matter oder Task-Text
        priority = frontmatter.get("priority", "medium")
        if "🔥" in task_text or "urgent" in task_text.lower():
            priority = "high"
        elif "⚡" in task_text:
            priority = "medium"
        elif "📝" in task_text:
            priority = "low"
        
        # Due Date aus Front Matter
        due_date = frontmatter.get("due_date", None)
        
        task = {
            "id": task_id,
            "title": task_text,
            "description": "",
            "status": "pending",
            "priority": priority,
            "tags": tags,
            "due_date": due_date,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "frontmatter": frontmatter
        }
        
        tasks.append(task)
    
    return tasks, frontmatter

if __name__ == "__main__":
    content = sys.stdin.read()
    tasks, frontmatter = parse_markdown_with_frontmatter(content)
    
    result = {
        "tasks": tasks,
        "frontmatter": frontmatter,
        "total_tasks": len(tasks),
        "parsed_at": datetime.now().isoformat()
    }
    
    print(json.dumps(result, indent=2, ensure_ascii=False))
'

# Markdown-Datei parsen
echo "📄 Parse Markdown mit Front Matter..."
PARSED_RESULT=$(cat "$MARKDOWN_FILE" | python3 -c "$PYTHON_FRONTMATTER_SCRIPT")

# Mistral für intelligente Metadaten-Ergänzung
echo "🤖 Mistral analysiert Tasks für bessere Metadaten..."

MISTRAL_PROMPT="Analysiere die folgenden Tasks und schlage bessere Metadaten vor (Tags, Prioritäten, Due Dates):

$PARSED_RESULT

**Schlage vor für jeden Task:**
1. **Tags** (business, development, marketing, personal, urgent, etc.)
2. **Priorität** (high, medium, low)
3. **Due Date** (basierend auf Kontext)
4. **Kategorie** (PUSH, Check24, Personal, etc.)

**Antworte im JSON-Format:**
{
  \"enhanced_tasks\": [
    {
      \"id\": \"task_id\",
      \"suggested_tags\": [\"tag1\", \"tag2\"],
      \"suggested_priority\": \"high|medium|low\",
      \"suggested_due_date\": \"YYYY-MM-DD\",
      \"suggested_category\": \"category\"
    }
  ]
}"

MISTRAL_RESPONSE=$(./automation/mistral-api.sh "$MISTRAL_PROMPT")

echo "✅ Front Matter Analyse abgeschlossen!"
echo ""
echo "📊 Original Tasks:"
echo "$PARSED_RESULT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'Total Tasks: {data[\"total_tasks\"]}')
for task in data['tasks'][:5]:  # Zeige erste 5 Tasks
    print(f'- {task[\"title\"]} (Priority: {task[\"priority\"]}, Tags: {task[\"tags\"]})')
"

echo ""
echo "🤖 Mistral Verbesserungsvorschläge:"
echo "$MISTRAL_RESPONSE"
