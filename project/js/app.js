// App State
let currentView = 'request';
let currentRequestData = null;
let isRecording = false;

// Mock Data
const MOCK_BLOOD_BANKS = [
    { name: "Central City Blood Bank", distance: "1.2 km", status: "Out of Stock", type: "bank" },
    { name: "Metro General Hospital", distance: "3.5 km", status: "Out of Stock", type: "hospital" },
    { name: "Red Cross Donation Center", distance: "5.0 km", status: "Out of Stock", type: "center" }
];

const MOCK_DONORS = [
    { name: "Alex J.", bloodGroup: "O-", distance: "0.8 km", eta: "5 mins" },
    { name: "Sarah M.", bloodGroup: "O-", distance: "1.5 km", eta: "8 mins" },
    { name: "David K.", bloodGroup: "O-", distance: "2.1 km", eta: "12 mins" }
];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    navigate('request');
});

// Navigation Logic
function navigate(viewId) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Quick and dirty way to find the right button
    const btnMap = {
        'request': 0,
        'dashboard': 1,
        'donors': 2,
        'register': 3,
        'rewards': 4
    };
    const btns = document.querySelectorAll('.nav-btn');
    if(btns[btnMap[viewId]]) {
        btns[btnMap[viewId]].classList.add('active');
    }

    // Load template
    const template = document.getElementById(`view-${viewId}`);
    const mainContent = document.getElementById('main-content');
    
    if (template && mainContent) {
        mainContent.innerHTML = '';
        mainContent.appendChild(template.content.cloneNode(true));
        
        // Trigger view specific logic
        if (viewId === 'dashboard' && currentRequestData) {
            simulateBloodSearch();
        } else if (viewId === 'donors') {
            simulateDonorResponses();
        }
    }
}

// Handle Request Submit
function handleRequestSubmit(event) {
    event.preventDefault();
    
    const bgSelect = document.getElementById('blood-group');
    const locInput = document.getElementById('location');
    const urgSelect = document.getElementById('urgency');
    
    currentRequestData = {
        group: bgSelect.value,
        location: locInput.value,
        urgency: urgSelect.value
    };
    
    // Change to dashboard to show searching
    navigate('dashboard');
}



// Handle Donor Registration Submit
function handleRegistrationSubmit(event) {
    event.preventDefault();
    
    // Simulate successful registration
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="material-symbols-outlined">verified</span> Registration Successful!';
    submitBtn.style.background = 'var(--success)';
    submitBtn.disabled = true;
    
    // Create mock notification
    setTimeout(() => {
        alert("Thank you for registering! Your profile is active and you will receive SMS alerts for emergency blood requests in your area.");
        // Redirect back to request view after 1s
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            event.target.reset();
            navigate('request');
        }, 1000);
    }, 500);
}

// Simulate Search (Step 2 & 4 of Flow)
function simulateBloodSearch() {
    const resultsContainer = document.getElementById('availability-results');
    const headerTitle = document.querySelector('.dashboard-header h2 .tag');
    const noAvailMode = document.getElementById('no-availability-mode');
    
    if (headerTitle) {
        headerTitle.textContent = `${currentRequestData.group} Request`;
    }
    
    // Clear previous
    resultsContainer.innerHTML = '';
    noAvailMode.classList.add('hidden');
    
    // Simulate loading cards
    MOCK_BLOOD_BANKS.forEach((bank, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <h4>${bank.name} <span class="material-symbols-outlined">local_hospital</span></h4>
            <span class="distance"><span class="material-symbols-outlined" style="font-size:16px;vertical-align:middle;">route</span> ${bank.distance}</span><br>
            <div class="stock-info" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444;">
                Checking Inventory...
            </div>
            <button class="btn-primary w-100 btn-contact" disabled style="opacity:0.5; cursor:not-allowed">Contacting</button>
        `;
        resultsContainer.appendChild(card);
    });
    
    // Dynamically update the emergency alert message to reflect the requested group
    const alertMessage = document.getElementById('alert-message');
    if (alertMessage) {
        alertMessage.textContent = `No nearby blood banks have ${currentRequestData.group} blood in stock. Activating Emergency Donor Alerts.`;
    }

    // Simulate finding blood after 2 seconds
    setTimeout(() => {
        const cards = resultsContainer.querySelectorAll('.result-card');
        let totalUnits = 0;

        cards.forEach((card, index) => {
            const stockInfo = card.querySelector('.stock-info');
            const contactBtn = card.querySelector('.btn-contact');
            
            // Make all blood banks show available stock for the requested blood group
            const units = Math.floor(Math.random() * 5) + 2; // 2 to 6 units
            totalUnits += units;
            
            stockInfo.className = 'stock-info stock-available';
            stockInfo.style = ''; // Remove the inline style from loading
            stockInfo.innerHTML = `<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle">check_circle</span> ${units} Units Available`;
            
            contactBtn.textContent = 'Reserve & Navigate';
            contactBtn.disabled = false;
            contactBtn.style = '';
            contactBtn.onclick = () => { 
                showTransportModal(MOCK_BLOOD_BANKS[index].distance); 
            };
        });
        
        // Update header status to show successful scan
        const systemStatus = document.querySelector('.system-status');
        if(systemStatus) {
            systemStatus.innerHTML = `<span style="color:#10b981">Scan Complete: ${totalUnits} Units Found of ${currentRequestData.group}</span>`;
        }
        
        // Keep emergency alert hidden since we found blood
        noAvailMode.classList.add('hidden');
        
    }, 2500);
    
    // Simulate SMS Alert firing to nearby donors simultaneously
    setTimeout(() => {
        showSmsToast(currentRequestData.group, currentRequestData.location || "City Hospital");
    }, 1000);
}

// Show SMS Toast
function showSmsToast(bloodGroup, location) {
    const toast = document.getElementById('sms-toast');
    if (toast) {
        document.getElementById('sms-blood-group').textContent = bloodGroup;
        document.getElementById('sms-location').textContent = location;
        
        toast.classList.remove('hidden');
        toast.classList.remove('hide');
        
        // Hide after 5 seconds
        setTimeout(() => {
            toast.classList.add('hide');
        }, 5000);
    }
}

// Trigger Smart Donor Alerts
function triggerEmergencyAlerts() {
    const btn = document.querySelector('.btn-danger');
    btn.innerHTML = '<span class="material-symbols-outlined">sync</span> Broadcasting...';
    btn.style.opacity = '0.8';
    
    // Simulate SMS sending delay then redirect
    setTimeout(() => {
        navigate('donors');
    }, 1500);
}

// Simulate Donor Responses (Step 6)
function simulateDonorResponses() {
    const list = document.getElementById('donor-response-list');
    list.innerHTML = '';
    
    // Add responses progressively
    MOCK_DONORS.forEach((donor, index) => {
        setTimeout(() => {
            const item = document.createElement('div');
            item.className = 'response-item';
            item.innerHTML = `
                <div class="donor-info-sm">
                    <div class="donor-avatar-sm">${donor.name.charAt(0)}</div>
                    <div>
                        <strong>${donor.name}</strong> <span class="tag" style="padding: 2px 6px; font-size: 0.7rem;">${donor.bloodGroup} Match</span><br>
                        <span style="font-size: 0.8rem; color: var(--text-secondary)">${donor.distance} • ETA: ${donor.eta}</span>
                    </div>
                </div>
                <button class="btn-success" onclick="acceptDonor(this)">
                    Accept & Track Route
                </button>
            `;
            list.appendChild(item);
        }, 1500 + (index * 2000)); // Staggered incoming responses
    });
}

function acceptDonor(btn) {
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">check_circle</span> Assigned';
    btn.style.background = '#10b981';
    btn.style.color = 'white';
    btn.disabled = true;
    
    // Disable others
    const allBtns = document.querySelectorAll('.btn-success');
    allBtns.forEach(b => {
        if (b !== btn) {
            b.style.opacity = '0.5';
            b.disabled = true;
            b.innerText = 'Standby';
        }
    });
    
    alert("Assigning Doorstep Blood Delivery...");
    setTimeout(() => {
        showTransportModal(btn.dataset.distance || "2.4 km");
    }, 800);
}

// Transport Modal Logic
function showTransportModal(distance) {
    const modal = document.getElementById('transport-modal');
    if (modal) {
        document.getElementById('transport-dist').textContent = distance;
        // Simple mock ETA based on distance
        const distNum = parseFloat(distance);
        const eta = Math.max(3, Math.round(distNum * 3)); // roughly 3 mins per km
        document.getElementById('transport-eta').textContent = `${eta} Mins`;
        document.getElementById('direction-dist').textContent = distance;
        
        // Determine Delivery Mode
        let modeId = 'mode-ambulance';
        let modeName = 'Ambulance Network';
        
        if (currentRequestData && currentRequestData.urgency === 'critical') {
            modeId = 'mode-drone';
            modeName = 'Emergency Drone';
        } else if (distNum < 3) {
            modeId = 'mode-bike';
            modeName = 'Fast Urban Bike';
        }

        // Reset all mode cards
        document.querySelectorAll('.mode-card').forEach(c => {
            c.style.opacity = '0.5';
            c.style.borderColor = 'var(--glass-border)';
            c.style.boxShadow = 'none';
        });
        
        // Highlight active mode
        const activeMode = document.getElementById(modeId);
        if (activeMode) {
            activeMode.style.opacity = '1';
            activeMode.style.borderColor = 'var(--accent-blue)';
            activeMode.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
        }
        
        document.getElementById('assigned-mode-text').innerHTML = `Delivery Assigned to <strong>${modeName}</strong>`;
        
        modal.classList.remove('hidden');
    }
}

function closeTransportModal() {
    const modal = document.getElementById('transport-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}
