#!/bin/bash

# 🎯 Todo-App Code Quality Fixer
# Automatische Behebung der wichtigsten ESLint-Probleme

echo "🔧 Todo-App Code Quality Fixer"
echo "=============================="

cd /Users/jensru/Sites/todos/todo-app-nextjs

echo "📝 1. Interface-Namen korrigieren (I-Prefix hinzufügen)..."

# Types.ts - Interface-Namen korrigieren
sed -i '' 's/export interface Task/export interface ITask/g' src/lib/types.ts
sed -i '' 's/export interface Subtask/export interface ISubtask/g' src/lib/types.ts
sed -i '' 's/export interface Goal/export interface IGoal/g' src/lib/types.ts
sed -i '' 's/export interface Message/export interface IMessage/g' src/lib/types.ts
sed -i '' 's/export interface WorkingStyleDNA/export interface IWorkingStyleDNA/g' src/lib/types.ts

# TaskCard.tsx - Interface-Namen korrigieren
sed -i '' 's/interface TaskCardProps/interface ITaskCardProps/g' src/components/TaskCard.tsx

echo "📝 2. Unused Imports entfernen..."

# TaskCard.tsx - GripVertical entfernen
sed -i '' 's/, GripVertical//g' src/components/TaskCard.tsx

# TaskService.ts - Subtask Import entfernen
sed -i '' 's/import { Task, Subtask }/import { Task }/g' src/lib/services/TaskService.ts

echo "📝 3. Unused Variables entfernen..."

# page.tsx - workingStyleDNA entfernen
sed -i '' '/const \[workingStyleDNA, setWorkingStyleDNA\]/d' src/app/page.tsx
sed -i '' '/setWorkingStyleDNA(data.workingStyleDNA || {});/d' src/app/page.tsx

echo "📝 4. Console.log Statements entfernen..."

# Alle console.log Statements entfernen (außer console.error)
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' '/console\.log/d'

echo "📝 5. Any Types korrigieren..."

# MistralService.ts - any durch unknown ersetzen
sed -i '' 's/context: any/context: unknown/g' src/lib/services/MistralService.ts

# TaskService.ts - any durch unknown ersetzen
sed -i '' 's/rawTasks: any\[\]/rawTasks: unknown[]/g' src/lib/services/TaskService.ts
sed -i '' 's/subtask: any/subtask: unknown/g' src/lib/services/TaskService.ts

# types.ts - any durch unknown ersetzen
sed -i '' 's/\[key: string\]: any/\[key: string\]: unknown/g' src/lib/types.ts

echo "📝 6. Return Types hinzufügen..."

# Wichtige Funktionen mit Return Types versehen
echo "✅ Code Quality Fixes abgeschlossen!"
echo ""
echo "🔍 Verbleibende Probleme:"
echo "- Return Types für alle Funktionen (manuell hinzufügen)"
echo "- JSX Arrow Functions (Performance-Optimierung)"
echo "- useEffect Dependencies (manuell prüfen)"
echo ""
echo "💡 Nächste Schritte:"
echo "1. npm run lint (prüfen)"
echo "2. Return Types manuell hinzufügen"
echo "3. Performance-Optimierungen"
echo "4. Tests schreiben"
