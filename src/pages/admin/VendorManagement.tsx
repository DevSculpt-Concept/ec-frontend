/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter, 
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Star,
  Search as SearchIcon,
  MoreVertical,
  Eye, 
  FileText,
  Plus,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "@/lib/toast";
import { useAllVendors, useUpdateVendorStatus, useUpdateVendorVerification, useDeleteVendor, useCreateVendor } from "@/hooks/useAdmin";
import { useAllServiceTypes } from "@/hooks/useServiceTypes";
 


type ConfirmAction = {
  type: 'suspend' | 'verify' | 'delete';
  vendorId: string;
  vendorName: string;
  currentState?: boolean;
} | null;

const initialVendorForm = {
  email: "",
  password: "",
  full_name: "",
  phone: "",
  business_name: "",
  bio: "",
  service_types: [] as string[],
  primary_location: "",
  contact_number: "",
  whatsapp_number: "",
  website_url: "",
};



export function VendorManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [vendorForm, setVendorForm] = useState(initialVendorForm);

  const { data: vendorsData, isLoading: vendorsLoading } = useAllVendors(page, 20, search, category, statusFilter);
  const { data: serviceTypesData } = useAllServiceTypes(false);

  const availableServiceTypes = serviceTypesData?.data?.serviceTypes || [];
  const navigate = useNavigate();
  const updateVendorStatusMutation = useUpdateVendorStatus();
  const updateVendorVerificationMutation = useUpdateVendorVerification();
  const deleteVendorMutation = useDeleteVendor();
  const createVendorMutation = useCreateVendor();

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleExport = () => {
    if (!vendors || vendors.length === 0) {
      showToast.error("No data to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "Business Name",
      "Owner Name",
      "Email",
      "Phone",
      "Category",
      "Location",
      "Status",
      "Verified",
      "Rating",
      "Created At"
    ];

    // Map vendors to CSV rows
    const rows = vendors.map((vendor: any) => [
      vendor.business_name || "",
      vendor.users?.full_name || "",
      vendor.users?.email || "",
      vendor.users?.phone || "",
      Array.isArray(vendor.service_types) ? vendor.service_types.join(", ") : (vendor.service_types || ""),
      vendor.primary_location || "",
      vendor.is_active ? "Active" : "Inactive",
      vendor.is_verified ? "Yes" : "No",
      vendor.rating || "0",
      vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : ""
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `vendors_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast.success(`Exported ${vendors.length} vendors to CSV`);
  };

  let vendors = vendorsData?.data?.vendors || [];
  const pagination = vendorsData?.data?.pagination;



  // Sort vendors based on selected criteria
  vendors = [...vendors].sort((a: any, b: any) => {
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0; // Default sort by date (from backend)
  });

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.type) {
        case 'suspend':
          await updateVendorStatusMutation.mutateAsync({
            vendorId: confirmAction.vendorId,
            isActive: !confirmAction.currentState,
          });
          showToast.success(`Vendor ${confirmAction.currentState ? 'suspended' : 'activated'} successfully`);
          break;
        case 'verify':
          await updateVendorVerificationMutation.mutateAsync({
            vendorId: confirmAction.vendorId,
            isVerified: !confirmAction.currentState,
          });
          showToast.success(`Vendor ${confirmAction.currentState ? 'unverified' : 'verified'} successfully`);
          break;
        case 'delete':
          await deleteVendorMutation.mutateAsync(confirmAction.vendorId);
          showToast.success('Vendor deleted successfully');
          break;
      }
      setConfirmAction(null);
    } catch (error) {
      showToast.error('Action failed', error instanceof Error ? error.message : 'Please try again');
    }
  };

  const handleToggleServiceType = (typeName: string) => {
    if (vendorForm.service_types.includes(typeName)) {
      setVendorForm({
        ...vendorForm,
        service_types: vendorForm.service_types.filter(t => t !== typeName),
      });
    } else {
      setVendorForm({
        ...vendorForm,
        service_types: [...vendorForm.service_types, typeName],
      });
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorForm.email || !vendorForm.password || !vendorForm.full_name || !vendorForm.business_name) {
      showToast.error("Please fill in all required fields");
      return;
    }

    try {
      await createVendorMutation.mutateAsync(vendorForm);
      showToast.success("Vendor created successfully! They are automatically verified.");
      setShowCreateModal(false);
      setVendorForm(initialVendorForm);
    } catch (error) {
      showToast.error("Failed to create vendor", error instanceof Error ? error.message : "Please try again");
    }
  };

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'delete' && (
                <>Are you sure you want to delete <strong>{confirmAction.vendorName}</strong>? This action cannot be undone.</>
              )}
              {confirmAction?.type === 'suspend' && (
                <>Are you sure you want to {confirmAction.currentState ? 'suspend' : 'activate'} <strong>{confirmAction.vendorName}</strong>?</>
              )}
              {confirmAction?.type === 'verify' && (
                <>Are you sure you want to {confirmAction.currentState ? 'unverify' : 'verify'} <strong>{confirmAction.vendorName}</strong>?</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={updateVendorStatusMutation.isPending || updateVendorVerificationMutation.isPending || deleteVendorMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={updateVendorStatusMutation.isPending || updateVendorVerificationMutation.isPending || deleteVendorMutation.isPending}
              className={confirmAction?.type === 'delete' ? 'bg-red-600 hover:bg-red-700 cursor-pointer' : 'cursor-pointer'}
            >
              {(updateVendorStatusMutation.isPending || updateVendorVerificationMutation.isPending || deleteVendorMutation.isPending) ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Vendor Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Vendor</DialogTitle>
            <DialogDescription>
              Create a new vendor account. The vendor will be automatically verified.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateVendor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Details */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Account Details</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                  placeholder="vendor@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={vendorForm.password}
                  onChange={(e) => setVendorForm({ ...vendorForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={vendorForm.full_name}
                  onChange={(e) => setVendorForm({ ...vendorForm, full_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  placeholder="+234 800 000 0000"
                />
              </div>

              {/* Business Details */}
              <div className="md:col-span-2 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Business Details</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={vendorForm.business_name}
                  onChange={(e) => setVendorForm({ ...vendorForm, business_name: e.target.value })}
                  placeholder="Awesome Events Ltd"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Location
                </label>
                <Input
                  value={vendorForm.primary_location}
                  onChange={(e) => setVendorForm({ ...vendorForm, primary_location: e.target.value })}
                  placeholder="Lagos, Nigeria"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio / Description
                </label>
                <Textarea
                  value={vendorForm.bio}
                  onChange={(e) => setVendorForm({ ...vendorForm, bio: e.target.value })}
                  placeholder="Tell us about your business..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Types <span className="text-red-500">*</span>
                </label>
                {availableServiceTypes.length === 0 ? (
                  <p className="text-sm text-gray-500">No service types available. Please add some in Service Types management.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {availableServiceTypes.map((serviceType) => (
                      <label
                        key={serviceType.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${vendorForm.service_types.includes(serviceType.name)
                          ? "bg-primary/10 border border-primary"
                          : "bg-gray-50 border border-transparent hover:bg-gray-100"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={vendorForm.service_types.includes(serviceType.name)}
                          onChange={() => handleToggleServiceType(serviceType.name)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {serviceType.display_name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {vendorForm.service_types.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {vendorForm.service_types.length} service type(s)
                  </p>
                )}
              </div>

              {/* Contact Details */}
              <div className="md:col-span-2 pt-4 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact Details</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <Input
                  value={vendorForm.contact_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, contact_number: e.target.value })}
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <Input
                  value={vendorForm.whatsapp_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, whatsapp_number: e.target.value })}
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <Input
                  type="url"
                  value={vendorForm.website_url}
                  onChange={(e) => setVendorForm({ ...vendorForm, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setVendorForm(initialVendorForm);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createVendorMutation.isPending}
                className="cursor-pointer"
              >
                {createVendorMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Vendor
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
        <div className="space-y-6">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vendor Management</h1>
              <p className="text-gray-600 text-sm mt-1">Manage all vendors on the platform</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vendor
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex gap-2 flex-1">
                <Input
                  type="text"
                  placeholder="Search by business name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} variant="outline">
                  <SearchIcon className="w-4 h-4" />
                </Button>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-2">
                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 px-3 pr-8 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {availableServiceTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.display_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="h-10 px-3 pr-8 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                </div>

                {/* Sort By */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
                    className="h-10 px-3 pr-8 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="date">Newest First</option>
                    <option value="rating">Highest Rating</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
                </div>

                {/* Export Button */}
                <Button
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Vendor Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[calc(100vh-300px)]">
              <table className="w-full">
                {/* Table Header */}
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Vendor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Ratings
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white">
                  {vendorsLoading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b border-gray-200">
                          <td className="px-6 py-4" colSpan={6}>
                            <Skeleton className="h-12 w-full" />
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : vendors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No vendors found
                      </td>
                    </tr>
                  ) : (
                    vendors.filter((vendor) => vendor && vendor.id).map((vendor) => {
                      const initials = (vendor.name || "V")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <tr
                          key={vendor.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {vendor.profileImage ? (
                                <img
                                  src={vendor.profileImage}
                                  alt={vendor.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <p className="text-sm text-gray-900 font-medium">
                                  {vendor.name}
                                </p>
                                <p className="text-xs text-gray-500">{vendor.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 capitalize">
                              {Array.isArray(vendor.category) ? vendor.category.join(', ') : vendor.category || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${vendor.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : vendor.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                                }`}
                            >
                              {vendor.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm text-gray-900">
                                {vendor.rating.toFixed(1)} ({vendor.totalReviews})
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="cursor-pointer">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/admin/vendors/${vendor.id}`)}
                                  className="cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                
                               
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 flex items-center justify-between border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {vendors.length} of {pagination.totalResults} vendors
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}


