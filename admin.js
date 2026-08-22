const firebaseConfig = {
    apiKey: "AIzaSyCjolGY6uh5pY7CHIc0ON6m8qNSz5xJDXM",
    authDomain: "dbcoffee-bbeaf.firebaseapp.com",
    databaseURL: "https://dbcoffee-bbeaf-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dbcoffee-bbeaf",
    storageBucket: "dbcoffee-bbeaf.firebasestorage.app",
    messagingSenderId: "118275632803",
    appId: "1:118275632803:web:459762b6ace8d1c25ed916",
    measurementId: "G-MHVZ55R50Y"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function cafeApp() {
    return {
        // ================= NAVIGATION & CHUNG =================
        currentTab: 'pos',
        searchQuery: '',
        selectedAreaFilter: 'Tất cả',
        activeCategory: 'Tất cả',
        categories: ['Tất cả', 'Café', 'Trà', 'Nước ngọt', 'Đồ ăn'],
        showCategoryModal: false,
        isEditingCategory: false,
        selectedShiftToPrint: null,
        showPrintShiftModal: false,
        categoryOldName: '',
        categoryInputName: '',
        pendingCustomerOrders: [],
showCustomerOrderModal: false,
selectedPendingOrder: null,
showQrModal: false,
selectedTableForQr: null,
showAllQrModal: false,
        tabs: [
            { id: 'pos', name: 'Bán hàng POS', icon: 'fa-solid fa-cash-register' },
            { id: 'tables', name: 'Quản lý Bàn', icon: 'fa-solid fa-chair' },
            { id: 'menu', name: 'Quản lý Món', icon: 'fa-solid fa-utensils' },
            { id: 'inventory', name: 'Quản lý Kho', icon: 'fa-solid fa-warehouse' },
            { id: 'history_orders', name: 'Lịch sử HĐ', icon: 'fa-solid fa-clock-rotate-left' },
            { id: 'cashflow', name: 'Sổ Quỹ Thu Chi', icon: 'fa-solid fa-wallet' },
            { id: 'staff', name: 'Nhân viên', icon: 'fa-solid fa-users' },
            { id: 'reports', name: 'Báo cáo', icon: 'fa-solid fa-chart-pie' }
        ],
        areas: ['Tầng trệt', 'Sân thượng', 'Phòng máy lạnh'],
        tables: [],
        menuItems: [],

        // ================= TÀI KHOẢN & CA LÀM VIỆC =================
        currentUser: JSON.parse(localStorage.getItem('cukcuk_user') || 'null'),
        loginForm: { username: '', pin: '' },
        currentShift: JSON.parse(localStorage.getItem('cukcuk_shift') || 'null'),
        showOpenShiftModal: false,
        showCloseShiftModal: false,
        openShiftForm: { initialCash: 500000, shiftName: 'Ca Sáng (06:00 - 14:00)', note: '' },
        closeShiftForm: { actualCash: 0, note: '' },
        shiftsHistory: [],
        staffList: [],
        showStaffModal: false,
        isEditingStaff: false,
        staffForm: { id: null, name: '', role: 'Thu ngân', phone: '', username: '', pin: '1234' },

        // ================= BÁN HÀNG & ORDER =================
        ordersList: [],
        selectedTable: null,
        tableOrders: {}, 
        currentOrder: { items: [] },
        discountPercent: 0,
        discountAmount: 0,
        discountType: 'percent',
        surcharge: 0,
        paymentMethod: 'Tiền mặt',
        orderNote: '',
        customerGivenMoney: 0,
        showPaymentModal: false,
        showBillModal: false,

        // Modal Đổi / Gộp / Tách bàn
        showMoveModal: false, targetTableId: '',
        showMergeModal: false, sourceTableIdForMerge: '',
        showSplitModal: false, targetTableIdForSplit: '', splitItemIndices: [],

        // Modal Bàn / Khu vực / Món
        showTableModal: false, isEditingTable: false, tableForm: { id: null, name: '', area: 'Tầng trệt', status: 'empty' },
        showAreaModal: false, newAreaName: '',
        showMenuModal: false, isEditingMenu: false, menuForm: { id: null, name: '', image: '', category: 'Café', price: 25000, recipeList: [] },

        // ================= KHO & NHÀ CUNG CẤP =================
        invSubTab: 'xnt',
        inventoryNVL: [],
        inventorySP: [],
        unitsList: ['g', 'kg', 'ml', 'lít', 'chai', 'lon', 'gói', 'hộp', 'thùng', 'cái'],
        showUnitModal: false,
        newUnitName: '',
        importTab: 'nvl',
        importOrder: { supplier: '', note: '', items: [] },
        selectedImportItemId: '',
        showInventoryModal: false,
        invForm: { id: null, name: '', stock: 100, unit: 'g', type: 'nvl' },
        suppliersList: [],
        showSupplierModal: false,
        isEditingSupplier: false,
        supplierForm: { id: null, name: '', phone: '', address: '', note: '' },
        inventoryHistory: [],

        // ================= LỊCH SỬ HÓA ĐƠN =================
        historyFilterKeyword: '',
        historyFilterDate: '',
        historyFilterPayment: 'Tất cả',
        selectedBillToView: null,
        showBillDetailModal: false,
        showEditBillModal: false,
        editingBillForm: { id: null, table: '', paymentMethod: 'Tiền mặt', total: 0, note: '', discount: 0, subTotal: 0 },

        // ================= SỔ QUỸ THU CHI =================
        cashFlowList: [],
        showCashFlowModal: false,
        isEditingCashFlow: false,
        cashFlowFilterType: 'Tất cả',
        cashFlowFilterCategory: 'Tất cả',
        cashFlowFilterDate: '',
        cashFlowForm: { id: null, type: 'CHI', category: 'Tiền điện/nước/mạng', amount: 0, recipient: '', note: '', paymentMethod: 'Tiền mặt' },
        expenseCategories: [
            'Tiền điện/nước/mạng', 'Mặt bằng', 'Mua nguyên vật liệu ngoài',
            'Lương/Thưởng nhân viên', 'Sửa chữa/Bảo trì thiết bị',
            'Văn phòng phẩm/Vật dụng quán', 'Chi phí marketing/Quảng cáo', 'Chi phí khác'
        ],
        incomeCategories: [
            'Thu tiền bán hàng POS (Tự động)', 'Thu hoàn tiền / Chiết khấu NCC',
            'Thu thanh lý đồ dùng/phế liệu', 'Chủ quán nộp tiền vào quỹ', 'Thu nhập khác'
        ],

        // ================= KHỞI TẠO DỮ LIỆU REALTIME =================
        init() {
            db.ref('menu').on('value', snap => {
                const d = snap.val();
                this.menuItems = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : [];
            });

            db.ref('tables').on('value', snap => {
                const d = snap.val();
                this.tables = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : [];
            });

            db.ref('areas').on('value', snap => {
                const d = snap.val();
                if (d) this.areas = d;
            });

            db.ref('categories').on('value', snap => {
                const d = snap.val();
                if (d && Array.isArray(d)) {
                    this.categories = ['Tất cả', ...d.filter(c => c !== 'Tất cả')];
                }
            });
            db.ref('pendingOrders').on('value', snap => {
    const d = snap.val();
    if (d) {
        this.pendingCustomerOrders = Object.keys(d).map(k => ({ key: k, ...d[k] })).filter(o => o.status === 'pending');
        // Phát âm thanh chuông báo khi có đơn mới
        if (this.pendingCustomerOrders.length > 0) {
            try {
                let audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play();
            } catch(e){}
        }
    } else {
        this.pendingCustomerOrders = [];
    }
});

            db.ref('suppliers').on('value', snap => {
                const d = snap.val();
                this.suppliersList = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : [];
            });

            db.ref('inventoryHistory').on('value', snap => {
                const d = snap.val();
                this.inventoryHistory = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })).reverse() : [];
            });

            db.ref('cashFlow').on('value', snap => {
                const d = snap.val();
                this.cashFlowList = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })).reverse() : [];
            });

            db.ref('shiftsHistory').on('value', snap => {
                const d = snap.val();
                this.shiftsHistory = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })).reverse() : [];
            });

            db.ref('units').on('value', snap => {
                const d = snap.val();
                if (d) this.unitsList = d;
            });

            db.ref('tableOrders').on('value', snap => {
                this.tableOrders = snap.val() || {};
                if (this.selectedTable) {
                    this.currentOrder.items = this.tableOrders[this.selectedTable.id] || [];
                }
            });

            db.ref('inventoryNVL').on('value', snap => { 
                this.inventoryNVL = snap.val() ? Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })) : []; 
            });

            db.ref('inventorySP').on('value', snap => { 
                this.inventorySP = snap.val() ? Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })) : []; 
            });

            db.ref('staff').on('value', snap => { 
                const d = snap.val();
                this.staffList = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []; 
            });

            db.ref('orders').on('value', snap => { 
                const d = snap.val();
                this.ordersList = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []; 
            });
        },
        // ================= kiểm tra quyền theo danh sách vai trò cho phé
hasPermission(allowedRoles = []) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'Quản lý' || this.currentUser.username === 'admin') return true;
    return allowedRoles.includes(this.currentUser.role);
},

// Chuyển tab có kiểm tra quyền bảo vệ
switchTab(tabId) {
    // 1. Các tab chỉ Quản lý mới vào được
    const managerOnlyTabs = ['reports', 'staff', 'inventory'];
    if (managerOnlyTabs.includes(tabId) && !this.hasPermission(['Quản lý'])) {
        alert('Bạn không có quyền truy cập vào mục này! Chỉ Quản lý mới có quyền.');
        return;
    }

    // 2. Tab Thu ngân & Quản lý (Cho phép thêm tab cashflow)
    const cashierTabs = ['history_orders', 'cashflow'];
    if (cashierTabs.includes(tabId) && !this.hasPermission(['Quản lý', 'Thu ngân'])) {
        alert('Chức năng này chỉ dành cho Thu ngân và Quản lý!');
        return;
    }

    this.currentTab = tabId;
},

        // ================= XÁC THỰC ĐĂNG NHẬP / ĐĂNG XUẤT =================
        login() {
            const u = (this.loginForm.username || '').trim().toLowerCase();
            const p = String(this.loginForm.pin || '').trim();

            if (!u || !p) {
                alert('Vui lòng nhập đầy đủ Tên đăng nhập và Mã PIN!');
                return;
            }

            // 1. Admin mặc định
            if (u === 'admin' && p === '1234') {
                this.currentUser = { id: 'admin', name: 'Quản Trị Viên', role: 'Quản lý', username: 'admin' };
                localStorage.setItem('cukcuk_user', JSON.stringify(this.currentUser));
                this.loginForm = { username: '', pin: '' };
                return;
            }

            // 2. Tìm trong danh sách nhân viên Firebase
            const list = Array.isArray(this.staffList) ? this.staffList : [];
            const staff = list.find(s => {
                const sUser = String(s.username || '').trim().toLowerCase();
                const sPin = String(s.pin || '').trim();
                return sUser === u && sPin === p;
            });

            if (staff) {
                this.currentUser = { 
                    id: staff.id, 
                    name: staff.name, 
                    role: staff.role || 'Thu ngân', 
                    username: staff.username 
                };
                localStorage.setItem('cukcuk_user', JSON.stringify(this.currentUser));
                this.loginForm = { username: '', pin: '' };
                alert(`Đăng nhập thành công! Chào mừng ${staff.name}`);
            } else {
                alert('Tên đăng nhập hoặc mã PIN không chính xác!');
            }
        },

        logout() {
            if (this.currentShift) {
                if (!confirm('Bạn đang có ca làm việc chưa kết ca! Bạn có chắc muốn đăng xuất?')) return;
            }
            this.currentUser = null;
            localStorage.removeItem('cukcuk_user');
            this.loginForm = { username: '', pin: '' };
        },

        // ================= QUẢN LÝ CA LÀM VIỆC =================
        openShift() {
            if (!this.currentUser) { alert('Vui lòng đăng nhập trước!'); return; }
            if (Number(this.openShiftForm.initialCash) < 0) { alert('Tiền quỹ ban đầu không hợp lệ!'); return; }

            this.currentShift = {
                id: 'SHIFT_' + Date.now(),
                shiftName: this.openShiftForm.shiftName,
                cashier: this.currentUser.name,
                startTime: new Date().toISOString(),
                initialCash: Number(this.openShiftForm.initialCash) || 0,
                note: this.openShiftForm.note || ''
            };

            localStorage.setItem('cukcuk_shift', JSON.stringify(this.currentShift));
            db.ref('currentShifts/' + this.currentUser.username).set(this.currentShift);

            alert(`Mở ca làm việc "${this.currentShift.shiftName}" thành công!`);
            this.showOpenShiftModal = false;
        },

        get shiftStats() {
            if (!this.currentShift) return { ordersCount: 0, cashIncome: 0, bankIncome: 0, expensesCash: 0, systemExpectedCash: 0 };

            const shiftStart = new Date(this.currentShift.startTime).getTime();
            const ordersInShift = this.ordersList.filter(o => new Date(o.timestamp).getTime() >= shiftStart);
            const cashIncome = ordersInShift.filter(o => o.paymentMethod === 'Tiền mặt').reduce((s, o) => s + (o.total || 0), 0);
            const bankIncome = ordersInShift.filter(o => o.paymentMethod !== 'Tiền mặt').reduce((s, o) => s + (o.total || 0), 0);

            const expensesInShift = this.cashFlowList
                .filter(c => c.type === 'CHI' && c.paymentMethod === 'Tiền mặt' && new Date(c.timestamp).getTime() >= shiftStart)
                .reduce((s, c) => s + (c.amount || 0), 0);

            const expectedCash = (this.currentShift.initialCash || 0) + cashIncome - expensesInShift;

            return {
                ordersCount: ordersInShift.length,
                cashIncome: cashIncome,
                bankIncome: bankIncome,
                expensesCash: expensesInShift,
                systemExpectedCash: expectedCash
            };
        },

        openCloseShiftModalFunc() {
            if (!this.currentShift) { alert('Hiện tại chưa có ca làm việc nào đang mở!'); return; }
            this.closeShiftForm.actualCash = this.shiftStats.systemExpectedCash;
            this.closeShiftForm.note = '';
            this.showCloseShiftModal = true;
        },

        confirmCloseShift() {
            const stats = this.shiftStats;
            const actualCash = Number(this.closeShiftForm.actualCash) || 0;
            const diff = actualCash - stats.systemExpectedCash;

            const shiftReport = {
                ...this.currentShift,
                endTime: new Date().toISOString(),
                cashRevenue: stats.cashIncome,
                bankRevenue: stats.bankIncome,
                cashExpenses: stats.expensesCash,
                expectedCash: stats.systemExpectedCash,
                actualCash: actualCash,
                difference: diff,
                closeNote: this.closeShiftForm.note
            };

            db.ref('shiftsHistory').push(shiftReport);
            if (this.currentUser) {
                db.ref('currentShifts/' + this.currentUser.username).remove();
            }

            alert(`Kết ca thành công!\n- Tiền thực tế: ${actualCash.toLocaleString()}đ\n- Chênh lệch: ${diff >= 0 ? '+' : ''}${diff.toLocaleString()}đ`);
            this.currentShift = null;
            localStorage.removeItem('cukcuk_shift');
            this.showCloseShiftModal = false;
        },

        // ================= QUẢN LÝ NHÂN VIÊN =================
        openStaffModal() { 
            this.isEditingStaff = false;
            this.staffForm = { id: null, name: '', role: 'Thu ngân', phone: '', username: '', pin: '1234' }; 
            this.showStaffModal = true; 
        },

        openEditStaffModal(st) {
            this.isEditingStaff = true;
            this.staffForm = { 
                id: st.id, 
                name: st.name || '', 
                role: st.role || 'Thu ngân', 
                phone: st.phone || '', 
                username: st.username || '', 
                pin: String(st.pin || '') 
            };
            this.showStaffModal = true;
        },

        saveStaff() {
            const name = (this.staffForm.name || '').trim();
            const username = (this.staffForm.username || '').trim().toLowerCase();
            const pin = String(this.staffForm.pin || '').trim();

            if (!name) { alert('Vui lòng nhập họ tên nhân viên!'); return; }
            if (!username || !pin) { alert('Vui lòng nhập tên đăng nhập và mã PIN!'); return; }

            const payload = { 
                name: name, 
                role: this.staffForm.role || 'Thu ngân', 
                phone: (this.staffForm.phone || '').trim(),
                username: username,
                pin: pin
            };

            if (this.isEditingStaff) {
                db.ref('staff/' + this.staffForm.id).update(payload);
            } else {
                db.ref('staff').push(payload);
            }

            alert('Lưu thông tin nhân viên thành công!');
            this.showStaffModal = false;
        },

        deleteStaff(id) { 
            if (confirm('Bạn có chắc muốn xóa nhân viên này?')) db.ref('staff/' + id).remove(); 
        },

        // ================= POS & ORDER =================
        get filteredTables() {
            return this.selectedAreaFilter === 'Tất cả' ? this.tables : this.tables.filter(t => t.area === this.selectedAreaFilter);
        },

        get filteredMenu() {
            let items = this.menuItems;
            if (this.activeCategory !== 'Tất cả') items = items.filter(i => i.category === this.activeCategory);
            if (this.searchQuery.trim() !== '') items = items.filter(i => i.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            return items;
        },

        get totalRevenue() { return this.ordersList.reduce((sum, o) => sum + (o.total || 0), 0); },
        get totalOrdersCount() { return this.ordersList.length; },

        selectTable(table) {
            this.selectedTable = table;
            this.discountPercent = 0;
            this.discountAmount = 0;
            this.surcharge = 0;
            this.currentOrder.items = this.tableOrders[table.id] || [];
        },

        addToOrder(item) {
            if (!this.selectedTable) { alert('Vui lòng chọn một bàn trước khi gọi món!'); return; }
            let existing = this.currentOrder.items.find(i => i.name === item.name && !i.isGift);
            if (existing) existing.qty++;
            else this.currentOrder.items.push({ ...item, qty: 1 });
            
            this.tableOrders[this.selectedTable.id] = [...this.currentOrder.items];
            db.ref('tableOrders/' + this.selectedTable.id).set(this.currentOrder.items);
        },

        updateQty(index, change) {
            this.currentOrder.items[index].qty += change;
            if (this.currentOrder.items[index].qty <= 0) this.currentOrder.items.splice(index, 1);
            if (this.selectedTable) {
                db.ref('tableOrders/' + this.selectedTable.id).set(this.currentOrder.items);
            }
        },

        removeItem(index) {
            this.currentOrder.items.splice(index, 1);
            if (this.selectedTable) {
                db.ref('tableOrders/' + this.selectedTable.id).set(this.currentOrder.items);
            }
        },

        subTotal() { 
            return this.currentOrder.items.reduce((sum, i) => sum + (i.price * i.qty), 0); 
        },

        get discountCalculated() {
            let sub = this.subTotal();
            if (this.discountType === 'percent') {
                return (sub * (Number(this.discountPercent) || 0)) / 100;
            } else {
                return Math.min(sub, Number(this.discountAmount) || 0);
            }
        },

        finalTotal() {
            let sub = this.subTotal();
            let total = sub - this.discountCalculated + (Number(this.surcharge) || 0);
            return Math.max(0, total);
        },

        get returnChange() {
            if (!this.customerGivenMoney || this.customerGivenMoney <= 0) return 0;
            return Math.max(0, this.customerGivenMoney - this.finalTotal());
        },

        saveTableOrder() {
            if (!this.selectedTable) { alert('Vui lòng chọn bàn trước!'); return; }
            if (this.currentOrder.items.length === 0) { alert('Chưa có món nào để lưu order!'); return; }

            db.ref('tables/' + this.selectedTable.id).update({ status: 'serving' });
            this.selectedTable.status = 'serving';
            db.ref('tableOrders/' + this.selectedTable.id).set(this.currentOrder.items);
            alert(`Đã lưu order cho ${this.selectedTable.name}!`);
        },

        cancelOrder() {
            if (!this.selectedTable) { alert('Vui lòng chọn bàn cần hủy order!'); return; }
            if (this.currentOrder.items.length === 0) { alert('Bàn này hiện chưa có món nào trong order!'); return; }

            if (!confirm(`Bạn có chắc chắn muốn HỦY TOÀN BỘ ORDER của ${this.selectedTable.name}?`)) return;

            db.ref('tableOrders/' + this.selectedTable.id).remove();
            db.ref('tables/' + this.selectedTable.id).update({ status: 'empty' });

            delete this.tableOrders[this.selectedTable.id];
            this.currentOrder.items = [];
            this.selectedTable.status = 'empty';
            alert(`Đã hủy order của ${this.selectedTable.name}!`);
        },

        openPaymentModal() {
            if (!this.selectedTable || this.currentOrder.items.length === 0) {
                alert('Không có món nào trong order để thanh toán!');
                return;
            }
            this.discountPercent = 0;
            this.discountAmount = 0;
            this.discountType = 'percent';
            this.paymentMethod = 'Tiền mặt';
            this.orderNote = '';
            this.customerGivenMoney = this.finalTotal();
            this.showPaymentModal = true;
        },

        confirmCheckout() {
            if (!this.selectedTable || this.currentOrder.items.length === 0) return;

            let sub = this.subTotal();
            let finalAmt = this.finalTotal();
            let discVal = this.discountCalculated;

            // Trừ kho tự động
            let exportedItems = [];
            this.currentOrder.items.forEach(cartItem => {
                if (cartItem.recipeList && Array.isArray(cartItem.recipeList)) {
                    cartItem.recipeList.forEach(recipeItem => {
                        let inv = this.inventoryNVL.find(i => i.id === recipeItem.invId);
                        if (inv) {
                            let totalDeduct = recipeItem.amount * cartItem.qty;
                            let newStock = Math.max(0, inv.stock - totalDeduct);
                            db.ref('inventoryNVL/' + inv.id).update({ stock: newStock });
                            exportedItems.push({ id: inv.id, name: inv.name, qty: totalDeduct, unit: inv.unit });
                        }
                    });
                }
                let matchedSP = this.inventorySP.find(sp => sp.name.toLowerCase() === cartItem.name.toLowerCase());
                if (matchedSP) {
                    let newStockSP = Math.max(0, matchedSP.stock - cartItem.qty);
                    db.ref('inventorySP/' + matchedSP.id).update({ stock: newStockSP });
                    exportedItems.push({ id: matchedSP.id, name: matchedSP.name, qty: cartItem.qty, unit: matchedSP.unit });
                }
            });

            if (exportedItems.length > 0) {
                db.ref('inventoryHistory').push({
                    type: 'XUAT',
                    targetWarehouse: 'Bán hàng POS',
                    supplier: 'Khách hàng (' + this.selectedTable.name + ')',
                    note: this.orderNote ? ('Bán hàng POS - ' + this.orderNote) : 'Bán hàng POS',
                    items: exportedItems,
                    timestamp: new Date().toISOString()
                });
            }

            db.ref('orders').push({
                table: this.selectedTable.name,
                area: this.selectedTable.area,
                items: this.currentOrder.items,
                subTotal: sub,
                discount: discVal,
                total: finalAmt,
                paymentMethod: this.paymentMethod,
                note: this.orderNote,
                cashier: this.currentUser ? this.currentUser.name : 'Thu ngân',
                timestamp: new Date().toISOString()
            });

            db.ref('tables/' + this.selectedTable.id).update({ status: 'empty' });
            db.ref('tableOrders/' + this.selectedTable.id).remove();

            alert(`Thanh toán thành công ${finalAmt.toLocaleString()}đ cho ${this.selectedTable.name}!`);

            this.selectedTable.status = 'empty';
            this.selectedTable = null;
            this.currentOrder.items = [];
            this.showPaymentModal = false;
        },

        printTemporaryBill() {
            if (!this.selectedTable || this.currentOrder.items.length === 0) { alert('Không có dữ liệu hóa đơn!'); return; }
            this.showBillModal = true;
        },

        // ================= ĐỔI / GỘP / TÁCH BÀN =================
        openMoveTableModal() {
            if (!this.selectedTable) { alert('Vui lòng chọn bàn cần chuyển!'); return; }
            const emptyTables = this.tables.filter(t => t.id !== this.selectedTable.id && t.status === 'empty');
            this.targetTableId = emptyTables.length > 0 ? emptyTables[0].id : '';
            this.showMoveModal = true;
        },
        confirmMoveTable() {
            if (!this.targetTableId || !this.selectedTable) { alert('Vui lòng chọn bàn đích!'); return; }
            const targetTbl = this.tables.find(t => t.id === this.targetTableId);
            if (!targetTbl) return;

            const currentItems = [...this.currentOrder.items];
            db.ref('tableOrders/' + targetTbl.id).set(currentItems);
            db.ref('tables/' + targetTbl.id).update({ status: 'serving' });
            targetTbl.status = 'serving';

            db.ref('tableOrders/' + this.selectedTable.id).remove();
            db.ref('tables/' + this.selectedTable.id).update({ status: 'empty' });
            this.selectedTable.status = 'empty';

            this.tableOrders[targetTbl.id] = currentItems;
            delete this.tableOrders[this.selectedTable.id];

            alert(`Đã chuyển toàn bộ món sang ${targetTbl.name}!`);
            this.showMoveModal = false;
            this.selectTable(targetTbl);
        },

        openMergeBillModal() {
            if (!this.selectedTable) { alert('Vui lòng chọn bàn chính!'); return; }
            const servingTables = this.tables.filter(t => t.id !== this.selectedTable.id && t.status === 'serving');
            if (servingTables.length === 0) { alert('Không có bàn nào khác đang phục vụ để gộp!'); return; }
            this.sourceTableIdForMerge = servingTables[0].id;
            this.showMergeModal = true;
        },
        confirmMergeBill() {
            if (!this.sourceTableIdForMerge || !this.selectedTable) return;
            const sourceTbl = this.tables.find(t => t.id === this.sourceTableIdForMerge);
            const sourceItems = this.tableOrders[this.sourceTableIdForMerge] || [];

            sourceItems.forEach(sItem => {
                let existing = this.currentOrder.items.find(i => i.name === sItem.name && !i.isGift);
                if (existing) existing.qty = Number(existing.qty) + Number(sItem.qty);
                else this.currentOrder.items.push({ ...sItem });
            });

            db.ref('tableOrders/' + this.selectedTable.id).set(this.currentOrder.items);
            db.ref('tables/' + this.selectedTable.id).update({ status: 'serving' });
            this.selectedTable.status = 'serving';

            db.ref('tableOrders/' + this.sourceTableIdForMerge).remove();
            db.ref('tables/' + this.sourceTableIdForMerge).update({ status: 'empty' });
            delete this.tableOrders[this.sourceTableIdForMerge];
            if (sourceTbl) sourceTbl.status = 'empty';

            alert(`Đã gộp món thành công vào ${this.selectedTable.name}!`);
            this.showMergeModal = false;
        },

        openSplitBillModal() {
            if (!this.selectedTable || this.currentOrder.items.length === 0) { alert('Chưa có món để tách!'); return; }
            this.splitItemIndices = [];
            const otherTables = this.tables.filter(t => t.id !== this.selectedTable.id);
            this.targetTableIdForSplit = otherTables.length > 0 ? otherTables[0].id : '';
            this.showSplitModal = true;
        },
        confirmSplitBill() {
            if (!this.targetTableIdForSplit || this.splitItemIndices.length === 0) {
                alert('Vui lòng chọn bàn và tích chọn món cần tách!');
                return;
            }
            const targetTbl = this.tables.find(t => t.id === this.targetTableIdForSplit);
            if (!targetTbl) return;

            const selectedIndices = this.splitItemIndices.map(Number);
            const itemsToMove = [];
            const remainingItems = [];

            this.currentOrder.items.forEach((item, idx) => {
                if (selectedIndices.includes(idx)) itemsToMove.push({ ...item });
                else remainingItems.push({ ...item });
            });

            let targetOrders = this.tableOrders[targetTbl.id] || [];
            itemsToMove.forEach(mItem => {
                let existing = targetOrders.find(i => i.name === mItem.name && !i.isGift);
                if (existing) existing.qty = Number(existing.qty) + Number(mItem.qty);
                else targetOrders.push({ ...mItem });
            });

            db.ref('tableOrders/' + targetTbl.id).set(targetOrders);
            db.ref('tables/' + targetTbl.id).update({ status: 'serving' });
            this.tableOrders[targetTbl.id] = targetOrders;

            this.currentOrder.items = remainingItems;
            this.tableOrders[this.selectedTable.id] = remainingItems;

            if (remainingItems.length === 0) {
                db.ref('tableOrders/' + this.selectedTable.id).remove();
                db.ref('tables/' + this.selectedTable.id).update({ status: 'empty' });
                this.selectedTable.status = 'empty';
            } else {
                db.ref('tableOrders/' + this.selectedTable.id).set(remainingItems);
            }

            alert(`Đã tách món sang ${targetTbl.name}!`);
            this.showSplitModal = false;
        },
        // Hàm in phiếu kết ca trực tiếp từ Modal Kết Ca
        printCurrentShiftReceipt() {
            const stats = this.shiftStats;
            const actualCash = Number(this.closeShiftForm.actualCash) || 0;
            const diff = actualCash - stats.systemExpectedCash;

            this.selectedShiftToPrint = {
                shiftName: this.currentShift.shiftName,
                cashier: this.currentShift.cashier,
                startTime: this.currentShift.startTime,
                endTime: new Date().toISOString(),
                initialCash: this.currentShift.initialCash || 0,
                cashRevenue: stats.cashIncome,
                bankRevenue: stats.bankIncome,
                cashExpenses: stats.expensesCash,
                expectedCash: stats.systemExpectedCash,
                actualCash: actualCash,
                difference: diff,
                ordersCount: stats.ordersCount,
                closeNote: this.closeShiftForm.note || ''
            };

            this.showPrintShiftModal = true;
        },

        // Hàm xem và in lại phiếu từ danh sách lịch sử ca
        reprintShiftReceipt(sh) {
            this.selectedShiftToPrint = { ...sh };
            this.showPrintShiftModal = true;
        },

        executePrint() {
            window.print();
        },
        // ================= QUẢN LÝ BÀN, KHU VỰC, DANH MỤC, MÓN =================
        openTableModal() { this.isEditingTable = false; this.tableForm = { id: null, name: '', area: this.areas[0] || 'Tầng trệt', status: 'empty' }; this.showTableModal = true; },
        openEditTableModal(t) { this.isEditingTable = true; this.tableForm = { ...t }; this.showTableModal = true; },
        saveTable() {
            if (!this.tableForm.name.trim()) { alert('Vui lòng nhập tên bàn!'); return; }
            if (this.isEditingTable) {
                db.ref('tables/' + this.tableForm.id).update({ name: this.tableForm.name, area: this.tableForm.area });
            } else {
                db.ref('tables').push({ name: this.tableForm.name, area: this.tableForm.area, status: 'empty' });
            }
            this.showTableModal = false;
        },
        deleteTable(id) { if (confirm('Bạn có chắc muốn xóa bàn này?')) db.ref('tables/' + id).remove(); },

        openAreaModal() { this.newAreaName = ''; this.showAreaModal = true; },
        saveArea() {
            let name = this.newAreaName.trim();
            if (!name) { alert('Vui lòng nhập tên khu vực!'); return; }
            if (this.areas.includes(name)) { alert('Khu vực đã tồn tại!'); return; }
            this.areas.push(name);
            db.ref('areas').set(this.areas);
            this.showAreaModal = false;
        },
        deleteArea(name) {
            if (confirm(`Xóa khu vực "${name}"?`)) {
                this.areas = this.areas.filter(a => a !== name);
                db.ref('areas').set(this.areas);
            }
        },

        openCategoryModal() { this.isEditingCategory = false; this.categoryInputName = ''; this.showCategoryModal = true; },
        openEditCategoryModal(cat) { if (cat === 'Tất cả') return; this.isEditingCategory = true; this.categoryOldName = cat; this.categoryInputName = cat; this.showCategoryModal = true; },
        saveCategory() {
            let name = this.categoryInputName.trim();
            if (!name || name === 'Tất cả') return;
            let list = this.categories.filter(c => c !== 'Tất cả');

            if (this.isEditingCategory) {
                let idx = list.indexOf(this.categoryOldName);
                if (idx !== -1) list[idx] = name;
                this.menuItems.forEach(item => {
                    if (item.category === this.categoryOldName) db.ref('menu/' + item.id).update({ category: name });
                });
            } else {
                if (!list.includes(name)) list.push(name);
            }

            db.ref('categories').set(list);
            this.categories = ['Tất cả', ...list];
            this.showCategoryModal = false;
        },
        deleteCategory(cat) {
            if (cat === 'Tất cả') return;
            if (confirm(`Xóa danh mục "${cat}"?`)) {
                let list = this.categories.filter(c => c !== 'Tất cả' && c !== cat);
                db.ref('categories').set(list);
                this.categories = ['Tất cả', ...list];
            }
        },

        openMenuModal() { this.isEditingMenu = false; this.menuForm = { id: null, name: '', image: '', category: 'Café', price: 25000, recipeList: [] }; this.showMenuModal = true; },
        openEditMenuModal(m) { 
            this.isEditingMenu = true; 
            this.menuForm = { id: m.id, name: m.name, image: m.image || '', category: m.category, price: m.price, recipeList: m.recipeList ? [...m.recipeList] : [] }; 
            this.showMenuModal = true; 
        },
        addRecipeRow() { this.menuForm.recipeList.push({ invId: '', amount: 1 }); },
        removeRecipeRow(index) { this.menuForm.recipeList.splice(index, 1); },
        saveMenu() {
            if (!this.menuForm.name.trim()) { alert('Vui lòng nhập tên món!'); return; }
            let payload = {
                name: this.menuForm.name.trim(),
                image: (this.menuForm.image || '').trim(),
                category: this.menuForm.category,
                price: Number(this.menuForm.price) || 0,
                recipeList: this.menuForm.recipeList || []
            };
            if (this.isEditingMenu) db.ref('menu/' + this.menuForm.id).update(payload);
            else db.ref('menu').push(payload);
            this.showMenuModal = false;
        },
        deleteMenuItem(id) { if (confirm('Xóa món này?')) db.ref('menu/' + id).remove(); },

        // ================= EXCEL THỰC ĐƠN =================
        downloadMenuTemplate() {
            const data = [
                { "Tên món (*)": "Cà phê sữa đá", "Danh mục (*)": "Café", "Giá bán (*)": 25000, "Link hình ảnh": "" },
                { "Tên món (*)": "Trà đào cam sả", "Danh mục (*)": "Trà", "Giá bán (*)": 30000, "Link hình ảnh": "" }
            ];
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "ThucDon");
            XLSX.writeFile(wb, "Mau_Nhap_Thuc_Don.xlsx");
        },
        exportMenuToExcel() {
            if (this.menuItems.length === 0) return;
            const data = this.menuItems.map(i => ({ "Tên món": i.name, "Danh mục": i.category, "Giá bán": i.price, "Link hình ảnh": i.image || '' }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "ThucDon");
            XLSX.writeFile(wb, `ThucDon_${new Date().toISOString().slice(0, 10)}.xlsx`);
        },
        importMenuFromExcel(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const wb = XLSX.read(data, { type: 'array' });
                    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                    rows.forEach(r => {
                        const name = r["Tên món (*)"] || r["Tên món"];
                        const price = Number(r["Giá bán (*)"] || r["Giá bán"] || 0);
                        const category = r["Danh mục (*)"] || r["Danh mục"] || "Café";
                        const image = r["Link hình ảnh"] || "";
                        if (name) db.ref('menu').push({ name: String(name).trim(), price, category: String(category).trim(), image: String(image).trim(), recipeList: [] });
                    });
                    alert(`Nhập thành công ${rows.length} món!`);
                } catch (err) { alert('Lỗi đọc file Excel!'); }
                event.target.value = '';
            };
            reader.readAsArrayBuffer(file);
        },
        // Tạo URL gọi món cho bàn
getTableQrUrl(tableId) {
    // Tự động nhận diện URL hiện tại và trỏ chính xác về file khachorder.html cùng thư mục
    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    const basePath = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
    return `${basePath}/khachorder.html?tableId=${encodeURIComponent(tableId)}`;
},

// Mở modal xem QR của 1 bàn
openTableQrModal(table) {
    this.selectedTableForQr = table;
    this.showQrModal = true;
},

// In trang mã QR
printQrCode() {
    window.print();
},
        // ================= XỬ LÝ LỊCH SỬ HÓA ĐƠN (XEM, SỬA, XÓA, IN) =================
        viewBillDetail(b) {
            this.selectedBillToView = b;
            this.showBillDetailModal = true;
        },

        printReprintBill() {
            window.print();
        },

        // Hàm xóa hóa đơn (Sửa lỗi ReferenceError)
        deleteOrderHistory(orderId) {
            if (!this.hasPermission(['Quản lý'])) {
                alert('Chỉ tài khoản Quản lý mới có quyền xóa hóa đơn!');
                return;
            }
            if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này khỏi hệ thống?')) {
                db.ref('orders/' + orderId).remove();
                alert('Đã xóa hóa đơn thành công!');
                this.showBillDetailModal = false;
            }
        },

        // Hàm mở modal sửa hóa đơn
        openEditBillModal(b) {
            if (!this.hasPermission(['Quản lý'])) {
                alert('Chỉ tài khoản Quản lý mới có quyền sửa hóa đơn!');
                return;
            }
            this.editingBillForm = {
                id: b.id,
                table: b.table || '',
                paymentMethod: b.paymentMethod || 'Tiền mặt',
                total: b.total || 0,
                note: b.note || '',
                discount: b.discount || 0,
                subTotal: b.subTotal || b.total || 0
            };
            this.showEditBillModal = true;
        },
        

        // Hàm lưu hóa đơn sau khi sửa
        saveEditedBill() {
            if (!this.editingBillForm.id) return;
            
            db.ref('orders/' + this.editingBillForm.id).update({
                table: this.editingBillForm.table,
                paymentMethod: this.editingBillForm.paymentMethod,
                total: Number(this.editingBillForm.total) || 0,
                note: this.editingBillForm.note || ''
            });

            alert('Đã cập nhật hóa đơn thành công!');
            this.showEditBillModal = false;
            
            if (this.selectedBillToView && this.selectedBillToView.id === this.editingBillForm.id) {
                this.selectedBillToView.table = this.editingBillForm.table;
                this.selectedBillToView.paymentMethod = this.editingBillForm.paymentMethod;
                this.selectedBillToView.total = Number(this.editingBillForm.total) || 0;
                this.selectedBillToView.note = this.editingBillForm.note || '';
            }
        },
        // ================= KHO, ĐƠN VỊ TÍNH, NHÀ CUNG CẤP =================
        openUnitModal() { this.newUnitName = ''; this.showUnitModal = true; },
        saveUnit() {
            let u = this.newUnitName.trim();
            if (u && !this.unitsList.includes(u)) {
                this.unitsList.push(u);
                db.ref('units').set(this.unitsList);
                this.showUnitModal = false;
            }
        },
        deleteUnit(u) { if (confirm(`Xóa ĐVT "${u}"?`)) { this.unitsList = this.unitsList.filter(x => x !== u); db.ref('units').set(this.unitsList); } },

        openInventoryModal(type = 'nvl') { this.invForm = { id: null, name: '', stock: 100, unit: this.unitsList[0] || 'g', type }; this.showInventoryModal = true; },
        saveInventory() {
            if (!this.invForm.name.trim()) return;
            let targetRef = this.invForm.type === 'sp' ? 'inventorySP' : 'inventoryNVL';
            db.ref(targetRef).push({ name: this.invForm.name.trim(), stock: Number(this.invForm.stock) || 0, unit: this.invForm.unit });
            this.showInventoryModal = false;
        },
        deleteInventory(id, type = 'nvl') {
            if (confirm('Xóa mặt hàng này?')) db.ref((type === 'sp' ? 'inventorySP' : 'inventoryNVL') + '/' + id).remove();
        },

        addToImportList(item) {
            let exist = this.importOrder.items.find(i => i.id === item.id);
            if (exist) exist.qty++;
            else this.importOrder.items.push({ id: item.id, name: item.name, qty: 1, unit: item.unit || 'g' });
        },
        removeFromImportList(index) { this.importOrder.items.splice(index, 1); },
        confirmImportGoods() {
            if (this.importOrder.items.length === 0) return;
            let targetRef = this.importTab === 'sp' ? 'inventorySP' : 'inventoryNVL';
            let list = this.importTab === 'sp' ? this.inventorySP : this.inventoryNVL;

            this.importOrder.items.forEach(imp => {
                let target = list.find(i => i.id === imp.id);
                if (target) db.ref(targetRef + '/' + target.id).update({ stock: Number(target.stock) + Number(imp.qty) });
            });

            db.ref('inventoryHistory').push({
                type: 'NHAP',
                targetWarehouse: this.importTab === 'sp' ? 'Kho Sản Phẩm' : 'Kho NVL',
                supplier: this.importOrder.supplier || 'NCC Vãng lai',
                note: this.importOrder.note || '',
                items: this.importOrder.items,
                timestamp: new Date().toISOString()
            });

            alert('Nhập kho thành công!');
            this.importOrder = { supplier: '', note: '', items: [] };
        },
        // HÀM TIẾP NHẬN ĐƠN KHÁCH VÀ CHUYỂN SANG ĐANG PHỤC VỤ
acceptCustomerOrder(order) {
    const targetTableId = order.tableId;

    // 1. Cập nhật trạng thái bàn sang "Đang phục vụ"
    db.ref('tables/' + targetTableId).update({ status: 'serving' });

    // 2. Gộp món vào Order của bàn
    let currentTableItems = this.tableOrders[targetTableId] || [];
    order.items.forEach(newItem => {
        let exist = currentTableItems.find(i => i.name === newItem.name && !i.isGift);
        if (exist) {
            exist.qty = Number(exist.qty) + Number(newItem.qty);
        } else {
            currentTableItems.push({ ...newItem });
        }
    });

    db.ref('tableOrders/' + targetTableId).set(currentTableItems);

    // 3. Đổi trạng thái đơn của khách sang "serving" để màn hình khách hiện "Đang được phục vụ"
    db.ref('pendingOrders/' + targetTableId).update({ status: 'serving' });

    // Tự động xóa thông báo sau 15 giây
    setTimeout(() => {
        db.ref('pendingOrders/' + targetTableId).remove();
    }, 15000);

    alert(`Đã tiếp nhận đơn của ${order.tableName}! Món đã được lưu vào bàn.`);
    this.showCustomerOrderModal = false;
},

// TỪ CHỐI ĐƠN
rejectCustomerOrder(order) {
    if (confirm(`Hủy yêu cầu gọi món của ${order.tableName}?`)) {
        db.ref('pendingOrders/' + order.tableId).remove();
    }
},
        openSupplierModal() { this.isEditingSupplier = false; this.supplierForm = { id: null, name: '', phone: '', address: '', note: '' }; this.showSupplierModal = true; },
        openEditSupplierModal(s) { this.isEditingSupplier = true; this.supplierForm = { ...s }; this.showSupplierModal = true; },
        saveSupplier() {
            if (!this.supplierForm.name.trim()) return;
            let payload = { name: this.supplierForm.name.trim(), phone: this.supplierForm.phone || '', address: this.supplierForm.address || '', note: this.supplierForm.note || '' };
            if (this.isEditingSupplier) db.ref('suppliers/' + this.supplierForm.id).update(payload);
            else db.ref('suppliers').push(payload);
            this.showSupplierModal = false;
        },
        deleteSupplier(id) { if (confirm('Xóa NCC này?')) db.ref('suppliers/' + id).remove(); },

        get xntReport() {
            let allItems = [
                ...this.inventoryNVL.map(i => ({ ...i, typeName: 'Nguyên vật liệu' })),
                ...this.inventorySP.map(i => ({ ...i, typeName: 'Hàng bán sẵn' }))
            ];
            return allItems.map(item => {
                let totalImport = 0, totalExport = 0;
                this.inventoryHistory.forEach(h => {
                    (h.items || []).forEach(it => {
                        if (it.id === item.id || (it.name && it.name.toLowerCase() === item.name.toLowerCase())) {
                            if (h.type === 'NHAP') totalImport += Number(it.qty || 0);
                            if (h.type === 'XUAT') totalExport += Number(it.qty || 0);
                        }
                    });
                });
                return {
                    id: item.id, name: item.name, unit: item.unit, typeName: item.typeName,
                    initialStock: Math.max(0, Number(item.stock) + totalExport - totalImport),
                    importStock: totalImport, exportStock: totalExport, currentStock: Number(item.stock)
                };
            });
        },

        // ================= LỊCH SỬ HÓA ĐƠN =================
        // Getter lọc lịch sử hóa đơn (Có phân quyền Thu ngân theo ngày)
get filteredOrdersList() {
    let list = [...this.ordersList].reverse(); // Đưa đơn mới nhất lên đầu

    // 1. Phân quyền: Nếu là 'Thu ngân', chỉ lọc đơn của chính mình bán trong ngày hôm nay
    if (this.currentUser && this.currentUser.role === 'Thu ngân') {
        const todayStr = new Date().toLocaleDateString('en-CA'); // Lấy ngày YYYY-MM-DD theo giờ hiện tại
        list = list.filter(o => {
            const orderDate = o.timestamp ? new Date(o.timestamp).toLocaleDateString('en-CA') : '';
            const isToday = orderDate === todayStr;
            const isMyOrder = o.cashier === this.currentUser.name || o.cashier === this.currentUser.username;
            return isToday && isMyOrder;
        });
    }

    // 2. Bộ lọc tìm kiếm theo từ khóa (Bàn, mã đơn, món, ghi chú)
    if (this.historyFilterKeyword.trim() !== '') {
        const kw = this.historyFilterKeyword.toLowerCase().trim();
        list = list.filter(o => {
            const matchTable = (o.table || '').toLowerCase().includes(kw);
            const matchId = (o.id || '').toLowerCase().includes(kw);
            const matchNote = (o.note || '').toLowerCase().includes(kw);
            const matchCashier = (o.cashier || '').toLowerCase().includes(kw);
            const matchItems = (o.items || []).some(item => (item.name || '').toLowerCase().includes(kw));
            return matchTable || matchId || matchNote || matchCashier || matchItems;
        });
    }

    // 3. Bộ lọc theo ngày chọn (áp dụng cho Quản lý)
    if (this.historyFilterDate) {
        list = list.filter(o => {
            const orderDate = o.timestamp ? new Date(o.timestamp).toLocaleDateString('en-CA') : '';
            return orderDate === this.historyFilterDate;
        });
    }

    // 4. Bộ lọc phương thức thanh toán
    if (this.historyFilterPayment !== 'Tất cả') {
        list = list.filter(o => o.paymentMethod === this.historyFilterPayment);
    }

    return list;
},

        // ================= SỔ QUỸ THU CHI =================
        get totalAutoPosIncome() {
    return this.filteredCashFlowList
        .filter(c => c.type === 'THU' && c.isPosOrder)
        .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
},

get totalManualIncome() {
    return this.filteredCashFlowList
        .filter(c => c.type === 'THU' && !c.isPosOrder)
        .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
},

get totalExpenses() {
    return this.filteredCashFlowList
        .filter(c => c.type === 'CHI')
        .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
},

get netCashBalance() {
    return (this.totalAutoPosIncome + this.totalManualIncome) - this.totalExpenses;
},

        get filteredCashFlowList() {
    // 1. Chuyển đổi danh sách đơn hàng POS thành định dạng Phiếu Thu
    const posIncomeRows = (this.ordersList || []).map(order => ({
        id: 'POS_' + order.id,
        type: 'THU',
        category: 'Thu tiền bán hàng POS',
        amount: Number(order.total) || 0,
        recipient: order.table ? `Bàn: ${order.table}` : 'Khách lẻ POS',
        paymentMethod: order.paymentMethod || 'Tiền mặt',
        note: order.note ? `Hóa đơn POS (${order.note})` : 'Hóa đơn bán hàng POS tự động',
        timestamp: order.timestamp || new Date().toISOString(),
        cashier: order.cashier || 'Thu ngân',
        created_by: order.cashier || 'Thu ngân',
        isPosOrder: true
    }));

    // 2. Gộp phiếu thu/chi thủ công và đơn POS, sắp xếp theo thời gian mới nhất
    let list = [...(this.cashFlowList || []), ...posIncomeRows].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    // 3. Phân quyền: Nếu là 'Thu ngân', chỉ lấy giao dịch của chính mình trong ngày hôm nay
    if (this.currentUser && this.currentUser.role === 'Thu ngân') {
        const todayStr = new Date().toLocaleDateString('en-CA'); // Lấy ngày YYYY-MM-DD theo giờ hiện tại
        list = list.filter(c => {
            const flowDate = c.timestamp ? new Date(c.timestamp).toLocaleDateString('en-CA') : '';
            const isToday = flowDate === todayStr;
            const isMyFlow = (c.created_by === this.currentUser.name || c.created_by === this.currentUser.username ||
                              c.cashier === this.currentUser.name || c.cashier === this.currentUser.username);
            return isToday && isMyFlow;
        });
    }

    // 4. Áp dụng các bộ lọc thủ công (Loại phiếu, Nhóm chi phí, Ngày chọn)
    if (this.cashFlowFilterType && this.cashFlowFilterType !== 'Tất cả') {
        list = list.filter(c => c.type === this.cashFlowFilterType);
    }
    if (this.cashFlowFilterCategory && this.cashFlowFilterCategory !== 'Tất cả') {
        list = list.filter(c => c.category === this.cashFlowFilterCategory);
    }
    if (this.cashFlowFilterDate) {
        list = list.filter(c => {
            const flowDate = c.timestamp ? new Date(c.timestamp).toLocaleDateString('en-CA') : '';
            return flowDate === this.cashFlowFilterDate;
        });
    }

    return list;
},

        openCashFlowModal(type = 'CHI') {
            this.isEditingCashFlow = false;
            this.cashFlowForm = { id: null, type, category: type === 'CHI' ? this.expenseCategories[0] : this.incomeCategories[1], amount: 0, recipient: '', note: '', paymentMethod: 'Tiền mặt' };
            this.showCashFlowModal = true;
        },
        openEditCashFlowModal(c) { this.isEditingCashFlow = true; this.cashFlowForm = { ...c }; this.showCashFlowModal = true; },
        saveCashFlow() {
    if (!this.cashFlowForm.amount || Number(this.cashFlowForm.amount) <= 0) {
        alert('Vui lòng nhập số tiền hợp lệ (> 0)!');
        return;
    }
    if (!this.cashFlowForm.category) {
        alert('Vui lòng chọn loại chi phí / thu nhập!');
        return;
    }

    let payload = {
        type: this.cashFlowForm.type,
        category: this.cashFlowForm.category,
        amount: Number(this.cashFlowForm.amount),
        recipient: this.cashFlowForm.recipient.trim() || '---',
        note: this.cashFlowForm.note.trim() || '',
        paymentMethod: this.cashFlowForm.paymentMethod || 'Tiền mặt',
        created_by: this.currentUser ? this.currentUser.name : 'Thu ngân',
        timestamp: this.isEditingCashFlow ? this.cashFlowForm.timestamp : new Date().toISOString()
    };

    if (this.isEditingCashFlow) {
        db.ref('cashFlow/' + this.cashFlowForm.id).update(payload);
    } else {
        db.ref('cashFlow').push(payload);
    }

    alert(`Đã lưu phiếu ${payload.type === 'CHI' ? 'chi' : 'thu'} thành công!`);
    this.showCashFlowModal = false;
},
        deleteCashFlow(id) { if (confirm('Xóa phiếu này?')) db.ref('cashFlow/' + id).remove(); }
    };
}
