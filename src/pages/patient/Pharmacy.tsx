import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ShoppingCart, Plus, Minus, X, Trash2,
  Upload, Pill, Package, Clock, Check, ChevronRight, Star
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';
import { medicines } from '@/lib/mock-data';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const categories = [
  { id: 'all', name: 'All', icon: Package },
  { id: 'prescription', name: 'Prescription', icon: Pill },
  { id: 'otc', name: 'OTC', icon: Package },
  { id: 'vitamins', name: 'Vitamins', icon: Pill },
  { id: 'first-aid', name: 'First Aid', icon: Package },
];

export default function Pharmacy() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: typeof medicines[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setOrderComplete(true);
    setTimeout(() => {
      setOrderComplete(false);
      setCart([]);
      setIsCartOpen(false);
    }, 3000);
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Online Pharmacy</h1>
              <p className="text-muted-foreground">Order medicines and healthcare products</p>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Prescription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Prescription</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Drag and drop your prescription here, or click to browse
                      </p>
                      <Button variant="outline" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, PDF. Max file size: 10MB.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button className="relative gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                    {cartItemsCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                        {cartItemsCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="flex w-full flex-col sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Shopping Cart ({cartItemsCount} items)</SheetTitle>
                  </SheetHeader>

                  {cart.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                      <p className="text-muted-foreground">Your cart is empty</p>
                      <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                        Continue Shopping
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 space-y-4 overflow-auto py-4">
                        <AnimatePresence mode="popLayout">
                          {cart.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center gap-4 rounded-lg border p-3"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-primary">${item.price.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      <div className="border-t pt-4">
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Delivery</span>
                            <span className="text-emerald-600">Free</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleCheckout}>
                          Proceed to Checkout
                        </Button>
                      </div>
                    </>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search & Categories */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="gap-2 rounded-full border data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMedicines.map((medicine) => (
              <StaggerItem key={medicine.id}>
                <GlassCard hover className="flex flex-col p-4">
                  <div className="relative mb-4">
                    <img
                      src={medicine.image}
                      alt={medicine.name}
                      className="h-40 w-full rounded-lg object-cover"
                    />
                    {medicine.requiresPrescription && (
                      <Badge className="absolute left-2 top-2 bg-amber-500">
                        Rx Required
                      </Badge>
                    )}
                    {medicine.inStock ? (
                      <Badge className="absolute right-2 top-2 bg-emerald-500">In Stock</Badge>
                    ) : (
                      <Badge className="absolute right-2 top-2" variant="destructive">Out of Stock</Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{medicine.name}</h3>
                    <p className="text-sm text-muted-foreground">{medicine.manufacturer}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-sm">{medicine.rating}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">${medicine.price.toFixed(2)}</span>
                      {medicine.originalPrice && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          ${medicine.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      disabled={!medicine.inStock}
                      onClick={() => addToCart(medicine)}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Order Success Modal */}
          <Dialog open={orderComplete} onOpenChange={setOrderComplete}>
            <DialogContent className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
              >
                <Check className="h-10 w-10 text-emerald-600" />
              </motion.div>
              <DialogTitle className="text-xl">Order Placed Successfully!</DialogTitle>
              <p className="text-muted-foreground">
                Your order has been confirmed. You will receive a confirmation email shortly.
              </p>
              <div className="rounded-lg bg-muted p-4 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Estimated delivery: 2-3 business days</span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
