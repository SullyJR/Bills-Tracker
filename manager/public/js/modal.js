document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('billModal');
    const addBillBtns = document.querySelectorAll('.add-bill-btn');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('addBillForm');
    const propertyIdInput = document.getElementById('propertyId');
    const userIdSelect = document.getElementById('userId');

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
                const userId = tenant.getAttribute('data-user-id'); // Get user_id from data attribute
                const option = document.createElement('option');
                option.value = userId; // Use user_id as the value
                option.textContent = name;
                userIdSelect.appendChild(option);
            });

            modal.style.display = 'block';
        });
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        const billData = Object.fromEntries(formData.entries());

        // Send the data to the server
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
                modal.style.display = 'none';
                form.reset();
            } else {
                alert('Error adding bill. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });
});