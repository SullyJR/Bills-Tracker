// Get the Add Bill modal
var addBillModal = document.getElementById("addBillModal");
var addBillBtn = document.getElementById("addBillBtn");
var addBillSpan = addBillModal.getElementsByClassName("close")[0]; // Close button for Add Bill modal

// When the user clicks the button, open the Add Bill modal
addBillBtn.onclick = function() {
    addBillModal.style.display = "block";
}

// When the user clicks on the close (x), close the Add Bill modal
addBillSpan.onclick = function() {
    addBillModal.style.display = "none";
}

// Get the Edit Profile modal
const editProfileModal = document.getElementById("editProfileModal");
const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileSpan = editProfileModal.getElementsByClassName("close")[0]; // Close button for Edit Profile modal

// When the user clicks the button, open the Edit Profile modal
editProfileBtn.onclick = function() {
    editProfileModal.style.display = "block";
}

// When the user clicks on the close (x), close the Edit Profile modal
editProfileSpan.onclick = function() {
    editProfileModal.style.display = "none";
}

// When the user clicks anywhere outside the modal, close both modals
window.onclick = function(event) {
    if (event.target == addBillModal) {
        addBillModal.style.display = "none";
    }
    if (event.target == editProfileModal) {
        editProfileModal.style.display = "none";
    }
}

// Edit Profile Form Submission
const editProfileForm = document.getElementById("editProfileForm");

editProfileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(editProfileForm);
    const userData = Object.fromEntries(formData.entries());

    fetch('/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profile updated successfully!');
            editProfileModal.style.display = "none";
            location.reload(); // Reload the page to reflect changes
        } else {
            alert('Error updating profile. Please try again.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});

// Phone Number Validation for Edit Profile form
const editPhoneInput = document.getElementById("editPhone");
const editPhoneError = document.getElementById("editPhoneError");

editPhoneInput.addEventListener('input', function(e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2] + (x[3] ? '-' + x[3] : '');

    const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
    if (!phonePattern.test(e.target.value) && e.target.value.length > 0) {
        editPhoneError.style.display = 'block';
        e.target.setCustomValidity('Please enter a valid phone number');
    } else {
        editPhoneError.style.display = 'none';
        e.target.setCustomValidity('');
    }
});

// Additional logic for form submission to ensure validation
editProfileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!editPhoneInput.checkValidity()) {
        editPhoneError.style.display = 'block';
        return;
    }
    
    const formData = new FormData(editProfileForm);
    const userData = Object.fromEntries(formData.entries());

    fetch('/update-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profile updated successfully!');
            editProfileModal.style.display = "none";
            location.reload(); // Reload the page to reflect changes
        } else {
            alert('Error updating profile. Please try again.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});
