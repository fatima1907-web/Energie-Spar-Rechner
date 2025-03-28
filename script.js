
// Array für ausgewählte Geräte
let selectedDevices = [];
let energyChart = null;
let editIndex = -1;

// Ereignis beim Laden der Seite
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Ladebenachrichtigung anzeigen
        showLoadingMessage("Lade Geräteliste...");
        
        // Geräte aus JSON-Datei laden
        const response = await fetch("devices.json");
        const data = await response.json();
        const deviceSelect = document.getElementById("deviceSelect");
        
        // Option für benutzerdefinierte Eingabe hinzufügen
        const customOption = document.createElement("option");
        customOption.value = "custom";
        customOption.textContent = "Eigene Angaben";
        deviceSelect.appendChild(customOption);
        
        // Vordefinierte Geräte zum Dropdown hinzufügen
        data.devices.forEach(device => {
            const option = document.createElement("option");
            option.value = device.watt;
            option.textContent = `${device.name} (${device.watt} W)`;
            deviceSelect.appendChild(option);
        });
        
        // Event-Listener für Dropdown-Änderungen hinzufügen
        deviceSelect.addEventListener('change', handleDeviceSelectChange);
        
        // Ladebenachrichtigung ausblenden
        hideLoadingMessage();

        // Gespeicherte Geräte laden
        loadSavedDevices();
        updateDeviceList();
        
        // Tooltips hinzufügen
        addTooltips();
    } catch (error) {
        console.error("Fehler beim Laden der Geräte:", error);
        showErrorMessage("Fehler beim Laden der Geräteliste. Bitte Seite neu laden.");
    }
});

// Funktion zur Behandlung von Dropdown-Änderungen
function handleDeviceSelectChange() {
    const deviceSelect = document.getElementById("deviceSelect");
    const deviceNameInput = document.getElementById("deviceName");
    const devicePowerInput = document.getElementById("devicePower");

    if (deviceSelect.value === "custom") {
        // Wenn "custom" ausgewählt ist, Eingabefelder aktivieren
        deviceNameInput.disabled = false;
        devicePowerInput.disabled = false;

        // Eingabefelder zurücksetzen
        deviceNameInput.value = "";
        devicePowerInput.value = "";
    } else {
        // Wenn ein vordefiniertes Gerät ausgewählt ist
        deviceNameInput.disabled = true;
        devicePowerInput.disabled = true;

        // Auswahl des Gerätenamens und der Wattzahl
        const selectedOption = deviceSelect.options[deviceSelect.selectedIndex];
        if (selectedOption.value) { // Nur wenn ein echtes Gerät ausgewählt wurde
            const deviceNameMatch = selectedOption.textContent.match(/(.+)/);
            if (deviceNameMatch) {
                deviceNameInput.value = deviceNameMatch[1];
                devicePowerInput.value = selectedOption.value;
            }
        }
    }
}


// Tooltips für Eingabefelder erweitern
function addTooltips() {
    const tooltips = [
        { 
            id: "deviceSelect", 
            text: "Wähle ein vordefiniertes Gerät oder 'Eigene Angaben' für individuelle Eingabe" 
        },
        { 
            id: "deviceName", 
            text: "Name deines Geräts. Bei vordefinierten Geräten wird der Name automatisch ausgefüllt" 
        },
        { 
            id: "devicePower", 
            text: "Stromverbrauch in Watt (W). Bei vordefinierten Geräten wird der Wert automatisch eingefügt" 
        },
        { id: "deviceCount", text: "Anzahl der identischen Geräte" },
        { id: "usageHours", text: "Durchschnittliche Nutzungsdauer pro Tag" },
        { id: "usageDays", text: "Anzahl der Tage pro Woche" },
        { id: "usageWeeks", text: "Anzahl der Wochen pro Jahr" },
        { id: "electricityPrice", text: "Aktueller Strompreis in Cent pro Kilowattstunde (kWh)" }
    ];
    
    // Tooltips für jedes Element erstellen
    tooltips.forEach(tooltip => {
        const element = document.getElementById(tooltip.id);
        const label = element.previousElementSibling;
        
        // Tooltip-Symbol erstellen
        const tooltipSpan = document.createElement("span");
        tooltipSpan.className = "tooltip";
        tooltipSpan.innerHTML = "ℹ️";
        
        // Tooltip-Text erstellen
        const tooltipText = document.createElement("span");
        tooltipText.className = "tooltip-text";
        tooltipText.textContent = tooltip.text;
        
        // Tooltip-Elemente zusammenfügen
        tooltipSpan.appendChild(tooltipText);
        label.appendChild(tooltipSpan);
    });
}



// Ladeanzeige anzeigen
function showLoadingMessage(message) {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "loadingMessage";
    loadingDiv.className = "info-message";
    loadingDiv.textContent = message || "Lade...";
    document.querySelector(".container").appendChild(loadingDiv);
}

// Ladeanzeige verstecken
function hideLoadingMessage() {
    const loadingDiv = document.getElementById("loadingMessage");
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Fehlermeldung anzeigen
function showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    document.querySelector(".container").appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Erfolgsmeldung anzeigen
function showSuccessMessage(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.textContent = message;
    document.querySelector(".input-section").appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Gespeicherte Geräte aus localStorage laden
function loadSavedDevices() {
    const savedDevices = localStorage.getItem("energyCalculatorDevices");
    if (savedDevices) {
        try {
            selectedDevices = JSON.parse(savedDevices);
        } catch (e) {
            console.error("Fehler beim Laden der gespeicherten Geräte:", e);
            localStorage.removeItem("energyCalculatorDevices");
        }
    }
}

// Geräteliste im localStorage speichern
function saveDevicesToStorage() {
    localStorage.setItem("energyCalculatorDevices", JSON.stringify(selectedDevices));
}

// Gerät hinzufügen
function addDevice() {
    const deviceSelect = document.getElementById("deviceSelect");
    const deviceName = document.getElementById("deviceName").value.trim();
    const devicePower = document.getElementById("devicePower").value;
    const deviceCount = parseInt(document.getElementById("deviceCount").value) || 1;
    const usageHours = parseInt(document.getElementById("usageHours").value) || 0;
    const usageDays = parseInt(document.getElementById("usageDays").value) || 0;
    const usageWeeks = parseInt(document.getElementById("usageWeeks").value) || 0;

    let name, watt;

    if (deviceSelect.value === "custom") {
        // Benutzerdefinierte Eingabe
        if (!deviceName || !devicePower) {
            showErrorMessage("Bitte Name und Wattzahl angeben!");
            return;
        }
        name = deviceName;
        watt = parseInt(devicePower);
    } else if (deviceSelect.value) {
        // Vordefiniertes Gerät
        name = deviceSelect.options[deviceSelect.selectedIndex].text.split(" (")[0];
        watt = parseInt(deviceSelect.value);
    } else {
        showErrorMessage("Bitte Gerät oder Name/Watt angeben!");
        return;
    }

    if (isNaN(watt)) {
        showErrorMessage("Bitte eine gültige Wattzahl angeben!");
        return;
    }

    if (watt <= 0) {
        showErrorMessage("Die Wattzahl muss größer als 0 sein!");
        return;
    }

    if (deviceCount <= 0) {
        showErrorMessage("Die Anzahl der Geräte muss mindestens 1 sein!");
        return;
    }

    if (usageHours < 0 || usageHours > 24) {
        showErrorMessage("Die Stunden pro Tag müssen zwischen 0 und 24 liegen!");
        return;
    }

    if (usageDays < 1 || usageDays > 7) {
        showErrorMessage("Die Tage pro Woche müssen zwischen 1 und 7 liegen!");
        return;
    }

    if (usageWeeks < 0 || usageWeeks > 52) {
        showErrorMessage("Die Wochen pro Jahr müssen zwischen 0 und 52 liegen!");
        return;
    }

    const newDevice = {
        name: name,
        watt: watt,
        count: deviceCount,
        hours: usageHours,
        days: usageDays,
        weeks: usageWeeks
    };

    if (editIndex >= 0) {
        // Gerät bearbeiten
        selectedDevices[editIndex] = newDevice;
        editIndex = -1;
        showSuccessMessage(`${name} wurde erfolgreich aktualisiert!`);
    } else {
        // Neues Gerät hinzufügen
        selectedDevices.push(newDevice);
        showSuccessMessage(`${name} wurde erfolgreich hinzugefügt!`);
    }

    // Eingabefelder zurücksetzen
    resetInputFields();
    updateDeviceList();
    saveDevicesToStorage();
}


// Eingabefelder zurücksetzen
function resetInputFields() {
    document.getElementById("deviceSelect").selectedIndex = 0;
    document.getElementById("deviceName").value = "";
    document.getElementById("devicePower").value = "";
    document.getElementById("deviceCount").value = "1";
    document.getElementById("usageHours").value = "6";
    document.getElementById("usageDays").value = "5";
    document.getElementById("usageWeeks").value = "45";
    
    // Button-Text ändern, falls im Bearbeitungsmodus
    const addButton = document.querySelector(".input-section button");
    addButton.textContent = "Hinzufügen";
}

// Geräteliste aktualisieren
function updateDeviceList() {
    const deviceList = document.getElementById("deviceList");
    const noDevicesMessage = document.getElementById("noDevicesMessage");
    
    deviceList.innerHTML = "";
    
    if (selectedDevices.length === 0) {
        noDevicesMessage.style.display = "block";
        return;
    } else {
        noDevicesMessage.style.display = "none";
    }

    selectedDevices.forEach((device, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${device.count}x ${device.name} (${device.watt} W) - ${device.hours}h/${device.days}d/${device.weeks}w
            <div class="device-actions">
                <button class="edit-button" onclick="editDevice(${index})" title="Gerät bearbeiten">✏️</button>
                <button onclick="removeDevice(${index})" title="Gerät entfernen">❌</button>
            </div>
        `;
        deviceList.appendChild(li);
    });
}

// Gerät entfernen
function removeDevice(index) {
    if (confirm("Möchtest du dieses Gerät wirklich entfernen?")) {
        selectedDevices.splice(index, 1);
        updateDeviceList();
        saveDevicesToStorage();
    }
}

// Gerät bearbeiten
function editDevice(index) {
    const device = selectedDevices[index];
    editIndex = index;
    
    // Eingabefelder mit Gerätedaten füllen
    document.getElementById("deviceSelect").selectedIndex = 0; // Zurücksetzen
    document.getElementById("deviceName").value = device.name;
    document.getElementById("devicePower").value = device.watt;
    document.getElementById("deviceCount").value = device.count;
    document.getElementById("usageHours").value = device.hours;
    document.getElementById("usageDays").value = device.days;
    document.getElementById("usageWeeks").value = device.weeks;
    
    // Button-Text ändern
    const addButton = document.querySelector(".input-section button");
    addButton.textContent = "Aktualisieren";
    
    // Zum Eingabeformular scrollen
    
}

// Alle Geräte zurücksetzen
function resetDevices() {
    if (confirm("Möchtest du wirklich alle Geräte zurücksetzen?")) {
        selectedDevices = [];
        updateDeviceList();
        saveDevicesToStorage();
        showSuccessMessage("Alle Geräte wurden zurückgesetzt");
    }
}

function calculateCosts() {
    const electricityPrice = parseFloat(document.getElementById("electricityPrice").value) / 100;
    const calculationYears = parseInt(document.getElementById("calculationYears").value);
    
    if (selectedDevices.length === 0) {
        showErrorMessage("Bitte füge mindestens ein Gerät hinzu!");
        return;
    }
    
    if (isNaN(electricityPrice) || electricityPrice <= 0) {
        showErrorMessage("Bitte gib einen gültigen Strompreis ein!");
        return;
    }
    
    if (isNaN(calculationYears) || calculationYears < 1 || calculationYears > 20) {
        showErrorMessage("Bitte gib eine gültige Anzahl von Jahren zwischen 1 und 20 ein!");
        return;
    }
    
    let totalPower24h = 0;
    let totalPowerOptimized = 0;

    selectedDevices.forEach(device => {
        if (!device.watt || !device.count) {
            console.error("Ungültige Gerätedaten:", device);
            return;
        }
        
        const totalWatt = device.watt * device.count;
        
        // Berechnung für ein Jahr
        totalPower24h += totalWatt * 24 * 7 * 52;
        
        const hours = device.hours || 0;
        const days = device.days || 0;
        const weeks = device.weeks || 0;
        
        totalPowerOptimized += totalWatt * hours * days * weeks;
    });

    const cost24h = (totalPower24h / 1000) * electricityPrice;
    const costOptimized = (totalPowerOptimized / 1000) * electricityPrice;
    const savings = cost24h - costOptimized;
    const savingsPercentage = cost24h > 0 ? ((savings / cost24h) * 100).toFixed(1) : 0;
    
    // CO2-Berechnung (durchschnittlich 401g CO2 pro kWh in Deutschland 2023)
    const co2Factor = 0.401; // kg CO2 pro kWh
    const co2Savings = ((totalPower24h - totalPowerOptimized) / 1000 * co2Factor).toFixed(2);

    // Update year-specific texts
    document.getElementById("yearsPeriod").textContent = calculationYears;
    document.getElementById("yearsOptimizedPeriod").textContent = calculationYears;
    
    document.getElementById("costs365").textContent = cost24h.toFixed(2);
    document.getElementById("optimizedCosts").textContent = costOptimized.toFixed(2);
    document.getElementById("savings").textContent = savings.toFixed(2);
    document.getElementById("savingsPercentage").textContent = savingsPercentage;
    document.getElementById("co2Savings").textContent = co2Savings;

    // Diagramm-Daten für mehrere Jahre
    const yearlyData24h = cost24h * calculationYears;
    const yearlyDataOptimized = costOptimized * calculationYears;

    updateChart(calculationYears, yearlyData24h, yearlyDataOptimized);
    
    // Zu den Ergebnissen scrollen
    
}

// Diagramm aktualisieren
function updateChart(calculationYears, totalCost24h, totalCostOptimized) {
    const ctx = document.getElementById("energyChart").getContext("2d");
   
    if (energyChart) energyChart.destroy();
   
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Create labels with actual years
    const labels = Array.from({length: calculationYears}, (_, i) => currentYear + i);
    
    // Berechnung der kumulativen Kosten pro Jahr
    const fullUsageData = Array(calculationYears).fill(totalCost24h / calculationYears);
    const optimizedData = Array(calculationYears).fill(totalCostOptimized / calculationYears);
    
    // Kumulierte Daten berechnen
    const fullUsageCumulative = fullUsageData.map((value, index) => 
        fullUsageData.slice(0, index + 1).reduce((a, b) => a + b, 0)
    );
    const optimizedCumulative = optimizedData.map((value, index) => 
        optimizedData.slice(0, index + 1).reduce((a, b) => a + b, 0)
    );
    const savingsCumulative = fullUsageCumulative.map((full, index) => 
        full - optimizedCumulative[index]
    );

    energyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Kumulierte Kosten Dauerbetrieb',
                    data: fullUsageCumulative,
                    backgroundColor: '#036bb1',
                    borderColor: '#344e26',
                    borderWidth: 1
                },
                {
                    label: 'Kumulierte Kosten Optimierter Betrieb',
                    data: optimizedCumulative,
                    backgroundColor: '#3498db',
                    borderColor: '#9ca947',
                    borderWidth: 1
                },
                {
                    label: 'Kumulierte Ersparnis',
                    data: savingsCumulative,
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 2,
                    type: 'line',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Kumulierte Kosten in €'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Jahr'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)} €`;
                        }
                    }
                },
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

// E-Mail Funktion (Beispiel)
function sendEmail() {
    // Prüfen, ob Berechnungen durchgeführt wurden
    const savings = document.getElementById("savings").textContent;
    if (savings === "0") {
        showErrorMessage("Bitte führe zuerst eine Berechnung durch!");
        return;
    }

    const results = {
        cost24h: document.getElementById("costs365").textContent,
        optimized: document.getElementById("optimizedCosts").textContent,
        savings: document.getElementById("savings").textContent,
        savingsPercentage: document.getElementById("savingsPercentage").textContent,
        co2Savings: document.getElementById("co2Savings").textContent
    };
    
    // E-Mail-Adresse abfragen
    const email = prompt("Bitte gib deine E-Mail-Adresse ein:", "");
    
    if (email) {
        showSuccessMessage("Ergebnisse wurden per E-Mail gesendet!");
        
        alert(`Ergebnisse würden an ${email} gesendet:\n
        24/7 Kosten: ${results.cost24h}€\n
        Optimierte Kosten: ${results.optimized}€\n
        Ersparnis: ${results.savings}€ (${results.savingsPercentage}%)\n
        CO₂-Einsparung: ${results.co2Savings} kg`);
    }
}

// Druckfunktion
function printResults() {
    // Prüfen, ob Berechnungen durchgeführt wurden
    const savings = document.getElementById("savings").textContent;
    if (savings === "0") {
        showErrorMessage("Bitte führe zuerst eine Berechnung durch!");
        return;
    }
    
    // Druckvorgang vorbereiten
    const printWindow = window.open('', '_blank');
    
    // Geräteliste erstellen
    let deviceListHTML = '';
    selectedDevices.forEach(device => {
        deviceListHTML += `<li>${device.count}x ${device.name} (${device.watt} W) - 
            ${device.hours} Std/Tag, ${device.days} Tage/Woche, ${device.weeks} Wochen/Jahr</li>`;
    });
    
    // Druckinhalt erstellen
    printWindow.document.write(`
        <html>
        <head>
            <title>Energie-Spar-Rechner Ergebnisse</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color:#3c92ca; }
                .results { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                .savings { font-weight: bold; color:#3c92ca; }
                ul { padding-left: 20px; }
            </style>
        </head>
        <body>
            <h1>Energie-Spar-Rechner Ergebnisse</h1>
            
            <div class="results">
                <h2>Kosten-Übersicht</h2>
                <p>Kosten bei 24/7 Nutzung: ${document.getElementById("costs365").textContent} €</p>
                <p>Kosten bei optimierter Nutzung: ${document.getElementById("optimizedCosts").textContent} €</p>
                <p class="savings">Gesparte Kosten: ${document.getElementById("savings").textContent} € 
                   (${document.getElementById("savingsPercentage").textContent}%)</p>
                <p>CO₂-Einsparung: ${document.getElementById("co2Savings").textContent} kg</p>
            </div>
            
            <div>
                <h2>Berücksichtigte Geräte</h2>
                <ul>${deviceListHTML}</ul>
            </div>
            
            <p>Strompreis: ${document.getElementById("electricityPrice").value} Cent/kWh</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
                Erstellt mit dem Energie-Spar-Rechner am ${new Date().toLocaleDateString()}
            </p>
        </body>
        </html>
    `);
    
    // Drucken
    printWindow.document.close();
    printWindow.focus();
    
    // Kurze Verzögerung für das Laden
    setTimeout(() => {
        printWindow.print();
    }, 500);
}