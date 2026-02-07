import os
import re

base_path = "/Users/one/Documents/Github/aixzip/src/content/blog"
target_file = "how-to-zip-your-resume-and-portfolio.md"

languages = [
    "ar", "de", "en", "es", "fa", "fr", "hi", "id", "it", "ja", "ko", "ms", 
    "nl", "pl", "pt", "ro", "ru", "sv", "th", "tr", "uk", "ur", "vi", "zh-cn", "zh-tw"
]

print(f"Checking {len(languages)} languages...")

for lang in languages:
    file_path = os.path.join(base_path, lang, target_file)
    
    if not os.path.exists(file_path):
        print(f"[MISSING] {lang}: File not found at {file_path}")
        continue
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        frontmatter = []
        in_fm = False
        fm_count = 0
        for line in lines:
            if line.strip() == '---':
                fm_count += 1
                if fm_count == 1:
                    in_fm = True
                    continue
                elif fm_count == 2:
                    in_fm = False
                    break
            if in_fm:
                frontmatter.append(line)
        
        if fm_count < 2:
            print(f"[INVALID] {lang}: Incomplete frontmatter")
            continue
            
        fm_text = "".join(frontmatter)
        
        # Check lang field
        lang_match = re.search(r'^lang:\s*(.+)$', fm_text, re.MULTILINE)
        if not lang_match:
            print(f"[INVALID] {lang}: Missing 'lang' field")
        else:
            found_lang = lang_match.group(1).strip().replace('"', '').replace("'", "")
            if found_lang != lang:
                print(f"[INVALID] {lang}: 'lang' is '{found_lang}', expected '{lang}'")

        # Check title quotes if colon exists
        title_match = re.search(r'^title:\s*(.+)$', fm_text, re.MULTILINE)
        if title_match:
            title_val = title_match.group(1).strip()
            if ':' in title_val and not (title_val.startswith('"') or title_val.startswith("'")):
                 # Check if the colon is inside quotes (rough check)
                 print(f"[WARNING] {lang}: Title might need quotes: {title_val}")
        else:
             print(f"[INVALID] {lang}: Missing title")

        # Check tags array format
        tags_match = re.search(r'^tags:\s*(.+)$', fm_text, re.MULTILINE)
        if tags_match:
            tags_val = tags_match.group(1).strip()
            if not (tags_val.startswith('[') and tags_val.endswith(']')):
                 print(f"[INVALID] {lang}: Tags not in array format: {tags_val}")
        else:
             print(f"[INVALID] {lang}: Missing tags")

        print(f"[OK] {lang}")
            
    except Exception as e:
        print(f"[ERROR] {lang}: {e}")
