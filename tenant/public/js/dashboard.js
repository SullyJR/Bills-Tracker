// Get the modal
var modal = document.getElementById("addBillModal");

// Get the button that opens the modal
var btn = document.getElementById("addBillBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// Edit Profile Modal
const editProfileModal = document.getElementById("editProfileModal");
const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileSpan = editProfileModal.getElementsByClassName("close")[0];
const editProfileForm = document.getElementById("editProfileForm");

editProfileBtn.onclick = function() {
    editProfileModal.style.display = "block";
}

editProfileSpan.onclick = function() {
    editProfileModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == editProfileModal) {
        editProfileModal.style.display = "none";
    }
}

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
            // Reload the page to reflect changes
            location.reload();
        } else {
            alert('Error updating profile. Please try again.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});

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
            // Reload the page to reflect changes
            location.reload();
        } else {
            alert('Error updating profile. Please try again.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});

// Rest of the existing code...