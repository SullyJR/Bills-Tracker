document.addEventListener('DOMContentLoaded', function() {
    // Edit Profile Functionality
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const editProfileCloseBtn = editProfileModal.querySelector('.close');
    const editProfileForm = document.getElementById('editProfileForm');
    const phoneInput = document.getElementById('editPhone');

    // Add Bill Functionality
    const billModal = document.getElementById('billModal');
    const addBillBtns = document.querySelectorAll('.add-bill-btn');
    const billCloseBtn = billModal.querySelector('.close');
    const addBillForm = document.getElementById('addBillForm');
    const propertyIdInput = document.getElementById('propertyId');
    const userIdSelect = document.getElementById('userId');

    // Edit Profile Event Listeners
    editProfileBtn.addEventListener('click', function() {
        editProfileModal.style.display = 'block';
    });

    editProfileCloseBtn.addEventListener('click', function() {
        editProfileModal.style.display = 'none';
    });

    // Phone number formatting
    phoneInput.addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : `${x[1]}-${x[2]}${x[3] ? `-${x[3]}` : ''}`;
    });

    editProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(editProfileForm);
        const data = Object.fromEntries(formData.entries());

        fetch('/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // Update the displayed information
                document.getElementById('managerName').textContent = `${data.first_name} ${data.last_name}`;
                document.getElementById('managerEmail').textContent = data.email;
                document.getElementById('managerPhone').textContent = data.phone_number;
                document.getElementById('managerCompany').textContent = data.company;
                
                // Close the modal
                editProfileModal.style.display = 'none';
                
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });

    // Add Bill Event Listeners
    addBillBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyId = this.getAttribute('data-property-id');
            propertyIdInput.value = propertyId;
            
            // Clear previous options
            userIdSelect.innerHTML = '<option value="">Select Tenant</option><option value="all">All Tenants</option>';
            
            // Add tenants for this property
            const propertyCard = this.closest('.property-card');
            const tenants = propertyCard.querySelectorAll('ul li');
            tenants.forEach(tenant => {
                const name = tenant.textContent.split(' - ')[0];
                const userId = tenant.getAttribute('data-user-id');
                const option = document.createElement('option');
                option.value = userId;
                option.textContent = name;
                userIdSelect.appendChild(option);
            });

            billModal.style.display = 'block';
        });
    });

    billCloseBtn.addEventListener('click', function() {
        billModal.style.display = 'none';
    });

    addBillForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(addBillForm);
        const billData = Object.fromEntries(formData.entries());

        fetch('/add-bill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(billData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Bill added successfully!');
                billModal.style.display = 'none';
                addBillForm.reset();
            } else {
                alert('Error adding bill. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });

    // Common Modal Functionality
    window.addEventListener('click', function(event) {
        if (event.target == editProfileModal) {
            editProfileModal.style.display = 'none';
        }
        if (event.target == billModal) {
            billModal.style.display = 'none';
        }
    });
});