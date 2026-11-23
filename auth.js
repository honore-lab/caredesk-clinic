const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('registerbtn');
        btn.disabled = true;
        const {error} = await db.auth.signUp({
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value,
            options: { data : {full_name: document.getElementById("fullname").value.trim()}}
    });
    btn.disabled = false;
    if (error) return alert("Sign up failed: " + error.message);
    alert("Sign up successful! Please check your email to confirm your account.");
    window.location.href = "login.html";
    });
}
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('LoginBtn');
        btn.disabled = true;
        const {data, error} = await db.auth.signInWithPassword({
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value
        });
        btn.disabled = false;
        if (error) return alert("Login failed: " + error.message);
        const role = await getRole(data.user.id);
        window.location.href = role === 'medical' ? "medical-dashboard.html" : "index.html";
    });
}