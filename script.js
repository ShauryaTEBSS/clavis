// REPLACE WITH YOUR GOOGLE SCRIPT WEB APP URL
const API_URL = "https://script.google.com/a/~/macros/s/AKfycbxvzB0OB7kjp5NcJGU5C2vfSIjvscmvQgkIrZYOrA5KzzaE5lBF0uNnrHAIJtKa8NM/exec";

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
            alert("Login Failed: " + data.message);
        }
    });
});
