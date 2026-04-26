from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import OrderStatus, UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: UserRole

    model_config = ConfigDict(from_attributes=True)


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    price: Decimal
    stock: int
    image_url: str | None = None
    category: CategoryOut
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    name: str
    slug: str
    description: str
    price: Decimal
    stock: int = 0
    image_url: str | None = None
    category_id: int


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    stock: int | None = None
    image_url: str | None = None
    category_id: int | None = None


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=99)


class CartItemOut(BaseModel):
    id: int
    quantity: int
    product: ProductOut

    model_config = ConfigDict(from_attributes=True)


class CartOut(BaseModel):
    items: list[CartItemOut]
    subtotal: Decimal


class OrderItemOut(BaseModel):
    id: int
    quantity: int
    price_at_purchase: Decimal
    product: ProductOut

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    status: OrderStatus
    total: Decimal
    shipping_address: str
    created_at: datetime
    items: list[OrderItemOut]

    model_config = ConfigDict(from_attributes=True)


class CheckoutIn(BaseModel):
    shipping_address: str = Field(min_length=5, max_length=500)


class AdminOrderOut(BaseModel):
    id: int
    status: OrderStatus
    total: Decimal
    shipping_address: str
    created_at: datetime
    items: list[OrderItemOut]
    customer: UserOut

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


TokenResponse.model_rebuild()
