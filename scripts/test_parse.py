import os
import re

def test_parse():
    path = os.path.join('src', 'data', 'mock-exams', 'modellsatz-1.ts')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find hoeren block
    hoeren_match = re.search(r'hoeren:\s*\{.*?questions:\s*\[(.*?)\]\s*,\s*lesen:', content, re.DOTALL)
    if not hoeren_match:
        print("Hoeren block not found!")
        return

    hoeren_block = hoeren_match.group(1)
    # Match id and audioScript
    pattern = re.compile(r'id:\s*[\'"]([^\'"]+)[\'"].*?audioScript:\s*[\'"](.*?)[\'"]\s*,', re.DOTALL)
    matches = pattern.findall(hoeren_block)
    print(f"Found {len(matches)} listening questions in modellsatz-1.ts")
    for qid, text in matches:
        clean_text = text.replace('\\n', ' ').replace('\\"', '"').replace("\\'", "'")
        print(f" - {qid}: {clean_text[:60]}...")

if __name__ == '__main__':
    test_parse()
