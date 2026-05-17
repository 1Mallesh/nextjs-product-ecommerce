"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Heart, Bell, User, Search, Menu, X,
  ChevronDown, MapPin, Package, LogOut, Settings,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleCart } from "@/store/slices/uiSlice";
import { logout } from "@/store/slices/authSlice";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/constants";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Offers", href: "/offers" },
];

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const cartItems = useAppSelector((s) => s.cart.items);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const getDashboardLink = () => {
    if (!user) return ROUTES.LOGIN;
    const map: Record<string, string> = {
      ADMIN: ROUTES.ADMIN_DASHBOARD,
      VENDOR: ROUTES.VENDOR_DASHBOARD,
      DELIVERY_BOY: ROUTES.DELIVERY_DASHBOARD,
      CUSTOMER: ROUTES.CUSTOMER_DASHBOARD,
    };
    return map[user.role] || ROUTES.CUSTOMER_DASHBOARD;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full bg-background transition-shadow duration-200 ${
          scrolled ? "shadow-md" : "border-b"
        }`}
      >
        {/* Top bar */}
        <div className="bg-brand text-white text-xs py-1.5 px-4 text-center hidden md:block">
          Free delivery on orders above ₹499 | Use code <strong>WELCOME50</strong> for 50% off first order
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Logo className="shrink-0" />

            {/* Search bar - desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4">
              <SearchBar className="w-full" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Mobile search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-full hover:bg-muted"
              >
                <Search className="h-5 w-5" />
              </button>

              <ThemeToggle />

              {/* Wishlist */}
              <Link href="/wishlist" className="p-2 rounded-full hover:bg-muted hidden sm:block">
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-2 rounded-full hover:bg-muted"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                    {cartItems.length > 9 ? "9+" : cartItems.length}
                  </span>
                )}
              </button>

              {/* User menu */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-muted transition-colors">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-[10px] bg-brand text-white">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-medium max-w-[80px] truncate">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className="w-fit text-[10px] mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "CUSTOMER" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.ORDERS} className="cursor-pointer">
                            <Package className="mr-2 h-4 w-4" />
                            My Orders
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={ROUTES.WISHLIST} className="cursor-pointer">
                            <Heart className="mr-2 h-4 w-4" />
                            Wishlist
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={ROUTES.LOGIN}>Login</Link>
                  </Button>
                  <Button size="sm" variant="brand" className="hidden sm:inline-flex" asChild>
                    <Link href={ROUTES.REGISTER}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 pb-3 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/vendor/onboarding" className="text-muted-foreground hover:text-brand transition-colors">
              Sell on TOKOMORT
            </Link>
          </nav>
        </div>

        {/* Mobile search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t bg-background px-4 py-3 md:hidden"
            >
              <SearchBar autoFocus onClose={() => setSearchOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl md:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <Logo />
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center h-10 px-3 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/vendor/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center h-10 px-3 rounded-md text-sm font-medium text-brand hover:bg-brand/5 transition-colors"
              >
                Sell on TOKOMORT
              </Link>
            </nav>
            {!isAuthenticated && (
              <div className="p-4 border-t flex flex-col gap-2">
                <Button asChild className="w-full" variant="brand">
                  <Link href={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href={ROUTES.REGISTER} onClick={() => setMobileMenuOpen(false)}>
                    Create Account
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
