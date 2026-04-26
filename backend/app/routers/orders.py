from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from ..auth.dependencies import get_current_user
from ..database import get_db
from ..models import CartItem, Order, OrderItem, OrderStatus, Product, User
from ..schemas import CheckoutIn, OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderOut])
def list_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Order)
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .selectinload(Product.category)
        )
        .filter(Order.user_id == user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    order = (
        db.query(Order)
        .options(
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .selectinload(Product.category)
        )
        .filter(Order.id == order_id, Order.user_id == user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/checkout", response_model=OrderOut, status_code=201)
def checkout(
    payload: CheckoutIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart_items = (
        db.query(CartItem)
        .options(selectinload(CartItem.product))
        .filter(CartItem.user_id == user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Lock product rows we're about to mutate so concurrent checkouts can't oversell.
    product_ids = [c.product_id for c in cart_items]
    locked = {
        p.id: p
        for p in db.query(Product)
        .filter(Product.id.in_(product_ids))
        .with_for_update()
        .all()
    }

    total = Decimal("0")
    for item in cart_items:
        product = locked.get(item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail="Product no longer exists")
        if item.quantity > product.stock:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}",
            )
        total += product.price * item.quantity

    order = Order(
        user_id=user.id,
        status=OrderStatus.paid,
        total=total,
        shipping_address=payload.shipping_address,
    )
    db.add(order)
    db.flush()

    for item in cart_items:
        product = locked[item.product_id]
        product.stock -= item.quantity
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                price_at_purchase=product.price,
            )
        )

    for item in cart_items:
        db.delete(item)

    db.commit()
    return get_order(order.id, user, db)
