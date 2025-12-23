"""
Update menu.html to match the new card design from homepage
- Remove overlay buttons
- Add buttons in product-actions div at the bottom
- Keep all existing products and their categories
"""

import re

# Read the menu file
with open('c:/Users/simoa/OneDrive/Documents/bakery/pages/menu.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match each product card
pattern = r'(\u003carticle class="product-card"[^\u003e]*data-product[^\u003e]*data-category="[^"]*"[^\u003e]*data-description="[^"]*"[^\u003e]*data-tags="[^"]*"\u003e\s*\u003cdiv class="product-media"\u003e\s*\u003cspan class="product-badge[^"]*"\u003e[^\u003c]*\u003c/span\u003e\s*\u003cimg src="[^"]*"[^/]*/?loading="lazy"\u003e)\s*\u003cdiv class="product-actions-overlay"\u003e.*?\u003c/div\u003e\s*(\u003c/div\u003e\s*\u003cdiv class="product-info"\u003e\s*\u003cdiv class="product-header"\u003e\s*\u003ch3\u003e[^\u003c]*\u003c/h3\u003e\s*\u003cp class="product-price"\u003e[^\u003c]*\u003c/p\u003e\s*\u003c/div\u003e)\s*\u003c/div\u003e'

# Function to replace product card structure
def replace_card(match):
    media_section = match.group(1)
    info_section = match.group(2)
    
    # Extract product name from the h3 tag
    product_name_match = re.search(r'\u003ch3\u003e([^\u003c]*)\u003c/h3\u003e', info_section)
    product_name = product_name_match.group(1) if product_name_match else "Product"
    
    # Extract badge type (Sugar or Gluten)
    badge_match = re.search(r'\u003cspan class="product-badge[^"]*"\u003e([^\u003c]*)\u003c/span\u003e', media_section)
    badge_text = badge_match.group(1) if badge_match else ""
    
    # Determine which badge class to use based on content
    if "Sugar" in badge_text:
        badge_class = 'product-badge'
    elif "Gluten" in badge_text:
        badge_class = 'product-badge product-badge--calm'
    else:
        badge_class = 'product-badge product-badge--bright'
    
    # Update badge class in media section
    media_section = re.sub(r'class="product-badge[^"]*"', f'class="{badge_class}"', media_section)
    
    # Add category overlay after image
    category_overlay = f'\n                        \u003cspan class="product-category-overlay"\u003e{badge_text}\u003c/span\u003e'
    media_section = media_section.replace('loading="lazy"\u003e', f'loading="lazy"\u003e{category_overlay}')
    
    # Create the new structure with buttons at the bottom
    new_card = f'''{media_section}
                    \u003c/div\u003e
                    {info_section}
                        \u003cdiv class="product-actions"\u003e
                            \u003cbutton class="btn btn-outline btn-small" type="button" data-quickview="{product_name}"\u003eQuick View\u003c/button\u003e
                            \u003cbutton class="btn btn-ghost" type="button" data-add-to-cart="{product_name}"\u003eAdd to Cart\u003c/button\u003e
                        \u003c/div\u003e
                    \u003c/div\u003e'''
    
    return new_card

# Replace all product cards
updated_content = re.sub(pattern, replace_card, content, flags=re.DOTALL)

# Write back the updated content
with open('c:/Users/simoa/OneDrive/Documents/bakery/pages/menu.html', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("Menu page updated successfully!")
