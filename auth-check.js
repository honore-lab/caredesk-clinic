(async () => {
    const need = document.body.dataset.require;
    if (!need) return;
    const {data: {session}} = await db.auth.getSession();
    if (!session) { window.location.href = "login.html"; return; }
    if (need === "medical") {
        const role = await getRole(session.user.id);
        if (role !== "medical") {
            const role = await getRole(session.user.id);
            if (role !== "medical") {
                alert("Medical staff only."); window.location.href = "index.html"; }
            }
        }
            })();

            async function logout(e) {
                if (e) e.preventDefault();
                await db.auth.signOut();
                window.location.href = "login.html";
            }