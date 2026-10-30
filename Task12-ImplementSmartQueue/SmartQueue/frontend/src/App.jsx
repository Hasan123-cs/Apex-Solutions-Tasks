
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Services from "./pages/Services";
import { ServicesProvider } from "./Context/ServicesContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import { StaffProvider } from "./Context/StaffContext";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import AppointmentManagement from "./pages/AppointmentManagement";
import LiveQueue from "./pages/LiveQueue";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerLayout from "./components/CustomerLayout";
import EmployeeLayout from "./components/employee/EmployeeLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Customer"]} />
          }
        >
          <Route element={<CustomerLayout />}>


            <Route
              path="/book"
              element={<BookAppointment />}
            />

            <Route
              path="/my-appointments"
              element={<MyAppointments />}
            />
          </Route>
        </Route>


        {/* Employee Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["Staff", "Receptionist", "Admin"]}
            />
          }
        >

          <Route
            path="/employee"
            element={<EmployeeLayout />}
          >

            <Route
              index
              element={<Navigate to="appointments" replace />}
            />
            <Route
              path="staff"
              element={
                <StaffProvider>
                  <Staff />
                </StaffProvider>
              }
            />
            {/* Admin Dashboard */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["Admin"]} />
              }
            >
              <Route
                path="dashboard"
                element={<Dashboard />}
              />
              <Route
                path="services"
                element={
                  <ServicesProvider>
                    <Services />
                  </ServicesProvider>
                }
              />
            </Route>

            <Route
              path="appointments"
              element={<AppointmentManagement />}
            />

            <Route
              path="queue"
              element={<LiveQueue />}
            />
          </Route>
        </Route>


        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
