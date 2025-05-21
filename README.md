BACKEND API


HTTP{{BASE_URL}}/api


users:auth and profile

POST /api/auth/signup

POST /api/auth/signin

POST /api/auth/signout


GET   /api/users

GET   /api/users/id

PATCH /api/users/id

DEL   /api/users/id


products

GET   /api/products

GET   /api/products/id

<admin>POST  /api/products

<admin>PATCH /api/products/id

<admin>DEL   /api/products


cartItem

GET   /api/cart

GET   /api/cart/id

POST  /api/cart

PATCH /api/cart/id

DEL   /api/cart/id


reviews

<admin>GET /api/reviews

GET        /api/reviews/product/{productId}

POST   /api/reviews

PATCH  /api/reviews/id

DEL    /api/reviews/id


payments

<admin>GET /api/payments

GET   /api/payments/my

POST /api/payments

<admin>PATCH /api/payments

<admin>DEL   /api/payments


admin dash

GET /api/stats

GET /api/stats/sales-report
