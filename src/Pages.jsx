import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { buses, LOWER, UPPER, SERVICE_FEE } from "./data.js";

/* ---------- helpers ---------- */
const takenSeats = (bus, bookings) => [
  ...bus.booked,
  ...bookings.filter((b) => b.busId === bus.id && b.status === "CONFIRMED").flatMap((b) => b.berths),
];
const free = (bus, bookings) => 8 - takenSeats(bus, bookings).length - bus.reserved.length;
const getBookings = () => { try { return JSON.parse(localStorage.getItem("db_bookings")) || []; } catch { return []; } };

function BusCard({ bus, bookings }) {
  return (
    <div className="bus-card">
      <div className="row"><strong>{bus.name}</strong><span className="pill">{bus.type} Sleeper</span></div>
      <div className="muted">{bus.dep} → {bus.arr} | {free(bus, bookings)} berths free | ★ {bus.rating}</div>
      <div className="row" style={{ marginTop: 10 }}>
        <span className="price">₹{bus.fare}</span>
        <Link className="btn-outline" to={`/bus/${bus.id}`}>View Seats</Link>
      </div>
    </div>
  );
}

/* ---------- Home ---------- */
export function Home() {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const navigate = useNavigate();
  const search = (e) => { e.preventDefault(); navigate(`/buses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`); };
  return (
    <div className="page">
      <div className="hero"><h2>Sleep your way to the destination</h2><p>Book comfortable sleeper berths on DREAMBUS in a few clicks.</p></div>
      <form className="search" onSubmit={search}>
        <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From (e.g. Mumbai)" />
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To (e.g. Pune)" />
        <button className="btn" type="submit">Search Buses</button>
      </form>
    </div>
  );
}

/* ---------- Search results (query string + filter + sort) ---------- */
export function Buses() {
  const [p] = useSearchParams();
  const [type, setType] = useState("all"); const [sort, setSort] = useState("dep");
  const from = p.get("from") || "", to = p.get("to") || "";
  const bookings = getBookings();
  let list = buses.filter((b) => (!from || b.from.toLowerCase() === from.trim().toLowerCase()) && (!to || b.to.toLowerCase() === to.trim().toLowerCase()) && (type === "all" || b.type === type));
  list = [...list].sort((a, b) => (sort === "fare" ? a.fare - b.fare : a.dep.localeCompare(b.dep)));
  return (
    <div className="page">
      <h1 className="title">Search Results</h1>
      <p className="sub">{from && to ? `${from} → ${to}` : "All routes"}</p>
      <div className="row" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{list.length} bus(es) found</h3>
        <div className="filters">
          <select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option><option value="AC">AC</option><option value="Non-AC">Non-AC</option></select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="dep">Sort: Departure</option><option value="fare">Sort: Fare</option></select>
        </div>
      </div>
      {list.map((b) => <BusCard key={b.id} bus={b} bookings={bookings} />)}
      {!list.length && <p className="muted">No buses for this route. Try Mumbai → Pune or Pune → Goa.</p>}
    </div>
  );
}

/* ---------- Bus details + seat map + booking ---------- */
export function BusDetails({ user, bookings, onBook }) {
  const { id } = useParams(); const navigate = useNavigate();
  const bus = buses.find((b) => b.id === Number(id));
  const [sel, setSel] = useState([]); const [err, setErr] = useState("");
  const [f, setF] = useState({ name: "", age: "", mobile: "" });
  if (!bus) return <div className="page"><p>Bus not found. <Link to="/buses">Back to results</Link></p></div>;
  const taken = takenSeats(bus, bookings);
  const toggle = (s) => setSel((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const fare = sel.length * bus.fare, total = fare + SERVICE_FEE;
  const deck = (title, ids) => (
    <div><strong>{title}</strong><div>{ids.map((s) => {
      const b = taken.includes(s), r = bus.reserved.includes(s);
      return <button key={s} disabled={b || r} onClick={() => toggle(s)} className={"berth" + (b ? " booked" : r ? " reserved" : sel.includes(s) ? " selected" : "")}>{s}</button>;
    })}</div></div>
  );
  const book = (e) => {
    e.preventDefault(); setErr("");
    if (!user) return navigate("/login");
    if (!sel.length) return setErr("Select at least one berth.");
    if (!/^[6-9][0-9]{9}$/.test(f.mobile)) return setErr("Enter a valid 10-digit mobile number.");
    onBook({ id: "DB2026" + Math.floor(1000 + Math.random() * 9000), busId: bus.id, bus: bus.name, route: `${bus.from} → ${bus.to}`,
      berths: sel, total, passenger: f.name, user, status: "CONFIRMED", date: new Date().toLocaleString() });
    navigate("/my-bookings");
  };
  return (
    <div className="page">
      <Link to="/buses">← Back to results</Link>
      <h1 className="title">{bus.name}</h1>
      <p className="sub">{bus.from} → {bus.to} | {bus.dep} – {bus.arr} | {bus.type} Sleeper | ₹{bus.fare} per berth</p>
      <div className="grid">
        <div className="panel">
          <div className="legend"><i style={{ background: "#fff", border: "2px solid #5B32C8" }} />Available <i style={{ background: "#16a34a" }} />Selected <i style={{ background: "#d1d5db" }} />Booked <i style={{ background: "#fde68a" }} />Reserved</div>
          {deck("Lower deck", LOWER)}{deck("Upper deck", UPPER)}
          <hr />
          {sel.length ? <div className="muted">Berths: <b>{sel.join(", ")}</b><br />Ticket fare: ₹{fare}<br />Service fee: ₹{SERVICE_FEE}<br /><b style={{ color: "#111" }}>Total: ₹{total}</b></div> : <p className="muted">No berth selected.</p>}
        </div>
        <form className="panel auth" onSubmit={book} style={{ margin: 0, maxWidth: "none" }}>
          <strong>Passenger details</strong>
          <input required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input required type="number" min="1" max="100" placeholder="Age" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} />
          <input required placeholder="Mobile (10 digits)" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} />
          {err && <div className="err">{err}</div>}
          {!user && <div className="muted">You need to log in before paying.</div>}
          <button className="btn" type="submit">Pay & Confirm</button>
        </form>
      </div>
    </div>
  );
}

/* ---------- Login ---------- */
export function Login({ users, onLogin }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    const u = users.find((x) => x.email === email.trim().toLowerCase() && x.password === pw);
    if (!u) return setErr("Invalid email or password. New here? Register first.");
    onLogin(u.name.split(" ")[0].toLowerCase()); navigate("/my-bookings");
  };
  return (
    <form className="panel auth" onSubmit={submit}>
      <h2 className="title" style={{ fontSize: 24 }}>Login</h2>
      <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input required type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <div className="err">{err}</div>}
      <button className="btn" type="submit">Login</button>
      <div className="muted">No account? <Link to="/register">Create one</Link></div>
    </form>
  );
}

/* ---------- Register (Practical 1 validation rules) ---------- */
export function Register({ users, onRegister }) {
  const empty = { name: "", email: "", mobile: "", gender: "", password: "", confirm: "", terms: false };
  const [v, setV] = useState(empty); const [errs, setErrs] = useState({}); const [ok, setOk] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const validate = () => {
    const e = {};
    if (!v.name.trim()) e.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Please enter a valid email address.";
    if (!/^[6-9][0-9]{9}$/.test(v.mobile)) e.mobile = "Enter a valid 10-digit mobile number.";
    if (!v.gender) e.gender = "Please choose a gender.";
    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}/.test(v.password)) e.password = "Min 8 characters with uppercase, lowercase, number and special character.";
    if (v.confirm !== v.password || !v.confirm) e.confirm = "Passwords do not match.";
    if (!v.terms) e.terms = "You must agree before continuing.";
    if (users.some((u) => u.email === v.email.trim().toLowerCase())) e.email = "This email is already registered.";
    return e;
  };
  const submit = (e) => {
    e.preventDefault(); const er = validate(); setErrs(er);
    if (Object.keys(er).length) return setOk(false);
    onRegister({ name: v.name.trim(), email: v.email.trim().toLowerCase(), password: v.password, mobile: v.mobile, gender: v.gender });
    setOk(true); setV(empty);
  };
  const F = ({ k, label, type = "text", children }) => (
    <div className={"fld" + (errs[k] ? " bad" : "")}><label>{label}</label>
      {children || <input type={type} value={v[k]} onChange={set(k)} />}{errs[k] && <small>{errs[k]}</small>}</div>
  );
  return (
    <form className="panel reg" onSubmit={submit} noValidate>
      <h1 className="title" style={{ textAlign: "center" }}>DREAMBUS</h1>
      <p className="sub" style={{ textAlign: "center" }}>Create your sleeper-bus traveller account</p>
      {ok && <div className="ok">Registration successful! You can now <Link to="/login">log in</Link> and book your sleeper berth.</div>}
      <div className="two">
        <F k="name" label="Full Name" /><F k="email" label="Email Address" type="email" />
        <F k="mobile" label="Mobile Number" />
        <F k="gender" label="Gender"><select value={v.gender} onChange={set("gender")}><option value="">Choose...</option><option>Male</option><option>Female</option><option>Other</option></select></F>
        <F k="password" label="Password" type="password" /><F k="confirm" label="Confirm Password" type="password" />
      </div>
      <div className={"fld" + (errs.terms ? " bad" : "")}><label><input type="checkbox" checked={v.terms} onChange={set("terms")} /> I accept the DREAMBUS booking and cancellation terms</label>{errs.terms && <small>{errs.terms}</small>}</div>
      <button className="btn" style={{ width: "100%" }} type="submit">Create Account</button>
    </form>
  );
}

/* ---------- My Bookings (protected; cancel with 90% refund) ---------- */
export function MyBookings({ list, onCancel }) {
  const [msg, setMsg] = useState("");
  return (
    <div className="page">
      <h1 className="title">My Bookings</h1>
      {msg && <div className="ok">{msg}</div>}
      {!list.length && <p className="muted">No bookings yet. <Link to="/buses">Book a sleeper berth</Link></p>}
      {list.map((b) => (
        <div className="bus-card" key={b.id} style={b.status === "CANCELLED" ? { borderLeftColor: "#dc2626" } : {}}>
          <div className="row"><strong>{b.id}</strong><span className={"pill " + (b.status === "CANCELLED" ? "red" : "")}>{b.status}</span></div>
          <div className="muted">{b.bus} | {b.route} | Berths: {b.berths.join(", ")} | Passenger: {b.passenger}</div>
          <div className="row" style={{ marginTop: 10 }}>
            <span className="price">₹{b.total}{b.refund ? <small className="muted"> (refund ₹{b.refund})</small> : null}</span>
            {b.status === "CONFIRMED" && <button className="btn-outline" onClick={() => { onCancel(b.id); setMsg(`Booking ${b.id} cancelled. Refund of ₹${Math.round(b.total * 0.9)} (90%) initiated.`); }}>Cancel</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Practical checklist ---------- */
export function Practicals() {
  const rows = [
    ["1", "Bootstrap-style registration form + client-side validation", "/register", "Try empty submit, bad email, weak password, mismatched passwords"],
    ["2", "DOM: search, filter, sort, berth selection, fare summary", "/buses", "Filter AC / Non-AC, sort by fare, click berths"],
    ["3", "ES6 features (let/const, classes, async/await)", null, "Node scripts - run locally with node (see record)"],
    ["4", "React components, props, useState", "/bus/1", "SeatMap, BookingSummary and state updates"],
    ["5", "React Router: dynamic route, query string, protected route, 404", "/my-bookings", "Logged out -> redirected to /login; try /xyz for 404"],
    ["6-9", "MongoDB, Mongoose, Node core, REST API", null, "Backend scripts - run locally (CRUD, API, seat-clash 409)"],
    ["10", "MERN flow: search -> seats -> pay -> My Bookings -> cancel (90% refund)", "/", "Data persisted in browser storage on this deployment"],
  ];
  return (
    <div className="page">
      <h1 className="title">Practical Checklist</h1>
      <p className="sub">Open each feature of the DREAMBUS project record</p>
      {rows.map(([n, t, to, h]) => (
        <div className="bus-card" key={n}><div className="row"><strong>Practical {n}</strong>{to ? <Link className="btn-outline" to={to}>Open</Link> : <span className="pill red">Local only</span>}</div>
          <div>{t}</div><div className="muted">{h}</div></div>
      ))}
    </div>
  );
}

export function NotFound() {
  const { pathname } = useLocation();
  return <div className="page" style={{ textAlign: "center" }}><h1 className="title" style={{ fontSize: 64 }}>404</h1><p>No page at <code>{pathname}</code></p><Link to="/">Go Home</Link></div>;
}
