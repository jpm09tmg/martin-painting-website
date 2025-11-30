"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/app/providers/AuthProvider";
import { supabase } from "@/src/lib/db/supabase-client";
import { Loader2, LogOut, Calendar, Briefcase, CreditCard, MessageCircle } from "lucide-react";
import Header from "@/src/components/layout/Header";
import ChatWidget from "@/src/components/chat/ChatWidget";

export default function CustomerHome() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/");
    } else if (session) {
      const firstName = session.user?.user_metadata?.first_name || "User";
      setUserName(firstName);
      loadCustomerData();
    }
  }, [session, loading, router]);

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
                            project.status === "completed" ? "bg-success/20 text-success" :
                            project.status === "in_progress" ? "bg-primary/20 text-primary" :
                            "bg-text-muted/20 text-text-muted"
                          }`}>
                            {project.status.replace("_", " ")}
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
                            <h3 className="font-medium text-text">{quote.service_type}</h3>
                            <p className="text-sm text-text-muted">
                              Created: {new Date(quote.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            quote.status === "approved" ? "bg-success/20 text-success" :
                            quote.status === "pending" ? "bg-primary/20 text-primary" :
                            "bg-danger/20 text-danger"
                          }`}>
                            {quote.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-text">
                            ${parseFloat(quote.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {quote.status === "approved" && (
                            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:!bg-cyan-600 transition-colors font-medium">
                              Pay Now
                            </button>
                          )}
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
      </div>
    </>
  );
}

