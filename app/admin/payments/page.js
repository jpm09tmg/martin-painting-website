'use client'

import { useState } from "react"

export default function PaymentsPage() {

  const [payments, setPayments] = useState([
    { id: 1, project: "Exterior House Painting", client: "John Doe", total: 2500, paid: 1500, status: "Partial" },
    { id: 2, project: "Interior Office Painting", client: "Sarah Smith", total: 4000, paid: 4000, status: "Paid" },
    { id: 3, project: "Fence & Deck Stain", client: "Mike Lee", total: 1200, paid: 0, status: "Unpaid" },
  ])

  const handleStatusChange = (id, newStatus) => {
    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, status: newStatus } : p))
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">

        

        <div className="flex-1 p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Payments</h1>

          <div className="overflow-x-auto bg-[#F1F4E8] rounded-lg shadow border border-gray-200">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#5F9136] text-white">
                <tr>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Total ($)</th>
                  <th className="px-6 py-3">Paid ($)</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b text-gray-700 border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3">{p.project}</td>
                    <td className="px-6 py-3">{p.client}</td>
                    <td className="px-6 py-3">${p.total}</td>
                    <td className="px-6 py-3">${p.paid}</td>
                    <td className="px-6 py-3">
                     <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-semibold
                        ${p.status === "Paid" ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-700"}`}>
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
        </div>
      </div>
  )
}
