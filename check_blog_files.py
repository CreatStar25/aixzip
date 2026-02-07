import os
import yaml
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
            content = f.read()
            
        # Extract frontmatter
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            print(f"[INVALID] {lang}: No frontmatter found")
            continue
            
        fm_text = match.group(1)
        try:
            fm = yaml.safe_load(fm_text)
        except yaml.YAMLError as e:
            print(f"[INVALID] {lang}: YAML error: {e}")
            continue
            
        # Check required fields
        required_fields = ['title', 'description', 'pubDate', 'coverImage', 'tags', 'lang']
        missing = [field for field in required_fields if field not in fm]
        
        if missing:
            print(f"[INVALID] {lang}: Missing fields: {missing}")
            continue
            
        if fm['lang'] != lang:
            print(f"[INVALID] {lang}: 'lang' field is '{fm['lang']}', expected '{lang}'")
            
        if not isinstance(fm['tags'], list):
             print(f"[INVALID] {lang}: 'tags' must be a list")

        # Check for unquoted title with colon (YAML parser usually handles this if safe_load works, 
        # but sometimes it parses as a dict if not quoted properly in source, though safe_load might fail or return dict)
        if isinstance(fm['title'], dict):
             print(f"[INVALID] {lang}: Title parsed as object (likely unquoted colon)")

        print(f"[OK] {lang}")
            
    except Exception as e:
        print(f"[ERROR] {lang}: {e}")
