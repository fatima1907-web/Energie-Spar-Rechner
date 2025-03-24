let selectedDevices = [];
let energyChart = null;

// Geräte aus JSON laden
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("devices.json");
        const data = await response.json();
        const deviceSelect = document.getElementById("deviceSelect");
        
        data.devices.forEach(device => {
            const option = document.createElement("option");
            option.value = device.watt;
            option.textContent = `${device.name} (${device.watt} W)`;
            deviceSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Fehler beim Laden der Geräte:", error);
    }
});

// Gerät hinzufügen
function addDevice() {
    const deviceSelect = document.getElementById("deviceSelect");
    const deviceName = document.getElementById("deviceName").value;
    const devicePower = document.getElementById("devicePower").value;
    const deviceCount = document.getElementById("deviceCount").value;

    let name, watt;
    
    if (deviceSelect.value) {
        name = deviceSelect.options[deviceSelect.selectedIndex].text.split(" (")[0];
        watt = parseInt(deviceSelect.value);
    } else if (deviceName && devicePower) {
        name = deviceName;
        watt = parseInt(devicePower);
    } else {
        alert("Bitte Gerät auswählen oder Name/Watt eingeben!");
        return;
    }

    selectedDevices.push({
        name: name,
        watt: watt,
        count: parseInt(deviceCount) || 1,
        hours: parseInt(document.getElementById("usageHours").value) || 0,
        days: parseInt(document.getElementById("usageDays").value) || 0,
        weeks: parseInt(document.getElementById("usageWeeks").value) || 0
    });

    updateDeviceList();
}

// Geräteliste aktualisieren
function updateDeviceList() {
    const deviceList = document.getElementById("deviceList");
    deviceList.innerHTML = "";

    selectedDevices.forEach((device, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${device.count}x ${device.name} (${device.watt} W)
            <button onclick="removeDevice(${index})">❌</button>
        `;
        deviceList.appendChild(li);
    });
}

// Gerät entfernen
function removeDevice(index) {
    selectedDevices.splice(index, 1);
    updateDeviceList();
}

// Hauptberechnung
function calculateCosts() {
    const electricityPrice = parseFloat(document.getElementById("electricityPrice").value) / 100;
    
    let totalPower24h = 0;
    let totalPowerOptimized = 0;

    selectedDevices.forEach(device => {
        const totalWatt = device.watt * device.count;
        
        // 24/7 Berechnung (365 Tage)
        totalPower24h += totalWatt * 24 * 365;
        
        // Optimierte Berechnung
        totalPowerOptimized += totalWatt * device.hours * device.days * device.weeks;
    });

    const cost24h = (totalPower24h / 1000) * electricityPrice;
    const costOptimized = (totalPowerOptimized / 1000) * electricityPrice;
    const savings = cost24h - costOptimized;

    document.getElementById("costs365").textContent = cost24h.toFixed(2);
    document.getElementById("optimizedCosts").textContent = costOptimized.toFixed(2);
    document.getElementById("savings").textContent = savings.toFixed(2);

    updateChart(cost24h, costOptimized);
}

// Diagramm aktualisieren
function updateChart(cost24h, costOptimized) {
    const ctx = document.getElementById("energyChart").getContext("2d");
    
    if (energyChart) energyChart.destroy();

    energyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["24/7 Nutzung", "Optimierte Nutzung"],
            datasets: [{
                label: "Kosten in €",
                data: [cost24h, costOptimized],
                backgroundColor: ["#446a2e", "#b0bd4f"]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// E-Mail Funktion (Beispiel)
function sendEmail() {
    const results = {
        cost24h: document.getElementById("costs365").textContent,
        optimized: document.getElementById("optimizedCosts").textContent,
        savings: document.getElementById("savings").textContent
    };
    
    alert(`Ergebnisse per E-Mail gesendet:\n
    24/7 Kosten: ${results.cost24h}€\n
    Optimierte Kosten: ${results.optimized}€\n
    Ersparnis: ${results.savings}€`);
}

