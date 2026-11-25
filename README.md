## CareDesk Clinic: Patient intake & Emergency Response System

Caredesk clinic is a web application that lets patients pre-register for care and request emergency help with their live location, while medical staff review and resolve requests from a dashboard. A separate Emergency Hub shows live air-quality and weather advisories and searchable nearby hospitals and clinics. 

The problem it solves: Clinics lose time collecting basic details and locating patients in an emergency. CareDesk collects intake information before the visit and sends a patient's GPS coordinates to staff in one tap.

## Live Links & Demo
- Deployed application(via load balancer): https://caredesk-clinic.duckdns.org
- Load balancer IP: https://13.221.16.230
- Demo video: https://youtu.be/Eme5TG-Dhv0
- Repository: https://github.com/honore-lab/caredesk-clinic

## LOGIN DETAILS
- Staff (medical dashboard): staff1@gmail.com / <PASSWORD: 1234567>
- Patient: test1@gmail.com / <PASSWORD: 1234567>

## Features

- Account system: sign-up and login with email and password, with patient and medical roles.
- Patient intake form: name, date of birth and reason for visit, stores per user.
- Emergency activation: one button captures the browser's geolocation and phone number and creates an emergency alert.
- Medical staff dashboard: staff only page listing emergency alerts (with a map link to the patient's coordinates) and intake requests, with Resolve and Mark reviewed actions. it updates in real time.
- Emergency Hub: live temperature, humidity, US AQI and PM2.5 for the user's location, plus a searchable list of nearby hospitals and clinics with directions.
- Dark and light theme.

## External APIs Used & Credits
- supabase (Auth, Postgres, Realtime) 
- Open-Meteo Forecast API 
- Open-Meteo Air Quality API
- Overpass API(OpenStreesMap data)
- Broswer Geolocation API

## Multi-Tier Deployment

Server                  Role                            IP

7069-web-01             Application server              3.85.164.195
7069-web-02             Application server              52.90.237.214
7069-lb-01             Load balancer(Nginx)            13.221.16.230

**The app is static (HTML,CSS,Javascript) and uses Supabase as shared hosted database. Both servers therefore serve indetical files and share the same data, so a record submitted through web01 is visible when a request lands on web02**

## Web01 and Web02 setup

Run on each web server:
The x-served-by header retuens each server's hostname, which proves backed answered.

## Lb01 setup (Nginx)

Lb01 shipped with HAProxy already listening on port 80, so it was stopped and disabled to let Ngix take over:

- The dedault balancing method is round-robin.
- Proxy_next_upstream retries the other server if one fails.
X-Upstream shows which backend IP handled the request.

## HTTPS and Security

**Browsers only allow the Geolocation API on secure origins, so the emergency feature requires HTTPS. A free DuckDNS subdomain( caredesk-clinic.duckdns.org) was pointed at Lb01, a Let's Encrypt certificate was issued.**

- Row level security is enabled on profiles, intake_requests and emergency_alerts. Patients can insert and read only their own rowns; only users with the medical role can read all rows and update statuses.
- Role checks in auth-check.js improve the user experience, but real enforcement happens in Supabase RLS.
- All user-supplied text is escaped before being inserted into the page.
- Emergency alerts requirelogin so that every alert is tied to an account

## Challenges & solutions
- Broken apt repository: A dead certbox PPA returned 404 and aborted package installation. Removing it from /etc/apt/sources.list.d/ fixed it.
- Shared data across servers: Using supabase as a single hosted databse means both serves always see the same records.
- Keeping the servers in sync: Because each server has its own clone, updates must be pulled on both.  A short loop script handles this.

## AI USAGE 

This project used AI assistance in the following ways . The Codevibe report in `codevibe-reports/` records the measured figures, and this section explains the.

- Emergency Hub facility search: the parallel Overpass request with a Nominatim fallback, and the Google Maps fallback link.
- README: structure and parts of the text were drafted with AI.


## API KEYS / CREDENTIALS
- Supabase URL: https://abogzhbqprugupjbvipt.supabase.co
- Supabase publishable key: sb_publishable_ckTbRR9PFt11hYc1HFr-_A_6O6b9xbj
  (public client key, protected by Row Level Security)
- Open-Meteo, Overpass and Nominatim need no API key.

Author
KAMANA HERITIER HONORE, Web infrastructure, African Leadership University, Kigali, RWANDA

