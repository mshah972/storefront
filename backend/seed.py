"""Seed the Storefront database with sample categories, products, and users."""

from decimal import Decimal

from app.auth.jwt import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Category, Product, User, UserRole

CATEGORIES = [
    {"name": "Apparel", "slug": "apparel", "description": "Wearables and essentials."},
    {"name": "Audio", "slug": "audio", "description": "Headphones, speakers, and sound gear."},
    {"name": "Home", "slug": "home", "description": "Objects for everyday spaces."},
    {"name": "Workspace", "slug": "workspace", "description": "Tools for the desk."},
]

PRODUCTS = [
    ("Heritage Hoodie", "heritage-hoodie", "apparel", "Heavyweight loopback cotton, garment-dyed.", "78.00", 42, "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800"),
    ("Linen Field Shirt", "linen-field-shirt", "apparel", "European linen, mother-of-pearl buttons.", "112.00", 28, "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"),
    ("Merino Crew", "merino-crew", "apparel", "19.5 micron merino, milled in Biella.", "145.00", 18, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"),
    ("Studio Headphones", "studio-headphones", "audio", "Closed-back, 40mm drivers, detachable cable.", "289.00", 12, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"),
    ("Field Speaker", "field-speaker", "audio", "Portable speaker, 18-hour battery, IPX7.", "199.00", 24, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"),
    ("Travel IEMs", "travel-iems", "audio", "Tuned in-ears with passive isolation.", "129.00", 36, "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800"),
    ("Ceramic Carafe", "ceramic-carafe", "home", "Hand-thrown stoneware, 1L.", "62.00", 30, "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800"),
    ("Wool Throw", "wool-throw", "home", "Lambswool blanket, 130x180cm.", "168.00", 14, "https://images.unsplash.com/photo-1522444690501-6a31bb6e2c0a?w=800"),
    ("Brass Lamp", "brass-lamp", "home", "Articulating desk lamp in solid brass.", "245.00", 9, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800"),
    ("Walnut Desk Tray", "walnut-desk-tray", "workspace", "Hand-finished walnut, felt-lined.", "84.00", 22, "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800"),
    ("Field Notebook", "field-notebook", "workspace", "Tomoe River paper, dot grid, 192pp.", "24.00", 80, "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800"),
    ("Mechanical Keyboard", "mechanical-keyboard", "workspace", "75% layout, hot-swap, PBT keycaps.", "189.00", 16, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"),
]

USERS = [
    ("admin@storefront.dev", "admin1234", "Admin", UserRole.admin),
    ("demo@storefront.dev", "demo1234", "Demo Customer", UserRole.customer),
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Category).count() == 0:
            for c in CATEGORIES:
                db.add(Category(**c))
            db.commit()

        cat_by_slug = {c.slug: c for c in db.query(Category).all()}

        if db.query(Product).count() == 0:
            for name, slug, cat_slug, desc, price, stock, img in PRODUCTS:
                db.add(
                    Product(
                        name=name,
                        slug=slug,
                        description=desc,
                        price=Decimal(price),
                        stock=stock,
                        image_url=img,
                        category_id=cat_by_slug[cat_slug].id,
                    )
                )
            db.commit()

        if db.query(User).count() == 0:
            for email, pw, name, role in USERS:
                db.add(
                    User(
                        email=email,
                        password_hash=hash_password(pw),
                        name=name,
                        role=role,
                    )
                )
            db.commit()

        print("Seeded:", db.query(Category).count(), "categories,",
              db.query(Product).count(), "products,",
              db.query(User).count(), "users")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
