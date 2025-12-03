"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/db/supabase-client";
import { Search, Calendar, DollarSign, ExternalLink, CheckCircle } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(null);

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
    const payment = payments.find(p => p.id === id);
    
    const updates = {
      payment_status: newStatus,
    };

    // If marking as paid, set paid amount to total
    if (newStatus === 'Paid' && payment.total) {
      updates.paid = payment.total;
    }

    const { error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Failed to update status:", error);
      console.error("Error details:", error.message, error.details, error.hint);
      alert(`Failed to update status: ${error.message || 'Unknown error'}`);
    } else {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }
    setUpdating(null);
  };

  const handlePaidAmountChange = async (id, newAmount) => {
    setUpdating(id);
    const payment = payments.find(p => p.id === id);
    const paidAmount = parseFloat(newAmount) || 0;
    const total = parseFloat(payment.total) || 0;

    const updates = {
      paid: paidAmount,
      payment_status: paidAmount >= total ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid',
    };

    const { error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Failed to update paid amount:", error);
      console.error("Error details:", error.message, error.details, error.hint);
      alert(`Failed to update paid amount: ${error.message || 'Unknown error'}`);
    } else {
      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    }
    setUpdating(null);
  };

  const term = searchTerm.toLowerCase();
  const filteredPayments = payments.filter(
    (p) =>
      p.project?.toLowerCase().includes(term) ||
      p.client?.toLowerCase().includes(term) ||
      p.payment_status?.toLowerCase().includes(term) ||
      p.payment_method?.toLowerCase().includes(term)
  );

  const totalPaidAmount = payments
    .reduce((sum, p) => sum + (Number(p.paid) || 0), 0);
  
  const completedPayments = payments.filter(p => 
    p.payment_status === 'Paid' || p.payment_status === 'completed'
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Track and manage payment records</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {payments.length}
              </p>
              <p className="text-sm text-gray-600">Total Transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                ${totalPaidAmount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {completedPayments}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by project, client, status, or payment method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#74A744]"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredPayments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No payments found</p>
            <p className="text-sm text-gray-400">
              Payment records will appear here when added to the database
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stripe
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {p.project || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{p.client || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${Number(p.total || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={p.paid || 0}
                        onChange={(e) => handlePaidAmountChange(p.id, e.target.value)}
                        disabled={updating === p.id || p.stripe_payment_id}
                        className="w-24 px-2 py-1 text-sm font-semibold text-green-600 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#74A744] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        title={p.stripe_payment_id ? "Stripe payments cannot be edited" : "Edit paid amount"}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={p.payment_method || ''}
                        onChange={(e) => handlePaymentMethodChange(p.id, e.target.value)}
                        disabled={updating === p.id}
                        className={`px-2 py-1 rounded text-xs font-semibold border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#74A744] disabled:opacity-50 ${
                          p.payment_method?.toLowerCase() === 'stripe' ? 'bg-blue-100 text-blue-800' :
                          p.payment_method?.toLowerCase() === 'cash' ? 'bg-green-100 text-green-800' :
                          p.payment_method?.toLowerCase() === 'credit card' ? 'bg-purple-100 text-purple-800' :
                          p.payment_method?.toLowerCase() === 'e-transfer' ? 'bg-cyan-100 text-cyan-800' :
                          'bg-gray-100 text-gray-700'
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
                        value={p.payment_status || 'Unpaid'}
                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                        disabled={updating === p.id}
                        className={`px-2 py-1 rounded text-xs font-semibold border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#74A744] disabled:opacity-50 ${
                          p.payment_status === 'Paid' || p.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                          p.payment_status === 'Partial' || p.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          p.payment_status === 'Unpaid' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-700'
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
    </div>
  );
}

