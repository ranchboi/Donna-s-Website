// Admin Panel JavaScript

// Admin credentials (in production, this should be handled securely on the backend)
const ADMIN_PASSWORD = 'donna2024'; // Change this to a secure password

// Appointments data (will be loaded from localStorage)
let appointments = [];

let blockedTimes = [
    {
        date: '2024-01-16',
        startTime: '12:00',
        endTime: '13:00',
        reason: 'Lunch break'
    }
];

let currentAdminMonth = new Date().getMonth();
let currentAdminYear = new Date().getFullYear();

// Load appointments from localStorage
function loadAppointmentsFromStorage() {
    const storedAppointments = localStorage.getItem('appointments');
    if (storedAppointments) {
        appointments = JSON.parse(storedAppointments);
        console.log('Loaded appointments from storage:', appointments);
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    loadAppointmentsFromStorage();
    setupLogin();
    updateStats();
    initializeAdminCalendar();
    loadAppointments();
    loadTodaySchedule();
    updateCurrentDate();
});

// Login System
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        
        if (password === ADMIN_PASSWORD) {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            
            // Store login session
            sessionStorage.setItem('adminLoggedIn', 'true');
        } else {
            alert('Incorrect password. Please try again.');
            document.getElementById('password').value = '';
        }
    });
    
    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('password').value = '';
}

// Update Statistics
function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = getWeekStart(new Date());
    const thisWeekEnd = getWeekEnd(new Date());
    
    // Today's appointments
    const todayAppointments = appointments.filter(apt => apt.date === today && apt.status !== 'cancelled');
    document.getElementById('todayAppointments').textContent = todayAppointments.length;
    
    // Pending appointments
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
    document.getElementById('pendingAppointments').textContent = pendingAppointments.length;
    document.getElementById('pendingBadge').textContent = pendingAppointments.length;
    
    // Weekly appointments
    const weeklyAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= thisWeekStart && aptDate <= thisWeekEnd && apt.status !== 'cancelled';
    });
    document.getElementById('weeklyAppointments').textContent = weeklyAppointments.length;
    
    // Weekly revenue (simplified calculation)
    const weeklyRevenue = weeklyAppointments.reduce((total, apt) => {
        const price = extractPrice(apt.service);
        return total + price;
    }, 0);
    document.getElementById('weeklyRevenue').textContent = `$${weeklyRevenue}`;
}

function extractPrice(service) {
    const match = service.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
}

function getWeekEnd(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6;
    return new Date(d.setDate(diff));
}

// Admin Calendar
function initializeAdminCalendar() {
    generateAdminCalendar();
    
    document.getElementById('adminPrevMonth').onclick = () => {
        if (currentAdminMonth === 0) {
            currentAdminMonth = 11;
            currentAdminYear--;
        } else {
            currentAdminMonth--;
        }
        generateAdminCalendar();
    };
    
    document.getElementById('adminNextMonth').onclick = () => {
        if (currentAdminMonth === 11) {
            currentAdminMonth = 0;
            currentAdminYear++;
        } else {
            currentAdminMonth++;
        }
        generateAdminCalendar();
    };
}

function generateAdminCalendar() {
    const calendarGrid = document.getElementById('adminCalendarGrid');
    const currentMonthElement = document.getElementById('adminCurrentMonth');
    
    // Clear existing calendar
    calendarGrid.innerHTML = '';
    
    // Set month header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[currentAdminMonth]} ${currentAdminYear}`;
    
    // Add day headers
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = day;
        dayHeader.style.fontWeight = '600';
        dayHeader.style.color = '#666';
        dayHeader.style.textAlign = 'center';
        dayHeader.style.padding = '0.5rem';
        dayHeader.style.fontSize = '0.8rem';
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentAdminYear, currentAdminMonth, 1).getDay();
    const daysInMonth = new Date(currentAdminYear, currentAdminMonth + 1, 0).getDate();
    const today = new Date();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day disabled';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date(currentAdminYear, currentAdminMonth, day);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check if it's Sunday (day 0)
        const dayOfWeek = currentDate.getDay();
        
        // Check for appointments on this day
        const dayAppointments = appointments.filter(apt => apt.date === dateStr && apt.status !== 'cancelled');
        const blocked = blockedTimes.some(block => block.date === dateStr);
        const isFullyBooked = checkIfDateFullyBookedAdmin(dateStr, dayOfWeek);
        
        if (currentDate < today.setHours(0, 0, 0, 0)) {
            dayElement.classList.add('disabled');
        } else if (dayOfWeek === 0) {
            dayElement.classList.add('disabled');
            dayElement.title = 'Closed - We are closed on Sundays';
        } else if (isFullyBooked) {
            dayElement.classList.add('fully-booked');
            dayElement.title = 'Fully booked - All time slots taken';
            
            // Add full booking indicator
            const fullIcon = document.createElement('div');
            fullIcon.className = 'full-booked-icon';
            fullIcon.innerHTML = '●●●';
            dayElement.appendChild(fullIcon);
        } else if (blocked) {
            dayElement.classList.add('blocked');
        } else if (dayAppointments.length > 0) {
            dayElement.classList.add('booked');
            
            // Add appointment dot
            const dot = document.createElement('div');
            dot.className = 'appointment-dot';
            dayElement.appendChild(dot);
        } else {
            dayElement.classList.add('available');
        }
        
        // Add click handler
        dayElement.addEventListener('click', () => {
            if (!dayElement.classList.contains('disabled')) {
                showDayDetails(dateStr, dayAppointments);
            }
        });
        
        calendarGrid.appendChild(dayElement);
    }
}

function showDayDetails(date, appointments) {
    console.log(`Selected date: ${date}`, appointments);
    // This could open a modal with day details
}

// Appointments Management
function loadAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    appointmentsList.innerHTML = '';
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No appointment requests yet.</p>';
        return;
    }
    
    // Sort appointments by date and time
    const sortedAppointments = appointments.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
    });
    
    sortedAppointments.forEach(appointment => {
        const appointmentEl = createAppointmentElement(appointment);
        appointmentsList.appendChild(appointmentEl);
    });
}

function createAppointmentElement(appointment) {
    const div = document.createElement('div');
    div.className = `appointment-item ${appointment.status}`;
    div.onclick = () => showAppointmentDetails(appointment);
    
    div.innerHTML = `
        <div class="appointment-header">
            <span class="appointment-service">${appointment.service}</span>
            <span class="appointment-status ${appointment.status}">${appointment.status.toUpperCase()}</span>
        </div>
        <div class="appointment-details">
            <div class="appointment-time">${appointment.date} at ${appointment.time}</div>
            <div>${appointment.customerName} - ${appointment.customerPhone}</div>
        </div>
    `;
    
    return div;
}

function showAppointmentDetails(appointment) {
    const modal = document.getElementById('appointmentModal');
    const details = document.getElementById('appointmentDetails');
    const actions = document.getElementById('appointmentActions');
    
    details.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <strong>Service:</strong> ${appointment.service}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Date & Time:</strong> ${appointment.date} at ${appointment.time}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Customer:</strong> ${appointment.customerName}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Phone:</strong> ${appointment.customerPhone}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Email:</strong> ${appointment.customerEmail}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Special Requests:</strong> ${appointment.specialRequests || 'None'}
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>Confirmation #:</strong> ${appointment.confirmationNumber}
        </div>
        <div>
            <strong>Status:</strong> <span class="appointment-status ${appointment.status}">${appointment.status.toUpperCase()}</span>
        </div>
    `;
    
    // Action buttons based on status
    if (appointment.status === 'pending') {
        actions.innerHTML = `
            <button class="btn btn-danger" onclick="showDeclineModal('${appointment.id}')">Decline</button>
            <button class="btn btn-success" onclick="updateAppointmentStatus('${appointment.id}', 'confirmed')">Confirm</button>
        `;
    } else if (appointment.status === 'confirmed') {
        actions.innerHTML = `
            <button class="btn btn-warning" onclick="showRescheduleModal('${appointment.id}')">Reschedule</button>
            <button class="btn btn-danger" onclick="updateAppointmentStatus('${appointment.id}', 'cancelled')">Cancel</button>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        `;
    } else {
        actions.innerHTML = `
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        `;
    }
    
    modal.classList.add('active');
}

// Show decline reason modal
function showDeclineModal(appointmentId) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    const reason = prompt(`Please enter a reason for declining ${appointment.customerName}'s appointment:`, '');
    if (reason !== null) { // User didn't cancel the prompt
        appointment.declineReason = reason;
        updateAppointmentStatus(appointmentId, 'cancelled', reason);
    }
}

// Reschedule Functions
let currentRescheduleAppointmentId = null;

function showRescheduleModal(appointmentId) {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    currentRescheduleAppointmentId = appointmentId;
    
    // Show appointment details in reschedule modal
    const detailsDiv = document.getElementById('rescheduleAppointmentDetails');
    detailsDiv.innerHTML = `
        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <h4>Current Appointment</h4>
            <p><strong>Customer:</strong> ${appointment.customerName}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
            <p><strong>Current Date:</strong> ${appointment.date}</p>
            <p><strong>Current Time:</strong> ${appointment.time}</p>
        </div>
    `;
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('rescheduleDate').min = today;
    
    // Clear previous selections
    document.getElementById('rescheduleDate').value = '';
    document.getElementById('rescheduleTime').value = '';
    document.getElementById('rescheduleReason').value = '';
    
    // Show modal
    document.getElementById('rescheduleModal').style.display = 'block';
    
    // Add event listener for date change
    document.getElementById('rescheduleDate').addEventListener('change', populateAvailableTimes);
}

function populateAvailableTimes() {
    const selectedDate = document.getElementById('rescheduleDate').value;
    const timeSelect = document.getElementById('rescheduleTime');
    
    // Clear existing options
    timeSelect.innerHTML = '<option value="">Select a time...</option>';
    
    if (!selectedDate) return;
    
    // Convert date to determine day of week
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    
    let timeSlots;
    if (dayOfWeek === 6) { // Saturday: 9 AM - 3 PM
        timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM'
        ];
    } else if (dayOfWeek === 0) { // Sunday - closed
        timeSelect.innerHTML = '<option value="">Closed on Sundays</option>';
        return;
    } else { // Regular days: 9 AM - 5 PM
        timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
            '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
        ];
    }
    
    // Check availability for each time slot
    timeSlots.forEach(time => {
        const bookedCount = getBookedCountForDate(selectedDate, time);
        const availableSlots = 3 - bookedCount;
        
        if (availableSlots > 0) {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = `${time} (${availableSlots}/3 available)`;
            timeSelect.appendChild(option);
        }
    });
}

function getBookedCountForDate(date, time) {
    return appointments.filter(apt => 
        apt.date === date && 
        apt.time === time && 
        apt.status === 'confirmed' &&
        apt.id !== currentRescheduleAppointmentId // Exclude current appointment being rescheduled
    ).length;
}

function confirmReschedule() {
    const newDate = document.getElementById('rescheduleDate').value;
    const newTime = document.getElementById('rescheduleTime').value;
    const reason = document.getElementById('rescheduleReason').value;
    
    if (!newDate || !newTime) {
        alert('Please select both a new date and time.');
        return;
    }
    
    const appointment = appointments.find(apt => apt.id === currentRescheduleAppointmentId);
    if (!appointment) return;
    
    // Store old date/time for email
    const oldDate = appointment.date;
    const oldTime = appointment.time;
    
    // Update appointment
    appointment.date = newDate;
    appointment.time = newTime;
    appointment.rescheduleReason = reason;
    appointment.rescheduledAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Send notification emails
    sendRescheduleNotification(appointment, oldDate, oldTime, reason);
    
    // Close modal and refresh views
    closeRescheduleModal();
    loadAppointments();
    updateStats();
    generateAdminCalendar();
    loadTodaySchedule();
    
    alert('Appointment rescheduled successfully!');
}

function closeRescheduleModal() {
    document.getElementById('rescheduleModal').style.display = 'none';
    currentRescheduleAppointmentId = null;
}

function sendRescheduleNotification(appointment, oldDate, oldTime, reason) {
    // Send email to customer about reschedule
    const subject = `📅 Appointment Rescheduled - Donna Salon & Spa`;
    const message = `Hi ${appointment.customerName},

Your appointment at Donna Salon & Spa has been rescheduled.

Original Appointment:
• Date: ${oldDate}
• Time: ${oldTime}

New Appointment:
• Date: ${appointment.date}
• Time: ${appointment.time}
• Service: ${appointment.service}
• Confirmation #: ${appointment.confirmationNumber}

${reason ? `Reason: ${reason}\n\n` : ''}We apologize for any inconvenience. Please call us at 410-370-7710 if you have any questions.

Location: 1408 Crain Highway South, Glen Burnie, MD 21061

Thank you for your understanding!

Best regards,
Donna Salon & Spa
410-370-7710`;

    console.log('Sending reschedule notification to customer');
    sendEmailNotification(appointment.customerEmail, subject, message);
}

// Check if a date is fully booked (admin version)
function checkIfDateFullyBookedAdmin(dateString, dayOfWeek) {
    // Get time slots for this day
    let timeSlots;
    if (dayOfWeek === 6) { // Saturday: 9 AM - 3 PM
        timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM'
        ];
    } else { // Regular days: 9 AM - 5 PM
        timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
            '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
        ];
    }
    
    // Check if all time slots are fully booked (3 appointments each)
    for (const time of timeSlots) {
        const bookedCount = appointments.filter(apt => 
            apt.date === dateString && 
            apt.time === time && 
            apt.status === 'confirmed'
        ).length;
        
        // If any time slot has less than 3 bookings, date is not fully booked
        if (bookedCount < 3) {
            return false;
        }
    }
    
    return true; // All time slots are fully booked
}

function updateAppointmentStatus(appointmentId, newStatus, reason = '') {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
        appointment.status = newStatus;
        if (reason) {
            appointment.declineReason = reason;
        }
        
        // Save updated appointments to localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Send email notification to customer about status change
        sendCustomerStatusEmail(appointment, newStatus, reason);
        
        // Send email to customer
        sendCustomerNotification(appointment, newStatus);
        
        // Update UI
        loadAppointments();
        updateStats();
        generateAdminCalendar();
        loadTodaySchedule();
        
        closeModal();
        
        const statusText = newStatus === 'confirmed' ? 'confirmed' : 'declined';
        alert(`Appointment ${statusText} successfully!`);
    }
}

// Today's Schedule
function loadTodaySchedule() {
    const scheduleTimeline = document.getElementById('scheduleTimeline');
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today is Saturday for different hours
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();
    
    let businessHours;
    if (dayOfWeek === 6) { // Saturday: 9 AM - 3 PM with 30-minute slots
        businessHours = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM'
        ];
    } else { // Regular days: 9 AM - 5 PM with 30-minute slots
        businessHours = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
            '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
        ];
    }
    
    scheduleTimeline.innerHTML = '';
    
    businessHours.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'timeline-slot';
        
        // Check for appointments at this time
        const timeAppointments = appointments.filter(apt => 
            apt.date === today && apt.time === time && apt.status === 'confirmed'
        );
        
        // Check for blocked time
        const blocked = isTimeBlocked(today, time);
        
        if (blocked) {
            slot.classList.add('blocked');
            slot.innerHTML = `
                <div class="timeline-time">${time}</div>
                <div class="timeline-content">
                    <div class="timeline-empty">Blocked - ${blocked.reason}</div>
                </div>
            `;
        } else if (timeAppointments.length > 0) {
            slot.classList.add('occupied');
            const appointmentsList = timeAppointments.map(apt => 
                `<div class="timeline-appointment">${apt.service} - ${apt.customerName}</div>`
            ).join('');
            
            slot.innerHTML = `
                <div class="timeline-time">${time} (${timeAppointments.length}/3)</div>
                <div class="timeline-content">
                    ${appointmentsList}
                </div>
            `;
        } else {
            slot.innerHTML = `
                <div class="timeline-time">${time}</div>
                <div class="timeline-content">
                    <div class="timeline-empty">Available (3 slots)</div>
                </div>
            `;
        }
        
        scheduleTimeline.appendChild(slot);
    });
}

function isTimeBlocked(date, time) {
    return blockedTimes.find(block => {
        if (block.date !== date) return false;
        
        const timeHour = convertTimeToHour(time);
        const startHour = convertTimeToHour(block.startTime);
        const endHour = convertTimeToHour(block.endTime);
        
        return timeHour >= startHour && timeHour < endHour;
    });
}

function convertTimeToHour(timeStr) {
    if (timeStr.includes(':')) {
        return parseFloat(timeStr.replace(':', '.'));
    }
    // Convert "10:00 AM" format
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours + (minutes / 60);
}

// Block Time Modal
function showBlockTimeModal() {
    const modal = document.getElementById('blockTimeModal');
    modal.classList.add('active');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function blockTimeSlot() {
    const date = document.getElementById('blockDate').value;
    const startTime = document.getElementById('blockStartTime').value;
    const endTime = document.getElementById('blockEndTime').value;
    const reason = document.getElementById('blockReason').value || 'Blocked time';
    
    if (!date || !startTime || !endTime) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Add to blocked times
    blockedTimes.push({
        date,
        startTime,
        endTime,
        reason
    });
    
    // Update UI
    generateAdminCalendar();
    loadTodaySchedule();
    
    // Clear form
    document.getElementById('blockTimeForm').reset();
    
    closeModal();
    alert('Time slot blocked successfully!');
}

// SMS Notifications (placeholder functions)
function sendStatusUpdateSMS(appointment, status) {
    let subject = '';
    let message = '';
    
    if (status === 'confirmed') {
        subject = `✅ Appointment Confirmed - ${appointment.customerName}`;
        message = `Hi Donna,\n\nYou have confirmed an appointment:\n\nCustomer: ${appointment.customerName}\nService: ${appointment.service}\nDate: ${appointment.date}\nTime: ${appointment.time}\nPhone: ${appointment.customerPhone}\nEmail: ${appointment.customerEmail}\n\nThe customer will be notified of the confirmation.\n\nBest regards,\nDonna Salon & Spa System`;
    } else if (status === 'cancelled') {
        subject = `❌ Appointment Cancelled - ${appointment.customerName}`;
        message = `Hi Donna,\n\nYou have cancelled an appointment:\n\nCustomer: ${appointment.customerName}\nService: ${appointment.service}\nDate: ${appointment.date}\nTime: ${appointment.time}\nPhone: ${appointment.customerPhone}\n\nThe customer will be notified of the cancellation.\n\nBest regards,\nDonna Salon & Spa System`;
    }
    
    console.log('Email to Donna:', subject);
    
    // Send email notification to Donna
    sendEmailToDonna(subject, message);
}

// Send automatic email to customer about status change
function sendCustomerStatusEmail(appointment, status, reason = '') {
    if (status === 'confirmed') {
        sendAutomaticConfirmationEmail(appointment);
    } else if (status === 'cancelled') {
        sendAutomaticCancellationEmail(appointment, reason);
    }
}

// Send automatic confirmation email to customer - NO email client needed!
async function sendAutomaticConfirmationEmail(appointment) {
    const emailData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `✅ Appointment Confirmed - Donna Salon & Spa`,
        email: appointment.customerEmail,
        name: 'Donna Salon & Spa',
        message: `Hi ${appointment.customerName},

Great news! Your appointment at Donna Salon & Spa has been confirmed!

Appointment Details:
• Service: ${appointment.service}
• Date: ${appointment.date}
• Time: ${appointment.time}
• Confirmation #: ${appointment.confirmationNumber}

Location: 1408 Crain Highway South, Glen Burnie, MD 21061

Please arrive 10 minutes early. If you need to reschedule or cancel, please call us at 410-370-7710.

We look forward to seeing you!

Best regards,
Donna Salon & Spa
410-370-7710`
    };

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Confirmation email sent to customer automatically!');
        } else {
            console.error('❌ Failed to send confirmation email:', result);
        }
    } catch (error) {
        console.error('❌ Network error sending confirmation email:', error);
    }
}

// Send automatic cancellation email to customer - NO email client needed!
async function sendAutomaticCancellationEmail(appointment, reason = '') {
    const emailData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `❌ Appointment Cancelled - Donna Salon & Spa`,
        email: appointment.customerEmail,
        name: 'Donna Salon & Spa',
        message: `Hi ${appointment.customerName},

We're sorry, but we need to cancel your appointment scheduled for ${appointment.date} at ${appointment.time}.

${reason ? `Reason: ${reason}\n\n` : ''}We sincerely apologize for any inconvenience this may cause. Please call us at 410-370-7710 to reschedule your appointment.

We appreciate your understanding and look forward to serving you soon.

Best regards,
Donna Salon & Spa
410-370-7710`
    };

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Cancellation email sent to customer automatically!');
        } else {
            console.error('❌ Failed to send cancellation email:', result);
        }
    } catch (error) {
        console.error('❌ Network error sending cancellation email:', error);
    }
}

function sendCustomerNotification(appointment, status) {
    console.log(`Email notification sent to ${appointment.customerEmail} - Status: ${status}`);
    
    // In production, integrate with email service
}

// Main email notification function
function sendEmailNotification(emailAddress, subject, message) {
    console.log(`📧 Sending email to: ${emailAddress}`);
    console.log(`📧 Subject: ${subject}`);
    
    // Use mailto to open email client with pre-filled message
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(message);
    const mailtoLink = `mailto:${emailAddress}?subject=${encodedSubject}&body=${encodedBody}`;
    
    // Open email client
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Email client opened for sending');
}

// Send email notification to Donna
function sendEmailToDonna(subject, message) {
    const donnaEmail = 'bettyboops804@gmail.com';
    
    console.log(`Sending email to Donna (${donnaEmail}):`, subject);
    
    // Use mailto to open email client with pre-filled message
    sendEmailNotification(donnaEmail, subject, message);
}

// SMS SERVICE IMPLEMENTATIONS

// Option 1: Twilio SMS (RECOMMENDED)
function sendViaTwilio(phoneNumber, message) {
    // You'll need to create a backend endpoint for Twilio
    // This keeps your Twilio credentials secure
    
    fetch('/api/send-sms-twilio', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            to: `+1${phoneNumber}`,
            message: message
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Twilio SMS sent successfully!');
        } else {
            console.error('❌ Twilio SMS failed:', data.error);
            // Fallback to email-to-SMS
            sendViaEmailToSMS(phoneNumber, message);
        }
    })
    .catch(error => {
        console.error('Twilio Error:', error);
        // Fallback to email-to-SMS
        sendViaEmailToSMS(phoneNumber, message);
    });
}

// Email-to-SMS using EmailJS (FREE)
function sendViaEmailToSMS(phoneNumber, message) {
    console.log('📧 Using email-to-SMS gateway');
    
    // Most common carrier gateways
    const carrierGateways = [
        `${phoneNumber}@vtext.com`,      // Verizon
        `${phoneNumber}@txt.att.net`,    // AT&T
        `${phoneNumber}@tmomail.net`,    // T-Mobile
        `${phoneNumber}@messaging.sprintpcs.com`, // Sprint
        `${phoneNumber}@myboostmobile.com`,       // Boost Mobile
        `${phoneNumber}@sms.cricketwireless.net`  // Cricket
    ];
    
    // Send to all major carriers to ensure delivery
    carrierGateways.forEach((email, index) => {
        setTimeout(() => {
            sendEmailToSMS(email, message);
        }, index * 1000); // Stagger emails by 1 second
    });
}

// Send email to SMS gateway using EmailJS
function sendEmailToSMS(emailAddress, message) {
    // EmailJS configuration (you'll need to set up a free account)
    const serviceID = 'service_donna_salon'; // Your EmailJS service ID
    const templateID = 'template_sms_alert'; // Your EmailJS template ID
    const publicKey = 'YOUR_EMAILJS_PUBLIC_KEY'; // Your EmailJS public key
    
    console.log(`📧 Sending email-to-SMS to: ${emailAddress}`);
    
    // Prepare email data
    const templateParams = {
        to_email: emailAddress,
        subject: 'Alert',
        message: message,
        from_name: 'Donna Salon System'
    };
    
    // Try EmailJS first (requires setup)
    if (typeof emailjs !== 'undefined') {
        emailjs.send(serviceID, templateID, templateParams, publicKey)
            .then((response) => {
                console.log('✅ Email-to-SMS sent successfully:', response.status, response.text);
            })
            .catch((error) => {
                console.error('❌ EmailJS failed:', error);
                // Fallback to mailto (opens user's email client)
                sendViaMailto(emailAddress, message);
            });
    } else {
        // Fallback: Use mailto to open default email client
        sendViaMailto(emailAddress, message);
    }
}

// Fallback: Open email client with pre-filled message
function sendViaMailto(emailAddress, message) {
    console.log('📧 Fallback: Opening email client for:', emailAddress);
    
    const subject = encodeURIComponent('Donna Salon Alert');
    const body = encodeURIComponent(message);
    const mailtoLink = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    
    // Open default email client
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('📧 Email client opened for manual sending');
}

// Removed browser notifications as requested

// Update Current Date
function updateCurrentDate() {
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
}

// Mock function to simulate new appointment (for testing)
function addMockAppointment() {
    const newAppointment = {
        id: appointments.length + 1,
        service: 'Facial Treatment - $45+',
        date: new Date().toISOString().split('T')[0],
        time: '3:00 PM',
        customerName: 'Test Customer',
        customerEmail: 'test@email.com',
        customerPhone: '410-555-9999',
        specialRequests: 'Test appointment',
        status: 'pending',
        timestamp: new Date().toISOString(),
        confirmationNumber: 'DS' + Date.now().toString().slice(-6)
    };
    
    appointments.push(newAppointment);
    
    // Update UI
    loadAppointments();
    updateStats();
    generateAdminCalendar();
    loadTodaySchedule();
}
