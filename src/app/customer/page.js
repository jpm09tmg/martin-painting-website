"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/app/providers/AuthProvider";
import { supabase } from "@/src/lib/db/supabase-client";
import { Loader2, LogOut, Calendar, Briefcase, CreditCard, MessageCircle, CheckCircle, XCircle, Eye, X } from "lucide-react";
import Header from "@/src/components/layout/Header";
import ChatWidget from "@/src/components/chat/ChatWidget";
import { loadStripe } from "@stripe/stripe-js";

export default function CustomerHome() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [payingQuoteId, setPayingQuoteId] = useState(null);
  const [paymentNotification, setPaymentNotification] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    const checkCustomerAccess = async () => {
      if (!loading && !session) {
        router.push("/");
        return;
      }
      
      if (session) {
        // Check if user has a client record
        const { data: clientData } = await supabase
          .from('clients')
          .select('first_name, last_name')
          .eq('user_id', session.user.id)
          .single();

        if (!clientData) {
          // No client record = not a customer, redirect to home
          router.push("/");
          return;
        }

        const firstName = clientData.first_name || session.user?.user_metadata?.first_name || "User";
        const email = session.user?.email || "";
        setUserName(firstName);
        setUserEmail(email);
        loadCustomerData();

        // Check for payment status in URL
        const paymentStatus = searchParams.get('payment');
        if (paymentStatus === 'success') {
          setPaymentNotification({ type: 'success', message: 'Payment successful! Thank you.' });
          // Clear URL params after showing notification
          setTimeout(() => {
            router.replace('/customer');
          }, 100);
        } else if (paymentStatus === 'cancelled') {
          setPaymentNotification({ type: 'error', message: 'Payment was cancelled.' });
          setTimeout(() => {
            router.replace('/customer');
          }, 100);
        }
      }
    };

    checkCustomerAccess();
  }, [session, loading, router, searchParams]);

  const loadCustomerData = async () => {
    try {
      // Get client info
      const { data: clientData } = await supabase
        .from("clients")
        .select("id, user_id, first_name, last_name, email")
        .eq("user_id", session.user.id)
        .single();

      if (clientData) {
        // Load upcoming appointments
        const { data: upcomingData } = await supabase
          .from("appointments")
          .select("*")
          .eq("client_id", clientData.id)
          .gte("appointment_date", new Date().toISOString().split("T")[0])
          .order("appointment_date", { ascending: true })
          .limit(3);

        // Load past appointments
        const { data: pastData } = await supabase
          .from("appointments")
          .select("*")
          .eq("client_id", clientData.id)
          .lt("appointment_date", new Date().toISOString().split("T")[0])
          .order("appointment_date", { ascending: false })
          .limit(3);

        // Load projects
        const { data: projectsData } = await supabase
          .from("projects")
          .select("*")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false })
          .limit(2);

        // Load quotes
        const { data: quotesData } = await supabase
          .from("quotes")
          .select("*")
          .eq("client_id", clientData.id)
          .order("created_at", { ascending: false })
          .limit(3);

        setUpcomingAppointments(upcomingData || []);
        setPastAppointments(pastData || []);
        setProjects(projectsData || []);
        setQuotes(quotesData || []);
      }
    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handlePayment = async (quoteId) => {
    try {
      setPayingQuoteId(quoteId);

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteId,
          clientEmail: userEmail,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setPaymentNotification({ type: 'error', message: data.error });
        setPayingQuoteId(null);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentNotification({ type: 'error', message: 'Failed to process payment' });
      setPayingQuoteId(null);
    }
  };

  const handleViewQuote = async (quoteId) => {
    try {
      // Fetch complete quote data with items
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          quote_items (
            item_name,
            description,
            quantity,
            price,
            total
          )
        `)
        .eq('id', quoteId)
        .single();

      if (error) throw error;

      setSelectedQuote(data);
      setShowQuoteModal(true);
    } catch (error) {
      console.error('Error fetching quote details:', error);
      alert('Failed to load quote details');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      <Header currentPage="profile" />
      <div className="min-h-screen bg-background-dark pt-16">
        <div className="max-w-7xl mx-auto p-6">
          {/* Payment Notification */}
          {paymentNotification && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              paymentNotification.type === 'success' 
                ? 'bg-success/20 border-success text-success' 
                : 'bg-danger/20 border-danger text-danger'
            }`}>
              {paymentNotification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{paymentNotification.message}</span>
              <button
                onClick={() => setPaymentNotification(null)}
                className="ml-auto text-current hover:opacity-70 text-2xl"
              >
                ×
              </button>
            </div>
          )}

          {/* Top Bar - Welcome & Sign Out */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text">
              Welcome, {userName}!
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:!bg-cyan-600 transition-colors font-medium flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 3 Boxes */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appointments Box */}
              <div className="bg-background border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-text">Appointments</h2>
                </div>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Upcoming Appointments */}
                    <div>
                      <h3 className="text-sm font-semibold text-text-muted uppercase mb-3">Upcoming</h3>
                      {upcomingAppointments.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingAppointments.map((apt) => (
                            <div key={apt.id} className="bg-background-light border border-border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-medium text-text text-lg">{apt.property_type || 'Appointment'}</p>
                                  <p className="text-xs text-text-muted">{apt.location_type || 'Location'}</p>
                                </div>
                                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                                  {apt.status}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {apt.appointment_date && apt.appointment_time && (
                                  <div>
                                    <p className="text-xs text-text-muted uppercase">Confirmed Date & Time</p>
                                    <p className="text-sm text-text font-medium">
                                      {new Date(apt.appointment_date).toLocaleDateString()} at {apt.appointment_time}
                                    </p>
                                  </div>
                                )}
                                {apt.preferred_date && apt.preferred_time && (
                                  <div>
                                    <p className="text-xs text-text-muted uppercase">Preferred Date & Time</p>
                                    <p className="text-sm text-text-muted">
                                      {new Date(apt.preferred_date).toLocaleDateString()} at {apt.preferred_time}
                                    </p>
                                  </div>
                                )}
                                {apt.details && (
                                  <div>
                                    <p className="text-xs text-text-muted uppercase">Details</p>
                                    <p className="text-sm text-text">{apt.details}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-text-muted text-center py-4 text-sm">No upcoming appointments</p>
                      )}
                    </div>

                    {/* Past Appointments */}
                    {pastAppointments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-text-muted uppercase mb-3">Past</h3>
                        <div className="space-y-3">
                          {pastAppointments.map((apt) => (
                            <div key={apt.id} className="bg-background-light border border-border rounded-lg p-4 opacity-75">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-medium text-text text-lg">{apt.property_type || 'Appointment'}</p>
                                  <p className="text-xs text-text-muted">{apt.location_type || 'Location'}</p>
                                </div>
                                <span className="px-3 py-1 bg-text-muted/20 text-text-muted rounded-full text-xs font-medium">
                                  {apt.status}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {apt.appointment_date && apt.appointment_time && (
                                  <div>
                                    <p className="text-xs text-text-muted uppercase">Confirmed Date & Time</p>
                                    <p className="text-sm text-text font-medium">
                                      {new Date(apt.appointment_date).toLocaleDateString()} at {apt.appointment_time}
                                    </p>
                                  </div>
                                )}
                                {apt.details && (
                                  <div>
                                    <p className="text-xs text-text-muted uppercase">Details</p>
                                    <p className="text-sm text-text">{apt.details}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Projects Box */}
              <div className="bg-background border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-text">Project Details</h2>
                </div>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : projects.length > 0 ? (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-background-light border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-text text-lg">{project.project_address || 'Project'}</h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status?.toLowerCase() === "completed" ? "bg-success/20 text-success" :
                            project.status?.toLowerCase() === "in_progress" ? "bg-primary/20 text-primary" :
                            "bg-text-muted/20 text-text-muted"
                          }`}>
                            {project.status?.replace("_", " ") || "N/A"}
                          </span>
                        </div>
                        
                        {project.description && (
                          <div className="mb-3">
                            <p className="text-xs text-text-muted uppercase mb-1">Description</p>
                            <p className="text-sm text-text">{project.description}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {project.start_date && (
                            <div>
                              <p className="text-xs text-text-muted uppercase">Start Date</p>
                              <p className="text-text">{new Date(project.start_date).toLocaleDateString()}</p>
                            </div>
                          )}
                          {project.end_date && (
                            <div>
                              <p className="text-xs text-text-muted uppercase">End Date</p>
                              <p className="text-text">{new Date(project.end_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        
                        {(project.progress !== null && project.progress !== undefined) && (
                          <div className="mt-3">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-xs text-text-muted uppercase">Project Progress</p>
                              <p className="text-sm font-semibold text-primary">{project.progress}%</p>
                            </div>
                            <div className="w-full bg-border rounded-full h-2.5">
                              <div 
                                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-center py-8">No active projects</p>
                )}
              </div>

              {/* Quotes & Payment Box */}
              <div className="bg-background border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-text">Quotes & Payment</h2>
                </div>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : quotes.length > 0 ? (
                  <div className="space-y-3">
                    {quotes.map((quote) => (
                      <div key={quote.id} className="bg-background-light border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-text">{quote.project_type}</h3>
                            <p className="text-sm text-text-muted">
                              Created: {new Date(quote.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            quote.status?.toLowerCase() === "approved" ? "bg-success/20 text-success" :
                            quote.status?.toLowerCase() === "pending" ? "bg-primary/20 text-primary" :
                            "bg-danger/20 text-danger"
                          }`}>
                            {quote.status}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-text">
                              ${parseFloat(quote.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {quote.payment_status?.toLowerCase() === "paid" && (
                              <span className="px-4 py-2 bg-success/20 text-success rounded-lg font-medium flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Paid
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewQuote(quote.id)}
                              className="flex-1 px-4 py-2 bg-background-light border border-border text-text rounded-lg hover:bg-border transition-colors font-medium flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            {quote.status?.toLowerCase() === "approved" && quote.payment_status?.toLowerCase() !== "paid" && (
                              <button 
                                onClick={() => handlePayment(quote.id)}
                                disabled={payingQuoteId === quote.id}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:!bg-cyan-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                {payingQuoteId === quote.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  'Pay Now'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        {quote.notes && (
                          <p className="text-sm text-text-muted mt-3">{quote.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-center py-8">No quotes available</p>
                )}
              </div>
            </div>

            {/* Right Column - Chat */}
            <div className="lg:col-span-1">
              <div className="bg-background border border-border rounded-lg p-6 sticky top-24 h-[calc(100vh-7rem)]">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-text">Chat with Admin</h2>
                </div>
                <div className="h-[calc(100%-3rem)]">
                  <ChatWidget isFullPage={true} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Details Modal */}
        {showQuoteModal && selectedQuote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-background z-10">
                <div>
                  <h2 className="text-2xl font-semibold text-text">
                    Quote Details
                  </h2>
                  <p className="text-sm text-text-muted mt-1">
                    Created: {new Date(selectedQuote.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedQuote.status?.toLowerCase() === "approved" ? "bg-success/20 text-success" :
                    selectedQuote.status?.toLowerCase() === "pending" ? "bg-primary/20 text-primary" :
                    "bg-danger/20 text-danger"
                  }`}>
                    {selectedQuote.status}
                  </span>
                  <button
                    onClick={() => setShowQuoteModal(false)}
                    className="text-text-muted hover:text-text transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Project Details */}
                <div>
                  <h3 className="text-lg font-medium text-text mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Project Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-background-light border border-border rounded-lg p-4">
                    {selectedQuote.project_address && (
                      <div className="md:col-span-2">
                        <span className="text-text-muted">Project Address:</span>
                        <p className="text-text font-medium mt-1">{selectedQuote.project_address}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-text-muted">Property Type:</span>
                      <p className="text-text font-medium mt-1">{selectedQuote.property_type || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Project Type:</span>
                      <p className="text-text font-medium mt-1">{selectedQuote.project_type || 'N/A'}</p>
                    </div>
                    {selectedQuote.quote_valid_until && (
                      <div>
                        <span className="text-text-muted">Valid Until:</span>
                        <p className="text-text font-medium mt-1">
                          {new Date(selectedQuote.quote_valid_until).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedQuote.project_description && (
                    <div className="mt-4 bg-background-light border border-border rounded-lg p-4">
                      <span className="text-text-muted text-sm">Description:</span>
                      <p className="text-text mt-2">{selectedQuote.project_description}</p>
                    </div>
                  )}
                </div>

                {/* Quote Items */}
                <div>
                  <h3 className="text-lg font-medium text-text mb-3">
                    Quote Items
                  </h3>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-background-light">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {selectedQuote.quote_items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                              {item.item_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-text-muted">
                              {item.description || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                              ${parseFloat(item.price).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                              ${parseFloat(item.total).toFixed(2)}
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-text-muted">
                              No items found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="mt-4 bg-primary/10 border border-primary/30 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-lg font-medium text-text">Total Amount:</span>
                    <span className="text-3xl font-bold text-primary">
                      ${parseFloat(selectedQuote.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {selectedQuote.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-text mb-3">
                      Additional Notes
                    </h3>
                    <div className="bg-background-light border border-border rounded-lg p-4">
                      <p className="text-text text-sm whitespace-pre-wrap">{selectedQuote.notes}</p>
                    </div>
                  </div>
                )}

                {/* Payment Section */}
                {selectedQuote.status?.toLowerCase() === "approved" && selectedQuote.payment_status?.toLowerCase() !== "paid" && (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-text">Ready to proceed?</p>
                        <p className="text-sm text-text-muted mt-1">This quote has been approved and is ready for payment.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setShowQuoteModal(false);
                          handlePayment(selectedQuote.id);
                        }}
                        disabled={payingQuoteId === selectedQuote.id}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:!bg-cyan-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {payingQuoteId === selectedQuote.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {selectedQuote.payment_status?.toLowerCase() === "paid" && (
                  <div className="bg-success/10 border border-success/30 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-success" />
                    <div>
                      <p className="font-medium text-success">Payment Completed</p>
                      <p className="text-sm text-text-muted mt-1">This quote has been paid in full.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border bg-background-light flex justify-end">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="px-6 py-2 bg-background border border-border text-text rounded-lg hover:bg-border transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

