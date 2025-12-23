import re

# Read the menu file
with open('pages/menu.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match product cards with bottom buttons
pattern = r'(<article class="product-card"[^>]*>.*?<div class="product-media">.*?<span class="product-badge[^"]*">([^<]+)</span>.*?<img[^>]+>.*?<span class="product-category-overlay">([^<]+)</span>.*?</div>.*?<div class="product-info">.*?<div class="product-header">.*?<h3>([^<]+)</h3>.*?<p class="product-price">([^<]+)</p>.*?</div>.*?)<div class="product-actions">.*?data-quickview="([^"]+)".*?data-add-to-cart="([^"]+)".*?</div>.*?(</div>.*?</article>)'

# SVG icons
eye_svg = '''<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>'''

cart_svg = '''<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                    stroke-width="2">
                                    <path
                                        d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-7-4h7a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>'''

def replace_card(match):
    before_actions = match.group(1)
    quickview_name = match.group(6)
    addtocart_name = match.group(7)
    after_actions = match.group(8)
    
    # Build the overlay
    overlay = f'''<div class="product-actions-overlay">
                            <button class="btn-icon" aria-label="Quick View" data-quickview="{quickview_name}">
                                {eye_svg}
                            </button>
                            <button class="btn-icon" aria-label="Add to Cart" data-add-to-cart="{addtocart_name}">
                                {cart_svg}
                            </button>
                        </div>'''
    
    # Insert overlay before </div> that closes product-media
    before_actions = re.sub(r'(<span class="product-category-overlay">[^<]+</span>\s*)(</div>)', 
                            r'\1' + overlay + r'\n                    \2', before_actions)
    
    # Add loading="lazy" to images that don't have it
    before_actions = re.sub(r'(<img[^>]+)(?<!loading="lazy")>',
                           r'\1 loading="lazy">', before_actions)
    
    return before_actions + after_actions

# Replace all cards
content = re.sub(pattern, replace_card, content, flags=re.DOTALL)

# Write back
with open('pages/menu.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Successfully updated all menu cards to match homepage structure!")
