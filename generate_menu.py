import os

images_dir = "images" 
if not os.path.exists(images_dir):
    print("Error: images dir not found")
    exit(1)

files = os.listdir(images_dir)
gluten_free = sorted([f for f in files if f.startswith("gluten_free")])
sugar_free = sorted([f for f in files if f.startswith("sugar_free")])

def create_card(filename, type_name):
    # Name formatting: gluten_free1.png -> Gluten Free 1
    # User asked for "Gluten Free" category and "Sugar Free" category tags
    formatted_type = type_name.replace("_", " ").title()
    name_suffix = filename.split(".")[0].replace(type_name, "").replace("_", "")
    full_name = f"{formatted_type} {name_suffix}"
    
    category_slug = type_name.replace("_", "-") # gluten-free
    
    return f"""                <article class="product-card" data-product data-category="{category_slug}"
                    data-description="Delicious {full_name} made with natural ingredients."
                    data-tags="{formatted_type}">
                    <div class="product-media">
                        <span class="product-badge">{formatted_type}</span>
                        <img src="../images/{filename}" alt="{full_name}">
                        <span class="product-category-overlay">{formatted_type}</span>
                    </div>
                    <div class="product-info">
                        <div class="product-header">
                            <h3>{full_name}</h3>
                            <p class="product-price">30&nbsp;MAD</p>
                        </div>
                        <div class="product-actions">
                            <button class="btn btn-outline btn-small" type="button"
                                data-quickview="{full_name}">Quick View</button>
                            <button class="btn btn-ghost" type="button" data-add-to-cart="{full_name}">Add to Cart</button>
                        </div>
                    </div>
                </article>"""

print("<!-- START GENERATED CONTENT -->")
for f in gluten_free:
    print(create_card(f, "gluten_free"))
for f in sugar_free:
    print(create_card(f, "sugar_free"))
print("<!-- END GENERATED CONTENT -->")
