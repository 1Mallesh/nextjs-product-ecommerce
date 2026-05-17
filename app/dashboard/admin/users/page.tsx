"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, UserX, UserCheck } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  VENDOR: "bg-blue-100 text-blue-800",
  CUSTOMER: "bg-green-100 text-green-800",
  DELIVERY_BOY: "bg-orange-100 text-orange-800",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter, page],
    queryFn: async () => {
      const { data } = await adminService.getUsers({
        search: search || undefined,
        role: roleFilter === "ALL" ? undefined : roleFilter,
        page,
      });
      return data.data;
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: adminService.toggleBlockUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User status updated");
    },
  });

  const users: import("@/types").User[] = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Users</h2>

      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-1">
          {["ALL", "CUSTOMER", "VENDOR", "DELIVERY_BOY", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                roleFilter === r ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {r === "ALL" ? "All" : r === "DELIVERY_BOY" ? "Delivery" : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !users.length ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Name", "Email", "Mobile", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.mobile}</td>
                  <td className="px-4 py-3">
                    <Badge className={ROLE_COLORS[user.role] ?? "bg-muted text-muted-foreground"} variant="outline">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? "success" : "secondary"} className="text-[10px]">
                      {user.isActive ? "Active" : "Blocked"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => toggleBlockMutation.mutate(user.id)}
                        disabled={toggleBlockMutation.isPending}
                      >
                        <UserX className="h-3.5 w-3.5 mr-1" /> Block
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => toggleBlockMutation.mutate(user.id)}
                        disabled={toggleBlockMutation.isPending}
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-1" /> Unblock
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground flex items-center px-4">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
