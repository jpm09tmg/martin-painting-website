"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/db/supabase-client";
import { Search, Calendar, DollarSign } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payments:", error);
      } else {
        setPayments(data || []);
      }
      setLoading(false);
    };

    fetchPayments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from("payments")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Failed to update status: ", error);
    } else {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    }
  };

  const handlePaymentMethodChange = async (id, newMethod) => {
    const { error } = await supabase
      .from("payments")
      .update({ payment_method: newMethod })
      .eq("id", id);

    if (error) {
      console.error("Failed to update payment method: ", error);
    } else {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, payment_method: newMethod } : p))
      );
    }
  };

  const term = searchTerm.toLowerCase();
  const filteredPayments = payments.filter(
    (p) =>
      p.project?.toLowerCase().includes(term) ||
      p.client?.toLowerCase().includes(term) ||
      p.status?.toLowerCase().includes(term) ||
      p.payment_method?.toLowerCase().includes(term)
  );

  const unpaidAmount = payments.reduce((sum, p) => {
    const total = Number(p.total) || 0;
    const paid = Number(p.paid) || 0;
    const remaining = total - paid;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-background-light p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-text">{payments.length}</p>
              <p className="text-sm text-text-muted">Total Payments</p>
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
                ${unpaidAmount.toFixed(2)}
              </p>
              <p className="text-sm text-text-muted">Unpaid Amount</p>
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
                    Total ($)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Paid ($)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background-light divide-y divide-border">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-primary/10">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text">
                        {p.project}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">{p.client}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">${p.total}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">${p.paid}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={p.payment_method || ""}
                        onChange={(e) =>
                          handlePaymentMethodChange(p.id, e.target.value)
                        }
                        className="px-2 py-1 rounded text-xs font-semibold bg-background-light text-text-muted border border-border-muted focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select...</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="E-Transfer">E-Transfer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={p.status}
                        onChange={(e) =>
                          handleStatusChange(p.id, e.target.value)
                        }
                        className={`bg-background-light px-2 py-1 rounded text-xs font-semibold ${
                          p.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : p.status === "Partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Partial">Partial</option>
                        <option value="Unpaid">Unpaid</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
