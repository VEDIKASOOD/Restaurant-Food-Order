import { CartProvider } from '@/contexts/CartContext';

export default function RestaurantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <CartProvider>{children}</CartProvider>;
}
