"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/db/supabase-client";
import {
  Search,
  Calendar,
  DollarSign,
  ExternalLink,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newPayment, setNewPayment] = useState({
    client: "",
    project: "",
    total: "",
    paid: "",
    payment_method: "",
    payment_status: "Unpaid",
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
      } else {
        setPayments(paymentsData || []);
      }

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, first_name, last_name")
        .order("last_name", { ascending: true });

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
      } else {
        setClients(clientsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handlePaymentMethodChange = async (id, newMethod) => {
    setUpdating(id);
    const { error } = await supabase
      .from("payments")
      .update({ payment_method: newMethod })
      .eq("id", id);

    if (error) {
      console.error("Failed to update payment method:", error);
      alert("Failed to update payment method");
    } else {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, payment_method: newMethod } : p))
      );
    }
    setUpdating(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    const payment = payments.find((p) => p.id === id);

    const updates = {
      payment_status: newStatus,
    };

    // If marking as paid, set paid amount to total
    if (newStatus === "Paid" && payment.total) {
      updates.paid = payment.total;
    }

    const { error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Failed to update status:", error);
      console.error("Error details:", error.message, error.details, error.hint);
      alert(`Failed to update status: ${error.message || "Unknown error"}`);
    } else {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }
    setUpdating(null);
  };

  const handlePaidAmountChange = async (id, newAmount) => {
    setUpdating(id);
    const payment = payments.find((p) => p.id === id);
    const paidAmount = parseFloat(newAmount) || 0;
    const total = parseFloat(payment.total) || 0;

    const updates = {
      paid: paidAmount,
      payment_status:
        paidAmount >= total ? "Paid" : paidAmount > 0 ? "Partial" : "Unpaid",
    };

    const { error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Failed to update paid amount:", error);
      console.error("Error details:", error.message, error.details, error.hint);
      alert(
        `Failed to update paid amount: ${error.message || "Unknown error"}`
      );
    } else {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }
    setUpdating(null);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("payments")
        .insert([
          {
            client: newPayment.client,
            project: newPayment.project,
            total: parseFloat(newPayment.total) || 0,
            paid: parseFloat(newPayment.paid) || 0,
            payment_method: newPayment.payment_method,
            payment_status: newPayment.payment_status,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setPayments([data, ...payments]);
      setShowAddForm(false);
      setNewPayment({
        client: "",
        project: "",
        total: "",
        paid: "",
        payment_method: "",
        payment_status: "Unpaid",
      });
      alert("Payment record created successfully!");
    } catch (error) {
      console.error("Error creating payment:", error);
      alert(`Failed to create payment: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const term = searchTerm.toLowerCase();
  const filteredPayments = payments.filter(
    (p) =>
      p.project?.toLowerCase().includes(term) ||
      p.client?.toLowerCase().includes(term) ||
      p.payment_status?.toLowerCase().includes(term) ||
      p.payment_method?.toLowerCase().includes(term)
  );

  const totalPaidAmount = payments.reduce(
    (sum, p) => sum + (Number(p.paid) || 0),
    0
  );

  const completedPayments = payments.filter(
    (p) => p.payment_status === "Paid" || p.payment_status === "completed"
  ).length;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#74A744] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text">Payments</h1>
            <p className="text-text-muted">Track and manage payment records</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-background-light p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text">{payments.length}</p>
              <p className="text-sm text-text-muted">Total Transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-background-light p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text">
                ${totalPaidAmount.toFixed(2)}
              </p>
              <p className="text-sm text-text-muted">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-background-light p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text">
                {completedPayments}
              </p>
              <p className="text-sm text-text-muted">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background-light p-4 rounded-lg shadow-sm border border-border mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by project, client, status, or payment method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-text border border-border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-background-light rounded-lg shadow-sm border border-border">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-muted">No payments found</p>
            <p className="text-sm text-text-muted">
              Payment records will appear here when added to the database
            </p>
          </div>
        ) : (
          <div className="border border-border rounded overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-background-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Stripe
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-light divide-y divide-border">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-primary/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text">
                        {p.project || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">
                        {p.client || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-text">
                        ${Number(p.total || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={p.paid || 0}
                        onChange={(e) =>
                          handlePaidAmountChange(p.id, e.target.value)
                        }
                        disabled={updating === p.id || p.stripe_payment_id}
                        className="w-24 px-2 py-1 text-sm font-semibold text-text border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-background disabled:cursor-not-allowed disabled:text-text/70"
                        title={
                          p.stripe_payment_id
                            ? "Stripe payments cannot be edited"
                            : "Edit paid amount"
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={p.payment_method || ""}
                        onChange={(e) =>
                          handlePaymentMethodChange(p.id, e.target.value)
                        }
                        disabled={updating === p.id}
                        className={`px-2 py-1 rounded text-xs font-semibold border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                          p.payment_method?.toLowerCase() === "stripe"
                            ? "bg-blue-100 text-blue-800"
                            : p.payment_method?.toLowerCase() === "cash"
                            ? "bg-green-100 text-green-800"
                            : p.payment_method?.toLowerCase() === "credit card"
                            ? "bg-purple-100 text-purple-800"
                            : p.payment_method?.toLowerCase() === "e-transfer"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <option value="">Select...</option>
                        <option value="Cash">Cash</option>
                        <option value="Stripe">Stripe</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="E-Transfer">E-Transfer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={p.payment_status || "Unpaid"}
                        onChange={(e) =>
                          handleStatusChange(p.id, e.target.value)
                        }
                        disabled={updating === p.id}
                        className={`px-2 py-1 rounded text-xs font-semibold border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#74A744] disabled:opacity-50 ${
                          p.payment_status === "Paid" ||
                          p.payment_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : p.payment_status === "Partial" ||
                              p.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : p.payment_status === "Unpaid"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.stripe_payment_id ? (
                        <a
                          href={`https://dashboard.stripe.com/payments/${p.stripe_payment_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                          title="View in Stripe Dashboard"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold text-text">Add New Payment</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-text-muted hover:text-text"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Client Name *
                </label>
                <select
                  value={newPayment.client}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, client: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text bg-background"
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option
                      key={client.id}
                      value={`${client.first_name} ${client.last_name}`}
                    >
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newPayment.project}
                  onChange={(e) =>
                    setNewPayment({ ...newPayment, project: e.target.value })
                  }
                  required
                  placeholder="e.g., Kitchen Repaint"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Total Amount * ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPayment.total}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, total: e.target.value })
                    }
                    required
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Paid Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPayment.paid}
                    onChange={(e) =>
                      setNewPayment({ ...newPayment, paid: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Payment Method
                  </label>
                  <select
                    value={newPayment.payment_method}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text bg-background"
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="E-Transfer">E-Transfer</option>
                    <option value="Stripe">Stripe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Payment Status *
                  </label>
                  <select
                    value={newPayment.payment_status}
                    onChange={(e) =>
                      setNewPayment({
                        ...newPayment,
                        payment_status: e.target.value,
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text bg-background"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-border text-text rounded-lg hover:bg-background-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Add Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
