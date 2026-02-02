# QR Food Order 🍽️

A modern, QR-based contactless food ordering system covering the entire restaurant-customer flow. Built with **Next.js**, **MongoDB**, and **NextAuth.js**.

## 🚀 Features

### For Restaurants (Admin)
-   **Dashboard**: Real-time overview of orders, revenue, and pending actions.
-   **Menu Management**: Add, edit, delete, and toggle availability of items with images.
-   **QR Code Generator**: Automatic unique QR code generation for tables.
-   **Order Management**: Track orders through `Pending -> Confirmed -> Preparing -> Ready -> Completed`.
-   **Settings**: Manage restaurant profile, operating hours, and discount configurations.

### For Customers (Public)
-   **Mobile-First Menu**: Clean, responsive interface to browse categories and items.
-   **Cart System**: Add items, manage quantities, and review order totals.
-   **Checkout**: Table number input, special instructions, and discount code support.
-   **Review System**: Leave 5-star ratings and earn automatic discount codes for next visit.

## 🛠️ Tech Stack
-   **Framework**: Next.js 15+ (App Router)
-   **Database**: MongoDB (via Mongoose)
-   **Auth**: NextAuth.js (Credentials Provider)
-   **Styling**: CSS Modules (Scoped & Responsive)
-   **Utilities**: `bcryptjs` (Security), `qrcode` (Generation)

## 📦 Getting Started

### Prerequisites
-   Node.js 18+
-   MongoDB Instance (Local or Atlas)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/qr-food-order.git
    cd qr-food-order
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory:
    ```env
    # Database
    MONGODB_URI=mongodb://localhost:27017/qr-food-order

    # Auth
    NEXTAUTH_SECRET=your-super-secret-key-change-in-production
    NEXTAUTH_URL=http://localhost:3000

    # Application
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment

The application is production-ready.

1.  **Build**:
    ```bash
    npm run build
    ```

2.  **Start**:
    ```bash
    npm start
    ```

### Recommended Hosting
-   **Vercel** (Zero config for Next.js)
-   **Railway** / **Render** (For Node.js + MongoDB)

## 🧪 Verification
Refer to `walkthrough.md` in the artifacts folder for a detailed manual verification checklist.
