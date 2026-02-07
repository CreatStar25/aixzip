import os

# Hardcoded from src/config/tools.ts
locales = [
  'en', 'zh-cn', 'zh-tw', 'es', 'ar', 'pt', 'id', 'ms', 
  'fr', 'ru', 'hi', 'ja', 'de', 'ko', 'tr', 'vi', 
  'th', 'it', 'fa', 'nl', 'pl', 'sv', 'uk', 'ro'
]

blog_path = "/Users/one/Documents/Github/aixzip/src/content/blog"
i18n_path = "/Users/one/Documents/Github/aixzip/src/content/i18n"

blog_folders = [d for d in os.listdir(blog_path) if os.path.isdir(os.path.join(blog_path, d))]
i18n_files = [f.replace('.json', '') for f in os.listdir(i18n_path) if f.endswith('.json')]

print("--- Check Results ---")

# Check 1: Are all locales in blog?
missing_blog = set(locales) - set(blog_folders)
if missing_blog:
    print(f"Locales missing from blog folders: {missing_blog}")
else:
    print("All locales have blog folders.")

# Check 2: Are all blog folders in locales?
extra_blog = set(blog_folders) - set(locales)
if extra_blog:
    print(f"Blog folders not in locales: {extra_blog}")
else:
    print("No extra blog folders.")

# Check 3: Are all locales in i18n?
missing_i18n = set(locales) - set(i18n_files)
if missing_i18n:
    print(f"Locales missing from i18n files: {missing_i18n}")
else:
    print("All locales have i18n files.")

# Check 4: Are all i18n files in locales?
extra_i18n = set(i18n_files) - set(locales)
if extra_i18n:
    print(f"i18n files not in locales: {extra_i18n}")

# Check 5: Check blog content files for 'ro' specifically
ro_file = os.path.join(blog_path, 'ro', 'how-to-zip-your-resume-and-portfolio.md')
if os.path.exists(ro_file):
    print("RO blog file exists.")
else:
    print("RO blog file MISSING.")
