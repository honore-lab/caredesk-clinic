// medical-dashboard.html
const emergencyBody = document.getElementById("emergencyTablebody");
const intakeBody = document.getElementById("intakeTablebody");

async function loadEmergencies() {
  const { data, error } = await db.from("emergency_alerts").select("*").order("created_at", { ascending: false });
  if (error) { emergencyBody.innerHTML = `<tr><td colspan="5">${esc(error.message)}</td></tr>`; return; }
  if (!data.length) { emergencyBody.innerHTML = `<tr><td colspan="5">No emergency alerts.</td></tr>`; return; }
  emergencyBody.innerHTML = data.map(r => `
    <tr>
      <td>${esc(r.full_name)}</td>
      <td>${esc(r.phone)}</td>
      <td><a target="_blank" rel="noopener" href="https://www.google.com/maps?q=${Number(r.latitude)},${Number(r.longitude)}">${Number(r.latitude).toFixed(5)}, ${Number(r.longitude).toFixed(5)}</a></td>
      <td>${esc(r.status)}</td>
      <td>${r.status === "resolved" ? "—" : `<button onclick="setStatus('emergency_alerts', ${r.id}, 'resolved')">Resolve</button>`}</td>
    </tr>`).join("");
}

async function loadIntakes() {
  const { data, error } = await db.from("intake_requests").select("*").order("created_at", { ascending: false });
  if (error) { intakeBody.innerHTML = `<tr><td colspan="4">${esc(error.message)}</td></tr>`; return; }
  if (!data.length) { intakeBody.innerHTML = `<tr><td colspan="4">No intake requests.</td></tr>`; return; }
  intakeBody.innerHTML = data.map(r => `
    <tr>
      <td>${esc(r.full_name)}</td>
      <td>${esc(r.dob)}</td>
      <td>${esc(r.reason)}</td>
      <td>${r.status === "reviewed" ? "Reviewed" : `<button onclick="setStatus('intake_requests', ${r.id}, 'reviewed')">Mark reviewed</button>`}</td>
    </tr>`).join("");
}

async function setStatus(table, id, status) {
  const { error } = await db.from(table).update({ status }).eq("id", id);
  if (error) return alert(error.message);
  table === "emergency_alerts" ? loadEmergencies() : loadIntakes();
}

function toggleTheme() {
  const dark = document.body.classList.toggle("dark");
  document.getElementById("themeToggleBtn").textContent = dark ? "Dark" : "Light";
  localStorage.setItem("theme", dark ? "dark" : "light");
}

document.getElementById("emergencyBtn")?.addEventListener("click", () => document.getElementById("emergencySection").scrollIntoView());
document.getElementById("intakeBtn")?.addEventListener("click", () => document.getElementById("intakesection").scrollIntoView());
document.getElementById("logoutBtn")?.addEventListener("click", logout);
if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

loadEmergencies();
loadIntakes();

db.channel("live").on("postgres_changes", { event: "*", schema: "public", table: "emergency_alerts" }, loadEmergencies)
  .on("postgres_changes", { event: "*", schema: "public", table: "intake_requests" }, loadIntakes).subscribe();
