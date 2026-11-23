const intakeform = document.getElementById('intake-form');
if (intakeform) {
    intakeform.addEventListener('submit', async (e) => {
        e.preventDefault();
        const {data: {session}} = await db.auth.getSession();
        if (!session) {alert("Please Log in first."); window.location.href = "login.html"; return; }

        const {error} = await db.from("intake_requests").insert({
            user_id: session.user.id,
            full_name: document.getElementById("full-name").value.trim(),
            dob: document.getElementById("dob").value,
            reason: document.getElementById("reason").value.trim(),

        });
        if (error) return alert("Submission failed: " + error.message);
        alert("Intake request submitted successfully!. Our staff will review it.");
        intakeform.reset();
    });
}