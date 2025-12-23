"""
Fix the extra closing div tags in menu.html
"""

# Read the menu file
with open('c:/Users/simoa/OneDrive/Documents/bakery/pages/menu.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the pattern where there are two consecutive closing divs followed by product-info
# Pattern: </div>\n                    </div>\n                    <div class="product-info">
# Should be: </div>\n                    <div class="product-info">

import re

# Remove the extra </div> that appears right before <div class="product-info">
pattern = r'(</div>)\s*</div>\s*(<div class="product-info">)'
replacement = r'\1\n                    \2'

fixed_content = re.sub(pattern, replacement, content)

# Write back
with open('c:/Users/simoa/OneDrive/Documents/bakery/pages/menu.html', 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print("Fixed extra closing divs in menu.html!")
