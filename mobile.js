// ================= CẤU HÌNH FIREBASE =================
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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

function cafeApp() {
    const getTodayStr = () => new Date().toLocaleDateString('en-CA');

    return {
        // ================= NAVIGATION & TAB =================
        currentTab: 'tables',
        posSubView: 'order_details',
        showMoreMenu: false,
        searchQuery: '',
        selectedAreaFilter: 'Tất cả',
        activeCategory: 'Tất cả',
        categories: ['Tất cả', 'Café', 'Trà', 'Nước ngọt', 'Đồ ăn'],
        tabs: [
            { id: 'pos', name: 'Order POS', icon: 'fa-solid fa-cash-register' },
            { id: 'tables', name: 'Sơ đồ bàn', icon: 'fa-solid fa-chair' },
            { id: 'history_orders', name: 'Lịch sử HĐ', icon: 'fa-solid fa-clock-rotate-left' },
            { id: 'cashflow', name: 'Sổ quỹ', icon: 'fa-solid fa-wallet' },
            { id: 'reports', name: 'Báo cáo', icon: 'fa-solid fa-chart-pie' }
        ],
        areas: ['Tầng trệt', 'Sân thượng', 'Phòng máy lạnh'],
        tables: [],
        menuItems: [],

        // ================= TÀI KHOẢN & PHÂN QUYỀN =================
        currentUser: JSON.parse(localStorage.getItem('cukcuk_mobile_user') || 'null'),
        loginForm: { username: '', pin: '' },
        staffList: [],
        showStaffModal: false,
        isEditingStaff: false,
        staffForm: { id: null, name: '', role: 'Thu ngân', phone: '', username: '', pin: '1234' },

        currentShift: JSON.parse(localStorage.getItem('cukcuk_mobile_shift') || 'null'),
        showOpenShiftModal: false,
        showCloseShiftModal: false,
        openShiftForm: { initialCash: 500000, shiftName: 'Ca Sáng (06:00 - 14:00)', note: '' },
        closeShiftForm: { actualCash: 0, note: '' },

        // ================= BÁO CÁO NÂNG CAO =================
        reportsSubTab: 'overview',
        reportStartDate: getTodayStr(),
        reportEndDate: getTodayStr(),

        setReportDateFilter(type) {
            const today = new Date();
            if (type === 'today') {
                const d = today.toLocaleDateString('en-CA');
                this.reportStartDate = d;
                this.reportEndDate = d;
            } else if (type === 'yesterday') {
                const y = new Date(today);
                y.setDate(today.getDate() - 1);
                const yd = y.toLocaleDateString('en-CA');
                this.reportStartDate = yd;
                this.reportEndDate = yd;
            } else if (type === 'this_month') {
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString('en-CA');
                this.reportStartDate = firstDay;
                this.reportEndDate = today.toLocaleDateString('en-CA');
            } else if (type === 'all') {
                this.reportStartDate = '';
                this.reportEndDate = '';
            }
        },

        get reportFilteredOrders() {
            let list = [...this.ordersList];
            if (this.reportStartDate) {
                const startTs = new Date(this.reportStartDate + 'T00:00:00').getTime();
                list = list.filter(o => o.timestamp && new Date(o.timestamp).getTime() >= startTs);
            }
            if (this.reportEndDate) {
                const endTs = new Date(this.reportEndDate + 'T23:59:59').getTime();
                list = list.filter(o => o.timestamp && new Date(o.timestamp).getTime() <= endTs);
            }
            return list;
        },

        get reportByItems() {
            const itemMap = {};
            this.reportFilteredOrders.forEach(order => {
                (order.items || []).forEach(it => {
                    if (!itemMap[it.name]) {
                        itemMap[it.name] = { name: it.name, qty: 0, revenue: 0 };
                    }
                    itemMap[it.name].qty += Number(it.qty || 0);
                    itemMap[it.name].revenue += (Number(it.price || 0) * Number(it.qty || 0));
                });
            });
            return Object.values(itemMap).sort((a, b) => b.qty - a.qty);
        },

        get reportByStaff() {
            const staffMap = {};
            this.reportFilteredOrders.forEach(order => {
                const cashier = order.cashier || 'Thu ngân';
                if (!staffMap[cashier]) {
                    staffMap[cashier] = { name: cashier, orderCount: 0, totalRevenue: 0 };
                }
                staffMap[cashier].orderCount++;
                staffMap[cashier].totalRevenue += Number(order.total || 0);
            });
            return Object.values(staffMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
        },

        get reportByTables() {
            const tableMap = {};
            this.reportFilteredOrders.forEach(order => {
                const tblKey = order.table || 'Khách mang về';
                if (!tableMap[tblKey]) {
                    tableMap[tblKey] = { name: tblKey, area: order.area || 'Chung', orderCount: 0, revenue: 0 };
                }
                tableMap[tblKey].orderCount++;
                tableMap[tblKey].revenue += Number(order.total || 0);
            });
            return Object.values(tableMap).sort((a, b) => b.revenue - a.revenue);
        },

        get reportByPaymentMethods() {
            const payMap = {
                'Tiền mặt': { name: 'Tiền mặt', count: 0, amount: 0, icon: 'fa-solid fa-money-bill-wave', color: 'text-emerald-600' },
                'Chuyển khoản': { name: 'Chuyển khoản', count: 0, amount: 0, icon: 'fa-solid fa-qrcode', color: 'text-[#0072bc]' }
            };
            this.reportFilteredOrders.forEach(o => {
                const method = o.paymentMethod === 'Chuyển khoản' ? 'Chuyển khoản' : 'Tiền mặt';
                payMap[method].count++;
                payMap[method].amount += Number(o.total || 0);
            });
            return Object.values(payMap);
        },

        get reportByHourly() {
            const hours = Array.from({ length: 24 }, (_, i) => ({
                hour: `${String(i).padStart(2, '0')}:00 - ${String(i).padStart(2, '0')}:59`,
                orderCount: 0,
                revenue: 0
            }));
            this.reportFilteredOrders.forEach(o => {
                if (o.timestamp) {
                    const h = new Date(o.timestamp).getHours();
                    if (hours[h]) {
                        hours[h].orderCount++;
                        hours[h].revenue += Number(o.total || 0);
                    }
                }
            });
            return hours.filter(h => h.orderCount > 0);
        },

        // ================= BỘ LỌC NGÀY HÓA ĐƠN =================
        historyStartDate: getTodayStr(),
        historyEndDate: getTodayStr(),

        setHistoryDateFilter(type) {
            const today = new Date();
            if (type === 'today') {
                const d = today.toLocaleDateString('en-CA');
                this.historyStartDate = d;
                this.historyEndDate = d;
            } else if (type === 'yesterday') {
                const y = new Date(today);
                y.setDate(today.getDate() - 1);
                const yd = y.toLocaleDateString('en-CA');
                this.historyStartDate = yd;
                this.historyEndDate = yd;
            } else if (type === 'all') {
                this.historyStartDate = '';
                this.historyEndDate = '';
            }
        },

        // ================= BỘ LỌC NGÀY SỔ QUỸ =================
        cashFlowStartDate: getTodayStr(),
        cashFlowEndDate: getTodayStr(),

        setCashFlowDateFilter(type) {
            const today = new Date();
            if (type === 'today') {
                const d = today.toLocaleDateString('en-CA');
                this.cashFlowStartDate = d;
                this.cashFlowEndDate = d;
            } else if (type === 'yesterday') {
                const y = new Date(today);
                y.setDate(today.getDate() - 1);
                const yd = y.toLocaleDateString('en-CA');
                this.cashFlowStartDate = yd;
                this.cashFlowEndDate = yd;
            } else if (type === 'all') {
                this.cashFlowStartDate = '';
                this.cashFlowEndDate = '';
            }
        },

        // ================= MODAL ĐỔI BÀN =================
        showMoveModal: false,
        targetTableId: '',

        // ================= ĐƠN KHÁCH GỌI =================
        pendingCustomerOrders: [],
        showCustomerOrderModal: false,

        // ================= BÁN HÀNG & ORDER POS =================
        ordersList: [],
        promotionsList: [],
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
        selectedBillToView: null,
        showBillDetailModal: false,

        // ================= SỔ QUỸ THU CHI =================
        cashFlowList: [],
        showCashFlowModal: false,
        isEditingCashFlow: false,
        cashFlowForm: { 
            id: null, 
            type: 'CHI', 
            category: 'Tiền điện/nước/mạng', 
            amount: 0, 
            recipient: '', 
            note: '', 
            paymentMethod: 'Tiền mặt' 
        },
        expenseCategories: [
            'Tiền điện/nước/mạng', 'Mặt bằng', 'Mua nguyên vật liệu ngoài',
            'Lương/Thưởng nhân viên', 'Sửa chữa/Bảo trì thiết bị',
            'Văn phòng phẩm/Vật dụng quán', 'Chi phí marketing/Quảng cáo', 'Chi phí khác'
        ],
        incomeCategories: [
            'Thu tiền bán hàng POS', 'Thu hoàn tiền / Chiết khấu NCC',
            'Thu thanh lý đồ dùng/phế liệu', 'Chủ quán nộp tiền vào quỹ', 'Thu nhập khác'
        ],

        // ================= CÀI ĐẶT THÔNG TIN QUÁN =================
        storeSettings: {
            storeName: 'HomesCoffee',
            address: '123 Đường Số 1, Quận 1, TP.HCM',
            phone: '0972.023.222',
            paperSize: '80mm',
            showQrPayment: true,
            bankCode: 'MB',
            bankAccount: '0972023222',
            bankAccountName: 'HOMES COFFEE',
            telegramBotToken: '',
            telegramChatId: '',
            enableTelegramNotify: true
        },

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
                if (d && Array.isArray(d)) this.categories = ['Tất cả', ...d.filter(c => c !== 'Tất cả')];
            });

            db.ref('promotions').on('value', snap => {
                const d = snap.val();
                this.promotionsList = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : [];
            });

            db.ref('settings/store').on('value', snap => {
                const d = snap.val();
                if (d) this.storeSettings = { ...this.storeSettings, ...d };
            });

            db.ref('pendingOrders').on('value', snap => {
                const d = snap.val();
                if (d) {
                    this.pendingCustomerOrders = Object.keys(d).map(k => ({ key: k, ...d[k] })).filter(o => o.status === 'pending');
                    if (this.pendingCustomerOrders.length > 0) {
                        try {
                            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
                        } catch(e){}
                    }
                } else {
                    this.pendingCustomerOrders = [];
                }
            });

            db.ref('tableOrders').on('value', snap => {
                this.tableOrders = snap.val() || {};
                if (this.selectedTable) {
                    this.currentOrder.items = this.tableOrders[this.selectedTable.id] || [];
                }
            });

            db.ref('orders').on('value', snap => {
                const d = snap.val();
                this.ordersList = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : [];
            });

            db.ref('cashFlow').on('value', snap => {
                const d = snap.val();
                this.cashFlowList = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })).reverse() : [];
            });

            db.ref('staff').on('value', snap => {
                const d = snap.val();
                this.staffList = d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : [];
            });
        },

        // ================= LOGIC PHÂN QUYỀN TÀI KHOẢN =================
        hasPermission(allowedRoles = []) {
            if (!this.currentUser) return false;
            if (this.currentUser.role === 'Quản lý' || this.currentUser.username === 'admin') return true;
            return allowedRoles.includes(this.currentUser.role);
        },

        switchTab(tabId) {
            if (tabId === 'reports' && !this.hasPermission(['Quản lý'])) {
                alert('Chức năng Báo cáo chỉ dành cho Quản lý!');
                return;
            }
            if ((tabId === 'history_orders' || tabId === 'cashflow') && !this.hasPermission(['Quản lý', 'Thu ngân'])) {
                alert('Chức năng này chỉ dành cho Thu ngân và Quản lý!');
                return;
            }
            this.currentTab = tabId;
        },

        openReportSubTab(subTabName) {
            if (!this.hasPermission(['Quản lý'])) {
                alert('Chức năng Báo cáo chỉ dành cho Quản lý!');
                return;
            }
            this.reportsSubTab = subTabName;
            this.currentTab = 'reports';
            this.showMoreMenu = false;
        },

        login() {
            const u = (this.loginForm.username || '').trim().toLowerCase();
            const p = String(this.loginForm.pin || '').trim();

            if (!u || !p) {
                alert('Vui lòng nhập tên tài khoản và mã PIN!');
                return;
            }

            if (u === 'admin' && p === '1234') {
                this.currentUser = { id: 'admin', name: 'Quản Trị Viên', role: 'Quản lý', username: 'admin' };
                localStorage.setItem('cukcuk_mobile_user', JSON.stringify(this.currentUser));
                this.loginForm = { username: '', pin: '' };
                alert('Đăng nhập thành công với quyền Quản lý!');
                return;
            }

            const list = Array.isArray(this.staffList) ? this.staffList : [];
            const staff = list.find(s => String(s.username || '').trim().toLowerCase() === u && String(s.pin || '').trim() === p);

            if (staff) {
                this.currentUser = { id: staff.id, name: staff.name, role: staff.role || 'Thu ngân', username: staff.username };
                localStorage.setItem('cukcuk_mobile_user', JSON.stringify(this.currentUser));
                this.loginForm = { username: '', pin: '' };
                alert(`Xin chào ${staff.name} (${this.currentUser.role})!`);
            } else {
                alert('Tên đăng nhập hoặc mã PIN không đúng!');
            }
        },

        logout() {
            if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) return;
            this.currentUser = null;
            localStorage.removeItem('cukcuk_mobile_user');
            this.loginForm = { username: '', pin: '' };
            this.currentTab = 'tables';
        },

        // ================= QUẢN LÝ NHÂN VIÊN =================
        openStaffModal() {
            if (!this.hasPermission(['Quản lý'])) {
                alert('Chỉ Quản lý mới có quyền quản lý nhân viên!');
                return;
            }
            this.isEditingStaff = false;
            this.staffForm = { id: null, name: '', role: 'Thu ngân', phone: '', username: '', pin: '1234' };
            this.showStaffModal = true;
        },

        openEditStaffModal(st) {
            if (!this.hasPermission(['Quản lý'])) return;
            this.isEditingStaff = true;
            this.staffForm = {
                id: st.id,
                name: st.name || '',
                role: st.role || 'Thu ngân',
                phone: st.phone || '',
                username: st.username || '',
                pin: String(st.pin || '1234')
            };
            this.showStaffModal = true;
        },

        saveStaff() {
            const name = (this.staffForm.name || '').trim();
            const username = (this.staffForm.username || '').trim().toLowerCase();
            const pin = String(this.staffForm.pin || '').trim();

            if (!name || !username || !pin) {
                alert('Vui lòng điền đủ Tên, Tên tài khoản và Mã PIN!');
                return;
            }

            const payload = {
                name: name,
                role: this.staffForm.role || 'Thu ngân',
                phone: (this.staffForm.phone || '').trim(),
                username: username,
                pin: pin
            };

            if (this.isEditingStaff && this.staffForm.id) {
                db.ref('staff/' + this.staffForm.id).update(payload);
            } else {
                db.ref('staff').push(payload);
            }

            alert('Đã lưu thông tin nhân viên thành công!');
            this.showStaffModal = false;
        },

        deleteStaff(id) {
            if (!this.hasPermission(['Quản lý'])) return;
            if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
                db.ref('staff/' + id).remove();
            }
        },

        // ================= CA LÀM VIỆC =================
        openShift() {
            if (!this.currentUser) return;
            this.currentShift = {
                id: 'SHIFT_' + Date.now(),
                shiftName: this.openShiftForm.shiftName,
                cashier: this.currentUser.name,
                startTime: new Date().toISOString(),
                initialCash: Number(this.openShiftForm.initialCash) || 0,
                note: this.openShiftForm.note || ''
            };
            localStorage.setItem('cukcuk_mobile_shift', JSON.stringify(this.currentShift));
            alert('Mở ca làm việc thành công!');
            this.showOpenShiftModal = false;
        },

        confirmCloseShift() {
            this.currentShift = null;
            localStorage.removeItem('cukcuk_mobile_shift');
            alert('Kết ca thành công!');
            this.showCloseShiftModal = false;
        },

        // ================= POS BÁN HÀNG & CHỌN MÓN =================
        get filteredTables() {
            return this.selectedAreaFilter === 'Tất cả' ? this.tables : this.tables.filter(t => t.area === this.selectedAreaFilter);
        },

        get filteredMenu() {
            let items = this.menuItems;
            if (this.activeCategory !== 'Tất cả') items = items.filter(i => i.category === this.activeCategory);
            if (this.searchQuery.trim() !== '') items = items.filter(i => i.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
            return items;
        },

        selectTable(table) {
            this.selectedTable = table;
            this.discountPercent = 0;
            this.discountAmount = 0;
            this.discountType = 'percent';
            this.surcharge = 0;
            this.currentOrder.items = this.tableOrders[table.id] ? JSON.parse(JSON.stringify(this.tableOrders[table.id])) : [];
            this.posSubView = (this.currentOrder.items.length > 0) ? 'order_details' : 'menu';
            this.currentTab = 'pos';
        },

        openMoveTableModal() {
            if (!this.selectedTable) { alert('Vui lòng chọn bàn trước!'); return; }
            const emptyTables = this.tables.filter(t => t.id !== this.selectedTable.id && t.status === 'empty');
            if (emptyTables.length === 0) {
                alert('Hiện không có bàn nào đang trống để chuyển!');
                return;
            }
            this.targetTableId = emptyTables[0].id;
            this.showMoveModal = true;
        },

        confirmMoveTable() {
            if (!this.targetTableId || !this.selectedTable) {
                alert('Vui lòng chọn bàn đích!');
                return;
            }
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

            alert(`Đã chuyển toàn bộ món từ ${this.selectedTable.name} sang ${targetTbl.name}!`);
            this.showMoveModal = false;
            this.selectTable(targetTbl);
        },

        getItemQty(itemName) {
            const found = this.currentOrder.items.find(i => i.name === itemName);
            return found ? Number(found.qty) : 0;
        },

        addToOrder(item) {
            if (!this.selectedTable) { alert('Vui lòng chọn bàn trước!'); return; }
            let existing = this.currentOrder.items.find(i => i.name === item.name);
            if (existing) {
                existing.qty++;
            } else {
                this.currentOrder.items.push({ name: item.name, price: item.price, qty: 1, recipeList: item.recipeList || [] });
            }
            this.tableOrders[this.selectedTable.id] = [...this.currentOrder.items];
            db.ref('tableOrders/' + this.selectedTable.id).set(this.currentOrder.items);
        },

        changeQtyDirect(item, change) {
            if (!this.selectedTable) { alert('Vui lòng chọn bàn trước!'); return; }
            let existing = this.currentOrder.items.find(i => i.name === item.name);
            if (existing) {
                existing.qty += change;
                if (existing.qty <= 0) {
                    this.currentOrder.items = this.currentOrder.items.filter(i => i.name !== item.name);
                }
            } else if (change > 0) {
                this.addToOrder(item);
            }
            this.tableOrders[this.selectedTable.id] = [...this.currentOrder.items];
            db.ref('tableOrders/' + this.selectedTable.id).set(this.currentOrder.items);
        },

        removeItem(index) {
            this.currentOrder.items.splice(index, 1);
            if (this.selectedTable) {
                this.tableOrders[this.selectedTable.id] = [...this.currentOrder.items];
                db.ref('tableOrders/' + this.selectedTable.id).set(this.currentOrder.items);
            }
        },

        subTotal() {
            return this.currentOrder.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
        },

        get matchedPromotion() {
            if (!this.promotionsList || this.promotionsList.length === 0) return null;
            const sub = this.subTotal();
            if (sub <= 0) return null;

            const now = new Date().getTime();
            const eligiblePromos = this.promotionsList.filter(p => {
                const active = (p.isActive === true || p.isActive === 'true');
                const minVal = Number(p.minOrderValue) || 0;
                const startValid = p.startDate ? (now >= new Date(p.startDate).getTime()) : true;
                const endValid = p.endDate ? (now <= new Date(p.endDate).getTime()) : true;
                return active && (sub >= minVal) && startValid && endValid;
            });

            if (eligiblePromos.length === 0) return null;
            return eligiblePromos.sort((a, b) => Number(b.discountPercent) - Number(a.discountPercent))[0];
        },

        get discountCalculated() {
            const sub = this.subTotal();
            if (sub <= 0) return 0;

            if (this.matchedPromotion) {
                const percent = Number(this.matchedPromotion.discountPercent) || 0;
                return (sub * percent) / 100;
            }

            if (this.discountType === 'percent') {
                return (sub * (Number(this.discountPercent) || 0)) / 100;
            } else {
                return Math.min(sub, Number(this.discountAmount) || 0);
            }
        },

        finalTotal() {
            const sub = this.subTotal();
            const total = sub - this.discountCalculated + (Number(this.surcharge) || 0);
            return Math.max(0, total);
        },

        saveTableOrder() {
            if (!this.selectedTable) return;
            if (this.currentOrder.items.length === 0) { alert('Chưa có món nào!'); return; }
            db.ref('tables/' + this.selectedTable.id).update({ status: 'serving' });
            db.ref('tableOrders/' + this.selectedTable.id).set(this.currentOrder.items);
            alert(`Đã lưu order cho ${this.selectedTable.name}!`);
            this.selectedTable = null;
            this.currentOrder.items = [];
            this.currentTab = 'tables';
        },

        cancelOrder() {
            if (!this.selectedTable) return;
            if (!confirm(`Hủy toàn bộ order ${this.selectedTable.name}?`)) return;
            db.ref('tableOrders/' + this.selectedTable.id).remove();
            db.ref('tables/' + this.selectedTable.id).update({ status: 'empty' });
            delete this.tableOrders[this.selectedTable.id];
            this.selectedTable = null;
            this.currentOrder.items = [];
            this.currentTab = 'tables';
        },

        openPaymentModal() {
            if (!this.hasPermission(['Quản lý', 'Thu ngân'])) {
                alert('Chỉ Thu ngân hoặc Quản lý mới có quyền thanh toán!');
                return;
            }
            if (!this.selectedTable || this.currentOrder.items.length === 0) { 
                alert('Chưa có món để thanh toán!'); 
                return; 
            }
            this.discountPercent = 0;
            this.discountAmount = 0;
            this.discountType = 'percent';
            this.surcharge = 0;
            this.paymentMethod = 'Tiền mặt';
            this.orderNote = '';
            this.showPaymentModal = true;
        },

        confirmCheckout() {
            if (!this.selectedTable || this.currentOrder.items.length === 0) return;
            const sub = this.subTotal();
            const finalAmt = this.finalTotal();
            const discVal = this.discountCalculated;

            const orderData = {
                table: this.selectedTable.name,
                area: this.selectedTable.area,
                items: [...this.currentOrder.items],
                subTotal: sub,
                discount: discVal,
                total: finalAmt,
                paymentMethod: this.paymentMethod,
                note: this.orderNote || '',
                cashier: this.currentUser ? this.currentUser.name : 'Thu ngân',
                timestamp: new Date().toISOString()
            };

            db.ref('orders').push(orderData);
            db.ref('tables/' + this.selectedTable.id).update({ status: 'empty' });
            db.ref('tableOrders/' + this.selectedTable.id).remove();

            if (this.storeSettings.enableTelegramNotify && this.storeSettings.telegramBotToken) {
                const itemsTxt = orderData.items.map(i => `• ${i.qty}x ${i.name}`).join('\n');
                const teleMsg = `💰 <b>ĐƠN HÀNG MOBILE HOÀN TẤT</b>\n🪑 Bàn: <b>${orderData.table}</b>\n💵 Tổng tiền: <b>${finalAmt.toLocaleString()}đ</b> (${orderData.paymentMethod})\n🏷️ Giảm giá: <b>${discVal.toLocaleString()}đ</b>\n👤 Thu ngân: ${orderData.cashier}\n${itemsTxt}`;
                fetch(`https://api.telegram.org/bot${this.storeSettings.telegramBotToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: this.storeSettings.telegramChatId, text: teleMsg, parse_mode: 'HTML' })
                }).catch(()=>{});
            }

            this.selectedBillToView = { ...orderData };
            this.showBillDetailModal = true;
            this.showPaymentModal = false;

            this.selectedTable = null;
            this.currentOrder.items = [];
            this.currentTab = 'tables';

            setTimeout(() => {
                this.printReceipt('final-bill-print-area');
            }, 300);
        },

        // ================= DUYỆT ĐƠN KHÁCH =================
        acceptCustomerOrder(order) {
            db.ref('tables/' + order.tableId).update({ status: 'serving' });
            let currentItems = this.tableOrders[order.tableId] || [];
            order.items.forEach(newItem => {
                let exist = currentItems.find(i => i.name === newItem.name);
                if (exist) exist.qty += Number(newItem.qty);
                else currentItems.push({ ...newItem });
            });
            db.ref('tableOrders/' + order.tableId).set(currentItems);
            db.ref('pendingOrders/' + order.tableId).remove();
            alert(`Đã tiếp nhận đơn của ${order.tableName}!`);
            this.showCustomerOrderModal = false;
        },

        rejectCustomerOrder(order) {
            if (confirm(`Hủy yêu cầu gọi món của ${order.tableName}?`)) {
                db.ref('pendingOrders/' + order.tableId).remove();
            }
        },

        // ================= QUẢN LÝ SỔ QUỸ THU CHI =================
        openCashFlowModal(type = 'CHI') {
            if (!this.hasPermission(['Quản lý', 'Thu ngân'])) {
                alert('Chỉ Thu ngân hoặc Quản lý mới có quyền lập phiếu thu/chi!');
                return;
            }
            this.isEditingCashFlow = false;
            this.cashFlowForm = {
                id: null,
                type: type,
                category: type === 'CHI' ? this.expenseCategories[0] : this.incomeCategories[1],
                amount: 0,
                recipient: '',
                note: '',
                paymentMethod: 'Tiền mặt'
            };
            this.showCashFlowModal = true;
        },

        saveCashFlow() {
            if (!this.cashFlowForm.amount || Number(this.cashFlowForm.amount) <= 0) {
                alert('Vui lòng nhập số tiền hợp lệ (> 0)!');
                return;
            }
            if (!this.cashFlowForm.category) {
                alert('Vui lòng chọn loại chi phí / thu nhập!');
                return;
            }

            const payload = {
                type: this.cashFlowForm.type,
                category: this.cashFlowForm.category,
                amount: Number(this.cashFlowForm.amount),
                recipient: (this.cashFlowForm.recipient || '').trim() || '---',
                note: (this.cashFlowForm.note || '').trim() || '',
                paymentMethod: this.cashFlowForm.paymentMethod || 'Tiền mặt',
                created_by: this.currentUser ? this.currentUser.name : 'Thu ngân',
                timestamp: new Date().toISOString()
            };

            db.ref('cashFlow').push(payload);
            alert(`Đã lưu phiếu ${payload.type === 'CHI' ? 'chi' : 'thu'} thành công!`);
            this.showCashFlowModal = false;
        },

        deleteCashFlow(id) {
            if (!this.hasPermission(['Quản lý'])) {
                alert('Chỉ Quản lý mới có quyền xóa phiếu thu chi!');
                return;
            }
            if (confirm('Bạn có chắc chắn muốn xóa phiếu này?')) {
                db.ref('cashFlow/' + id).remove();
            }
        },

        // ================= IN ẤN NGẦM =================
        printReceipt(areaId) {
            const el = document.getElementById(areaId);
            if (!el) { window.print(); return; }

            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <html>
                <head>
                    <title>In Hóa Đơn</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @page { size: auto; margin: 0; }
                        body { font-family: monospace, sans-serif; width: 80mm; margin: 0 auto; padding: 6px; }
                        img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
                    </style>
                </head>
                <body class="font-mono text-xs">
                    ${el.innerHTML}
                </body>
                </html>
            `);
            doc.close();

            setTimeout(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => { document.body.removeChild(iframe); }, 1000);
            }, 500);
        },

        getVietQrUrl(amount = 0, note = '') {
            if (!this.storeSettings.bankCode || !this.storeSettings.bankAccount) return '';
            return `https://img.vietqr.io/image/${this.storeSettings.bankCode}-${this.storeSettings.bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(this.storeSettings.bankAccountName)}`;
        },

        // ================= BÁO CÁO & LỊCH SỬ HÓA ĐƠN =================
        get filteredOrdersList() {
            let list = [...this.ordersList].reverse();

            if (this.currentUser && this.currentUser.role === 'Thu ngân') {
                const todayStr = getTodayStr();
                list = list.filter(o => {
                    const orderDate = o.timestamp ? new Date(o.timestamp).toLocaleDateString('en-CA') : '';
                    const isMyOrder = o.cashier === this.currentUser.name || o.cashier === this.currentUser.username;
                    return orderDate === todayStr && isMyOrder;
                });
            } else {
                if (this.historyStartDate) {
                    const startTs = new Date(this.historyStartDate + 'T00:00:00').getTime();
                    list = list.filter(o => o.timestamp && new Date(o.timestamp).getTime() >= startTs);
                }
                if (this.historyEndDate) {
                    const endTs = new Date(this.historyEndDate + 'T23:59:59').getTime();
                    list = list.filter(o => o.timestamp && new Date(o.timestamp).getTime() <= endTs);
                }
            }

            return list;
        },

        viewBillDetail(b) {
            if (!b) return;
            this.selectedBillToView = {
                ...b,
                items: Array.isArray(b.items) ? [...b.items] : []
            };
            this.showBillDetailModal = true;
        },

        deleteOrderHistory(orderId) {
            if (!this.hasPermission(['Quản lý'])) {
                alert('Chỉ Quản lý mới có quyền xóa hóa đơn!');
                return;
            }
            if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
                db.ref('orders/' + orderId).remove();
                alert('Đã xóa hóa đơn!');
                this.showBillDetailModal = false;
            }
        },

        // ================= LỌC SỔ QUỸ =================
        get filteredCashFlowList() {
            const posIncomeRows = (this.ordersList || []).map(order => ({
                id: 'POS_' + order.id,
                type: 'THU',
                category: 'Thu tiền bán hàng POS',
                amount: Number(order.total) || 0,
                recipient: order.table ? `Bàn: ${order.table}` : 'Khách POS',
                paymentMethod: order.paymentMethod || 'Tiền mặt',
                note: order.note ? `Hóa đơn POS (${order.note})` : 'Bán hàng POS',
                timestamp: order.timestamp || new Date().toISOString(),
                created_by: order.cashier || 'Thu ngân',
                isPosOrder: true
            }));

            let list = [...(this.cashFlowList || []), ...posIncomeRows];

            if (this.currentUser && this.currentUser.role === 'Thu ngân') {
                const todayStr = getTodayStr();
                list = list.filter(c => {
                    const flowDate = c.timestamp ? new Date(c.timestamp).toLocaleDateString('en-CA') : '';
                    const isMyFlow = c.created_by === this.currentUser.name || c.created_by === this.currentUser.username;
                    return flowDate === todayStr && isMyFlow;
                });
            } else {
                if (this.cashFlowStartDate) {
                    const startTs = new Date(this.cashFlowStartDate + 'T00:00:00').getTime();
                    list = list.filter(c => c.timestamp && new Date(c.timestamp).getTime() >= startTs);
                }
                if (this.cashFlowEndDate) {
                    const endTs = new Date(this.cashFlowEndDate + 'T23:59:59').getTime();
                    list = list.filter(c => c.timestamp && new Date(c.timestamp).getTime() <= endTs);
                }
            }

            return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        },

        get totalAutoPosIncome() {
            return this.filteredCashFlowList.filter(c => c.type === 'THU' && c.isPosOrder).reduce((sum, o) => sum + Number(o.amount || 0), 0);
        },

        get totalManualIncome() {
            return this.filteredCashFlowList.filter(c => c.type === 'THU' && !c.isPosOrder).reduce((sum, c) => sum + Number(c.amount || 0), 0);
        },

        get totalExpenses() {
            return this.filteredCashFlowList.filter(c => c.type === 'CHI').reduce((sum, c) => sum + Number(c.amount || 0), 0);
        }
    };
}