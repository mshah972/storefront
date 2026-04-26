from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload

from ..auth.dependencies import require_admin
from ..database import get_db
from ..models import Order, OrderItem, OrderStatus, Product, User
from ..schemas import AdminOrderOut, OrderStatusUpdate

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


def _load_order(db: Session, order_id: int) -> Order | None:
    return (
        db.query(Order)
        .options(
            selectinload(Order.user),
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .selectinload(Product.category),
        )
        .filter(Order.id == order_id)
        .first()
    )


def _serialize(order: Order) -> AdminOrderOut:
    data = AdminOrderOut.model_validate(
        {
            "id": order.id,
            "status": order.status,
            "total": order.total,
            "shipping_address": order.shipping_address,
            "created_at": order.created_at,
            "items": order.items,
            "customer": order.user,
        }
    )
    return data


@router.get("/orders", response_model=list[AdminOrderOut])
def list_all_orders(
    db: Session = Depends(get_db),
    status: OrderStatus | None = Query(default=None, description="Filter by status"),
):
    q = (
        db.query(Order)
        .options(
            selectinload(Order.user),
            selectinload(Order.items)
            .selectinload(OrderItem.product)
            .selectinload(Product.category),
        )
        .order_by(Order.created_at.desc())
    )
    if status:
        q = q.filter(Order.status == status)
    return [_serialize(o) for o in q.all()]


@router.get("/orders/stats")
def order_stats(db: Session = Depends(get_db)):
    """Aggregate counts per status for the admin dashboard cards."""
    counts = {s.value: 0 for s in OrderStatus}
    rows = (
        db.query(Order.status, Order.id)
        .all()
    )
    for status, _ in rows:
        counts[status.value] += 1
    counts["total"] = sum(counts[s.value] for s in OrderStatus)
    counts["ready_to_ship"] = counts[OrderStatus.paid.value]
    return counts


@router.get("/orders/{order_id}", response_model=AdminOrderOut)
def get_any_order(order_id: int, db: Session = Depends(get_db)):
    """Admin-scoped fetch — bypasses the customer-scoped /orders/{id} filter."""
    order = _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _serialize(order)


@router.patch("/orders/{order_id}", response_model=AdminOrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    order = _load_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return _serialize(order)
