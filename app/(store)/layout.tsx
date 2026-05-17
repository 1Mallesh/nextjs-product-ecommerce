import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CartDrawer from "@/components/shared/CartDrawer";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import LoginModal from "@/components/auth/LoginModal";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <CartDrawer />
      <MobileBottomNav />
      <LoginModal />
    </div>
  );
}
