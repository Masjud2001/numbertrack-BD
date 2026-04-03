document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('phoneBtn').addEventListener('click', async () => {
        const phone = document.getElementById('phoneInput').value;
        const results = document.getElementById('phoneResults');
        
        if (!phone) return results.innerHTML = '<div class="results error">Enter a phone number</div>';
        
        try {
            const response = await fetch('/api/trace-phone', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({phone})
            });
            const data = await response.json();
            
            if (data.error) {
                results.innerHTML = `<div class="results error">${data.error}</div>`;
            } else {
                results.innerHTML = `
                    <div class="results">
                        <div class="result-item"><strong>Number:</strong> <span>${data.phone}</span></div>
                        <div class="result-item"><strong>Carrier:</strong> <span style="color: #007bff;">${data.carrier}</span></div>
                        <div class="result-item"><strong>Location:</strong> <span>${data.location}</span></div>
                        <div class="result-item"><strong>Area:</strong> <span>${data.approximate_area}</span></div>
                        <div class="bd-flag">Bangladesh Mobile</div>
                    </div>
                `;
            }
        } catch (e) {
            results.innerHTML = '<div class="results error">Trace failed</div>';
        }
    });

    document.getElementById('ipBtn').addEventListener('click', async () => {
        const ip = document.getElementById('ipInput').value;
        const results = document.getElementById('ipResults');
        
        try {
            const response = await fetch('/api/trace-ip', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ip: ip || ''})
            });
            const data = await response.json();
            
            if (data.error) {
                results.innerHTML = `<div class="results error">${data.error}</div>`;
            } else {
                results.innerHTML = `
                    <div class="results">
                        <div class="result-item"><strong>IP:</strong> <span>${data.ip}</span></div>
                        <div class="result-item"><strong>Country:</strong> <span>${data.country}</span></div>
                        <div class="result-item"><strong>City:</strong> <span>${data.city || 'N/A'}</span></div>
                        <div class="result-item"><strong>ISP:</strong> <span>${data.isp}</span></div>
                        <div class="result-item"><strong>Lat/Lon:</strong> <span>${data.latitude}, ${data.longitude}</span></div>
                        ${data.is_bangladesh ? '<div class="bd-flag">Bangladesh IP Confirmed</div>' : ''}
                    </div>
                `;
            }
        } catch (e) {
            results.innerHTML = '<div class="results error">Trace failed</div>';
        }
    });

    document.getElementById('myIpBtn').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/my-ip');
            const data = await response.json();
            document.getElementById('ipInput').value = data.ip;
            document.getElementById('ipBtn').click();
        } catch (e) {
            alert('Failed to get your IP');
        }
    });

    // Auto-focus
    document.getElementById('phoneInput').focus();
});
