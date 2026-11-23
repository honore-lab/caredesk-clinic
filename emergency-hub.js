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

    async function loadCenters(lat,lon) {
        listBox.innerHTML = "<p>Searching nearby facilities...</p>";

        const q= `[out:json][timeout:20];
        (
        node["amenity"~"hospital|clinic"](around:10000,${lat},${lon});
        way["amenity"~"hospital|clinic"](around:10000,${lat},${lon});
        );
        out center 30;`;

        const servers= [
            "https://overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://lz4.overpass-api.de/api/interpreter"
        ];

        try {
            let json = null;
            for (const url of servers) {
                try {
                    const res = await fetch(url, {
                        method: "POST",
                        headers: { "content-Type": "application/x-www-form-urlencoded"},
                        body : "data=" + encodeURIComponent(q)

                    });
                    if (res.ok) { json = await res.json(); break; }
                } catch (e) {  }

                }
                if (!json) throw new Error("All Overpass servers failed");

                allCenters = json.elements.map(e => ({
                    name: e.tags?.name || "Unnamed facility",
                    type: e.tags?.amenity || "",
                    speciality: e.tags?.["healthcare:speciality"] || "",
                    phone: e.tags?.phone || "",
                    lat: e.lat ?? e.center?.lat,
                    lon: e.lon ?? e.center?.lon 
                }));
                renderCenters(allCenters);

            } catch (err) {
                console.error(err);
                listBox.innerHTML = "<p>Could not load facilities.</p>";
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
    