#!/usr/bin/env python3
import json
import re

# Read the JSON file
with open('part2.json', 'r') as f:
    data = json.load(f)

# Renumber all questions sequentially
for i, question in enumerate(data['questions'], 1):
    # Update the number field
    question['number'] = i
    # Update the id field with zero-padded format
    question['id'] = f"p2_q{i:03d}"

# Write the updated JSON back to file
with open('part2.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Successfully renumbered {len(data['questions'])} questions from 1 to {len(data['questions'])}")
print(f"Total questions: {data['totalQuestions']}")
