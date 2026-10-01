import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { usePersist } from "./store.js";
import { Home, Buses, BusDetails, Login, Register, MyBookings, NotFound } from "./Pages.jsx";

export default function App() {
  const [user, setUser] = usePersist("db_user", null);
  const [users, setUsers] = usePersist("db_users", []);
  const [bookings, setBookings] = usePersist("db_bookings", []);
  const cls = ({ isActive }) => (isActive ? "active" : "");
  const mine = bookings.filter((b) => b.user === user);

  return (
    <>
      <nav className="nav">
        <span className="brand">DREAMBUS</span>
        <div className="links">
          <NavLink to="/" end className={cls}>Home</NavLink>
          <NavLink to="/buses" className={cls}>Bus Tickets</NavLink>
          <NavLink to="/my-bookings" className={cls}>My Bookings</NavLink>
          {user ? <a href="#logout" onClick={(e) => { e.preventDefault(); setUser(null); }}>Logout ({user})</a>
                : <NavLink to="/login" className={cls}>Login</NavLink>}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buses" element={<Buses />} />
        <Route path="/bus/:id" element={<BusDetails user={user} bookings={bookings} onBook={(b) => setBookings((p) => [...p, b])} />} />
        <Route path="/login" element={<Login users={users} onLogin={setUser} />} />
        <Route path="/register" element={<Register users={users} onRegister={(u) => setUsers((p) => [...p, u])} />} />
        <Route path="/my-bookings" element={user ? <MyBookings list={mine}
          onCancel={(id) => setBookings((p) => p.map((b) => b.id === id ? { ...b, status: "CANCELLED", refund: Math.round(b.total * 0.9) } : b))} />
          : <Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
