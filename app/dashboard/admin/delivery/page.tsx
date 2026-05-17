"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bike, CheckCircle2, XCircle, Ban, Eye, Search, Clock,
  FileText, Phone, Mail, MapPin, Star, Package,
} from "lucide-react";
import { deliveryService } from "@/services/delivery.service";
import { useSocket } from "@/providers/SocketProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type ApprovalStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

const STATUS_TABS: { value: ApprovalStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SUSPENDED", label: "Suspended" },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    APPROVED: "success",
    PENDING: "warning",
    UNDER_REVIEW: "info",
    REJECTED: "destructive",
    SUSPENDED: "secondary",
  };
  return map[status] ?? "secondary";
}

export default function AdminDeliveryPage() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<ApprovalStatus>("ALL");
  const [search, setSearch] = useState("");
  const [selectedBoy, setSelectedBoy] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-boys"] });
      toast.success(`New delivery partner registered: ${data?.name ?? "Someone"}`);
    };
    socket.on("delivery.registered", handler);
    socket.on("delivery.onboarded", handler);
    return () => {
      socket.off("delivery.registered", handler);
      socket.off("delivery.onboarded", handler);
    };
  }, [socket, queryClient]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-delivery-boys", activeTab],
    queryFn: async () => {
      const { data } = await deliveryService.adminGetAll({
        status: activeTab === "ALL" ? undefined : activeTab,
        page: 1,
      });
      const payload = data.data as any;
      const items =
        payload?.deliveryBoys ??
        payload?.data ??
        (Array.isArray(payload) ? payload : []);
      return items as any[];
    },
    staleTime: 0,
    refetchInterval: 30_000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => deliveryService.adminApprove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-boys"] });
      setSelectedBoy(null);
      toast.success("Delivery partner approved!");
    },
    onError: () => toast.error("Failed to approve"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason, suspend }: { id: string; reason: string; suspend?: boolean }) =>
      suspend ? deliveryService.adminSuspend(id, reason) : deliveryService.adminReject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-boys"] });
      setShowRejectModal(null);
      setRejectReason("");
      setSelectedBoy(null);
      toast.success("Application rejected");
    },
    onError: () => toast.error("Failed to reject"),
  });

  const boys: any[] = data ?? [];
  const filtered = boys.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) ||
      b.mobile?.includes(q)
    );
  });

  const counts = {
    ALL: boys.length,
    PENDING: boys.filter((b) => b.approvalStatus === "PENDING" || b.approvalStatus === "UNDER_REVIEW").length,
    APPROVED: boys.filter((b) => b.approvalStatus === "APPROVED").length,
    REJECTED: boys.filter((b) => b.approvalStatus === "REJECTED").length,
    SUSPENDED: boys.filter((b) => b.approvalStatus === "SUSPENDED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">Delivery Partners</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, mobile..."
            className="pl-9 w-64"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === tab.value
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                tab.value === "PENDING" && counts.PENDING > 0
                  ? "bg-yellow-500 text-white"
                  : "bg-muted-foreground/20"
              }`}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : !filtered.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bike className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>{search ? "No results match your search" : "No delivery partners in this category"}</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Partner", "Contact", "Vehicle", "KYC Status", "Rating", "Deliveries", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((boy) => (
                <tr key={boy.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {boy.profilePhoto ? (
                        <img src={boy.profilePhoto} alt={boy.name} className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm">
                          {boy.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{boy.name}</p>
                        <p className="text-xs text-muted-foreground">{boy.aadhaarNumber ? `Aadhaar: ${boy.aadhaarNumber.slice(0, 4)}****` : "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" /> {boy.email}</p>
                    <p className="text-xs flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {boy.mobile}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-medium">{boy.vehicleType ?? "—"}</p>
                    <p className="text-muted-foreground">{boy.vehicleNumber ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge(boy.approvalStatus ?? "PENDING") as any} className="text-[10px]">
                      {boy.approvalStatus === "PENDING" && <Clock className="h-3 w-3 mr-1" />}
                      {boy.approvalStatus ?? "PENDING"}
                    </Badge>
                    {boy.rejectionReason && (
                      <p className="text-[10px] text-destructive mt-1 max-w-[120px] truncate">{boy.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {boy.rating?.toFixed(1) ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {boy.totalDeliveries ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(boy.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => setSelectedBoy(selectedBoy?.id === boy.id ? null : boy)}
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {(boy.approvalStatus === "PENDING" || boy.approvalStatus === "UNDER_REVIEW") && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 text-xs gap-1"
                            onClick={() => approveMutation.mutate(boy.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-destructive hover:bg-red-50 text-xs gap-1"
                            onClick={() => { setShowRejectModal(boy.id); setSelectedBoy(boy); }}
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </>
                      )}
                      {boy.approvalStatus === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-orange-600 hover:bg-orange-50 text-xs gap-1"
                          onClick={() => { setShowRejectModal(boy.id); setSelectedBoy(boy); }}
                        >
                          <Ban className="h-3.5 w-3.5" /> Suspend
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selectedBoy && !showRejectModal && (
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> KYC Details — {selectedBoy.name}
            </h3>
            <button onClick={() => setSelectedBoy(null)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Aadhaar Number</p>
              <p className="font-medium">{selectedBoy.aadhaarNumber ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">PAN Number</p>
              <p className="font-medium">{selectedBoy.panNumber ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Driving License</p>
              <p className="font-medium">{selectedBoy.drivingLicense ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Address</p>
              <p className="font-medium text-xs">{selectedBoy.address ?? "—"}</p>
            </div>
          </div>

          {/* Document images */}
          {["profilePhoto", "aadhaarFront", "aadhaarBack", "panCard", "drivingLicenseImage"].some((k) => selectedBoy[k]) && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">Uploaded Documents</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "profilePhoto", label: "Profile Photo" },
                  { key: "aadhaarFront", label: "Aadhaar Front" },
                  { key: "aadhaarBack", label: "Aadhaar Back" },
                  { key: "panCard", label: "PAN Card" },
                  { key: "drivingLicenseImage", label: "Driving License" },
                ].map(({ key, label }) =>
                  selectedBoy[key] ? (
                    <a key={key} href={selectedBoy[key]} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={selectedBoy[key]}
                        alt={label}
                        className="h-24 w-full object-cover rounded-lg border hover:opacity-80 transition-opacity"
                      />
                      <p className="text-[10px] text-muted-foreground text-center mt-1">{label}</p>
                    </a>
                  ) : null
                )}
              </div>
            </div>
          )}

          {(selectedBoy.approvalStatus === "PENDING" || selectedBoy.approvalStatus === "UNDER_REVIEW") && (
            <div className="flex gap-3 pt-2">
              <Button
                variant="brand"
                className="gap-2"
                onClick={() => approveMutation.mutate(selectedBoy.id)}
                loading={approveMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4" /> Approve Application
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setShowRejectModal(selectedBoy.id)}
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Reject / Suspend modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-semibold text-lg">
              {selectedBoy?.approvalStatus === "APPROVED" ? "Suspend" : "Reject"} Application
            </h3>
            <p className="text-sm text-muted-foreground">
              Please provide a reason for {selectedBoy?.approvalStatus === "APPROVED" ? "suspending" : "rejecting"} <strong>{selectedBoy?.name}</strong>'s application.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason (e.g. Invalid documents, Expired license...)"
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowRejectModal(null); setRejectReason(""); }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() => rejectMutation.mutate({ id: showRejectModal, reason: rejectReason, suspend: selectedBoy?.approvalStatus === "APPROVED" })}
                loading={rejectMutation.isPending}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
