#!/bin/bash

# Einfacher Mistral Test
echo "🤖 Mistral einfacher Test..."

# Einfacher Prompt ohne Sonderzeichen
SIMPLE_PROMPT="Kategorisiere diese Todos: 1) Pricing-Strategie entwickeln 2) Joggen 3) Simon Kubica 4) Tools schneller"

# Mistral API aufrufen
echo "📊 Mistral testet..."
MISTRAL_RESPONSE=$(./mistral-api.sh "$SIMPLE_PROMPT")

echo "✅ Mistral Response:"
echo "$MISTRAL_RESPONSE"
