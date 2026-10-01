export const SERVICE_FEE = 30;
export const LOWER = ["L01", "L02", "L03", "L04"];
export const UPPER = ["U01", "U02", "U03", "U04"];
export const buses = [
  { id: 1, name: "DreamLine Royal",  type: "AC",     from: "Mumbai", to: "Pune", dep: "21:30", arr: "01:15", fare: 750, rating: 4.6, booked: ["L02", "U03"], reserved: ["U01"] },
  { id: 2, name: "Sahyadri Sleeper", type: "Non-AC", from: "Mumbai", to: "Pune", dep: "22:15", arr: "02:30", fare: 480, rating: 4.1, booked: ["L01", "L04", "U02"], reserved: [] },
  { id: 3, name: "NightOwl Express", type: "AC",     from: "Mumbai", to: "Pune", dep: "23:00", arr: "03:10", fare: 890, rating: 4.8, booked: ["U04"], reserved: ["L03"] },
  { id: 4, name: "Konkan Cruiser",   type: "Non-AC", from: "Mumbai", to: "Goa",  dep: "19:45", arr: "07:30", fare: 990, rating: 4.3, booked: ["L01"], reserved: [] },
  { id: 5, name: "Coastal Dreamer",  type: "AC",     from: "Pune",   to: "Goa",  dep: "20:30", arr: "06:00", fare: 1150, rating: 4.5, booked: ["U02"], reserved: [] },
];
