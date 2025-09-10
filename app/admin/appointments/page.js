import AdminHeader from "../../components/adminHeader";
import Sidebar from "../../components/Sidebar";

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AdminHeader />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 p-4">
          <p className="text-gray-700">This is the appointments page!</p>
        </div>
      </div>
    </div>
  );
}