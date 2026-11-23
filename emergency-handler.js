async function activateEmergency() {
    const {data: {session}} = await db.auth.getSession();
    if (!session) {alert("Please Log in first."); window.location.href = "login.html"; return; }

    if (!navigator.geolocation) return alert("Geolocation is not supported. call emergency services directly.");

    const phone = prompt("Enter phone number where we can reach you:");
    if (!phone) return; 
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { data: profile } = await db.from("profiles").select("full_name").eq("id", session.user.id).single();
        const {error} = await db.from("emergency_alerts").insert({
            user_id: session.user.id,
            full_name: profile?.full_name || session.user.email,
            phone,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
        });
       if (error) return alert("Failed to activate emergency: " + error.message + "\n call emergency services directly.");
       alert("emergency alert sent with your location. Stay visible and wait for help");
    }, (err) => alert("could not get location ("+ err.message+ "). allow location access or call emergency services directly."),
{ enableHighAccuracy: true, timeout: 10000,});
}