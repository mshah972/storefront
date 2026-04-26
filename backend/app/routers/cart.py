from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from ..auth.dependencies import get_current_user
from ..database import get_db
from ..models import CartItem, Product, User
from ..schemas import CartItemIn, CartItemOut, CartOut

router = APIRouter(prefix="/cart", tags=["cart"])


def _serialize_cart(items: list[CartItem]) -> CartOut:
    subtotal = sum((item.product.price * item.quantity for item in items), Decimal("0"))
    return CartOut(
        items=[CartItemOut.model_validate(i) for i in items],
        subtotal=subtotal,
    )


def _load_cart(db: Session, user_id: int) -> list[CartItem]:
    return (
        db.query(CartItem)
        .options(selectinload(CartItem.product).selectinload(Product.category))
        .filter(CartItem.user_id == user_id)
        .all()
    )


@router.get("", response_model=CartOut)
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _serialize_cart(_load_cart(db, user.id))


@router.post("/items", response_model=CartOut)
def add_item(
    payload: CartItemIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(CartItem)
        .filter(CartItem.user_id == user.id, CartItem.product_id == payload.product_id)
        .first()
    )
    new_qty = (existing.quantity if existing else 0) + payload.quantity
    if new_qty > product.stock:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    if existing:
        existing.quantity = new_qty
    else:
        db.add(CartItem(user_id=user.id, product_id=product.id, quantity=payload.quantity))
    db.commit()
    return _serialize_cart(_load_cart(db, user.id))


@router.patch("/items/{item_id}", response_model=CartOut)
def update_item(
    item_id: int,
    payload: CartItemIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.get(CartItem, item_id)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if payload.quantity > item.product.stock:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    item.quantity = payload.quantity
    db.commit()
    return _serialize_cart(_load_cart(db, user.id))


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.get(CartItem, item_id)
    if not item or item.user_id != user.id:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return _serialize_cart(_load_cart(db, user.id))
