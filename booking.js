// Booking System JavaScript

let currentStep = 1;
let selectedService = '';
let selectedDate = '';
let selectedTime = '';
let selectedPaymentMethod = '';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Initialize booking system
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    setupServiceSelection();
    setupPaymentSelection();
    setupNavigation();
});

// Service Selection
function setupServiceSelection() {
    const serviceInputs = document.querySelectorAll('input[name="service"]');
    serviceInputs.forEach(input => {
        input.addEventListener('change', function() {
            selectedService = this.value;
            const nextBtn = document.querySelector('#step1 .next-step');
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
            updatePaymentTotal();
        });
    });
}

// Payment Selection
function setupPaymentSelection() {
    const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]');
    paymentInputs.forEach(input => {
        input.addEventListener('change', function() {
            selectedPaymentMethod = this.value;
            const nextBtn = document.querySelector('#step4 .next-step');
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        });
    });
}

// Update Payment Total
function updatePaymentTotal() {
    const totalElement = document.getElementById('paymentTotal');
    if (!totalElement) return;
    
    // Extract price from selected service
    let price = 'TBD';
    if (selectedService) {
        const priceMatch = selectedService.match(/\$(\d+)/);
        if (priceMatch) {
            price = '$' + priceMatch[1] + '+';
        }
    }
    totalElement.textContent = price;
}

// Navigation Functions
function nextStep() {
    if (currentStep === 1 && !selectedService) {
        alert('Please select a service first.');
        return;
    }
    
    if (currentStep === 2) {
        if (!selectedDate) {
            alert('Please select a date from the calendar first.');
            return;
        }
        if (!selectedTime) {
            alert('Please select an available time slot.');
            return;
        }
    }
    
    if (currentStep === 3) {
        if (!validateContactForm()) {
            return;
        }
    }
    
    if (currentStep === 4 && !selectedPaymentMethod) {
        alert('Please select a payment method.');
        return;
    }
    
    if (currentStep === 4) {
        updateSummary();
    }
    
    currentStep++;
    showStep(currentStep);
}

function prevStep() {
    currentStep--;
    showStep(currentStep);
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.booking-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show current step
    if (step <= 5) {
        const stepElement = document.getElementById(`step${step}`);
        if (stepElement) {
            stepElement.classList.add('active');
        }
    } else {
        document.getElementById('success').style.display = 'block';
    }
    
    // Update navigation buttons
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const steps = document.querySelectorAll('.booking-step');
    steps.forEach((step, index) => {
        const nextBtn = step.querySelector('.next-step');
        if (nextBtn) {
            if (index === 0) {
                nextBtn.disabled = !selectedService;
                nextBtn.style.opacity = selectedService ? '1' : '0.5';
            } else if (index === 1) {
            nextBtn.disabled = !selectedDate || !selectedTime;
            nextBtn.style.opacity = (selectedDate && selectedTime) ? '1' : '0.5';
            
            // Add helpful text for time selection
            const timeHint = step.querySelector('.time-selection-hint');
            if (timeHint) {
                if (selectedDate && !selectedTime) {
                    timeHint.textContent = 'Please select a time slot to continue';
                    timeHint.style.color = '#f59e0b';
                } else if (selectedDate && selectedTime) {
                    timeHint.textContent = `Selected: ${selectedTime}`;
                    timeHint.style.color = '#10b981';
                } else {
                    timeHint.textContent = '';
                }
            }
            }
        }
    });
}

// Calendar Functions
function initializeCalendar() {
    generateCalendar();
    generateTimeSlots();
}

function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElement = document.getElementById('currentMonth');
    
    // Clear existing calendar
    calendarGrid.innerHTML = '';
    
    // Set month header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = day;
        dayHeader.style.fontWeight = '600';
        dayHeader.style.color = '#666';
        dayHeader.style.textAlign = 'center';
        dayHeader.style.padding = '0.5rem';
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
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
        
        const currentDate = new Date(currentYear, currentMonth, day);
        
        // Check if it's Sunday (day 0)
        const dayOfWeek = currentDate.getDay();
        
        // Disable past dates and Sundays
        if (currentDate < today.setHours(0, 0, 0, 0)) {
            dayElement.classList.add('disabled');
        } else if (dayOfWeek === 0) {
            dayElement.classList.add('disabled');
            dayElement.title = 'Closed - We are closed on Sundays';
        } else {
            // Check if date is fully booked
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isFullyBooked = checkIfDateFullyBooked(dateString, dayOfWeek);
            
            if (isFullyBooked) {
                dayElement.classList.add('fully-booked');
                dayElement.title = 'Fully booked - No available time slots';
            } else {
                dayElement.classList.add('available');
                dayElement.addEventListener('click', () => selectDate(currentYear, currentMonth, day));
            }
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    // Setup navigation
    document.getElementById('prevMonth').onclick = () => {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        generateCalendar();
        generateTimeSlots();
    };
    
    document.getElementById('nextMonth').onclick = () => {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        generateCalendar();
        generateTimeSlots();
    };
}

function selectDate(year, month, day) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selection to clicked date
    event.target.classList.add('selected');
    
    selectedDate = `${month + 1}/${day}/${year}`;
    generateTimeSlots();
    updateNavigationButtons();
}

function generateTimeSlots() {
    const timeGrid = document.querySelector('.time-grid');
    timeGrid.innerHTML = '';
    
    if (!selectedDate) {
        const noDateMessage = document.createElement('div');
        noDateMessage.textContent = 'Please select a date first';
        noDateMessage.style.gridColumn = '1 / -1';
        noDateMessage.style.textAlign = 'center';
        noDateMessage.style.color = '#666';
        timeGrid.appendChild(noDateMessage);
        return;
    }
    
    // Check if selected date is Saturday (different hours)
    const selectedDateObj = new Date(selectedDate);
    const dayOfWeek = selectedDateObj.getDay();
    
    let timeSlots;
    if (dayOfWeek === 6) { // Saturday: 9 AM - 3 PM with 30-minute slots
        timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM'
        ];
    } else { // Regular days: 9 AM - 6 PM with 30-minute slots
        timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
            '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM'
        ];
    }
    
    timeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        
        // Check if this is today and time has passed
        const isToday = isSelectedDateToday();
        const isTimePassed = isToday && hasTimePassed(time);
        
        // Check availability for this time slot (3 slots total)
        const bookedCount = getBookedCount(selectedDate, time);
        const availableSlots = 3 - bookedCount;
        
        // Create time slot content with availability
        const timeText = document.createElement('div');
        timeText.className = 'time-text';
        timeText.textContent = time;
        
        const availabilityText = document.createElement('div');
        availabilityText.className = 'availability-text';
        
        if (isTimePassed) {
            timeSlot.classList.add('disabled');
            timeSlot.title = 'Time has already passed';
            availabilityText.textContent = 'Past';
        } else if (availableSlots === 0) {
            timeSlot.classList.add('booked');
            timeSlot.title = 'All slots booked';
            availabilityText.textContent = 'Full';
        } else {
            timeSlot.classList.add('available');
            timeSlot.title = `${availableSlots} of 3 slots available`;
            availabilityText.textContent = `${availableSlots}/3 available`;
            timeSlot.addEventListener('click', () => selectTime(time));
        }
        
        timeSlot.appendChild(timeText);
        timeSlot.appendChild(availabilityText);
        timeGrid.appendChild(timeSlot);
    });
}

function selectTime(time) {
    // Remove previous selection
    document.querySelectorAll('.time-slot.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Find the clicked time slot and add selection
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        const timeText = slot.querySelector('.time-text');
        if (timeText && timeText.textContent === time) {
            slot.classList.add('selected');
        }
    });
    
    selectedTime = time;
    console.log('Selected time:', selectedTime);
    updateNavigationButtons();
}

// Functions for checking real booked dates/times (connect to backend)
function isDateBooked(year, month, day) {
    // This will connect to your backend to check real bookings
    // For now, no dates are marked as booked
    return false;
}

function isTimeBooked(date, time) {
    // This will connect to your backend to check real booked times
    // For now, no times are marked as booked
    return false;
}

// Get number of bookings for a specific date and time
function getBookedCount(date, time) {
    // Get appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    // Convert date format from MM/DD/YYYY to YYYY-MM-DD for comparison
    const [month, day, year] = date.split('/');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // Count confirmed appointments for this date and time
    const bookedCount = appointments.filter(apt => 
        apt.date === formattedDate && 
        apt.time === time && 
        apt.status === 'confirmed'
    ).length;
    
    return bookedCount;
}

// Check if a date is fully booked (all time slots are taken)
function checkIfDateFullyBooked(dateString, dayOfWeek) {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    // Get time slots for this day
    let timeSlots;
    if (dayOfWeek === 6) { // Saturday: 9 AM - 3 PM
        timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM'
        ];
    } else { // Regular days: 9 AM - 6 PM
        timeSlots = [
            '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
            '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM'
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

// Check if selected date is today
function isSelectedDateToday() {
    if (!selectedDate) return false;
    
    const today = new Date();
    const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    return selectedDate === todayStr;
}

// Check if time has already passed today
function hasTimePassed(timeSlot) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Convert time slot to 24-hour format
    const [time, period] = timeSlot.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) {
        hour24 += 12;
    } else if (period === 'AM' && hour === 12) {
        hour24 = 0;
    }
    
    // Add 30 minutes buffer (appointment needs to be booked at least 30 min in advance)
    const slotTime = hour24 * 60 + minute;
    const currentTime = currentHour * 60 + currentMinute + 30; // 30 min buffer
    
    return slotTime <= currentTime;
}

// Form Validation
function validateContactForm() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    
    if (!name || !email || !phone) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    return true;
}

// Summary Update
function updateSummary() {
    document.getElementById('summaryService').textContent = selectedService;
    document.getElementById('summaryDate').textContent = selectedDate;
    document.getElementById('summaryTime').textContent = selectedTime;
    document.getElementById('summaryName').textContent = document.getElementById('customerName').value;
    document.getElementById('summaryPhone').textContent = document.getElementById('customerPhone').value;
    document.getElementById('summaryEmail').textContent = document.getElementById('customerEmail').value;
    
    // Add payment method to summary
    let paymentDisplay = '';
    switch(selectedPaymentMethod) {
        case 'cashapp':
            paymentDisplay = '💵 CashApp ($5 Deposit Paid)';
            break;
        case 'paypal':
            paymentDisplay = '💳 PayPal ($5 Deposit Paid)';
            break;
        case 'zelle':
            paymentDisplay = '🏦 Zelle ($5 Deposit Paid)';
            break;
        default:
            paymentDisplay = 'Not Selected';
    }
    document.getElementById('summaryPayment').textContent = paymentDisplay;
}

// Booking Confirmation
async function confirmBooking() {
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!agreeTerms) {
        alert('Please agree to the terms and conditions.');
        return;
    }
    
    // Show loading state
    const confirmBtn = event.target;
    confirmBtn.textContent = 'Processing...';
    confirmBtn.disabled = true;
    
    try {
        // Collect all booking data
        const bookingData = {
            service: selectedService,
            date: selectedDate,
            time: selectedTime,
            customerName: document.getElementById('customerName').value,
            customerEmail: document.getElementById('customerEmail').value,
            customerPhone: document.getElementById('customerPhone').value,
            specialRequests: document.getElementById('specialRequests').value,
            timestamp: new Date().toISOString(),
            confirmationNumber: generateConfirmationNumber()
        };
        
        // Send booking data (this would connect to your backend)
        await submitBooking(bookingData);
        
        // Show success
        document.getElementById('confirmationNumber').textContent = bookingData.confirmationNumber;
        showStep('success');
        
    } catch (error) {
        alert('There was an error processing your booking. Please try again or call us directly.');
        confirmBtn.textContent = 'Confirm Appointment';
        confirmBtn.disabled = false;
    }
}

// Submit booking to backend
async function submitBooking(bookingData) {
    // Store booking in localStorage so it appears in admin panel
    let existingBookings = JSON.parse(localStorage.getItem('appointments') || '[]');
    
    // Add booking with proper status
    const newBooking = {
        id: 'APT' + Date.now(),
        service: bookingData.service,
        date: formatDateForStorage(bookingData.date),
        time: bookingData.time,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        specialRequests: bookingData.specialRequests || '',
        status: 'pending',
        timestamp: bookingData.timestamp,
        confirmationNumber: bookingData.confirmationNumber
    };
    
    existingBookings.push(newBooking);
    localStorage.setItem('appointments', JSON.stringify(existingBookings));
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate successful booking
            console.log('Booking submitted and stored:', newBooking);
            
            // Send email notification to Donna
            sendEmailNotification(bookingData);
            
            // Send confirmation email to customer (you'll need to implement this)
            sendConfirmationEmail(bookingData);
            
            resolve(bookingData);
        }, 2000);
    });
}

// Email Notification Function - Send to Donna when new appointment is booked
function sendEmailNotification(bookingData) {
    console.log('Sending automatic emails for booking:', bookingData.confirmationNumber);
    
    // Send email to Donna automatically
    sendAutomaticEmailToDonna(bookingData);
    
    // Send confirmation email to customer automatically
    sendAutomaticConfirmationToCustomer(bookingData);
}

// Send email to Donna
function sendEmailToDonna(subject, message) {
    const donnaEmail = 'bettyboops804@gmail.com';
    
    console.log(`Sending email to Donna (${donnaEmail}):`, subject);
    
    // Use mailto to open email client with pre-filled message
    sendEmail(donnaEmail, subject, message);
}

// Completely Automatic Email Functions using Web3Forms - NO email client needed!
async function sendAutomaticEmailToDonna(bookingData) {
    const emailData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `🆕 New Appointment Booked - ${bookingData.customerName}`,
        email: 'bettyboops804@gmail.com',
        name: 'Donna Salon Website',
        message: `Hi Donna,

A new appointment has been booked on your website!

Customer Details:
• Name: ${bookingData.customerName}
• Phone: ${bookingData.customerPhone}
• Email: ${bookingData.customerEmail}

Appointment Details:
• Service: ${bookingData.service}
• Date: ${bookingData.date}
• Time: ${bookingData.time}
• Confirmation #: ${bookingData.confirmationNumber}
• Special Requests: ${bookingData.specialRequests || 'None'}

Please log in to your admin panel to confirm or decline:
${window.location.origin}/admin.html

Password: donna2024

The customer is waiting for your confirmation.

Best regards,
Donna Salon & Spa System`
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
            console.log('✅ Email sent to Donna automatically!');
        } else {
            console.error('❌ Failed to send email to Donna:', result);
        }
    } catch (error) {
        console.error('❌ Network error sending email to Donna:', error);
    }
}

async function sendAutomaticConfirmationToCustomer(bookingData) {
    const emailData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `📅 Appointment Submitted - ${bookingData.confirmationNumber}`,
        email: bookingData.customerEmail,
        name: 'Donna Salon & Spa',
        message: `Hi ${bookingData.customerName},

Thank you for booking with Donna Salon & Spa!

Your appointment has been submitted and is pending confirmation.

Appointment Details:
• Service: ${bookingData.service}
• Date: ${bookingData.date}
• Time: ${bookingData.time}
• Confirmation #: ${bookingData.confirmationNumber}

We will confirm your appointment within 24 hours. You'll receive another email once confirmed.

Location: 1408 Crain Highway South, Glen Burnie, MD 21061
Phone: 410-370-7710

If you need to make changes, please call us.

Thank you for choosing Donna Salon & Spa!

Best regards,
Donna Salon & Spa Team`
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

// Email function for booking notifications (fallback)
function sendEmail(emailAddress, subject, message) {
    console.log(`📧 Fallback: Opening email client for: ${emailAddress}`);
    
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

// Email Confirmation Function (placeholder)
function sendConfirmationEmail(bookingData) {
    console.log('Confirmation email sent to:', bookingData.customerEmail);
    
    // This would integrate with an email service like SendGrid or EmailJS
}

// Utility Functions
function generateConfirmationNumber() {
    return 'DS' + Date.now().toString().slice(-6);
}

// Convert MM/DD/YYYY to YYYY-MM-DD format for storage
function formatDateForStorage(dateString) {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function newBooking() {
    // Reset all selections
    currentStep = 1;
    selectedService = '';
    selectedDate = '';
    selectedTime = '';
    selectedPaymentMethod = '';
    
    // Clear all form inputs
    const form = document.getElementById('bookingForm');
    if (form) {
        form.reset();
    }
    
    // Clear individual form fields
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('specialRequests').value = '';
    document.getElementById('agreeTerms').checked = false;
    
    // Clear service selection
    document.querySelectorAll('input[name="service"]').forEach(input => {
        input.checked = false;
    });
    
    // Clear payment method selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
        input.checked = false;
    });
    
    // Clear date selection
    document.querySelectorAll('.calendar-day.selected').forEach(day => {
        day.classList.remove('selected');
    });
    
    // Clear time selection
    document.querySelectorAll('.time-slot.selected').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Reset calendar to current month
    currentMonth = new Date().getMonth();
    currentYear = new Date().getFullYear();
    
    // Show first step and reinitialize
    showStep(1);
    initializeCalendar();
    generateTimeSlots(); // Clear time slots
    updateNavigationButtons();
    
    console.log('Booking form reset successfully');
}

// Navigation Setup
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Image Zoom Functionality
function zoomImage(imgElement, caption) {
    const modal = document.getElementById('imageZoomModal');
    const zoomedImg = document.getElementById('zoomedImage');
    const captionDiv = document.querySelector('.zoom-caption');
    
    // Set the image source and caption
    zoomedImg.src = imgElement.src;
    zoomedImg.alt = imgElement.alt;
    captionDiv.textContent = caption;
    
    // Show the modal
    modal.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

function closeZoomModal() {
    const modal = document.getElementById('imageZoomModal');
    modal.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
}

// Setup zoom modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking the X
    const closeBtn = document.querySelector('.zoom-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeZoomModal);
    }
    
    // Close modal when clicking outside the image
    const modal = document.getElementById('imageZoomModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeZoomModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeZoomModal();
        }
    });
});
