import { iphoneModels } from './data/iphoneModels.js';

const API_URL = 'http://localhost:5001/api/records';

document.addEventListener('DOMContentLoaded', () => {
    // STATE
    let records = [];
    const recordsContainer = document.getElementById('records-container');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

   

    const fetchRecords = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch records.');
            records = await response.json();
            render(); 
        } catch (error) {
            console.error('Error fetching records:', error);
            recordsContainer.innerHTML = `<p class="empty-state">Could not load data from the server.</p>`;
        }
    };
    
    document.querySelector('.header-buttons').addEventListener('click', (e) => {
        if (e.target.classList.contains('add-btn')) {
            const type = e.target.dataset.type;
            openModal(type);
        }
    });

  
    document.getElementById('dark-mode-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    
    document.getElementById('search-bar').addEventListener('input', render);
    document.getElementById('date-filter').addEventListener('change', render);

    
    recordsContainer.addEventListener('click', async (e) => {
        const recordCard = e.target.closest('[data-id]');
        if (!recordCard) return;
        const recordId = recordCard.dataset.id;
        
        if (e.target.closest('[data-action="delete"]')) {
            if (confirm('Are you sure you want to delete this record?')) {
                await deleteRecord(recordId);
            }
        }
        if (e.target.closest('[data-action="edit"]')) {
            const recordToEdit = records.find(r => r._id === recordId);
            openModal(recordToEdit.type, recordToEdit);
        }
    }

    const openModal = type, record = null) => {
        modalContent.innerHTML = generateFormHTML(type, record);
        modalOverlay.classList.remove('hidden');
        document.getElementById('modal-form').addEventListener('submit', handleFormSubmit);
        document.querySelector('.close-btn').addEventListener('click', closeModal);
    };

    const closeModal = () => {
        modalOverlay.classList.add('hidden');
    };
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const recordId = data.id; 
        const recordData = {
            type: data.type,
            customerName: data.customerName,
            supplierName: data.supplierName,
            phoneSold: data.phoneSold,
            phoneGiven: data.phoneGiven,
            phoneReceived: data.phoneReceived,
            amountPaid: Number(data.amountPaid) || 0,
            amountSellerPaid: Number(data.amountSellerPaid) || 0,
            phoneNames: data.phoneNames,
            quantity: Number(data.quantity) || 0,
            unitPrice: Number(data.unitPrice) || 0,
            paymentStatus: data.paymentStatus,
            date: data.date,
        };

        if(recordData.quantity && recordData.unitPrice) {
            recordData.totalAmount = recordData.quantity * recordData.unitPrice;
        }
        
        if (recordId) {
            await updateRecord(recordId, recordData);
        } else {
            await addRecord(recordData);
        }
        
        closeModal();
    };

    
    const addRecord = async (record) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
            });
            if (!response.ok) throw new Error('Failed to create record.');
            await fetchRecords(); 
        } catch (error) {
            console.error('Error adding record:', error);
            alert('Could not add the record. Please try again.');
        }
    };

    const updateRecord = async (id, updatedRecord) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRecord),
            });
            if (!response.ok) throw new Error('Failed to update record.');
            await fetchRecords();
        } catch (error) {
            console.error('Error updating record:', error);
            alert('Could not update the record. Please try again.');
        }
    };

    const deleteRecord = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete record.');
            await fetchRecords();
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Could not delete the record. Please try again.');
        }
    };



    const render = () => {
        renderRecords();
        updateSummaryCards();
    };

    
    const updateSummaryCards = () => {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));

        const todayRecords = records.filter(r => new Date(r.date) >= todayStart);

        const todayIncome = todayRecords.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
        const todayExpenses = todayRecords.reduce((sum, r) => sum + (r.amountSellerPaid || 0), 0);
        const todaySwaps = todayRecords.filter(r => r.type.includes('swap')).length;

        const totalIncome = records.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
        const totalExpenses = records.reduce((sum, r) => sum + (r.amountSellerPaid || 0) + (r.type === 'supply' ? (r.totalAmount || 0) : 0), 0);
        const totalSwaps = records.filter(r => r.type.includes('swap')).length;
        const pendingRecords = records.filter(r => ['pending', 'partial', 'not-paid'].includes(r.paymentStatus));
        const totalOwed = pendingRecords.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

        document.getElementById('today-income').textContent = `$${todayIncome.toFixed(2)}`;
        document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
        document.getElementById('today-expenses').textContent = `$${todayExpenses.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('pending-count').textContent = pendingRecords.length;
        document.getElementById('total-owed').textContent = `$${totalOwed.toFixed(2)}`;
        document.getElementById('today-swaps').textContent = todaySwaps;
        document.getElementById('total-swaps').textContent = totalSwaps;
    };

    const renderRecords = () => {
        const filteredRecords = getFilteredRecords();
        if (filteredRecords.length === 0) {
            recordsContainer.innerHTML = `<p class="empty-state">No records found. Add a transaction to get started!</p>`;
            return;
        }
        recordsContainer.innerHTML = filteredRecords.map(record => generateRecordCardHTML(record)).join('');
    };
    
    // (The getFilteredRecords function is unchanged)
    const getFilteredRecords = () => {
        const searchTerm = document.getElementById('search-bar').value.toLowerCase();
        const dateFilter = document.getElementById('date-filter').value;
        
        return records.filter(record => {
            const recordDate = new Date(record.date);
            let dateMatch = true;
            const now = new Date();
            if (dateFilter === 'today') {
                dateMatch = recordDate.toDateString() === now.toDateString();
            } else if (dateFilter === 'week') {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                dateMatch = recordDate >= oneWeekAgo;
            } else if (dateFilter === 'month') {
                dateMatch = recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
            }
            
            const searchString = `${record.customerName || ''} ${record.supplierName || ''} ${record.phoneGiven || ''} ${record.phoneReceived || ''} ${record.phoneSold || ''}`.toLowerCase();
            const searchMatch = searchString.includes(searchTerm);

            return dateMatch && searchMatch;
        });
    };

    const generateRecordCardHTML = (record) => {
        const statusClass = (record.paymentStatus || '').toLowerCase().replace(' ', '-');
        let details = '';
        let incomeOrExpense = '';

        switch(record.type) {
            case 'sale':
                details = `<p><strong>Sold:</strong> ${record.phoneSold}</p>`;
                incomeOrExpense = `<p><strong>Income:</strong> $${record.amountPaid || 0}</p>`;
                break;
            case 'swap-up':
                details = `<p><strong>Given:</strong> ${record.phoneGiven}</p><p><strong>Received:</strong> ${record.phoneReceived}</p>`;
                incomeOrExpense = `<p><strong>Income:</strong> $${record.amountPaid || 0}</p>`;
                break;
            case 'swap-down':
                details = `<p><strong>Given:</strong> ${record.phoneGiven}</p><p><strong>Received:</strong> ${record.phoneReceived}</p>`;
                incomeOrExpense = `<p><strong>Expense:</strong> $${record.amountSellerPaid || 0}</p>`;
                break;
             case 'android-swap':
                details = `<p><strong>Given:</strong> ${record.phoneGiven}</p><p><strong>Received:</strong> ${record.phoneReceived}</p>`;
                incomeOrExpense = record.amountPaid ? `<p><strong>Income:</strong> $${record.amountPaid}</p>` : `<p><strong>Expense:</strong> $${record.amountSellerPaid}</p>`;
                break;
            case 'supply':
                details = `<p><strong>Item(s):</strong> ${record.phoneNames} (x${record.quantity})</p>`;
                incomeOrExpense = `<p><strong>Total Cost:</strong> $${record.totalAmount || 0}</p>`;
                break;
        }

        return `
            <div class="record-card type-${record.type} status-${statusClass}" data-id="${record._id}">
                <div class="record-header">
                    <h5>${record.customerName || record.supplierName}</h5>
                    <span class="record-type">${record.type.replace('-', ' ')}</span>
                </div>
                <div class="record-body">
                    ${details}
                    ${incomeOrExpense}
                    <p><strong>Status:</strong> ${record.paymentStatus}</p>
                </div>
                <div class="record-footer">
                    <span class="record-date">${new Date(record.date).toLocaleDateString()}</span>
                    <div class="record-actions">
                        <button data-action="edit">✏️</button>
                        <button data-action="delete">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    };

    const generateFormHTML = (type, record = {}) => {
        const isEditing = !!record._id;
        const iphoneOptions = iphoneModels.map(model => `<option value="${model}" ${record.phoneGiven === model ? 'selected' : ''}>${model}</option>`).join('');
        const iphoneOptionsReceived = iphoneModels.map(model => `<option value="${model}" ${record.phoneReceived === model ? 'selected' : ''}>${model}</option>`).join('');
        
        let formFields = '';
        let title = '';

        // All form fields remain the same as the previous version...
        switch(type) {
            case 'sale':
                title = isEditing ? 'Edit Sale' : 'Add New Sale';
                formFields = `
                    <div class="form-group full-width">
                        <label for="customerName">Customer Name</label>
                        <input type="text" id="customerName" name="customerName" value="${record.customerName || ''}" required>
                    </div>
                    <div class="form-group full-width">
                        <label for="phoneSold">Phone Sold</label>
                        <input type="text" id="phoneSold" name="phoneSold" value="${record.phoneSold || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="amountPaid">Amount Paid</label>
                        <input type="number" step="0.01" id="amountPaid" name="amountPaid" value="${record.amountPaid || ''}" required>
                    </div>
                     <div class="form-group">
                        <label for="paymentStatus">Payment Status</label>
                        <select id="paymentStatus" name="paymentStatus" required>
                            <option value="paid" ${record.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
                            <option value="partial" ${record.paymentStatus === 'partial' ? 'selected' : ''}>Partial</option>
                            <option value="not-paid" ${record.paymentStatus === 'not-paid' ? 'selected' : ''}>Not Paid</option>
                        </select>
                    </div>
                `;
                break;
            case 'swap-up':
                title = isEditing ? 'Edit iPhone Swap Up' : 'New iPhone Swap Up';
                formFields = `
                    <div class="form-group full-width"><label>Customer Name</label><input type="text" name="customerName" value="${record.customerName || ''}" required></div>
                    <div class="form-group"><label>iPhone Given</label><select name="phoneGiven" required>${iphoneOptions}</select></div>
                    <div class="form-group"><label>iPhone Received</label><select name="phoneReceived" required>${iphoneOptionsReceived}</select></div>
                    <div class="form-group"><label>Amount Paid by Customer</label><input type="number" step="0.01" name="amountPaid" value="${record.amountPaid || ''}" required></div>
                    <div class="form-group"><label>Payment Status</label><select name="paymentStatus" required><option value="paid" ${record.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option><option value="partial" ${record.paymentStatus === 'partial' ? 'selected' : ''}>Partial</option><option value="not-paid" ${record.paymentStatus === 'not-paid' ? 'selected' : ''}>Not Paid</option></select></div>
                `;
                break;
            case 'swap-down':
                 title = isEditing ? 'Edit iPhone Swap Down' : 'New iPhone Swap Down';
                 formFields = `
                    <div class="form-group full-width"><label>Customer Name</label><input type="text" name="customerName" value="${record.customerName || ''}" required></div>
                    <div class="form-group"><label>iPhone Given</label><select name="phoneGiven" required>${iphoneOptions}</select></div>
                    <div class="form-group"><label>iPhone Received</label><select name="phoneReceived" required>${iphoneOptionsReceived}</select></div>
                    <div class="form-group"><label>Amount Paid to Customer</label><input type="number" step="0.01" name="amountSellerPaid" value="${record.amountSellerPaid || ''}" required></div>
                    <div class="form-group"><label>Payment Status</label><select name="paymentStatus" required><option value="paid" ${record.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option><option value="pending" ${record.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option></select></div>
                 `;
                 break;
             case 'android-swap':
                title = isEditing ? 'Edit Android Swap' : 'New Android Swap';
                formFields = `
                    <div class="form-group full-width"><label>Customer Name</label><input type="text" name="customerName" value="${record.customerName || ''}" required></div>
                    <div class="form-group"><label>Phone Given</label><input type="text" name="phoneGiven" value="${record.phoneGiven || ''}" required></div>
                    <div class="form-group"><label>Phone Received</label><input type="text" name="phoneReceived" value="${record.phoneReceived || ''}" required></div>
                    <div class="form-group"><label>Amount Paid (by Customer)</label><input type="number" step="0.01" name="amountPaid" placeholder="For Swap Up" value="${record.amountPaid || ''}"></div>
                    <div class="form-group"><label>Amount Paid (to Customer)</label><input type="number" step="0.01" name="amountSellerPaid" placeholder="For Swap Down" value="${record.amountSellerPaid || ''}"></div>
                    <div class="form-group full-width"><label>Payment Status</label><select name="paymentStatus" required><option value="paid" ${record.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option><option value="pending" ${record.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option><option value="partial" ${record.paymentStatus === 'partial' ? 'selected' : ''}>Partial</option></select></div>
                `;
                break;
            case 'supply':
                 title = isEditing ? 'Edit Supply Record' : 'New Supply Record';
                 formFields = `
                    <div class="form-group full-width"><label>Supplier Name</label><input type="text" name="supplierName" value="${record.supplierName || ''}" required></div>
                    <div class="form-group full-width"><label>Phone Name(s)</label><input type="text" name="phoneNames" value="${record.phoneNames || ''}" required></div>
                    <div class="form-group"><label>Quantity</label><input type="number" name="quantity" value="${record.quantity || ''}" required></div>
                    <div class="form-group"><label>Unit Price</label><input type="number" step="0.01" name="unitPrice" value="${record.unitPrice || ''}" required></div>
                    <div class="form-group full-width"><label>Payment Status</label><select name="paymentStatus" required><option value="paid" ${record.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option><option value="pending" ${record.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option></select></div>
                 `;
                break;
        }

        return `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <form id="modal-form">
                <input type="hidden" name="id" value="${record._id || ''}">
                <input type="hidden" name="type" value="${type}">
                <div class="form-grid">
                    ${formFields}
                    <div class="form-group full-width">
                        <label for="date">Date</label>
                        <input type="date" id="date" name="date" value="${record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}" required>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="submit-btn">${isEditing ? 'Save Changes' : 'Add Record'}</button>
                </div>
            </form>
        `;
    };
    
    fetchRecords();
});
