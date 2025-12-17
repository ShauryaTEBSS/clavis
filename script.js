// REPLACE WITH YOUR GOOGLE SCRIPT WEB APP URL
const API_URL = "https://script.google.com/a/~/macros/s/AKfycbxW1ZcimvY0OI1N4CSkDvYTKleIiJsgGmU2NAbLoL4bD9wA6F0jAXzWk1Nno_eSNxXZ/exec";

let serverOTP = ""; // In production, don't store OTP in JS var. This is for demo logic.

// 1. Splash Screen Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('splash-screen').classList.add('hidden');
            document.getElementById('main-container').classList.remove('hidden');
        }, 1000);
    }, 2500); // 2.5s splash
});

// 2. Navigation Logic
function showRegister() {
    document.getElementById('login-view').classList.remove('active-view');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('register-view').classList.remove('hidden');
    document.getElementById('register-view').classList.add('active-view');
}

function showLogin() {
    document.getElementById('register-view').classList.remove('active-view');
    document.getElementById('register-view').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
    document.getElementById('login-view').classList.add('active-view');
}

// 3. Multi-Step Form Logic
function nextStep(stepNum) {
    // Basic validation could go here
    document.querySelectorAll('.form-step').forEach(el => el.classList.add('hidden'));
    document.getElementById(`step-${stepNum}`).classList.remove('hidden');
    
    // Update indicator
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(`ind-${stepNum}`).classList.add('active');
}

function prevStep(stepNum) {
    document.querySelectorAll('.form-step').forEach(el => el.classList.add('hidden'));
    document.getElementById(`step-${stepNum}`).classList.remove('hidden');
    
    document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
    document.getElementById(`ind-${stepNum}`).classList.add('active');
}

// 4. OTP Logic
function sendOTP() {
    const email = document.getElementById('reg-email').value;
    if(!email) { alert("Please enter email"); return; }
    
    document.getElementById('loader').classList.remove('hidden');

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "send_otp", email: email })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('loader').classList.add('hidden');
        if(data.result === "success") {
            serverOTP = data.otp; // Storing for client-side check
            alert("OTP Sent to " + email);
            document.getElementById('otp-verify-section').classList.remove('hidden');
        }
    });
}

// 5. Dynamic ID Logic
function toggleIDOptions() {
    const country = document.getElementById('reg-country').value;
    const typeSelect = document.getElementById('reg-id-type');
    typeSelect.innerHTML = ""; // Clear options

    if(country === "India") {
        const ops = ["Aadhar Card", "PAN Card", "Voter ID"];
        ops.forEach(op => {
            let option = document.createElement("option");
            option.text = op; option.value = op;
            typeSelect.add(option);
        });
    } else {
         const ops = ["Passport", "National ID"];
         ops.forEach(op => {
            let option = document.createElement("option");
            option.text = op; option.value = op;
            typeSelect.add(option);
        });
    }
}

// 6. Registration Submission (with File Upload)
function submitRegistration() {
    const otpInput = document.getElementById('reg-otp-input').value;
    if(otpInput !== serverOTP) { alert("Invalid OTP"); return; }

    const fileInput = document.getElementById('reg-id-file');
    if(fileInput.files.length === 0) { alert("Please upload ID"); return; }
    
    const file = fileInput.files[0];
    if(file.size > 102400) { alert("File too large. Max 100kb."); return; } // 100kb check

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        const fileData = reader.result; // Base64 string

        const payload = {
            action: "register",
            username: document.getElementById('reg-username').value,
            password: document.getElementById('reg-password').value,
            email: document.getElementById('reg-email').value,
            fullName: document.getElementById('reg-name').value,
            phone: document.getElementById('reg-phone').value,
            country: document.getElementById('reg-country').value,
            orgName: document.getElementById('reg-org-name').value,
            idType: document.getElementById('reg-id-type').value,
            idNo: document.getElementById('reg-id-no').value,
            fileName: file.name,
            fileData: fileData
        };

        document.getElementById('loader').classList.remove('hidden');

        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('loader').classList.add('hidden');
            if(data.result === "success") {
                alert("Registration Successful! Check your email.");
                showLogin();
            } else {
                alert("Error: " + data.error);
            }
        });
    };
}

// 7. Login Logic
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;

    document.getElementById('loader').classList.remove('hidden');

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "login", username: u, password: p })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('loader').classList.add('hidden');
        if(data.result === "success") {
            alert("Login Successful! Welcome " + data.user.name);
            // Hide login, Show Portal (Next Phase)
            document.getElementById('login-view').classList.remove('active-view');
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('portal-view').classList.remove('hidden');
        } else {
            alert("Login Failed: " + (data.message || data.error));
        }
    });
    // ... inside your login fetch success block ...
if(data.result === "success") {
    // Check Role
    if(data.user.role === "admin") {
        alert("Welcome Administrator!");
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('admin-view').classList.remove('hidden');
        loadAdminData(); // Load admin tables
    } else {
        alert("Login Successful! Welcome " + data.user.name);
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('portal-view').classList.remove('hidden');
        loadPortalPage('announcements'); // Load announcements immediately
    }
}
});


/* --- PORTAL LOGIC --- */

// 1. Sidebar Toggle
function toggleSidebar() {
    const sb = document.getElementById("sidebar");
    const content = document.getElementById("portal-content");
    if(sb.style.width === "250px") {
        sb.style.width = "0";
        content.style.marginLeft = "0";
    } else {
        sb.style.width = "250px";
        content.style.marginLeft = "250px"; // Push content
    }
}

// 2. Page Navigation
function loadPortalPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.portal-page').forEach(p => p.classList.add('hidden'));
    // Show selected
    document.getElementById(`page-${pageName}`).classList.remove('hidden');
    // Close sidebar on mobile select
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("portal-content").style.marginLeft = "0";

    if(pageName === 'announcements') fetchAnnouncements();
}

// 3. Announcements Fetcher
function fetchAnnouncements() {
    const list = document.getElementById('announcement-list');
    list.innerHTML = "<p>Loading...</p>";
    
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "get_announcements" })
    })
    .then(res => res.json())
    .then(data => {
        if(data.result === "success") {
            list.innerHTML = "";
            data.data.forEach(ann => {
                const item = document.createElement('div');
                item.className = "webinar-card"; // Reuse card style
                item.innerHTML = `<h4>${ann.title}</h4><p>${ann.content}</p><small>${new Date(ann.date).toDateString()}</small>`;
                list.appendChild(item);
            });
        }
    });
}

// 4. Webinar Registration Logic
let currentWebinar = "";
let isPaidEvent = false;

function openWebinarForm(name, paid) {
    currentWebinar = name;
    isPaidEvent = paid;
    document.getElementById('webinar-modal').classList.remove('hidden');
    document.getElementById('modal-title').innerText = "Register: " + name;
    
    if(paid) document.getElementById('payment-field').classList.remove('hidden');
    else document.getElementById('payment-field').classList.add('hidden');
}

function closeModal() {
    document.getElementById('webinar-modal').classList.add('hidden');
}

function submitWebinar() {
    // Basic User info
    // NOTE: In a real app, you'd pull this from the logged-in session automatically
    const username = document.getElementById('login-username').value; 
    
    const payload = {
        action: "register_webinar",
        username: username,
        webinarName: currentWebinar,
        status: isPaidEvent ? "Draft (Payment Pending)" : "Confirmed"
    };

    document.getElementById('loader').classList.remove('hidden');
    fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        document.getElementById('loader').classList.add('hidden');
        closeModal();
        if(isPaidEvent) {
            alert("Registration Drafted! Please go to Payment Portal to complete.");
            loadPortalPage('payment');
        } else {
            alert("Registration Confirmed!");
        }
    });
}

// 5. Research Paper Submission Logic
function showSubTab(tab) {
    document.querySelectorAll('.sub-tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`sub-${tab}`).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function submitResearchPaper() {
    const fileInput = document.getElementById('paper-file');
    if(fileInput.files.length === 0) { alert("Please select a file"); return; }
    
    const file = fileInput.files[0];
    // Size Check: 4MB = 4 * 1024 * 1024
    if(file.size > 4194304) { alert("File too large. Max 4MB."); return; }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        const payload = {
            action: "submit_paper",
            username: document.getElementById('login-username').value,
            title: document.getElementById('paper-title').value,
            authors: document.getElementById('paper-authors').value,
            journal: document.getElementById('paper-journal').value,
            fileName: file.name,
            fileData: reader.result
        };

        document.getElementById('loader').classList.remove('hidden');
        fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json())
        .then(data => {
            document.getElementById('loader').classList.add('hidden');
            alert("Research Paper Submitted Successfully!");
        });
    };
}

// WEBINAR FLOW LOGIC
let currentWebinarName = "";
let isWebinarPaid = false;

function openWebinarForm(name, paid) {
    currentWebinarName = name;
    isWebinarPaid = paid;
    
    // Reset Modal
    document.getElementById('webinar-modal').classList.remove('hidden');
    document.getElementById('modal-step-1').classList.remove('hidden');
    document.getElementById('modal-step-2').classList.add('hidden');
    document.getElementById('modal-title').innerText = "Register: " + name;
    
    // Show/Hide Payment Warning
    if(paid) document.getElementById('payment-notice').classList.remove('hidden');
    else document.getElementById('payment-notice').classList.add('hidden');
}

function proceedWebinarFlow() {
    if(isWebinarPaid) {
        // Go to QR Screen
        document.getElementById('modal-step-1').classList.add('hidden');
        document.getElementById('modal-step-2').classList.remove('hidden');
    } else {
        // Just Submit (Free)
        submitPaidWebinar(false);
    }
}

function backToStep1() {
    document.getElementById('modal-step-2').classList.add('hidden');
    document.getElementById('modal-step-1').classList.remove('hidden');
}

function submitPaidWebinar(hasFile = true) {
    const username = document.getElementById('login-username').value; // Get logged in user
    
    let payload = {
        action: "register_webinar",
        username: username,
        webinarName: currentWebinarName,
        status: isWebinarPaid ? "Paid (Pending Verification)" : "Confirmed (Free)"
    };

    // If Paid, handle file upload
    if(hasFile && isWebinarPaid) {
        const fileInput = document.getElementById('web-payment-proof');
        if(fileInput.files.length === 0) { alert("Please upload payment screenshot"); return; }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            payload.fileName = file.name;
            payload.fileData = reader.result;
            sendWebinarData(payload);
        };
    } else {
        sendWebinarData(payload);
    }
}

function sendWebinarData(payload) {
    document.getElementById('loader').classList.remove('hidden');
    fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        document.getElementById('loader').classList.add('hidden');
        closeModal();
        alert(data.result === "success" ? "Registration Successful!" : "Error: " + data.error);
    });
}
function loadAdminData() {
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "admin_get_data" })
    })
    .then(res => res.json())
    .then(data => {
        if(data.result === "success") {
            // Render Users
            let uHtml = "<table class='clavis-table'><thead><tr><th>Name</th><th>Email</th><th>Org</th></tr></thead><tbody>";
            data.users.forEach(u => uHtml += `<tr><td>${u[4]}</td><td>${u[3]}</td><td>${u[7]}</td></tr>`); // Indices based on sheet columns
            uHtml += "</tbody></table>";
            document.getElementById('admin-users-list').innerHTML = uHtml;

            // Render Webinars
            let wHtml = "<table class='clavis-table'><thead><tr><th>User</th><th>Event</th><th>Proof</th></tr></thead><tbody>";
            data.webinars.forEach(w => {
                let proofLink = w[4] && w[4].startsWith('http') ? `<a href="${w[4]}" target="_blank">View Proof</a>` : "N/A";
                wHtml += `<tr><td>${w[1]}</td><td>${w[2]}</td><td>${proofLink}</td></tr>`;
            });
            wHtml += "</tbody></table>";
            document.getElementById('admin-webinars-list').innerHTML = wHtml;
        }
    });
}
