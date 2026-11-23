const SUPABASE_URL="https://abogzhbqprugupjbvipt.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_ckTbRR9PFt11hYc1HFr-_A_6O6b9xbj";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c=> ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); 
}

async function getRole(userId) {
    const { data } = await db.from("profiles").select("role").eq("id", userId).single();
    return data? data.role : null;
}