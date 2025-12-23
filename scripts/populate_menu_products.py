import re
from pathlib import Path

# Product names and prices for the goldenSweet1 items
products = [
    # Sugar-free products
    {"name": "Sugar Free Cinnamon Roll 1", "price": "25", "category": "sugar-free", "badge": "Sugar Free", "image": "sugar_free1.png", "tags": "No Sugar,Vegan,Keto"},
    {"name": "Sugar Free Chocolate Delight", "price": "30", "category": "sugar-free", "badge": "Sugar Free", "badge_class": "product-badge--bright", "image": "sugar_free2.png", "tags": "No Sugar,Chocolate,Premium"},
    {"name": "Sugar Free Caramel Swirl", "price": "28", "category": "sugar-free", "badge": "Sugar Free", "image": "sugar_free5.jpeg", "tags": "No Sugar,Caramel,Low-Carb"},
    {"name": "Sugar Free Vanilla Dream", "price": "28", "category": "sugar-free", "badge": "Sugar Free", "image": "sugar_free6.jpeg", "tags": "No Sugar,Vanilla,Dairy-Free"},
    {"name": "Sugar Free Berry Bliss", "price": "30", "category": "sugar-free", "badge": "Sugar Free", "badge_class": "product-badge--calm", "image": "sugar_free7.jpeg", "tags": "No Sugar,Berry,Fresh"},
    {"name": "Sugar Free Mocha Roll", "price": "32", "category": "sugar-free keto", "badge": "Keto", "badge_class": "product-badge--bright", "image": "sugar_free8.jpeg", "tags": "Keto,Coffee,Sugar-Free"},
    
    # Gluten-free products
    {"name": "Gluten Free Classic", "price": "25", "category": "gluten-free", "badge": "Gluten Free", "image": "gluten_free1.png", "tags": "Gluten-Free,Classic,Healthy"},
    {"name": "Gluten Free Pecan Delight", "price": "35", "category": "gluten-free", "badge": "Gluten Free", "badge_class": "product-badge--bright", "image": "gluten_free2.png", "tags": "Gluten-Free,Pecan,Premium"},
    {"name": "Gluten Free Almond Roll", "price": "30", "category": "gluten-free", "badge": "Gluten Free", "image": "gluten_free3.png", "tags": "Gluten-Free,Almond,Nutty"},
    {"name": "Gluten Free Hazelnut", "price": "32", "category": "gluten-free", "badge": "Gluten Free", "badge_class": "product-badge--calm", "image": "gluten_free4.png", "tags": "Gluten-Free,Hazelnut,Rich"},
    {"name": "Gluten Free Pistachio", "price": "35", "category": "gluten-free", "badge": "Gluten Free", "badge_class": "product-badge--calm", "image": "gluten_free5.png", "tags": "Gluten-Free,Pistachio,Signature"},
    {"name": "Gluten Free Caramel", "price": "30", "category": "gluten-free", "badge": "Gluten Free", "image": "gluten_free6.png", "tags": "Gluten-Free,Caramel,Sweet"},
    {"name": "Gluten Free Chocolate", "price": "30", "category": "gluten-free", "badge": "Gluten Free", "image": "gluten_free7.png", "tags": "Gluten-Free,Chocolate,Decadent"},
    {"name": "Gluten Free Cinnamon", "price": "25", "category": "gluten-free", "badge": "Gluten Free", "image": "gluten_free8.png", "tags": "Gluten-Free,Cinnamon,Traditional"},
    {"name": "Gluten Free Maple Pecan", "price": "35", "category": "gluten-free", "badge": "Gluten Free", "badge_class": "product-badge--bright", "image": "gluten_free9.png", "tags": "Gluten-Free,Maple,Pecan"},
]

# Read current menu
with open('pages/menu.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the product grid section
grid_pattern = r'(<div class="product-grid">)(.*?)(</div>\s*</section>)'
match = re.search(grid_pattern, content, re.DOTALL)

if match:
    # Build new product cards
    cards_html = '\n'
    
    for product in products:
        badge_class = product.get('badge_class', 'product-badge')
        if badge_class == 'product-badge':
            badge_html = f'<span class="product-badge">{product["badge"]}</span>'
        else:
            badge_html = f'<span class="product-badge {badge_class}">{product["badge"]}</span>'
        
        card = f'''                <article class="product-card" data-product data-category="{product['category']}"
                    data-description="{product['name']}"
                    data-tags="{product['tags']}">
                    <div class="product-media">
                        {badge_html}
                        <img src="../images/{product['image']}" alt="{product['name']}" loading="lazy">
                        <span class="product-category-overlay">{product['badge']}</span>
                        <div class="product-actions-overlay">
                            <button class="btn-icon" aria-label="Quick View" data-quickview="{product['name']}">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </button>
                            <button class="btn-icon" aria-label="Add to Cart" data-add-to-cart="{product['name']}">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path
                                        d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-7-4h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="product-header">
                            <h3>{product['name']}</h3>
                            <p class="product-price">{product['price']}&nbsp;MAD</p>
                        </div>
                    </div>
                </article>

'''
        cards_html += card
    
    # Replace the grid content
    new_content = match.group(1) + cards_html + '            ' + match.group(3)
    content = re.sub(grid_pattern, new_content, content, flags=re.DOTALL)
    
    # Write back
    with open('pages/menu.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Successfully added {len(products)} products from goldenSweet1!")
else:
    print("❌ Could not find product grid section")
