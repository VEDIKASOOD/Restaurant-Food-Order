# QR-Based Food Ordering System

A modern, QR code-based food ordering system that enables restaurants to provide a contactless digital menu and ordering experience to their customers.

## 🌟 Features

### For Customers
- **QR Code Access** - Scan table QR code to view menu instantly
- **Digital Menu** - Browse beautiful food items with images and descriptions
- **Real-time Ordering** - Add items to cart and place orders directly
- **Order Tracking** - Track order status and get updates
- **Reviews & Ratings** - Leave feedback after dining

### For Restaurants
- **Dashboard** - Manage all aspects of your restaurant
- **Menu Management** - Add, edit, and organize menu items
- **Order Management** - Receive and manage customer orders in real-time
- **QR Code Generation** - Generate unique QR codes for tables
- **Analytics** - View reviews, ratings, and customer feedback
- **Discount Codes** - Create and manage promotional offers

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **Styling**: CSS Modules with Dark Theme
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/VEDIKASOOD/Restaurant-Food-Order.git
cd Restaurant-Food-Order
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
MONGODB_URI=mongodb://localhost:27017/qr-food-order
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 🌐 Deployment to Vercel

### Quick Deploy

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Configure environment variables (see below)
5. Deploy!

### Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/qr-food` |
| `NEXTAUTH_SECRET` | Secret for NextAuth (generate with `openssl rand -base64 32`) | `kJd8sKf9dks...` |
| `NEXTAUTH_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Same as NEXTAUTH_URL | `https://your-app.vercel.app` |

**Important**: After first deployment, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your actual Vercel URL and redeploy.

### MongoDB Atlas Setup (Recommended)

1. Create free account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (Free tier M0)
3. Add database user (Database Access)
4. Whitelist all IPs: 0.0.0.0/0 (Network Access)
5. Get connection string and add to Vercel

## 📱 Usage

### Restaurant Setup
1. Register your restaurant at `/register`
2. Login with your credentials
3. Access dashboard to manage menu and orders

### Customer Flow
1. Scan QR code at restaurant table
2. Browse the digital menu
3. Add items to cart
4. Place order with table number
5. Leave review after dining

## 🎨 Features Showcase

- **Dark Theme UI** - Modern, premium dark theme design
- **Smart Image System** - Automatic placeholder images for menu items
- **Responsive Design** - Works on all devices
- **Real-time Updates** - Live order status
- **QR Code Generation** - Unique codes for each table

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📂 Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Restaurant dashboard
│   ├── register/      # Restaurant registration
│   └── restaurant/    # Customer-facing pages
├── components/        # Reusable components
├── contexts/          # React contexts
└── lib/
    ├── models/        # MongoDB models
    └── mongodb.ts     # Database connection
```

## 🔒 Security

- Passwords hashed with bcrypt
- Protected API routes with NextAuth
- Environment variables for sensitive data
- MongoDB connection secured with credentials

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**VEDIKA SOOD**
- GitHub: [@VEDIKASOOD](https://github.com/VEDIKASOOD)

## 🙏 Acknowledgments

- Built with Next.js and MongoDB
- Styled with modern CSS design system
- Icons from emoji sets
- Food images from Unsplash

---

Made with ❤️ for restaurants and their customers
