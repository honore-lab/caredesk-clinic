const advisoryBox= document.getElementById("advisory-box")  ;
const searchInput = document.getElementById("center-search");
const listBox = document.getElementById("centers-list");
let allCenters = [];

function aqilabel(v){
    if (v<= 50) return "Good";
     if (v<= 100) return "Moderate";
      if (v<= 150) return "Unhealthy for sensitive groups";
       if (v<= 200) return "unhealthy";
        return "very unhealthy/ hazardous";

    
}

async function loadAdvisory(lat,lon)
{
    try {
        const [w, a] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation`).then(r => r.json()),
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5`).then(r => r.json())
]);

        advisoryBox.innerHTML= `
        <p><strong>Temperature:</strong> ${esc(w.current.temperature_2m)}celsius</p>
        <p><strong>Humidity:</strong> ${esc(w.current.relative_humidity_2m)}%</p>
        <p><strong>Air quality (us AQI):</strong> ${esc(a.current.us_aqi)} - ${aqilabel(a.current.us_aqi)}</p>
        <p><strong>PM2.5:</strong>${esc(a.current.pm2_5)} ug/m3 </p>`;
    } catch { advisoryBox.innerHTML = "<p> could not load advisory data. Try again later.</p>";}

    }

    async function loadCenters(lat, lon) {
    listBox.innerHTML = "<p>Searching nearby facilities...</p>";

    const q = `[out:json][timeout:25];
nwr["amenity"~"^(hospital|clinic)$"](around:15000,${lat},${lon});
out center 40;`;
    const servers = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter"
    ];

    const fromOverpass = async (url) => {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "data=" + encodeURIComponent(q),
            signal: AbortSignal.timeout(10000)
        });
        if (!res.ok) throw new Error(url + " status " + res.status);
        const data = await res.json();
        if (data.remark || !data.elements.length) throw new Error(url + " empty/busy");
        return data.elements.map(e => ({
            name: e.tags?.name || "Unnamed facility",
            type: e.tags?.amenity || "",
            speciality: e.tags?.["healthcare:speciality"] || "",
            phone: e.tags?.phone || "",
            lat: e.lat ?? e.center?.lat,
            lon: e.lon ?? e.center?.lon
        }));
    };

    // Backup source: Nominatim (OpenStreetMap search, max 1 request/second)
    const fromNominatim = async () => {
        const d = 0.15; // about 16 km each way
        const box = `${lon - d},${lat + d},${lon + d},${lat - d}`;
        const out = [];
        for (const kind of ["hospital", "clinic"]) {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${kind}&viewbox=${box}&bounded=1&limit=20`,
                { signal: AbortSignal.timeout(10000) });
            if (!res.ok) throw new Error("Nominatim status " + res.status);
            (await res.json()).forEach(r => out.push({
                name: r.name || r.display_name.split(",")[0],
                type: kind, speciality: "", phone: "",
                lat: r.lat, lon: r.lon
            }));
            await new Promise(r => setTimeout(r, 1100));
        }
        return out;
    };

    try {
        try {
            allCenters = await Promise.any(servers.map(fromOverpass));
        } catch {
            console.warn("Overpass unavailable, using Nominatim backup");
            allCenters = await fromNominatim();
        }
        allCenters = allCenters.filter(c => c.lat && c.lon);
        renderCenters(allCenters);
    } catch (err) {
        console.error(err);
        listBox.innerHTML = `<p>Could not load facilities right now.
            <a target="_blank" rel="noopener" href="https://www.google.com/maps/search/hospitals/@${lat},${lon},14z">Open nearby hospitals in Google Maps</a></p>`;
    }
}

        function renderCenters(list)
        {
        if (!list.length) { listBox.innerHTML = "<p>No facilities found. </p>"; return;}
        listBox.innerHTML = list.map(c => `
    <div class="card">
    <h4>${esc(c.name)}</h4>
    <p>${esc(c.type)} ${c.speciality ? ". " + esc(c.speciality) : ""}</p>
    ${c.phone ? `<p>${esc(c.phone)}</p>` : ""}
    <a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}">Directions</a>
    </div>`).join("");

        }
    searchInput?.addEventListener("input", () =>{
        const t= searchInput.value.toLowerCase();
        renderCenters(allCenters.filter(c=> 
            `${c.name} ${c.type}  ${c.speciality}`.toLowerCase().includes(t)));
    });

    navigator.geolocation.getCurrentPosition(
        p=> { loadAdvisory(p.coords.latitude, p.coords. longitude); loadCenters(p.coords.latitude,
            p.coords.longitude); },
            () => {
                loadAdvisory(-1.9441, 30.0619); loadCenters(-1.9441, 30.0619);


            });
    