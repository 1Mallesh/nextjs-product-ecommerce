"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Truck, Bike, Copy, CheckCircle2, User, HelpCircle, Package, ArrowRight, ShieldAlert } from "lucide-react";
import { orderService } from "@/services/order.service";
import { deliveryService } from "@/services/delivery.service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from "@/constants";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>("");

  // Get orders list
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status, page],
    queryFn: async () => {
      const { data } = await orderService.adminGetAll({ status: status !== "all" ? status : undefined, page, limit: 20 });
      return data.data as any;
    },
    staleTime: 0,
  });

  // Get approved active delivery boys
  const { data: riders } = useQuery({
    queryKey: ["admin-active-riders"],
    queryFn: async () => {
      const { data } = await deliveryService.adminGetAll({ status: "APPROVED" });
      const payload = data.data as any;
      const items =
        payload?.deliveryBoys ??
        payload?.data ??
        (Array.isArray(payload) ? payload : []);
      return items.filter((b: any) => b.isAvailable) as any[];
    },
  });

  // Mutations for logistics actions
  const updateDeliveryTypeMutation = useMutation({
    mutationFn: ({ orderId, deliveryType }: { orderId: string; deliveryType: "LOCAL" | "SHIPROCKET" }) =>
      orderService.adminUpdateDeliveryType(orderId, deliveryType),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      // Update selectedOrder local state
      if (selectedOrder) {
        setSelectedOrder((prev: any) => ({ ...prev, deliveryType: res.data.data.deliveryType }));
      }
      toast.success(`Delivery method updated successfully`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update delivery method"),
  });

  const assignRiderMutation = useMutation({
    mutationFn: ({ orderId, deliveryBoyId }: { orderId: string; deliveryBoyId: string }) =>
      orderService.adminAssignDeliveryBoy(orderId, deliveryBoyId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrder(null);
      toast.success("Rider assigned to order successfully!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to assign rider"),
  });

  const shiprocketMutation = useMutation({
    mutationFn: (orderId: string) =>
      orderService.adminShipWithShiprocket(orderId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrder(null);
      toast.success("Order dispatched via Shiprocket successfully!");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to dispatch via Shiprocket"),
  });

  const handleUpdateDeliveryType = (type: "LOCAL" | "SHIPROCKET") => {
    if (!selectedOrder) return;
    updateDeliveryTypeMutation.mutate({ orderId: selectedOrder.id, deliveryType: type });
  };

  const handleAssignRider = () => {
    if (!selectedOrder || !selectedRiderId) return;
    assignRiderMutation.mutate({ orderId: selectedOrder.id, deliveryBoyId: selectedRiderId });
  };

  const handleShiprocketDispatch = () => {
    if (!selectedOrder) return;
    shiprocketMutation.mutate(selectedOrder.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">All Orders</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage customer orders, track payments, and dispatch shipments</p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <>
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {["Order #", "Customer", "Items", "Total", "Payment", "Logistics", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(data?.orders ?? data?.data ?? []).map((order: any) => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">#{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-xs">{order.user?.name || order.customer?.name || "Customer"}</p>
                          <p className="text-[10px] text-muted-foreground">{order.user?.phone || order.customer?.mobile || order.address?.phone || "—"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{order.items?.length}</td>
                      <td className="px-4 py-3 font-medium">{formatPrice(order.totalAmount ?? order.total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"} className="text-[10px]">
                          {order.paymentMethod} · {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${order.deliveryType === 'LOCAL' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30' : 'bg-purple-50 text-purple-700 dark:bg-purple-950/30'}`}>
                            {order.deliveryType === 'LOCAL' ? 'Local 🚲' : 'Shiprocket 🚀'}
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            {order.deliveryType === 'LOCAL' 
                              ? (order.delivery?.deliveryBoy?.user?.name || 'Unassigned') 
                              : (order.awbCode ? `AWB: ${order.awbCode}` : 'Not Dispatched')
                            }
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={ORDER_STATUS_COLORS[order.status]} variant="outline">
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                            <Link href={`/orders/${order.id}/tracking`}>Track</Link>
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => { setSelectedOrder(order); setSelectedRiderId(order.delivery?.deliveryBoyId || ""); }}>
                            Logistics
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {(data?.meta?.totalPages ?? 1) > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground flex items-center px-4">
                Page {page} of {data?.meta?.totalPages ?? 1}
              </span>
              <Button variant="outline" size="sm" disabled={!data?.meta?.hasNextPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      {/* Premium Logistics Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-card border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="p-5 border-b bg-muted/20 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                  <Truck className="h-5 w-5 text-brand" /> Manage Logistics
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Order #{selectedOrder.orderNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-lg font-medium"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Delivery method decision toggle */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Decision Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateDeliveryType("LOCAL")}
                    disabled={updateDeliveryTypeMutation.isPending}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      selectedOrder.deliveryType === "LOCAL"
                        ? "bg-blue-50/50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900"
                        : "bg-background hover:bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bike className="h-6 w-6" />
                    <span className="text-xs font-bold">Local Rider Delivery</span>
                    <span className="text-[10px] text-muted-foreground block font-normal text-center">Assign nearby logistics fleet</span>
                  </button>

                  <button
                    onClick={() => handleUpdateDeliveryType("SHIPROCKET")}
                    disabled={updateDeliveryTypeMutation.isPending}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      selectedOrder.deliveryType === "SHIPROCKET"
                        ? "bg-purple-50/50 border-purple-200 text-purple-700 dark:bg-purple-950/20 dark:border-purple-900"
                        : "bg-background hover:bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Truck className="h-6 w-6" />
                    <span className="text-xs font-bold">Shiprocket Courier</span>
                    <span className="text-[10px] text-muted-foreground block font-normal text-center">Inter-state express delivery</span>
                  </button>
                </div>
              </div>

              {/* Action panels based on selection */}
              {selectedOrder.deliveryType === "LOCAL" ? (
                <div className="bg-blue-50/20 border border-blue-100 rounded-xl p-5 dark:bg-blue-950/5 dark:border-blue-950 space-y-4">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Bike className="h-4 w-4 shrink-0" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Local Rider Assignment</h4>
                  </div>

                  {selectedOrder.delivery?.deliveryBoy ? (
                    <div className="bg-card border rounded-lg p-3.5 flex items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{selectedOrder.delivery.deliveryBoy.user?.name || "Assigned Rider"}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{selectedOrder.delivery.deliveryBoy.vehicleType} ({selectedOrder.delivery.deliveryBoy.vehicleNumber})</p>
                        </div>
                      </div>
                      <Badge variant="success" className="text-[9px]">Assigned</Badge>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">Select an active, available local rider to deliver this order:</p>
                      
                      <div className="flex gap-2">
                        <select
                          value={selectedRiderId}
                          onChange={(e) => setSelectedRiderId(e.target.value)}
                          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30"
                        >
                          <option value="">-- Choose Rider --</option>
                          {riders?.map((rider) => (
                            <option key={rider.id} value={rider.id}>
                              {rider.name} ({rider.vehicleType} · {rider.vehicleNumber})
                            </option>
                          ))}
                          {!riders?.length && <option disabled>No riders online currently</option>}
                        </select>

                        <Button 
                          size="sm" 
                          variant="brand" 
                          disabled={!selectedRiderId || assignRiderMutation.isPending}
                          onClick={handleAssignRider}
                        >
                          {assignRiderMutation.isPending ? "Assigning..." : "Assign"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-purple-50/20 border border-purple-100 rounded-xl p-5 dark:bg-purple-950/5 dark:border-purple-950 space-y-4">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                    <Truck className="h-4 w-4 shrink-0" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Shiprocket Dispatch</h4>
                  </div>

                  {selectedOrder.shiprocketOrderId ? (
                    <div className="bg-card border rounded-lg p-4 space-y-3 shadow-sm text-xs">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-muted-foreground">Shiprocket Order ID</span>
                        <span className="font-bold text-foreground">{selectedOrder.shiprocketOrderId}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-muted-foreground">Shipment ID</span>
                        <span className="font-semibold text-foreground">{selectedOrder.shiprocketShipmentId}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">AWB Tracking Code</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded border text-[11px]">{selectedOrder.awbCode}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrder.awbCode || "");
                              toast.success("AWB copied!");
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground">
                        Hand over shipment to Shiprocket courier service. This will automatically sync address, calculate weights, and fetch your AWB tracking code.
                      </p>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-[10px] text-yellow-800 flex gap-2">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-bold">Ready to Dispatch</p>
                          <p className="mt-0.5">Please ensure weight/dimensions are configured inside catalog prior to dispatch.</p>
                        </div>
                      </div>

                      <Button 
                        className="w-full gap-2 text-xs" 
                        variant="brand" 
                        onClick={handleShiprocketDispatch}
                        disabled={shiprocketMutation.isPending}
                      >
                        <Package className="h-4 w-4" /> 
                        {shiprocketMutation.isPending ? "Creating Shiprocket Order..." : "Dispatch via Shiprocket"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/10 flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
