// ==UserScript==
// @name              HelpDesk Hero
// @namespace         http://tampermonkey.net/
// @version           v3.0.1
// @description       To narzędzie dla Baselinker integruje licznik MP4 z graficznym celem i personalizowanym motywem, rozbudowaną watchlistę ticketów z terminami i priorytetami oraz konfigurowalny dashboard startowy.
// @author            Bartłomiej K. & Alex Gago (funkcjonalność Watchlist)
// @match             https://supportislove2.baselinker.com/*
// @updateURL         https://raw.githubusercontent.com/badurax96/bdrhdh/main/HelpDesk%20Hero.js
// @downloadURL       https://raw.githubusercontent.com/badurax96/bdrhdh/main/HelpDesk%20Hero.js
// @grant             GM_addStyle
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             GM_addValueChangeListener
// @icon              https://www.google.com/s2/favicons?sz=64&domain=baselinker.com
// ==/UserScript==

(function () {
    'use strict';

    const CONFIG = {
        STORAGE_KEYS: {
            USERNAME: 'ticket_counter_username',
            MP4_PASTE_COUNT: 'mp4PasteCount',
            HISTORY: 'mp4History',
            SELECTED_TEAM_MEMBERS: 'mp4SelectedTeamMembers',
            GLOBAL_THEME: 'mp4ModalGlobalBaseTheme',
            WATCHLIST: 'watchlist_v2',
            WATCHLIST_CATEGORIES: 'watchlistCategories_v2',
            MP4_DAILY_GOAL_PERCENT: 'mp4DailyGoalPercent',
            CUSTOM_THEME_SETTINGS: 'mp4CustomThemeSettings',
            CUSTOM_THEME_ENABLED: 'mp4CustomThemeEnabled',
            SAVED_CUSTOM_THEMES: 'mp4SavedCustomThemes',
            KEYBOARD_SHORTCUTS: 'mp4KeyboardShortcuts',
            SETTINGS_PANEL_STATE: 'mp4SettingsPanelState',
            DEFAULT_START_VIEW: 'mp4DefaultStartView_v2',
            DASHBOARD_WIDGETS: 'mp4DashboardWidgets_v4'
        },
        DEFAULT_USERNAME: 'Bartłomiej Kasiura',
        DEFAULT_MP4_GOAL: 0,
        PAGINATION: {
            TEAM_STATS_PER_PAGE: 10,
            HISTORY_RECORDS_PER_PAGE: 5,
            DASHBOARD_HISTORY_ITEMS: 3,
            DASHBOARD_TEAM_STATS_ITEMS: 5
        },
        MODAL_VIEWS: {
            STATS: 'stats',
            MP4_PERCENTAGE: 'mp4_percentage',
            MP4_HISTORY: 'mp4_history',
            WATCHLIST: 'watchlist',
            SETTINGS: 'settings_view',
            DASHBOARD: 'dashboard',
            WATCHLIST_TICKETS: 'watchlist_tickets',
            WATCHLIST_CATEGORIES: 'watchlist_categories'
        },
        AVAILABLE_DASHBOARD_WIDGETS: {
            MP4_TARGET_INFO: { id: 'mp4TargetInfo', label: 'Postęp i Statystyki Celu MP4' },
            WATCHLIST_DEADLINES: { id: 'watchlistDeadlines', label: 'Terminy z Watchlisty' },
            TEAM_STATS_VIEW: { id: 'teamStatsView', label: 'Statystyki Zespołu (Skrót)' }, // NOWY WIDGET
            MP4_HISTORY_VIEW: { id: 'mp4HistoryView', label: 'Skrót Historii MP4' }
        },
        DEFAULT_CATEGORY_COLOR: '#333333',
        DEADLINE_NOTIFICATION_UPCOMING_DAYS: 3,
        ELEMENT_IDS: {
            MP4_MODAL: 'mp4Modal',
            MP4_MODAL_CONTENT: 'mp4ModalContent',
            BTN_PLUS: 'btnPlus_glowny',
            BTN_MINUS: 'btnMinus_glowny',
            BTN_RESET: 'btnReset_glowny',
            BTN_TEAM_STATS: 'btnTeamStats_glowny',
            BTN_PERCENT: 'btnPercent_glowny',
            BTN_HISTORY: 'btnHistory_glowny',
            BTN_WATCHLIST: 'btnWatchlist_dodatkowy',
            BTN_TOGGLE_THEME: 'btnToggleBaseTheme',
            BTN_SETTINGS: 'btnSettings_glowny',
            BTN_DASHBOARD: 'btnDashboard_glowny',
            BTN_SAVE_TEAM_FILTER: 'saveSelectedTeamMembersBtn_glowny',
            BTN_SAVE_MP4_USERNAME: 'btnSaveMp4Username',
            MP4_CLOSE_BTN: 'mp4Close_glowny',
            TEAM_STATS_FILTER_CONTAINER: 'teamStatsFilterContainer_glowny',
            SELECTED_TEAM_MEMBERS_INPUT: 'selectedTeamMembersInput_glowny',
            MP4_USERNAME_INPUT: 'mp4UsernameInput',
            CURRENT_FILTER_DISPLAY: 'currentFilterDisplay_glowny',
            ADDITIONAL_STATS_CONTAINER: 'additionalStatsContainer_glowny',
            ADDITIONAL_STATS_CONTENT: 'additionalStatsContent_glowny',
            MP4_USER_SETTINGS_CONTAINER: 'mp4UserSettingsContainer',
            MP4_GOAL_INPUT: 'mp4GoalInput',
            BTN_SAVE_MP4_GOAL: 'btnSaveMp4Goal',
            MP4_GOAL_PROGRESS_DISPLAY: 'mp4GoalProgressDisplay',
            MP4_GOAL_PROGRESS_BAR_TEXT: 'mp4GoalProgressBarText',
            MP4_GOAL_PROGRESS_BAR_FILL: 'mp4GoalProgressBarFill',
            MP4_GOAL_PROGRESS_BAR_CONTAINER: 'mp4GoalProgressBarContainer',
            MP4_GOAL_PROGRESS_LABEL: 'mp4GoalProgressLabel',
            CUSTOM_THEME_OPTIONS_CONTAINER: 'customThemeOptionsContainer',
            BTN_APPLY_SAVE_CUSTOM_THEME: 'btnApplySaveCustomTheme',
            BTN_DISABLE_CUSTOM_THEME: 'btnDisableCustomTheme',
            BTN_RESET_CUSTOM_THEME: 'btnResetCustomTheme',
            INPUT_SAVE_THEME_NAME: 'inputSaveThemeName',
            BTN_SAVE_CURRENT_AS_PRESET: 'btnSaveCurrentAsPreset',
            SAVED_THEMES_LIST_CONTAINER: 'savedThemesListContainer',
            KEYBOARD_SHORTCUTS_CONTAINER: 'keyboardShortcutsContainer',
            BTN_SAVE_KEYBOARD_SHORTCUTS: 'btnSaveKeyboardShortcuts',
            DEFAULT_START_VIEW_SELECT: 'defaultStartViewSelect',
            DASHBOARD_WIDGET_CONFIG_CONTAINER: 'dashboardWidgetConfigContainer'
        },
        CSS_CLASSES: {
            SHORTCUT_INPUT_LISTENING: 'shortcut-input-listening'
        },
        DEFAULT_KEYBOARD_SHORTCUTS: {
            toggleMainModal: 'Ctrl+Shift+L',
            incrementMp4: 'Alt+ArrowUp',
            decrementMp4: 'Alt+ArrowDown',
            resetMp4: 'Alt+R',
            showDashboard: 'Alt+D',
            showTeamStats: 'Alt+S',
            showMp4Percentage: 'Alt+P',
            showMp4History: 'Alt+H',
            showWatchlist: 'Alt+W',
            showSettingsView: 'Alt+O',
            toggleBaseThemeShortcut: 'Alt+T',
        }
    };

    function h(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    // Lista atrybutów logicznych, które lepiej ustawiać jako właściwości
    const booleanAttributes = ['checked', 'disabled', 'selected', 'readOnly', 'open', 'draggable', 'required', 'multiple', 'autofocus', 'hidden', 'contentEditable'];

    for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            if (key === 'classList') {
                if (Array.isArray(attributes[key])) {
                    attributes[key].forEach(cls => cls && element.classList.add(cls));
                } else if (typeof attributes[key] === 'string' && attributes[key].trim() !== '') {
                    element.className = attributes[key];
                }
            } else if (key === 'style' && typeof attributes[key] === 'object') {
                Object.assign(element.style, attributes[key]);
            } else if (key === 'dataset' && typeof attributes[key] === 'object') {
                for (const dataProp in attributes[key]) {
                    if (attributes[key].hasOwnProperty(dataProp)) element.dataset[dataProp] = attributes[key][dataProp];
                }
            } else if (key === 'eventListeners' && typeof attributes[key] === 'object') {
                for (const eventType in attributes[key]) {
                    if (attributes[key].hasOwnProperty(eventType)) element.addEventListener(eventType, attributes[key][eventType]);
                }
            } else if (key === 'textContent' || key === 'innerText' || key === 'innerHTML') {
                element[key] = attributes[key];
            } else if (booleanAttributes.includes(key)) { // Poprawione ustawianie atrybutów logicznych
                element[key] = !!attributes[key]; // Ustawia właściwość na true/false
            } else { // Dla pozostałych atrybutów
                if (attributes[key] !== null && typeof attributes[key] !== 'undefined') {
                    element.setAttribute(key, attributes[key]);
                }
            }
        }
    }
    if (!Array.isArray(children)) children = [children];
    children.forEach(child => {
        if (typeof child === 'string') element.appendChild(document.createTextNode(child));
        else if (child instanceof Node) element.appendChild(child);
    });
    return element;
}

    const WATCHLIST_PRIORITIES = {
        NONE: '',
        LOW: 'Niski',
        NORMAL: 'Normalny',
        HIGH: 'Wysoki',
        CRITICAL: 'Krytyczny'
    };

    const WATCHLIST_PRIORITY_COLORS = {
        [WATCHLIST_PRIORITIES.NONE]: 'var(--mp4-modal-text, #888888)',
        [WATCHLIST_PRIORITIES.LOW]: 'var(--mp4-btn-green-bg, #28a745)',
        [WATCHLIST_PRIORITIES.NORMAL]: 'var(--mp4-btn-blue-bg, #007bff)',
        [WATCHLIST_PRIORITIES.HIGH]: 'var(--mp4-btn-orange-bg, #fd7e14)',
        [WATCHLIST_PRIORITIES.CRITICAL]: 'var(--mp4-btn-red-bg, #dc3545)'
    };


    const WatchlistModule = {
        state: {
            items: [],
            categories: [],
            currentModalView: CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS,
            currentFilter: 'All',
            searchText: '',
            draggedCategoryIndex: null,
            pageBgColor: '',
            lastClickedStarDescription: '',
            ticketSortKey: 'priority',
            ticketSortDirection: 'desc'
        },

        init: function () {
            this.state.items = GM_getValue(CONFIG.STORAGE_KEYS.WATCHLIST, []).map(item => ({
                ...item,
                deadline: item.deadline || null,
                priority: (typeof item.priority !== 'undefined' ? item.priority : WATCHLIST_PRIORITIES.NORMAL)
            }));
            let rawCategories = GM_getValue(CONFIG.STORAGE_KEYS.WATCHLIST_CATEGORIES, []);
            this.state.categories = rawCategories.map(cat => {
                if (typeof cat === 'string') return { name: cat, color: '' };
                if (cat && typeof cat === 'object' && cat !== null) {
                    if (!cat.hasOwnProperty('name')) return { name: String(cat), color: '' };
                    return { name: String(cat.name), color: typeof cat.color === 'string' ? cat.color : '' };
                }
                return null;
            }).filter(cat => cat !== null && typeof cat.name === 'string' && cat.name.trim() !== '');
            this.state.pageBgColor = window.getComputedStyle(document.body).backgroundColor;
        this.addStorageListeners();
    },
            addStorageListeners: function() {
        const self = this; // Potrzebne, aby 'this' działało poprawnie wewnątrz funkcji callback

        // Nasłuchuj zmian w głównej liście ticketów watchlisty
        GM_addValueChangeListener(CONFIG.STORAGE_KEYS.WATCHLIST, function(name, old_value, new_value, remote) {
            if (remote) { // 'remote' oznacza, że zmiana przyszła z innej karty przeglądarki
                console.log("HelpDesk Hero (Watchlist Sync): Dane ticketów watchlisty zmienione w innej karcie. Aktualizuję...");

                // Aktualizujemy stan ticketów w tej karcie, używając tych samych przekształceń co w funkcji init
                self.state.items = new_value.map(item => ({
                    ...item,
                    deadline: item.deadline || null,
                    priority: (typeof item.priority !== 'undefined' ? item.priority : WATCHLIST_PRIORITIES.NORMAL)
                }));

                // Odświeżamy widok, jeśli jest taka potrzeba
                // Sprawdzamy, czy modal jest otwarty i czy wyświetla listę ticketów
                if (MainAppModule.ui.modalElement && MainAppModule.ui.modalElement.classList.contains("show") &&
                    document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT)?.querySelector('.watchlist-table-container') &&
                    self.state.currentModalView === CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS) {
                    self.updateModal(); // Odśwież modal z watchlistą
                }
                self.initButtonsOnPage(); // Odśwież gwiazdki na stronie (np. na liście ticketów Baselinkera)
                MainAppModule.refreshDashboardIfNeeded(); // Odśwież dashboard, jeśli wyświetla dane z watchlisty
            }
        });

        // Nasłuchuj zmian w kategoriach watchlisty
        GM_addValueChangeListener(CONFIG.STORAGE_KEYS.WATCHLIST_CATEGORIES, function(name, old_value, new_value, remote) {
            if (remote) { // Jeśli zmiana przyszła z innej karty
                console.log("HelpDesk Hero (Watchlist Sync): Kategorie watchlisty zmienione w innej karcie. Aktualizuję...");

                // Aktualizujemy stan kategorii w tej karcie, używając tych samych przekształceń co w funkcji init
                self.state.categories = new_value.map(cat => {
                    if (typeof cat === 'string') return { name: cat, color: '' };
                    if (cat && typeof cat === 'object' && cat !== null) {
                        if (!cat.hasOwnProperty('name')) return { name: String(cat), color: '' };
                        return { name: String(cat.name), color: typeof cat.color === 'string' ? cat.color : '' };
                    }
                    return null;
                }).filter(cat => cat !== null && typeof cat.name === 'string' && cat.name.trim() !== '');

                // Odświeżamy widok, jeśli jest taka potrzeba
                // Sprawdzamy, czy modal jest otwarty i czy wyświetla kategorie lub listę ticketów (bo kategorie wpływają na filtry)
                if (MainAppModule.ui.modalElement && MainAppModule.ui.modalElement.classList.contains("show") &&
                    document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT)?.querySelector('.watchlist-table-container')) {
                    if (self.state.currentModalView === CONFIG.MODAL_VIEWS.WATCHLIST_CATEGORIES || self.state.currentModalView === CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS) {
                         self.updateModal(); // Odśwież modal
                    }
                }
                MainAppModule.refreshDashboardIfNeeded(); // Odśwież dashboard
            }
        });
    },

        saveData: function () {
            GM_setValue(CONFIG.STORAGE_KEYS.WATCHLIST, this.state.items);
            GM_setValue(CONFIG.STORAGE_KEYS.WATCHLIST_CATEGORIES, this.state.categories);
            MainAppModule.refreshDashboardIfNeeded();
        },

        handleDragStart: function (e) {
            const targetRow = e.target.closest('tr.draggable-row');
            if (targetRow) {
                this.state.draggedCategoryIndex = parseInt(targetRow.getAttribute('data-index'));
                targetRow.style.opacity = '0.5';
            }
        },

        handleDragOver: function (e) {
            e.preventDefault();
            const row = e.target.closest('tr.draggable-row');
            if (row) row.style.borderTop = '2px solid #4a90e2';
        },

        handleDrop: function (e) {
            e.preventDefault();
            const targetRow = e.target.closest('tr.draggable-row');
            if (targetRow) {
                targetRow.style.borderTop = '';
                const targetIndex = parseInt(targetRow.getAttribute('data-index'));
                if (this.state.draggedCategoryIndex !== null && this.state.draggedCategoryIndex !== targetIndex) {
                    const movedItem = this.state.categories.splice(this.state.draggedCategoryIndex, 1)[0];
                    this.state.categories.splice(targetIndex, 0, movedItem);
                    this.saveData();
                    this.updateModal();
                }
            }
            this.state.draggedCategoryIndex = null;
        },

        handleDragEnd: function () {
            const modalContent = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT);
            if (!modalContent) return;
            const rows = modalContent.querySelectorAll('.watchlist-table-container tr.draggable-row');
            rows.forEach(r => { r.style.opacity = ''; r.style.borderTop = ''; });
        },

        countTickets: function (filter) {
            let itemsToCount = this.state.items;
            if (this.state.searchText && this.state.searchText.trim() !== '') {
                const searchTerm = this.state.searchText.trim().toLowerCase();
                itemsToCount = itemsToCount.filter(item =>
                    (item.hash && String(item.hash).toLowerCase().includes(searchTerm)) ||
                    (item.description && item.description.toLowerCase().includes(searchTerm))
                );
            }

            if (filter === 'All') return itemsToCount.length;
            else if (filter === 'Inbox') return itemsToCount.filter(ticket => !ticket.category || ticket.category === "").length;
            else return itemsToCount.filter(ticket => ticket.category === filter).length;
        },

        createCategoryFilterSection: function () {
            const self = this;
            const filters = ['All', 'Inbox', ...this.state.categories];
            const filterButtons = filters.map(filt => {
                const filterName = (typeof filt === 'string') ? filt : filt.name;
                const btnAttributes = {
                    textContent: `${filterName} (${self.countTickets(filterName)})`,
                    classList: ['mp4-btn'],
                    eventListeners: { click: (event) => { event.stopPropagation(); self.state.currentFilter = filterName; self.updateModal(); }}
                };
                if (typeof filt === 'object' && filt.color) {
                    btnAttributes.style = { backgroundColor: filt.color, color: '#fff', borderColor: filt.color };
                    if (self.state.currentFilter === filterName) btnAttributes.style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,0.7)';
                } else {
                    btnAttributes.classList.push(self.state.currentFilter === filterName ? 'blue' : 'grey');
                }
                return h('button', btnAttributes);
            });
            return h('div', { classList: ['filter-section'] }, filterButtons);
        },

        handleWatchlistTableActions: function(event) {
            const self = WatchlistModule;

            const editTicketBtn = event.target.closest('.editTicketBtn');
            if (editTicketBtn) {
                event.stopPropagation();
                const ticketHash = editTicketBtn.dataset.hash;
                if (!ticketHash) { MainAppModule.showNotification("Error: Cannot edit ticket, hash is missing.", 'error'); return; }
                const ticketIndex = self.state.items.findIndex(t => t.hash === ticketHash);
                if (ticketIndex !== -1) { self.showEditTicketForm(self.state.items[ticketIndex], ticketIndex); }
                else { MainAppModule.showNotification('Ticket not found in watchlist for edit. Hash: ' + ticketHash, 'error'); }
                return;
            }

            const removeTicketBtn = event.target.closest('.removeTicketBtn');
            if (removeTicketBtn) {
                event.stopPropagation();
                const ticketHash = removeTicketBtn.dataset.hash;
                if (!ticketHash) { MainAppModule.showNotification("Error: Cannot remove ticket, hash is missing.", 'error'); return; }
                const ticketIndex = self.state.items.findIndex(t => t.hash === ticketHash);
                if (ticketIndex !== -1) {
                    MainAppModule.showConfirmationDialog(
                        `Are you sure you want to remove ticket "${self.state.items[ticketIndex].description}" [${ticketHash}] from the watchlist?`,
                        () => {
                            self.state.items.splice(ticketIndex, 1); self.saveData(); self.updateModal();
                            MainAppModule.showNotification('Ticket removed successfully!', 'success');
                        }
                    );
                } else { MainAppModule.showNotification('Ticket not found in watchlist for removal. Hash: ' + ticketHash, 'error'); }
                return;
            }

            const editCategoryBtn = event.target.closest('.editCategoryBtn');
            if (editCategoryBtn) {
                event.stopPropagation();
                const idxString = editCategoryBtn.dataset.index;
                if (idxString === null) { MainAppModule.showNotification("Error: Cannot edit category, index is missing.", 'error'); return; }
                const idx = parseInt(idxString);
                if (self.state.categories && self.state.categories[idx]) { self.showEditCategoryForm(idx); }
                else { MainAppModule.showNotification('Category not found for editing. Index: ' + idx, 'error');}
                return;
            }

            const removeCategoryBtn = event.target.closest('.removeCategoryBtn');
            if (removeCategoryBtn) {
                event.stopPropagation();
                const idxString = removeCategoryBtn.dataset.index;
                if (idxString === null) { MainAppModule.showNotification("Error: Cannot remove category, index is missing.", 'error'); return; }
                const idx = parseInt(idxString);
                if (self.state.categories && self.state.categories[idx]) {
                    const catToRemove = self.state.categories[idx];
                    MainAppModule.showConfirmationDialog(
                        `Are you sure you want to remove category "${catToRemove.name}"? This will also remove this category from all assigned tickets.`,
                        () => {
                            const removedCategoryName = catToRemove.name;
                            self.state.categories.splice(idx, 1);
                            self.state.items = self.state.items.map(ticket => { if (ticket.category === removedCategoryName) ticket.category = ""; return ticket; });
                            self.saveData(); self.updateModal();
                            MainAppModule.showNotification(`Category "${removedCategoryName}" removed.`, 'success');
                        }
                    );
                } else { MainAppModule.showNotification('Category not found for removal. Index: ' + idx, 'error');}
                return;
            }
        },

        createDeadlineNotificationsElement: function() {
            const upcomingDaysThreshold = CONFIG.DEADLINE_NOTIFICATION_UPCOMING_DAYS;
            const relevantItems = { overdue: [], today: [], upcoming: [] };
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            this.state.items.forEach(item => {
                if (!item.deadline) return;
                const deadlineDate = new Date(item.deadline);
                deadlineDate.setHours(0, 0, 0, 0);
                const diffTime = deadlineDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) relevantItems.overdue.push(item);
                else if (diffDays === 0) relevantItems.today.push(item);
                else if (diffDays > 0 && diffDays <= upcomingDaysThreshold) relevantItems.upcoming.push(item);
            });

            const sortByDeadlineAsc = (a, b) => new Date(a.deadline) - new Date(b.deadline);
            relevantItems.overdue.sort(sortByDeadlineAsc);
            relevantItems.today.sort(sortByDeadlineAsc);
            relevantItems.upcoming.sort(sortByDeadlineAsc);

            if (relevantItems.overdue.length === 0 && relevantItems.today.length === 0 && relevantItems.upcoming.length === 0) {
                 return h('p', {textContent: 'Brak nadchodzących terminów w Watchliście.', style: { textAlign: 'center', fontStyle: 'italic', padding: '10px 0', margin: 0}});
            }

            const notificationContainer = h('div', {
                classList: ['deadline-notifications-container'],
                style: {
                    padding: '0px',
                }
            });

            const createListElement = (item) => {
                return h('li', {
                    style: { marginBottom: '4px', cursor: 'pointer', padding: '3px 0' },
                    title: `Ticket: ${item.description} [${item.hash}]\nKategoria: ${item.category || 'Inbox'}\nPriorytet: ${item.priority || 'Brak'}`,
                    eventListeners: {
                        click: () => { window.open(`/ticket.php?hash=${item.hash}`, '_blank'); }
                    }
                }, [
                    h('span', { textContent: `(${item.deadline}) `, style: { marginRight: '5px', fontWeight: 'bold' } }),
                    h('span', { textContent: (item.description.length > 45 ? item.description.substring(0, 42) + '...' : item.description) + ` (#${item.hash.substring(0,6)}...)` })
                ]);
            };

            const createSection = (title, items, titleColor) => {
                if (items.length === 0) return null;
                const list = h('ul', { style: { listStyleType: 'none', paddingLeft: '0', margin: '0' } }, items.map(createListElement));
                return h('div', { style: { marginBottom: items.length > 0 ? '10px' : '0' } }, [
                    h('h5', { textContent: title, style: { color: titleColor, marginTop: '0', marginBottom: '5px', fontSize: 'var(--mp4-font-size-large)' } }),
                    list
                ]);
            };

            const overdueSection = createSection(`ZALEGŁE (${relevantItems.overdue.length})`, relevantItems.overdue, 'var(--mp4-btn-red-bg)');
            const todaySection = createSection(`DO ZROBIENIA DZISIAJ (${relevantItems.today.length})`, relevantItems.today, 'var(--mp4-btn-orange-bg)');
            const upcomingSection = createSection(`NADCHODZĄCE (najbl. ${upcomingDaysThreshold} dni) (${relevantItems.upcoming.length})`, relevantItems.upcoming, 'var(--mp4-btn-blue-bg)');

            if (overdueSection) notificationContainer.appendChild(overdueSection);
            if (todaySection) notificationContainer.appendChild(todaySection);
            if (upcomingSection) notificationContainer.appendChild(upcomingSection);

            if (notificationContainer.children.length === 0) return null;
            return notificationContainer;
        },


        updateModal: function () {
            const modalContent = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT);
            if (!modalContent) { return; }
            modalContent.innerHTML = '';
            const self = this;

            let headerButtons = [];
            if (this.state.currentModalView === CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS) {
                headerButtons.push(
                    h('button', { textContent: 'Add New Ticket', classList: ['mp4-btn', 'green'], eventListeners: { click: (event) => { event.stopPropagation(); self.showAddTicketForm(); } } }),
                    h('button', { textContent: 'Manage Categories', classList: ['mp4-btn', 'orange'], eventListeners: { click: (event) => { event.stopPropagation(); self.state.currentModalView = CONFIG.MODAL_VIEWS.WATCHLIST_CATEGORIES; self.updateModal(); } } })
                );
            } else if (this.state.currentModalView === CONFIG.MODAL_VIEWS.WATCHLIST_CATEGORIES) {
                headerButtons.push(
                    h('button', { textContent: 'Back to Tickets', classList: ['mp4-btn', 'blue'], eventListeners: { click: (e) => { e.stopPropagation(); self.state.currentModalView = CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS; self.updateModal(); } } }),
                    h('button', { textContent: 'Add New Category', classList: ['mp4-btn', 'green'], eventListeners: { click: (e) => { e.stopPropagation(); self.showAddCategoryForm(); } } })
                );
            }
            const modalHeader = h('div', { classList: ['modal-header'], style: { marginBottom: '10px', display: 'flex', justifyContent: 'center', gap: '8px' } }, headerButtons);

            let viewSpecificContentElements = [];
            if (this.state.currentModalView === CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS) {
                const deadlineNotificationsEl = this.createDeadlineNotificationsElement();
                if (deadlineNotificationsEl) {
                    viewSpecificContentElements.push(deadlineNotificationsEl);
                }

                viewSpecificContentElements.push(this.createCategoryFilterSection());

                const searchInput = h('input', {
                    type: 'text',
                    id: 'watchlistSearchInput_id',
                    placeholder: 'Szukaj po HashId lub Opisie...',
                    value: this.state.searchText,
                    style: {
                        width: 'calc(100% - 95px)',
                        padding: '8px',
                        marginRight: '5px',
                        border: '1px solid var(--mp4-input-border)',
                        borderRadius: 'var(--mp4-border-radius)',
                        backgroundColor: 'var(--mp4-input-bg)',
                        color: 'var(--mp4-input-text)',
                        boxSizing: 'border-box',
                        verticalAlign: 'middle'
                    },
                    eventListeners: {
                        input: function(event) {
                            self.state.searchText = event.target.value;
                        }
                    }
                });

                const searchButton = h('button', {
                    type: 'submit',
                    textContent: 'Szukaj',
                    classList: ['mp4-btn', 'blue'],
                    style: { padding: '8px 10px', verticalAlign: 'middle', height: '34px' }
                });

                const searchForm = h('form', {
                    style: { display: 'flex', marginBottom: '10px', alignItems: 'center' },
                    eventListeners: {
                        submit: function(event) {
                            event.preventDefault();
                            self.updateModal();
                        }
                    }
                }, [searchInput, searchButton]);
                viewSpecificContentElements.push(searchForm);


                let filteredItems = [];
                if (this.state.currentFilter === 'All') filteredItems = [...this.state.items];
                else if (this.state.currentFilter === 'Inbox') filteredItems = this.state.items.filter(item => !item.category || item.category === "");
                else filteredItems = this.state.items.filter(item => item.category === this.state.currentFilter);

                if (this.state.searchText && this.state.searchText.trim() !== '') {
                    const searchTerm = this.state.searchText.trim().toLowerCase();
                    filteredItems = filteredItems.filter(item =>
                        (item.hash && String(item.hash).toLowerCase().includes(searchTerm)) ||
                        (item.description && item.description.toLowerCase().includes(searchTerm))
                    );
                }


                if (this.state.ticketSortKey) {
                    filteredItems.sort((a, b) => {
                        let valA, valB;
                        if (this.state.ticketSortKey === 'deadline') {
                            const dateA = a.deadline ? new Date(a.deadline).getTime() : (this.state.ticketSortDirection === 'asc' ? Infinity : -Infinity);
                            const dateB = b.deadline ? new Date(b.deadline).getTime() : (this.state.ticketSortDirection === 'asc' ? Infinity : -Infinity);
                            return this.state.ticketSortDirection === 'asc' ? dateA - dateB : dateB - dateA;
                        } else if (this.state.ticketSortKey === 'priority') {
                            const priorityOrder = [WATCHLIST_PRIORITIES.NONE, WATCHLIST_PRIORITIES.LOW, WATCHLIST_PRIORITIES.NORMAL, WATCHLIST_PRIORITIES.HIGH, WATCHLIST_PRIORITIES.CRITICAL];
                            valA = priorityOrder.indexOf(a.priority || WATCHLIST_PRIORITIES.NONE);
                            valB = priorityOrder.indexOf(b.priority || WATCHLIST_PRIORITIES.NONE);
                                return this.state.ticketSortDirection === 'asc' ? valA - valB : valB - valA;
                        } else {
                            valA = a[this.state.ticketSortKey] ? String(a[this.state.ticketSortKey]).toLowerCase() : '';
                            valB = b[this.state.ticketSortKey] ? String(b[this.state.ticketSortKey]).toLowerCase() : '';
                            if (valA < valB) return this.state.ticketSortDirection === 'asc' ? -1 : 1;
                            if (valA > valB) return this.state.ticketSortDirection === 'asc' ? 1 : -1;
                            return 0;
                        }
                    });
                }


                if (filteredItems.length === 0) {
                    viewSpecificContentElements.push(h('p', { textContent: 'Brak ticketów spełniających kryteria filtrowania.', style: { textAlign: 'center', marginTop: '10px' } }));
                } else {
                    let currentTicketHashOnPage = (window.location.href.indexOf('ticket.php?hash=') > -1) ? new URLSearchParams(window.location.search).get('hash') : null;
                    const tableRows = filteredItems.map(item => {
                        let highlight = false;
                        if (currentTicketHashOnPage && currentTicketHashOnPage === item.hash) highlight = true;
                        else if (window.location.href.indexOf('tickets.php') > -1) {
                            const ticketsOnPage = Array.from(document.querySelectorAll('#support_tickets .ticket_row')).map(r => r.getAttribute('data-hash'));
                            if (ticketsOnPage.includes(item.hash)) highlight = true;
                        }

                        let deadlineText = item.deadline || 'Brak';
                        let deadlineCellStyle = {};
                        if (item.deadline) {
                            const today = new Date(); today.setHours(0,0,0,0);
                            const deadlineDate = new Date(item.deadline); deadlineDate.setHours(0,0,0,0);
                            if (deadlineDate < today) {
                                deadlineCellStyle.color = 'var(--mp4-btn-red-bg, red)';
                                deadlineCellStyle.fontWeight = 'bold';
                            } else if (deadlineDate.getTime() === today.getTime()) {
                                deadlineCellStyle.color = 'var(--mp4-btn-orange-bg, orange)';
                                deadlineCellStyle.fontWeight = 'bold';
                            }
                        }

                        const priorityValue = item.priority || WATCHLIST_PRIORITIES.NONE;
                        const priorityText = priorityValue || 'Brak';
                        let priorityCellStyle = { fontWeight: 'bold' };
                        if (WATCHLIST_PRIORITY_COLORS[priorityValue]) {
                            priorityCellStyle.color = WATCHLIST_PRIORITY_COLORS[priorityValue];
                        }

                        return h('tr', { classList: highlight ? ['in-view'] : [] }, [
                            h('td', {}, [h('a', { href: `/ticket.php?hash=${item.hash}`, textContent: item.hash })]),
                            h('td', { textContent: item.description }),
                            h('td', { textContent: item.category && item.category !== "" ? item.category : 'Inbox' }),
                            h('td', { style: deadlineCellStyle, textContent: deadlineText }),
                            h('td', { style: priorityCellStyle, textContent: priorityText }),
                            h('td', { style: { textAlign: 'center' } }, [
                                h('button', { classList: ['action-btn', 'editTicketBtn', 'mp4-btn', 'blue'], style: { padding: '3px 6px', fontSize: '10px' }, dataset: { hash: item.hash }, innerHTML: '<i class="fa fa-edit"></i> Edit' }),
                                h('button', { classList: ['action-btn', 'removeTicketBtn', 'mp4-btn', 'red'], style: { padding: '3px 6px', fontSize: '10px' }, dataset: { hash: item.hash }, innerHTML: '<i class="fa fa-trash"></i> Remove' })
                            ])
                        ]);
                    });

                    const sortableHeader = (text, sortKey) => {
                        let indicator = '';
                        if (this.state.ticketSortKey === sortKey) {
                            indicator = this.state.ticketSortDirection === 'asc' ? ' \u25B2' : ' \u25BC';
                        }
                        return h('th', {
                            textContent: text + indicator,
                            dataset: { sortKey: sortKey },
                            classList: ['sortable-header', this.state.ticketSortKey === sortKey ? 'sorted' : ''],
                            style: { cursor: 'pointer' },
                            eventListeners: {
                                click: () => {
                                    if (this.state.ticketSortKey === sortKey) {
                                        this.state.ticketSortDirection = this.state.ticketSortDirection === 'asc' ? 'desc' : 'asc';
                                    } else {
                                        this.state.ticketSortKey = sortKey;
                                        if (sortKey === 'deadline') this.state.ticketSortDirection = 'asc';
                                        else if (sortKey === 'priority') this.state.ticketSortDirection = 'desc';
                                        else this.state.ticketSortDirection = 'asc';
                                    }
                                    this.updateModal();
                                }
                            }
                        });
                    };

                    viewSpecificContentElements.push(h('table', { classList: ['modal-table'] }, [
                        h('thead', {}, [h('tr', {}, [
                            sortableHeader('HashId', 'hash'),
                            sortableHeader('Description', 'description'),
                            sortableHeader('Category', 'category'),
                            sortableHeader('Termin', 'deadline'),
                            sortableHeader('Priorytet', 'priority'),
                            h('th', { textContent: 'Actions' })
                        ])]),
                        h('tbody', {}, tableRows)
                    ]));
                }
            } else if (this.state.currentModalView === CONFIG.MODAL_VIEWS.WATCHLIST_CATEGORIES) {
                if (this.state.categories.length === 0) {
                    viewSpecificContentElements.push(h('p', { textContent: 'No categories defined.', style: { textAlign: 'center' } }));
                } else {
                    const tableRows = this.state.categories.map((cat, idx) =>
                        h('tr', { dataset: { index: idx }, draggable: true, classList: ['draggable-row'], eventListeners: { dragstart: self.handleDragStart.bind(self), dragover: self.handleDragOver.bind(self), drop: self.handleDrop.bind(self), dragend: self.handleDragEnd.bind(self) } }, [
                            h('td', { innerHTML: `<i class="fa fa-bars drag-handle" title="Drag to reorder"></i> ${cat.name}` }),
                            h('td', { textContent: self.countTickets(cat.name) }),
                            h('td', { style: { textAlign: 'center' }, innerHTML: cat.color ? `<span style="display:inline-block;width:16px;height:16px;background:${cat.color};border:1px solid #ccc; margin-left: auto; margin-right:auto;"></span>` : 'N/A' }),
                            h('td', { style: { textAlign: 'center' } }, [
                                h('button', { classList: ['action-btn', 'editCategoryBtn', 'mp4-btn', 'blue'], dataset: { index: idx }, innerHTML: '<i class="fa fa-edit"></i> Edit' }),
                                h('button', { classList: ['action-btn', 'removeCategoryBtn', 'mp4-btn', 'red'], dataset: { index: idx }, innerHTML: '<i class="fa fa-trash"></i> Remove' })
                            ])
                        ])
                    );
                    viewSpecificContentElements.push(h('table', { classList: ['modal-table'] }, [
                        h('thead', {}, [h('tr', {}, [h('th', { textContent: 'Category Name' }), h('th', { textContent: 'Ticket Count' }), h('th', { textContent: 'Color' }), h('th', { textContent: 'Actions' })])]),
                        h('tbody', {}, tableRows)
                    ]));
                }
            }

            const watchlistUiContainer = h('div', { classList: ['watchlist-table-container'], style: { maxHeight: 'calc(70vh - 150px)', overflowY: 'auto' } }, [modalHeader, ...viewSpecificContentElements]);
            modalContent.appendChild(watchlistUiContainer);
            watchlistUiContainer.addEventListener('click', this.handleWatchlistTableActions.bind(this));
        },

        createFormContainer: function (formId, modalContentElement) {
             if (!modalContentElement) { modalContentElement = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT); if (!modalContentElement) { MainAppModule.showNotification("Critical error: Modal content area not found.", "error", 0); return null; } }
             const existingForm = modalContentElement.querySelector(`#${formId}`); if (existingForm) existingForm.remove();
             const formContainer = h('div', { id: formId, classList: ['watchlist-form-container'] });

             const watchlistTableContainer = modalContentElement.querySelector('.watchlist-table-container');
             if (!watchlistTableContainer) { modalContentElement.insertBefore(formContainer, modalContentElement.firstChild); }
             else {
                 const mainHeaderInWatchlist = watchlistTableContainer.querySelector('.modal-header');
                 if (mainHeaderInWatchlist && mainHeaderInWatchlist.nextSibling) { watchlistTableContainer.insertBefore(formContainer, mainHeaderInWatchlist.nextSibling); }
                 else if (mainHeaderInWatchlist) { watchlistTableContainer.appendChild(formContainer); }
                 else { watchlistTableContainer.insertBefore(formContainer, watchlistTableContainer.firstChild); }
             }
             if (modalContentElement.scrollTop > 0 && watchlistTableContainer) watchlistTableContainer.scrollTop = 0;
             else if (modalContentElement.scrollTop > 0) modalContentElement.scrollTop = 0;
             return formContainer;
        },

        showAddTicketForm: function () {
            const modalContent = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT); if (!modalContent) return;
            if (document.getElementById('addTicketForm_watchlist')) return;
            const formContainer = this.createFormContainer('addTicketForm_watchlist', modalContent); if (!formContainer) return;
            const self = this;

            const hashInput = h('input', { type: 'text', required: true });
            const descInput = h('input', { type: 'text', required: true });
            const categoryOptions = [h('option', { value: "", textContent: "None (Inbox)" }), ...this.state.categories.map(cat => h('option', { value: cat.name, textContent: cat.name }))];
            const categorySelect = h('select', {}, categoryOptions);

            const deadlineInput = h('input', { type: 'date' });
            const priorityOptions = Object.values(WATCHLIST_PRIORITIES).map(pVal =>
                h('option', { value: pVal, textContent: pVal || 'Brak (Domyślny)' })
            );
            priorityOptions.find(opt => opt.value === WATCHLIST_PRIORITIES.NORMAL).selected = true;
            const prioritySelect = h('select', {}, priorityOptions);

            const submitBtn = h('button', { textContent: 'Add Ticket', classList: ['mp4-btn', 'green'], eventListeners: { click: function (event) {
                event.stopPropagation();
                const hash = hashInput.value.trim();
                const description = descInput.value.trim();
                const category = categorySelect.value;
                const deadline = deadlineInput.value;
                const priority = prioritySelect.value;

                if (!hash || !description) { MainAppModule.showNotification('Please fill in both hash and description.', 'warning'); return; }
                if (self.state.items.some(ticket => ticket.hash === hash)) { MainAppModule.showNotification('This ticket is already in your watchlist.', 'warning'); return; }

                self.state.items.unshift({
                    hash,
                    description,
                    category,
                    deadline: deadline || null,
                    priority: priority // `priority` to `prioritySelect.value`, który może być poprawnie `''`
                });
                self.saveData(); self.updateModal();
                MainAppModule.showNotification('Ticket added to watchlist!', 'success');
            }}});
            const cancelBtn = h('button', { textContent: 'Cancel', classList: ['mp4-btn', 'grey'], style: { marginLeft: '5px' }, eventListeners: { click: function(event){ event.stopPropagation(); formContainer.remove();}} });

            formContainer.append(
                h('label', { textContent: 'Ticket Hash:' }), hashInput,
                h('label', { textContent: 'Ticket Description:' }), descInput,
                h('label', { textContent: 'Ticket Category:' }), categorySelect,
                h('label', { textContent: 'Termin (Deadline):' }), deadlineInput,
                h('label', { textContent: 'Priorytet:' }), prioritySelect,
                h('div', { style: { textAlign: 'right', marginTop: '10px' } }, [submitBtn, cancelBtn])
            );
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        showEditTicketForm: function (ticket, ticketIndex) {
            const modalContent = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT); if (!modalContent) return;
            if (document.getElementById('editTicketForm_watchlist')) document.getElementById('editTicketForm_watchlist').remove();
            const formContainer = this.createFormContainer('editTicketForm_watchlist', modalContent); if (!formContainer) return;
            const self = this;

            const descInput = h('input', { type: 'text', value: ticket.description, required: true });
            const categoryOptions = [h('option', { value: "", textContent: "None (Inbox)" }), ...this.state.categories.map(cat => {
                const opt = h('option', { value: cat.name, textContent: cat.name });
                if (ticket.category === cat.name) opt.selected = true; return opt;
            })];
            const categorySelect = h('select', {}, categoryOptions);

            const deadlineInput = h('input', { type: 'date', value: ticket.deadline || '' });
            const priorityOptions = Object.values(WATCHLIST_PRIORITIES).map(pVal => {
    const opt = h('option', { value: pVal, textContent: pVal || 'Brak (Domyślny)' });
    // Użyj faktycznego priorytetu ticketa; jeśli jest undefined (stare dane), domyślnie NORMALNY dla celów zaznaczenia
    const currentTicketPriority = typeof ticket.priority !== 'undefined' ? ticket.priority : WATCHLIST_PRIORITIES.NORMAL;
    if (currentTicketPriority === pVal) {
        opt.selected = true;
    }
    return opt;
});
            const prioritySelect = h('select', {}, priorityOptions);

            const submitBtn = h('button', { textContent: 'Save', classList: ['mp4-btn', 'green'], eventListeners: { click: function (event) {
                event.stopPropagation();
                const newDesc = descInput.value.trim();
                const newCategory = categorySelect.value;
                const newDeadline = deadlineInput.value;
                const newPriority = prioritySelect.value;

                if (!newDesc) { MainAppModule.showNotification('Description cannot be empty.', 'warning'); return; }

                self.state.items[ticketIndex].description = newDesc;
                self.state.items[ticketIndex].category = newCategory;
                self.state.items[ticketIndex].deadline = newDeadline || null;
                self.state.items[ticketIndex].priority = newPriority; // `newPriority` to `prioritySelect.value`

                self.saveData(); self.updateModal();
                MainAppModule.showNotification('Ticket updated!', 'success');
            }}});
            const cancelBtn = h('button', { textContent: 'Cancel', classList: ['mp4-btn', 'grey'], style: { marginLeft: '5px' }, eventListeners: { click: function(event){ event.stopPropagation(); self.updateModal();}} });

            formContainer.append(
                h('label', { textContent: `Ticket Description (Hash: ${ticket.hash}):` }), descInput,
                h('label', { textContent: 'Ticket Category:' }), categorySelect,
                h('label', { textContent: 'Termin (Deadline):' }), deadlineInput,
                h('label', { textContent: 'Priorytet:' }), prioritySelect,
                h('div', { style: { textAlign: 'right', marginTop: '10px' } }, [submitBtn, cancelBtn])
            );
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        showAddCategoryForm: function () {
            const modalContent = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT); if (!modalContent) return;
            if (document.getElementById('addCategoryForm_watchlist')) return;
            const formContainer = this.createFormContainer('addCategoryForm_watchlist', modalContent); if (!formContainer) return;
            const self = this;

            const catInput = h('input', { type: 'text', required: true });
            const colorInput = h('input', { type: 'color', value: CONFIG.DEFAULT_CATEGORY_COLOR, classList: ['color-input'] });
            const submitBtn = h('button', { textContent: 'Add Category', classList: ['mp4-btn', 'green'], eventListeners: { click: function(event){
                event.stopPropagation(); const catName = catInput.value.trim(); const catColor = colorInput.value;
                if (!catName) { MainAppModule.showNotification('Category name cannot be empty.', 'warning'); return; }
                if (self.state.categories.some(c => c.name === catName)) { MainAppModule.showNotification('This category already exists.', 'warning'); return; }
                self.state.categories.push({ name: catName, color: catColor }); self.saveData(); self.updateModal();
                MainAppModule.showNotification(`Category "${catName}" added!`, 'success');
            }}});
            const cancelBtn = h('button', { textContent: 'Cancel', classList: ['mp4-btn', 'grey'], style: { marginLeft: '5px' }, eventListeners: { click: function(event){ event.stopPropagation(); formContainer.remove();}} });

            formContainer.append(
                h('label', { textContent: 'Category Name:' }), catInput,
                h('label', { textContent: 'Category Color (optional):' }), colorInput,
                h('div', { style: { textAlign: 'right', marginTop: '10px' } }, [submitBtn, cancelBtn])
            );
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        showEditCategoryForm: function (index) {
            const modalContent = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT); if (!modalContent) { return; }
            const cat = this.state.categories[index]; if (!cat) { MainAppModule.showNotification('Category not found for editing.', 'error'); return; }
            if (document.getElementById('editCategoryForm_watchlist')) document.getElementById('editCategoryForm_watchlist').remove();
            const formContainer = this.createFormContainer('editCategoryForm_watchlist', modalContent); if (!formContainer) return;
            const self = this;

            const catInput = h('input', { type: 'text', required: true, value: cat.name });
            const colorInput = h('input', { type: 'color', value: cat.color || CONFIG.DEFAULT_CATEGORY_COLOR, classList: ['color-input'] });
            const clearColorCheckbox = h('input', { type: 'checkbox', id: 'watchlist_clearColorCheckbox_' + index, style: { transform: 'scale(0.85)' } });
            const clearColorLabel = h('label', { htmlFor: clearColorCheckbox.id, style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '10px', marginBottom: '12px', fontWeight: 'normal', cursor: 'pointer' } }, [
                clearColorCheckbox,
                h('span', { textContent: 'Clear color (make transparent/none)', style: { fontSize: 'var(--mp4-font-size-normal)', marginLeft: '5px' } })
            ]);
            const submitBtn = h('button', { textContent: 'Save', classList: ['mp4-btn', 'green'], eventListeners: { click: function(event){
                event.stopPropagation(); const newName = catInput.value.trim(); const newColor = clearColorCheckbox.checked ? '' : colorInput.value;
                if (!newName) { MainAppModule.showNotification('Category name cannot be empty.', 'warning'); return; }
                if (self.state.categories.some((c, i) => i !== index && c.name === newName)) { MainAppModule.showNotification('This category name already exists.', 'warning'); return; }
                const oldCatName = self.state.categories[index].name;
                self.state.categories[index] = { name: newName, color: newColor };
                self.state.items = self.state.items.map(ticket => { if (ticket.category === oldCatName) ticket.category = newName; return ticket; });
                self.saveData(); self.updateModal();
                MainAppModule.showNotification(`Category "${newName}" updated!`, 'success');
            }}});
            const cancelBtn = h('button', { textContent: 'Cancel', classList: ['mp4-btn', 'grey'], style: { marginLeft: '5px' }, eventListeners: { click: function(event){ event.stopPropagation(); self.updateModal(); }} });

            formContainer.append(
                h('label', { textContent: 'Edit Category Name:' }), catInput,
                h('label', { textContent: 'Category Color:' }), colorInput,
                clearColorLabel,
                h('div', { style: { textAlign: 'right', marginTop: '10px' } }, [submitBtn, cancelBtn])
            );
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },

        handleShiftClick: function (ticketHash, description, starIconElement) {
            let ticketIndex = this.state.items.findIndex(t => t.hash === ticketHash);
            let ticketObject;

            if (ticketIndex === -1) {
                this.state.items.unshift({
                    hash: ticketHash,
                    description: description,
                    category: "",
                    deadline: null,
                    priority: WATCHLIST_PRIORITIES.NORMAL
                });
                if (starIconElement) starIconElement.classList.add('active');
                this.saveData();
                ticketIndex = this.state.items.findIndex(t => t.hash === ticketHash);
                if (ticketIndex !== -1) ticketObject = this.state.items[ticketIndex];
            } else {
                ticketObject = this.state.items[ticketIndex];
                if (ticketObject.description !== description && description && description.trim() !== "") {
                    ticketObject.description = description; this.saveData();
                }
                if (typeof ticketObject.deadline === 'undefined') ticketObject.deadline = null;
                if (typeof ticketObject.priority === 'undefined') ticketObject.priority = WATCHLIST_PRIORITIES.NORMAL;
            }


            if (ticketObject && typeof ticketIndex === 'number' && ticketIndex !== -1) {
                if (MainAppModule.ui.modalElement && !MainAppModule.ui.modalElement.classList.contains("show")) {
                     MainAppModule.ui.modalElement.classList.add("show");
                     MainAppModule.applyTheme();
                }
                MainAppModule.showMainContentArea(CONFIG.MODAL_VIEWS.WATCHLIST);

                this.state.currentModalView = CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS;
                this.state.currentFilter = 'All';
                this.updateModal();
                this.showEditTicketForm(ticketObject, ticketIndex);
            } else {
                MainAppModule.showNotification("Error: Could not process ticket for editing.", 'error');
            }
        },

        createButton: function (ticketHash, description) {
            const icon = h('i', { classList: ['fa', 'fa-star', 'watchlist-star'], style: {
                color: (this.state.pageBgColor === 'rgb(245, 245, 245)') ? 'var(--mp4-watchlist-star-inactive)' : 'var(--mp4-watchlist-star-inactive)',
                filter: (this.state.pageBgColor === 'rgb(245, 245, 245)') ? "brightness(96%)" : "brightness(140%)",
                fontSize: "10pt", cursor: 'pointer'
            }});

            if (this.state.items.some(ticket => ticket.hash === ticketHash)) {
                icon.classList.add('active');
            }
            const self = this;
            icon.addEventListener('click', function (event) {
                event.stopPropagation(); event.preventDefault();
                self.state.lastClickedStarDescription = description;
                if (event.shiftKey) {
                    self.handleShiftClick(ticketHash, description, this);
                } else {
                    self.toggleStatus(ticketHash, description, this);
                }
            });
            return icon;
        },

        toggleStatus: function (ticketHash, description, starIconElement) {
            const descToUse = description || this.state.lastClickedStarDescription || ('Ticket ' + ticketHash);
            const index = this.state.items.findIndex(ticket => ticket.hash === ticketHash);
            if (index !== -1) {
                this.state.items.splice(index, 1);
                if (starIconElement) starIconElement.classList.remove('active');
                MainAppModule.showNotification('Ticket removed from watchlist.', 'info', 2000);
            } else {
                this.state.items.unshift({
                    hash: ticketHash,
                    description: descToUse,
                    category: "",
                    deadline: null,
                    priority: WATCHLIST_PRIORITIES.NORMAL
                });
                if (starIconElement) starIconElement.classList.add('active');
                MainAppModule.showNotification('Ticket added to watchlist!', 'success', 2000);
            }
            this.saveData();
            this.state.lastClickedStarDescription = '';

            const modal = MainAppModule.ui.modalElement;
            const modalContent = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT);
            if (modal && modal.classList.contains("show") &&
                modalContent && modalContent.style.display === 'block' &&
                modalContent.querySelector('.watchlist-table-container') &&
                this.state.currentModalView === CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS) {
                this.updateModal();
            }
            MainAppModule.refreshDashboardIfNeeded();
        },

        initButtonsOnPage: function () {
            const self = this;
            if (window.location.href.includes('ticket.php?hash=')) {
                const urlParams = new URLSearchParams(window.location.search);
                const ticketHash = urlParams.get('hash');
                if (ticketHash) {
                    let ticketDescription = 'Ticket ' + ticketHash;
                    const ticketDescriptionElement = document.querySelector('.card-body h4 > i');
                    if (ticketDescriptionElement && ticketDescriptionElement.nextSibling && ticketDescriptionElement.nextSibling.nodeType === Node.TEXT_NODE) {
                        ticketDescription = ticketDescriptionElement.nextSibling.textContent.trim();
                    } else {
                        const subjectEl = document.querySelector('.ticket_subject_header');
                        if (subjectEl) ticketDescription = subjectEl.innerText.trim();
                    }

                    const existingFixedButton = document.getElementById('fixedWatchlistButton');
                    if (existingFixedButton) existingFixedButton.remove();

                    const starIcon = h('i', { classList: ['fa', 'fa-star', 'watchlist-star'] });
                    if (self.state.items.some(ticket => ticket.hash === ticketHash)) {
                        starIcon.classList.add('active');
                    }
                    const buttonTextNode = document.createTextNode(self.state.items.some(ticket => ticket.hash === ticketHash) ? ' In Watchlist' : ' Add to Watchlist');

                    const fixedButton = h('button', {
                        id: 'fixedWatchlistButton', classList: ['mp4-btn'],
                        style: { position: 'fixed', bottom: '20px', right: '20px', zIndex: '10001', width: 'auto', padding: '8px 12px' },
                        eventListeners: {
                            click: function (event) {
                                event.stopPropagation();
                                self.state.lastClickedStarDescription = ticketDescription;
                                if (event.shiftKey) {
                                    self.handleShiftClick(ticketHash, ticketDescription, starIcon);
                                } else {
                                    self.toggleStatus(ticketHash, ticketDescription, starIcon);
                                    const isNowActive = starIcon.classList.contains('active');
                                    buttonTextNode.nodeValue = isNowActive ? ' In Watchlist' : ' Add to Watchlist';
                                }
                            }
                        }
                    }, [starIcon, buttonTextNode]);
                    document.body.appendChild(fixedButton);
                }
            }

            if (window.location.href.includes('tickets.php')) {
                const table = document.getElementById('support_tickets');
                if (!table) { return; }

                if (!table.dataset.starColumnAdded) {
                    const headerRow = table.querySelector('thead tr');
                    if (headerRow) {
                        let referenceHeader = null;
                        const headers = Array.from(headerRow.querySelectorAll('th'));
                        const hashHeaderTexts = ["Hash", "ID", "Nr", "Ticket ID", "#"];
                        const userHeaderTexts = ["User", "Użytkownik", "Przypisany", "Odpowiedzialny"];
                        referenceHeader = headers.find(th => hashHeaderTexts.some(txt => th.innerText.trim().toUpperCase() === txt.toUpperCase()));
                        if (!referenceHeader && headers.length > 1) referenceHeader = headers[1];
                        else if (!referenceHeader && headers.length > 0) referenceHeader = headers[0];

                        const newStarHeader = h('th', { innerHTML: '<i class="fa fa-star" title="Watchlist"></i>', style: { width: '30px', textAlign: 'center', verticalAlign: 'middle'} });
                        const siblingHeaderForPadding = referenceHeader || (headers.length > 0 ? headers[0] : null);
                        if (siblingHeaderForPadding) {
                            const computedSiblingStyle = window.getComputedStyle(siblingHeaderForPadding);
                            Object.assign(newStarHeader.style, { paddingTop: computedSiblingStyle.paddingTop, paddingBottom: computedSiblingStyle.paddingBottom, paddingLeft: '5px', paddingRight: '5px'});
                        } else { newStarHeader.style.padding = 'var(--mp4-padding-medium) 5px'; }

                        if (referenceHeader) headerRow.insertBefore(newStarHeader, referenceHeader);
                        else if (headerRow.firstChild) headerRow.insertBefore(newStarHeader, headerRow.firstChild);
                        else headerRow.appendChild(newStarHeader);
                        table.dataset.starColumnAdded = 'true';

                        let userHeader = headers.find(th => userHeaderTexts.some(txt => th.innerText.trim().toUpperCase() === txt.toUpperCase()));
                        if (userHeader) {
                            const newWidth = '280px'; userHeader.style.width = newWidth; userHeader.style.minWidth = newWidth;
                            table.dataset.userColumnWidened = 'true';
                        }
                    }
                }

                let starColumnActualIndex = -1;
                table.querySelectorAll('thead th').forEach((th, index) => { if (th.querySelector('i.fa-star')) starColumnActualIndex = index; });
                if (starColumnActualIndex === -1 && table.dataset.starColumnAdded === 'true') starColumnActualIndex = 0;

                document.querySelectorAll('#support_tickets .ticket_row').forEach(row => {
                    const ticketHash = row.getAttribute('data-hash');
                    if (!ticketHash || row.querySelector('.watchlist-star-cell')) return;

                    const cells = row.querySelectorAll('td');
                    let referenceCellForPadding = null;
                    if (starColumnActualIndex !== -1 && cells.length > starColumnActualIndex) {
                        referenceCellForPadding = cells[starColumnActualIndex === 0 ? 0 : starColumnActualIndex -1 ];
                         if (!referenceCellForPadding && cells.length > 0) referenceCellForPadding = cells[0];
                    } else if (cells.length > 0) { referenceCellForPadding = cells[0]; }


                    const newStarCellStyle = { textAlign: 'center', verticalAlign: 'middle', width: '30px' };
                    if (referenceCellForPadding) {
                        const computedStyle = window.getComputedStyle(referenceCellForPadding);
                        Object.assign(newStarCellStyle, { paddingTop: computedStyle.paddingTop, paddingBottom: computedStyle.paddingBottom, paddingLeft: '5px', paddingRight: '5px' });
                    } else { newStarCellStyle.padding = 'var(--mp4-padding-medium) 5px'; }

                    let description = 'Ticket ' + ticketHash;
                    const subjectCell = Array.from(cells).find(cell => cell.getAttribute('onclick')?.includes('ticket_info'));
                    if (subjectCell) {
                        const mutedSpan = subjectCell.querySelector('span.text-muted');
                        if (mutedSpan) {
                            let potentialDescription = mutedSpan.innerText.trim();
                            if (potentialDescription.startsWith('| ')) potentialDescription = potentialDescription.substring(2).trim();
                            if (potentialDescription) description = potentialDescription;
                            else {
                                let fullText = subjectCell.innerText.trim();
                                const tagsSpan = subjectCell.querySelector('span[id*="_tags"]');
                                if (tagsSpan) fullText = fullText.replace(tagsSpan.innerText.trim(), '');
                                if (fullText.toLowerCase().startsWith('other')) fullText = fullText.substring(5).trim();
                                fullText = fullText.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
                                description = fullText || 'Ticket ' + ticketHash;
                            }
                        } else {
                            let fullText = subjectCell.innerText.trim();
                            const tagsSpan = subjectCell.querySelector('span[id*="_tags"]');
                            if (tagsSpan) fullText = fullText.replace(tagsSpan.innerText.trim(), '');
                            if (fullText.toLowerCase().startsWith('other')) fullText = fullText.substring(5).trim();
                            fullText = fullText.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
                            description = fullText || 'Ticket ' + ticketHash;
                        }
                    }
                    const ticketDescription = description;
                    const starButtonIcon = self.createButton(ticketHash, ticketDescription);
                    Object.assign(starButtonIcon.style, { verticalAlign: 'middle', display: 'inline-block' });

                    const newStarCell = h('td', { classList: ['watchlist-star-cell'], style: newStarCellStyle }, [starButtonIcon]);

                    if (starColumnActualIndex !== -1 && cells.length >= starColumnActualIndex) row.insertBefore(newStarCell, cells[starColumnActualIndex]);
                    else if (cells.length > 0) row.prepend(newStarCell);
                    else row.appendChild(newStarCell);
                });
                if (table.dataset.starColumnAdded === 'true') {
                    const ticketInfoCells = table.querySelectorAll('td.ticket_info[colspan]');
                    const currentHeaderCount = table.querySelector('thead tr').children.length;
                    ticketInfoCells.forEach(cell => {
                        if (cell.getAttribute('colspan') != currentHeaderCount.toString()) {
                            cell.setAttribute('colspan', currentHeaderCount);
                        }
                    });
                }
            }
        }
    };

    const MainAppModule = {
        state: {
            processedTextareas: new Map(),
            pasteCount: 0,
            userTicketCount: null,
            rawTeamStats: [],
            currentTeamStatsPage: 1,
            currentHistoryPage: 1,
            currentBaseTheme: 'light',
            mp4DailyGoalPercent: CONFIG.DEFAULT_MP4_GOAL,
            customThemeEnabled: false,
            customThemeSettings: {},
            savedThemes: {},
            keyboardShortcuts: {},
            settingsPanelStates: {},
            defaultStartView: CONFIG.MODAL_VIEWS.DASHBOARD,
            dashboardWidgets: []
        },
        ui: {
            counterLinkSpan: null,
            modalElement: null,
            teamStatsFilterContainer: null,
            selectedTeamMembersInput: null,
            mp4UsernameInput: null,
            currentFilterDisplay: null,
            additionalStatsContainer: null,
            additionalStatsContent: null,
            mp4ModalContent: null,
            notificationArea: null,
            mp4UserSettingsContainer: null,
            mp4GoalInput: null,
            mp4GoalProgressDisplay: null,
            mp4GoalProgressLabel: null,
            mp4GoalProgressBarContainer: null,
            mp4GoalProgressBarFill: null,
            mp4GoalProgressBarText: null,
            customThemeOptionsContainer: null,
            savedThemesListContainer: null,
            inputSaveThemeName: null,
            keyboardShortcutsContainer: null,
            defaultStartViewSelect: null,
            dashboardWidgetConfigContainer: null
        },
        _historyEventListenerAttached: false,
        CUSTOMIZABLE_COLORS: [
            { key: 'modal-bg', label: 'Tło Modala', defaultLight: '#FFFFFF', defaultDark: '#323B44' },
            { key: 'modal-text', label: 'Tekst Modala', defaultLight: '#333333', defaultDark: '#bfc3c6' },
            { key: 'modal-h2-color', label: 'Nagłówek Główny (H2)', defaultLight: '#333333', defaultDark: '#bfc3c6' },
            { key: 'modal-h4-color', label: 'Podnagłówki (H4)', defaultLight: '#007bff', defaultDark: '#3bafda' },
            { key: 'btn-generic-text', label: 'Tekst na Przyciskach', defaultLight: '#FFFFFF', defaultDark: '#E0E0E0' },
            { key: 'btn-green-bg', label: 'Przycisk Zielony', defaultLight: '#28a745', defaultDark: '#3E7240' },
            { key: 'btn-blue-bg', label: 'Przycisk Niebieski', defaultLight: '#007bff', defaultDark: '#3A668A' },
            { key: 'btn-red-bg', label: 'Przycisk Czerwony', defaultLight: '#dc3545', defaultDark: '#A04040' },
            { key: 'btn-purple-bg', label: 'Przycisk Fioletowy', defaultLight: '#6f42c1', defaultDark: '#6A4A8C' },
            { key: 'btn-orange-bg', label: 'Przycisk Pomarańczowy', defaultLight: '#fd7e14', defaultDark: '#B07030' },
            { key: 'btn-cyan-bg', label: 'Przycisk Turkusowy', defaultLight: '#17a2b8', defaultDark: '#388E8E' },
            { key: 'btn-grey-bg', label: 'Przycisk Szary', defaultLight: '#6c757d', defaultDark: '#5a6268' },
            { key: 'btn-theme-toggle-bg', label: 'Przycisk Zmiany Motywu Baz.', defaultLight: '#6c757d', defaultDark: '#4A5560' },
            { key: 'table-header-bg', label: 'Tło Nagłówka Tabeli', defaultLight: '#E9ECEF', defaultDark: '#3a424a' },
            { key: 'table-border-color', label: 'Obramowanie Tabeli', defaultLight: '#DEE2E6', defaultDark: '#555555' },
            { key: 'table-text-color', label: 'Tekst w Tabeli', defaultLight: '#333333', defaultDark: '#bfc3c6' },
            { key: 'input-bg', label: 'Tło Pól Input', defaultLight: '#FFFFFF', defaultDark: '#2c333a' },
            { key: 'input-text', label: 'Tekst Pól Input', defaultLight: '#333333', defaultDark: '#bfc3c6' },
            { key: 'input-border', label: 'Obramowanie Pól Input', defaultLight: '#CED4DA', defaultDark: '#444444' },
            { key: 'form-bg', label: 'Tło Formularzy/Paneli', defaultLight: '#f0f0f0', defaultDark: '#2D343C' },
            { key: 'filter-label-color', label: 'Etykiety Filtrów', defaultLight: '#495057', defaultDark: '#bfc3c6' },
            { key: 'filter-container-border', label: 'Obram. Kontenera Filtrów', defaultLight: '#DEE2E6', defaultDark: '#444444' },
            { key: 'watchlist-star-inactive', label: 'Gwiazdka Watchlisty (Nieaktywna)', defaultLight: '#bbbbbb', defaultDark: '#555555' },
            { key: 'watchlist-star-active', label: 'Gwiazdka Watchlisty (Aktywna)', defaultLight: '#F8D210', defaultDark: '#F8D210' },
            { key: 'link-color-base', label: 'Kolor Linku Licznika (Menu)', defaultLight: '#6c757d', defaultDark: '#bfc3c6' },
            { key: 'dashboard-widget-bg', label: 'Tło Widgetu Dashboardu', defaultLight: '#f9f9f9', defaultDark: '#282e34' }
        ],
        CONFIGURABLE_SHORTCUT_ACTIONS: [
            { id: 'toggleMainModal', label: 'Otwórz/Zamknij Modal Główny', func: () => {
                const modal = MainAppModule.ui.modalElement;
                if (modal) {
                    modal.classList.toggle("show");
                    if (modal.classList.contains("show")) {
                        MainAppModule.applyTheme();
                        MainAppModule.showMainContentArea(MainAppModule.state.defaultStartView);
                        if ((MainAppModule.state.defaultStartView === CONFIG.MODAL_VIEWS.STATS || MainAppModule.state.defaultStartView === CONFIG.MODAL_VIEWS.DASHBOARD) &&
                            (MainAppModule.state.rawTeamStats.length === 0 || MainAppModule.state.userTicketCount === null) ) {
                                MainAppModule.fetchStatisticsData();
                        }
                    } else {
                        MainAppModule.showMainContentArea('none');
                    }
                }
            }},
            { id: 'incrementMp4', label: 'Zwiększ Licznik MP4 (+1)', func: () => document.getElementById(CONFIG.ELEMENT_IDS.BTN_PLUS)?.click() },
            { id: 'decrementMp4', label: 'Zmniejsz Licznik MP4 (-1)', func: () => document.getElementById(CONFIG.ELEMENT_IDS.BTN_MINUS)?.click() },
            { id: 'resetMp4', label: 'Resetuj Licznik MP4', func: () => document.getElementById(CONFIG.ELEMENT_IDS.BTN_RESET)?.click() },
            { id: 'showDashboard', label: 'Pokaż Dashboard', func: () => { if(!MainAppModule.ui.modalElement?.classList.contains("show")) MainAppModule.CONFIGURABLE_SHORTCUT_ACTIONS.find(a=>a.id==='toggleMainModal').func(); MainAppModule.showMainContentArea(CONFIG.MODAL_VIEWS.DASHBOARD);}},
            { id: 'showTeamStats', label: 'Pokaż Statystyki Zespołu', func: () => { if(!MainAppModule.ui.modalElement?.classList.contains("show")) MainAppModule.CONFIGURABLE_SHORTCUT_ACTIONS.find(a=>a.id==='toggleMainModal').func(); MainAppModule.showMainContentArea(CONFIG.MODAL_VIEWS.STATS);}},
            { id: 'showMp4Percentage', label: 'Pokaż Procent MP4', func: () => { if(!MainAppModule.ui.modalElement?.classList.contains("show")) MainAppModule.CONFIGURABLE_SHORTCUT_ACTIONS.find(a=>a.id==='toggleMainModal').func(); MainAppModule.showMainContentArea(CONFIG.MODAL_VIEWS.MP4_PERCENTAGE); MainAppModule.calculatePercentage(); }},
            { id: 'showMp4History', label: 'Pokaż Historię MP4', func: () => { if(!MainAppModule.ui.modalElement?.classList.contains("show")) MainAppModule.CONFIGURABLE_SHORTCUT_ACTIONS.find(a=>a.id==='toggleMainModal').func(); MainAppModule.showMainContentArea(CONFIG.MODAL_VIEWS.MP4_HISTORY); MainAppModule.updateHistoryTable(); }},
            { id: 'showWatchlist', label: 'Pokaż Watchlistę', func: () => { if(!MainAppModule.ui.modalElement?.classList.contains("show")) MainAppModule.CONFIGURABLE_SHORTCUT_ACTIONS.find(a=>a.id==='toggleMainModal').func(); MainAppModule.showMainContentArea(CONFIG.MODAL_VIEWS.WATCHLIST); WatchlistModule.state.currentModalView = CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS; WatchlistModule.updateModal(); }},
            { id: 'showSettingsView', label: 'Pokaż Ustawienia Skryptu', func: () => { if(!MainAppModule.ui.modalElement?.classList.contains("show")) MainAppModule.CONFIGURABLE_SHORTCUT_ACTIONS.find(a=>a.id==='toggleMainModal').func(); MainAppModule.showMainContentArea(CONFIG.MODAL_VIEWS.SETTINGS); }},
            { id: 'toggleBaseThemeShortcut', label: 'Przełącz Motyw Bazowy', func: () => document.getElementById(CONFIG.ELEMENT_IDS.BTN_TOGGLE_THEME)?.click() }
        ],

        init: function () {
            this.state.pasteCount = localStorage.getItem(CONFIG.STORAGE_KEYS.MP4_PASTE_COUNT) ? parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.MP4_PASTE_COUNT)) : 0;
            this.state.currentBaseTheme = GM_getValue(CONFIG.STORAGE_KEYS.GLOBAL_THEME, 'light');
            this.state.mp4DailyGoalPercent = this.getStoredMp4Goal();
            this.loadCustomThemeSettings();
            this.loadSavedThemes();
            this.loadKeyboardShortcuts();
            this.loadSettingsPanelStates();
            this.state.defaultStartView = GM_getValue(CONFIG.STORAGE_KEYS.DEFAULT_START_VIEW, CONFIG.MODAL_VIEWS.DASHBOARD);
            const storedWidgets = GM_getValue(CONFIG.STORAGE_KEYS.DASHBOARD_WIDGETS);
            if (Array.isArray(storedWidgets)) {
                this.state.dashboardWidgets = storedWidgets.filter(id =>
                    Object.values(CONFIG.AVAILABLE_DASHBOARD_WIDGETS).some(widgetConf => widgetConf.id === id)
                );
                if (!this.state.dashboardWidgets.includes(CONFIG.AVAILABLE_DASHBOARD_WIDGETS.MP4_TARGET_INFO.id) &&
                    (storedWidgets.includes('mp4GoalProgress') || storedWidgets.includes('basicStats'))) {
                    this.state.dashboardWidgets.unshift(CONFIG.AVAILABLE_DASHBOARD_WIDGETS.MP4_TARGET_INFO.id);
                }
                if (this.state.dashboardWidgets.length === 0) {
                    this.state.dashboardWidgets = [CONFIG.AVAILABLE_DASHBOARD_WIDGETS.MP4_TARGET_INFO.id, CONFIG.AVAILABLE_DASHBOARD_WIDGETS.WATCHLIST_DEADLINES.id];
                }
            } else {
                this.state.dashboardWidgets = [CONFIG.AVAILABLE_DASHBOARD_WIDGETS.MP4_TARGET_INFO.id, CONFIG.AVAILABLE_DASHBOARD_WIDGETS.WATCHLIST_DEADLINES.id];
            }


            this.initUI();
            this.registerEventListeners();
            this.initKeyboardShortcutListener();
            this.applyTheme();
            this.updateCounterDisplay();
            this.fetchStatisticsData();
        },

        createCollapsiblePanel: function(id, title, contentElements, isOpenInitially_param = false) { // parametr isOpenInitially_param jest teraz mniej istotny dla wizualnego startu
    const self = this;

    // Strzałka będzie domyślnie wskazywać na zwinięty panel
    const arrowSpan = h('span', { classList: ['panel-arrow'], innerHTML: '&#9654;'});

    const summary = h('summary', { classList: ['settings-panel-header'] }, [
        h('span', {textContent: title}),
        arrowSpan
    ]);

    const details = h('details', {
        id: `settings-panel-${id}`,
        // Ustawiamy `open: false` aby panel zawsze startował zwinięty wizualnie.
        // Zapisany stan (jeśli istnieje) zostanie użyty przez logikę przełączania (toggle).
        open: false,
        eventListeners: {
            toggle: function() {
                // Aktualizuj strzałkę na podstawie stanu open/closed
                arrowSpan.innerHTML = this.open ? '&#9660;' : '&#9654;';
                // Zapisz aktualny stan (rozwinięty/zwinięty)
                self.state.settingsPanelStates[id] = this.open;
                GM_setValue(CONFIG.STORAGE_KEYS.SETTINGS_PANEL_STATE, self.state.settingsPanelStates);
            }
        }
    }, [summary]);

           const contentContainer = h('div', { classList: ['settings-panel-content'] }, contentElements);
    details.appendChild(contentContainer);
    return details;
},

        loadSettingsPanelStates: function() {
            this.state.settingsPanelStates = GM_getValue(CONFIG.STORAGE_KEYS.SETTINGS_PANEL_STATE, {});
        },


        initUI: function() {
            const navMenu = document.querySelector('.navigation-menu');
            if (!navMenu) { return; }
            let counterLinkElement = navMenu.querySelector('.mp4-link');
            if (!counterLinkElement) {
                counterLinkElement = h('div', { classList: ['mp4-link'] }, [ h('span', { classList: ['mp4-counter'], textContent: 'Ładowanie...' }) ]);
                navMenu.appendChild(counterLinkElement);
            }
            this.ui.counterLinkSpan = counterLinkElement.querySelector(".mp4-counter");

            let modalElement = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL);
            if (!modalElement) {
                this.ui.customThemeOptionsContainer = h('div', {
                    id: CONFIG.ELEMENT_IDS.CUSTOM_THEME_OPTIONS_CONTAINER,
                    style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }
                });

                this.CUSTOMIZABLE_COLORS.forEach(colorConf => {
                    const pickerId = `customColor_${colorConf.key}`;
                    const pickerDiv = h('div', {style: {display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '4px', border: '1px solid var(--mp4-table-border-color)', borderRadius:'var(--mp4-border-radius)'}}, [
                        h('label', {htmlFor: pickerId, textContent: `${colorConf.label}:`, style: {marginRight: '10px', flexShrink: 0, fontSize: 'var(--mp4-font-size-small)'}}),
                        h('input', {type: 'color', id: pickerId, dataset: {cssVarKey: colorConf.key}, style: {width: '50px', height:'25px', padding: '0 2px', border: '1px solid var(--mp4-input-border)', borderRadius: 'var(--mp4-border-radius)'}})
                    ]);
                    this.ui.customThemeOptionsContainer.appendChild(pickerDiv);
                });
                const customThemeGlobalButtonsContainer = h('div', {style: {gridColumn: '1 / -1', textAlign: 'center', marginTop: '15px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '5px', borderTop: '1px solid var(--mp4-table-border-color)', paddingTop: '15px'}}, [
                    h('button', {classList:['mp4-btn', 'green', 'small-text'], id:CONFIG.ELEMENT_IDS.BTN_APPLY_SAVE_CUSTOM_THEME, textContent:'Zastosuj i Zapisz'}),
                    h('button', {classList:['mp4-btn', 'orange', 'small-text'], id:CONFIG.ELEMENT_IDS.BTN_DISABLE_CUSTOM_THEME, textContent:'Wyłącz Niestandardowe'}),
                    h('button', {classList:['mp4-btn', 'red', 'small-text'], id:CONFIG.ELEMENT_IDS.BTN_RESET_CUSTOM_THEME, textContent:'Resetuj Niestandardowe'}),
                ]);
                this.ui.customThemeOptionsContainer.appendChild(customThemeGlobalButtonsContainer);

                this.ui.inputSaveThemeName = h('input', {type: 'text', id: CONFIG.ELEMENT_IDS.INPUT_SAVE_THEME_NAME, placeholder: 'Nazwa nowego motywu...', style: {width: 'calc(100% - 120px)', padding: 'var(--mp4-padding-small)', marginRight: '5px', verticalAlign: 'middle'}});
                const savePresetButton = h('button', {classList:['mp4-btn', 'blue', 'small-text'], id:CONFIG.ELEMENT_IDS.BTN_SAVE_CURRENT_AS_PRESET, textContent:'Zapisz bieżące', style:{verticalAlign: 'middle', padding: 'var(--mp4-padding-small) 8px'}});
                const savePresetContainer = h('div', {style:{gridColumn: '1 / -1', marginTop: '20px', borderTop: '1px solid var(--mp4-table-border-color)', paddingTop: '15px'}}, [
                    h('h6', {textContent: 'Zapisz jako nowy motyw:', style: {marginTop:0, marginBottom:'8px', textAlign:'center'}}),
                    h('div', {style: {display: 'flex'}}, [this.ui.inputSaveThemeName, savePresetButton])
                ]);
                this.ui.customThemeOptionsContainer.appendChild(savePresetContainer);

                this.ui.savedThemesListContainer = h('div', {id: CONFIG.ELEMENT_IDS.SAVED_THEMES_LIST_CONTAINER, style: {gridColumn: '1 / -1', marginTop: '15px', borderTop: '1px solid var(--mp4-table-border-color)', paddingTop: '15px'}});
                this.ui.customThemeOptionsContainer.appendChild(h('h6', {textContent: 'Zapisane Motywy Niestandardowe:', style: {marginTop:'15px', marginBottom:'10px', textAlign:'center', gridColumn: '1 / -1'}}));
                this.ui.customThemeOptionsContainer.appendChild(this.ui.savedThemesListContainer);

                this.ui.mp4UserSettingsContainer = h('div', {id: CONFIG.ELEMENT_IDS.MP4_USER_SETTINGS_CONTAINER, style:{display: 'none', marginTop:'10px', marginBottom: '15px'}});

                const startViewOptions = [
                    { value: CONFIG.MODAL_VIEWS.DASHBOARD, text: 'Dashboard' },
                    { value: CONFIG.MODAL_VIEWS.STATS, text: 'Statystyki Zespołu' },
                    { value: CONFIG.MODAL_VIEWS.MP4_PERCENTAGE, text: 'Procent MP4' },
                    { value: CONFIG.MODAL_VIEWS.MP4_HISTORY, text: 'Historia MP4' },
                    { value: CONFIG.MODAL_VIEWS.WATCHLIST, text: 'Watchlist' },
                    { value: CONFIG.MODAL_VIEWS.SETTINGS, text: 'Ustawienia Skryptu' },
                ];
                this.ui.defaultStartViewSelect = h('select', { id: CONFIG.ELEMENT_IDS.DEFAULT_START_VIEW_SELECT, style: { width: '100%', padding: 'var(--mp4-padding-small)', marginBottom: '10px'}},
                    startViewOptions.map(opt => h('option', {value: opt.value, textContent: opt.text}))
                );

                this.ui.dashboardWidgetConfigContainer = h('div', {id: CONFIG.ELEMENT_IDS.DASHBOARD_WIDGET_CONFIG_CONTAINER, style: {marginTop: '10px'}});
                Object.values(CONFIG.AVAILABLE_DASHBOARD_WIDGETS).forEach(widgetConf => {
                    const checkboxId = `widget-checkbox-${widgetConf.id}`;
                    const checkbox = h('input', { type: 'checkbox', id: checkboxId, dataset: { widgetId: widgetConf.id }, style: { marginRight: '8px' } });
                    const label = h('label', { htmlFor: checkboxId, textContent: widgetConf.label, style: { fontWeight: 'normal', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' } });
                    this.ui.dashboardWidgetConfigContainer.appendChild(h('div', {style: {marginBottom: '5px'}}, [checkbox, label]));
                });

                const dashboardSettingsContent = [
                    h('label', { htmlFor: CONFIG.ELEMENT_IDS.DEFAULT_START_VIEW_SELECT, style: { display: 'block', marginBottom: '2px', marginTop: '5px'}, textContent: 'Domyślny widok po otwarciu modala:'}),
                    this.ui.defaultStartViewSelect,
                    h('hr', {class:'settings-hr'}),
                    h('h5', {textContent: 'Widgety na Dashboardzie:', style: {textAlign: 'center', marginBottom: '10px', marginTop: '15px'}}),
                    this.ui.dashboardWidgetConfigContainer,
                    h('button', {classList:['mp4-btn', 'blue'], textContent: 'Zapisz Ustawienia Dashboardu', style: {marginTop: '15px', width: '100%'}, eventListeners: {click: () => this.saveDashboardSettings()}})
                ];
                 this.ui.mp4UserSettingsContainer.appendChild(this.createCollapsiblePanel('dashboardStart', 'Dashboard i Widok Startowy', dashboardSettingsContent, this.state.settingsPanelStates.dashboardStart === true));


                const generalSettingsContent = [
                    h('label', { htmlFor: CONFIG.ELEMENT_IDS.MP4_USERNAME_INPUT, style: { display: 'block', marginBottom: '2px', marginTop: '5px'}, textContent: 'Nazwa użytkownika dla statystyk MP4:'}),
                    h('div', {style: {display: 'flex', alignItems: 'center', marginBottom: '15px'}}, [
                        h('input', { type: 'text', id: CONFIG.ELEMENT_IDS.MP4_USERNAME_INPUT, style: { flexGrow: '1', marginRight: '8px', padding: 'var(--mp4-padding-small)' }}),
                        h('button', { classList: ['mp4-btn', 'blue'], id: CONFIG.ELEMENT_IDS.BTN_SAVE_MP4_USERNAME, textContent: 'Zapisz Nazwę'})
                    ]),
                    h('hr', {class:'settings-hr'}),
                    h('label', { htmlFor: CONFIG.ELEMENT_IDS.MP4_GOAL_INPUT, style: { display: 'block', marginBottom: '2px', marginTop: '15px'}, textContent: 'Dzienny cel MP4 (% wiadomości):'}),
                    h('div', {style: {display: 'flex', alignItems: 'center', marginBottom: '10px'}}, [
                        h('input', { type: 'number', id: CONFIG.ELEMENT_IDS.MP4_GOAL_INPUT, min: "0", max: "100", step:"1", style: { flexGrow: '1', marginRight: '8px', padding: 'var(--mp4-padding-small)' }}),
                        h('button', { classList: ['mp4-btn', 'green'], id: CONFIG.ELEMENT_IDS.BTN_SAVE_MP4_GOAL, textContent: 'Zapisz Cel'})
                    ]),
                ];
                this.ui.mp4UserSettingsContainer.appendChild(this.createCollapsiblePanel('general', 'Ustawienia Ogólne', generalSettingsContent, this.state.settingsPanelStates.general === true));


                const themeSettingsContent = [
                    h('h5', {textContent: 'Motyw Bazowy', style: {textAlign: 'center', marginBottom: '10px', marginTop: '10px'}}),
                    h('div', {style: {textAlign: 'center', marginBottom: '15px'}}, [
                        h('button', {classList:['mp4-btn', 'theme-toggle'], id:CONFIG.ELEMENT_IDS.BTN_TOGGLE_THEME, title:'Zmień motyw bazowy'})
                    ]),
                    h('hr', {class:'settings-hr'}),
                    h('h5', {textContent: 'Kolory Niestandardowe', style: {textAlign: 'center', marginBottom: '10px', marginTop: '15px'}}),
                    this.ui.customThemeOptionsContainer
                ];
                this.ui.mp4UserSettingsContainer.appendChild(this.createCollapsiblePanel('theme', 'Personalizacja Wyglądu', themeSettingsContent, this.state.settingsPanelStates.theme === true));

                this.ui.keyboardShortcutsContainer = h('div', { id: CONFIG.ELEMENT_IDS.KEYBOARD_SHORTCUTS_CONTAINER, style: { marginTop: '10px'} });
                this.CONFIGURABLE_SHORTCUT_ACTIONS.forEach(action => {
                    const shortcutInputId = `shortcut-input-${action.id}`;
                    const shortcutInput = h('input', {
                        type: 'text',
                        id: shortcutInputId,
                        classList:['shortcut-input-field'],
                        dataset: { actionId: action.id },
                        readOnly: true,
                        placeholder: 'Kliknij i naciśnij skrót',
                        style: { width: '180px', marginLeft: '10px', padding: 'var(--mp4-padding-small)', cursor: 'pointer', textAlign: 'center' }
                    });
                    this.addShortcutInputListeners(shortcutInput);
                    const shortcutRow = h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'} }, [
                        h('label', { htmlFor: shortcutInputId, textContent: `${action.label}:` , style: {fontSize: 'var(--mp4-font-size-normal)'}}),
                        shortcutInput
                    ]);
                    this.ui.keyboardShortcutsContainer.appendChild(shortcutRow);
                });
                this.ui.keyboardShortcutsContainer.appendChild(
                    h('button', { classList:['mp4-btn', 'green'], id: CONFIG.ELEMENT_IDS.BTN_SAVE_KEYBOARD_SHORTCUTS, textContent: 'Zapisz Skróty Klawiszowe', style: {marginTop: '15px', width: '100%'}})
                );
                this.ui.mp4UserSettingsContainer.appendChild(this.createCollapsiblePanel('shortcuts', 'Skróty Klawiszowe', [this.ui.keyboardShortcutsContainer], this.state.settingsPanelStates.shortcuts === true));

                this.ui.mp4GoalProgressDisplay = h('div', {id: CONFIG.ELEMENT_IDS.MP4_GOAL_PROGRESS_DISPLAY, style: {display: 'none', padding: '10px 5px', marginBottom: '10px'}});
                this.ui.mp4GoalProgressLabel = h('div', {id: CONFIG.ELEMENT_IDS.MP4_GOAL_PROGRESS_LABEL, style: {textAlign: 'center', fontWeight: 'bold', fontSize: 'var(--mp4-font-size-normal)', marginBottom: '5px'}});
                this.ui.mp4GoalProgressBarContainer = h('div', {id: CONFIG.ELEMENT_IDS.MP4_GOAL_PROGRESS_BAR_CONTAINER, classList: ['mp4-progress-bar-container']});
                this.ui.mp4GoalProgressBarFill = h('div', {id: CONFIG.ELEMENT_IDS.MP4_GOAL_PROGRESS_BAR_FILL, classList: ['mp4-progress-bar-fill']});
                this.ui.mp4GoalProgressBarText = h('div', {id: CONFIG.ELEMENT_IDS.MP4_GOAL_PROGRESS_BAR_TEXT, classList: ['mp4-progress-bar-text']});

                this.ui.mp4GoalProgressBarContainer.append(this.ui.mp4GoalProgressBarFill, this.ui.mp4GoalProgressBarText);
                this.ui.mp4GoalProgressDisplay.append(this.ui.mp4GoalProgressLabel, this.ui.mp4GoalProgressBarContainer);


                const mainActionButtonsContainer = h('div', { classList: ['mp4-button-group'], style: { textAlign:'center', marginBottom: '8px', display: 'flex', flexWrap:'wrap', justifyContent:'center', gap: '5px'} }, [
                    h('button', {classList:['mp4-btn', 'green'], id:CONFIG.ELEMENT_IDS.BTN_PLUS, title:'Zwiększ licznik MP4', innerHTML:'<i class="fa fa-plus"></i> +1 MP4'}),
                    h('button', {classList:['mp4-btn', 'blue'], id:CONFIG.ELEMENT_IDS.BTN_MINUS, title:'Zmniejsz licznik MP4', innerHTML:'<i class="fa fa-minus"></i> -1 MP4'}),
                    h('button', {classList:['mp4-btn', 'red'], id:CONFIG.ELEMENT_IDS.BTN_RESET, title:'Resetuj licznik MP4 (zapisze do historii)', innerHTML:'<i class="fa fa-refresh"></i> Resetuj MP4'})
                ]);

                const viewNavigationButtonsContainer = h('div', { classList: ['mp4-button-group'], style: { textAlign:'center', marginBottom: '15px', borderTop: '1px solid var(--mp4-table-border-color)', borderBottom: '1px solid var(--mp4-table-border-color)', paddingTop:'10px', paddingBottom:'10px', display: 'flex', flexWrap:'wrap', justifyContent:'center', gap: '5px'} }, [
                    h('button', {classList:['mp4-btn', 'grey'], id:CONFIG.ELEMENT_IDS.BTN_DASHBOARD, title:'Pokaż Dashboard', innerHTML:'<i class="fa fa-tachometer"></i> Dashboard'}),
                    h('button', {classList:['mp4-btn', 'cyan'], id:CONFIG.ELEMENT_IDS.BTN_TEAM_STATS, title:'Pokaż statystyki zespołu', innerHTML:'<i class="fa fa-bar-chart"></i> Statystyki Zespołu'}),
                    h('button', {classList:['mp4-btn', 'purple'], id:CONFIG.ELEMENT_IDS.BTN_PERCENT, title:'Pokaż procent MP4 do wiadomości', innerHTML:'<i class="fa fa-percent"></i> Procent MP4'}),
                    h('button', {classList:['mp4-btn', 'orange'], id:CONFIG.ELEMENT_IDS.BTN_HISTORY, title:'Pokaż historię licznika MP4', innerHTML:'<i class="fa fa-history"></i> Historia MP4'}),
                    h('button', {classList:['mp4-btn', 'grey'], id:CONFIG.ELEMENT_IDS.BTN_WATCHLIST, title:'Zarządzaj watchlistą ticketów', innerHTML:'<i class="fa fa-star"></i> Watchlist'}),
                    h('button', {classList:['mp4-btn', 'grey'], id:CONFIG.ELEMENT_IDS.BTN_SETTINGS, title:'Otwórz ustawienia skryptu', innerHTML:'<i class="fa fa-cog"></i> Ustawienia'})
                ]);


                modalElement = h('div', { id: CONFIG.ELEMENT_IDS.MP4_MODAL }, [
                    h('div', {}, [
                        h('span', { classList: ['close-btn'], id: CONFIG.ELEMENT_IDS.MP4_CLOSE_BTN, innerHTML: '&times;' }),
                        h('h2', { textContent: 'Licznik MP4 & Watchlist' }),
                        mainActionButtonsContainer,
                        viewNavigationButtonsContainer,
                        this.ui.mp4GoalProgressDisplay,
                        h('div', {id:CONFIG.ELEMENT_IDS.TEAM_STATS_FILTER_CONTAINER, style:{display: 'none', padding: '10px', borderRadius:'var(--mp4-border-radius)', marginBottom:'10px'}},[
                            h('h4', {textContent: 'Filtruj Statystyki Zespołu'}),
                            h('label', {htmlFor:CONFIG.ELEMENT_IDS.SELECTED_TEAM_MEMBERS_INPUT, style:{marginRight: 'var(--mp4-padding-small)'}, textContent:'Pokaż tylko (imiona/loginy oddzielone przecinkami):'}),
                            h('br'),
                            h('input', {type:'text', id:CONFIG.ELEMENT_IDS.SELECTED_TEAM_MEMBERS_INPUT, style:{width: 'calc(100% - 130px)', marginBottom: 'var(--mp4-padding-small)', marginTop: 'var(--mp4-padding-small)', padding: 'var(--mp4-padding-small)'}}),
                            h('button', {classList:['mp4-btn', 'blue'], id:CONFIG.ELEMENT_IDS.BTN_SAVE_TEAM_FILTER, style:{padding: 'var(--mp4-padding-small) var(--mp4-padding-medium)', marginLeft: 'var(--mp4-padding-small)'}, textContent:'Zastosuj Filtr'}),
                            h('div', {id:CONFIG.ELEMENT_IDS.CURRENT_FILTER_DISPLAY, style:{marginTop:'var(--mp4-padding-small)'}})
                        ]),
                        this.ui.mp4UserSettingsContainer,
                        h('div', {id:CONFIG.ELEMENT_IDS.ADDITIONAL_STATS_CONTAINER, style:{display: 'none'}},[
                            h('h4', {textContent: 'Statystyki wiadomości (zespół):'}),
                            h('div', {id:CONFIG.ELEMENT_IDS.ADDITIONAL_STATS_CONTENT, style:{padding: '0px 10px 10px 10px'}, textContent:'Ładowanie...'})
                        ]),
                        h('div', {id:CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT, style:{display: 'none'}})
                    ])
                ]);
                document.body.appendChild(modalElement);
            }
            this.ui.modalElement = modalElement;
            this.ui.teamStatsFilterContainer = document.getElementById(CONFIG.ELEMENT_IDS.TEAM_STATS_FILTER_CONTAINER);
            this.ui.selectedTeamMembersInput = document.getElementById(CONFIG.ELEMENT_IDS.SELECTED_TEAM_MEMBERS_INPUT);
            this.ui.mp4UsernameInput = document.getElementById(CONFIG.ELEMENT_IDS.MP4_USERNAME_INPUT);
            this.ui.currentFilterDisplay = document.getElementById(CONFIG.ELEMENT_IDS.CURRENT_FILTER_DISPLAY);
            this.ui.additionalStatsContainer = document.getElementById(CONFIG.ELEMENT_IDS.ADDITIONAL_STATS_CONTAINER);
            this.ui.additionalStatsContent = document.getElementById(CONFIG.ELEMENT_IDS.ADDITIONAL_STATS_CONTENT);
            this.ui.mp4ModalContent = document.getElementById(CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT);
            this.ui.mp4GoalInput = document.getElementById(CONFIG.ELEMENT_IDS.MP4_GOAL_INPUT);
            this.ui.defaultStartViewSelect = document.getElementById(CONFIG.ELEMENT_IDS.DEFAULT_START_VIEW_SELECT);
            this.ui.dashboardWidgetConfigContainer = document.getElementById(CONFIG.ELEMENT_IDS.DASHBOARD_WIDGET_CONFIG_CONTAINER);


            let notificationAreaEl = document.getElementById('mp4-notification-area-id');
            if (!notificationAreaEl) {
                notificationAreaEl = h('div', {id: 'mp4-notification-area-id', classList: ['mp4-notification-area']});
                document.body.appendChild(notificationAreaEl);
            }
            this.ui.notificationArea = notificationAreaEl;
        },
handleWidgetOrderChange: function(widgetId, direction) {
    const index = this.state.dashboardWidgets.indexOf(widgetId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
        [this.state.dashboardWidgets[index], this.state.dashboardWidgets[index - 1]] = [this.state.dashboardWidgets[index - 1], this.state.dashboardWidgets[index]];
    } else if (direction === 'down' && index < this.state.dashboardWidgets.length - 1) {
        [this.state.dashboardWidgets[index], this.state.dashboardWidgets[index + 1]] = [this.state.dashboardWidgets[index + 1], this.state.dashboardWidgets[index]];
    }

    // Odśwież UI tylko jeśli odpowiedni panel jest otwarty i widoczny
    if (this.ui.mp4UserSettingsContainer.style.display === 'block' && document.getElementById('settings-panel-dashboardStart')?.open) {
        this.populateDashboardSettings();
    }
},

handleWidgetCheckboxChange: function(widgetId, isChecked) {
    const currentlyEnabled = this.state.dashboardWidgets.includes(widgetId);
    if (isChecked && !currentlyEnabled) {
        this.state.dashboardWidgets.push(widgetId);
    } else if (!isChecked && currentlyEnabled) {
        this.state.dashboardWidgets = this.state.dashboardWidgets.filter(id => id !== widgetId);
    }

    // Odśwież UI tylko jeśli odpowiedni panel jest otwarty i widoczny
    if (this.ui.mp4UserSettingsContainer.style.display === 'block' && document.getElementById('settings-panel-dashboardStart')?.open) {
        this.populateDashboardSettings();
    }
},

        handleWidgetCheckboxChange: function(widgetId, isChecked) {
            if (isChecked) {
                if (!this.state.dashboardWidgets.includes(widgetId)) {
                    this.state.dashboardWidgets.push(widgetId); // Dodaj na koniec listy włączonych
                }
            } else {
                this.state.dashboardWidgets = this.state.dashboardWidgets.filter(id => id !== widgetId);
            }
            this.populateDashboardSettings(); // Odśwież UI konfiguracji widgetów
        },
           saveDashboardSettings: function() {
    if (this.ui.defaultStartViewSelect) {
        const selectedView = this.ui.defaultStartViewSelect.value;
        this.state.defaultStartView = selectedView;
        GM_setValue(CONFIG.STORAGE_KEYS.DEFAULT_START_VIEW, selectedView);
    }

    // Kolejność i wybór widgetów są już w this.state.dashboardWidgets
    GM_setValue(CONFIG.STORAGE_KEYS.DASHBOARD_WIDGETS, this.state.dashboardWidgets);

    this.showNotification("Ustawienia dashboardu zapisane.", "success");
    this.refreshDashboardIfNeeded(); // Odśwież dashboard jeśli jest widoczny
},

         populateDashboardSettings: function() {
    const self = this; // Dla zachowania kontekstu 'this' w event listenerach
    if (this.ui.defaultStartViewSelect) {
        this.ui.defaultStartViewSelect.value = this.state.defaultStartView;
    }
    if (!this.ui.dashboardWidgetConfigContainer) return;

    this.ui.dashboardWidgetConfigContainer.innerHTML = ''; // Wyczyść

    // 1. Włączone widgety (w kolejności z this.state.dashboardWidgets)
    this.state.dashboardWidgets.forEach((widgetId, index) => {
        const widgetConf = Object.values(CONFIG.AVAILABLE_DASHBOARD_WIDGETS).find(w => w.id === widgetId);
        if (!widgetConf) return;

        const checkboxId = `widget-checkbox-${widgetConf.id}`;
        const checkbox = h('input', {
            type: 'checkbox', id: checkboxId, dataset: { widgetId: widgetConf.id }, checked: true, style: { marginRight: '10px', transform: 'scale(1.2)' },
            eventListeners: { change: (e) => self.handleWidgetCheckboxChange(widgetConf.id, e.target.checked) }
        });
        const label = h('label', { htmlFor: checkboxId, textContent: widgetConf.label, style: { fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', flexGrow: 1 } });
        const upButton = h('button', {
            classList: ['mp4-btn', 'grey', 'small-text', 'widget-order-btn'], innerHTML: '<i class="fa fa-arrow-up"></i>', style: { marginLeft: 'auto', padding: '3px 7px'},
            disabled: index === 0,
            eventListeners: { click: () => self.handleWidgetOrderChange(widgetConf.id, 'up') }
        });
        const downButton = h('button', {
            classList: ['mp4-btn', 'grey', 'small-text', 'widget-order-btn'], innerHTML: '<i class="fa fa-arrow-down"></i>', style: { marginLeft: '5px', padding: '3px 7px'},
            disabled: index === self.state.dashboardWidgets.length - 1,
            eventListeners: { click: () => self.handleWidgetOrderChange(widgetConf.id, 'down') }
        });

        this.ui.dashboardWidgetConfigContainer.appendChild(
            h('div', { classList: ['widget-config-row', 'enabled-widget-row'], style: { display: 'flex', alignItems: 'center', marginBottom: '6px', padding: '10px', border: '1px solid var(--mp4-input-border)', borderRadius: 'var(--mp4-border-radius)' } },
                [checkbox, label, upButton, downButton]
            )
        );
    });

    // Separator (opcjonalnie)
    if (this.state.dashboardWidgets.length > 0 && Object.values(CONFIG.AVAILABLE_DASHBOARD_WIDGETS).some(wc => !this.state.dashboardWidgets.includes(wc.id))) {
         this.ui.dashboardWidgetConfigContainer.appendChild(h('hr', {style: {margin: '15px 0', borderTop: '1px dashed var(--mp4-table-border-color)'}}));
    }


    // 2. Wyłączone widgety
    Object.values(CONFIG.AVAILABLE_DASHBOARD_WIDGETS).forEach(widgetConf => {
        if (!self.state.dashboardWidgets.includes(widgetConf.id)) {
            const checkboxId = `widget-checkbox-${widgetConf.id}`;
            const checkbox = h('input', {
                type: 'checkbox', id: checkboxId, dataset: { widgetId: widgetConf.id }, checked: false, style: { marginRight: '10px', transform: 'scale(1.2)' },
                eventListeners: { change: (e) => self.handleWidgetCheckboxChange(widgetConf.id, e.target.checked) }
            });
            const label = h('label', { htmlFor: checkboxId, textContent: widgetConf.label, style: { fontWeight: 'normal', cursor: 'pointer', display: 'flex', alignItems: 'center', flexGrow: 1, color: 'var(--mp4-modal-text)', opacity: '0.6' } });

            this.ui.dashboardWidgetConfigContainer.appendChild(
                h('div', { classList: ['widget-config-row', 'disabled-widget-row'], style: { display: 'flex', alignItems: 'center', marginBottom: '6px', padding: '10px', border: '1px dashed var(--mp4-input-border)', borderRadius: 'var(--mp4-border-radius)', opacity: '0.7' } },
                    [checkbox, label]
                )
            );
        }
    });
},

        addShortcutInputListeners: function(inputElement) {
            inputElement.addEventListener('focus', function() {
                this.classList.add(CONFIG.CSS_CLASSES.SHORTCUT_INPUT_LISTENING);
                this.dataset.originalValue = this.value;
                this.value = '';
                this.placeholder = 'Naciśnij skrót...';
            });

            inputElement.addEventListener('blur', function() {
                this.classList.remove(CONFIG.CSS_CLASSES.SHORTCUT_INPUT_LISTENING);
                if (this.value === '') {
                    this.value = this.dataset.originalValue || '';
                }
                this.placeholder = 'Kliknij i naciśnij skrót';
            });

            inputElement.addEventListener('keydown', function(event) {
                event.preventDefault();
                event.stopPropagation();

                if (event.key === 'Escape') {
                    this.value = this.dataset.originalValue || '';
                    this.blur();
                    return;
                }
                if (event.key === 'Backspace' || event.key === 'Delete') {
                    this.value = '';
                    this.dataset.originalValue = '';
                    return;
                }

                if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
                    return;
                }

                const keyString = MainAppModule.getKeyStringFromEvent(event);
                if (keyString) {
                    this.value = keyString;
                    this.blur();
                }
            });
        },


        showNotification: function(message, type = 'info', duration = 3000) {
            if (!this.ui.notificationArea) {
                alert(message);
                return;
            }
            const notificationTypeClass = `mp4-notification-${type}`;
            const notificationElement = h('div', {
                classList: ['mp4-notification', notificationTypeClass],
                textContent: message
            });

            this.ui.notificationArea.appendChild(notificationElement);

            if (duration > 0) {
                setTimeout(() => {
                    notificationElement.style.opacity = '0';
                    setTimeout(() => notificationElement.remove(), 500);
                }, duration);
            }
            return notificationElement;
        },

        showConfirmationDialog: function(message, onConfirmCallback, onCancelCallback = null) {
            let overlay;
            const handleEsc = (event) => {
                if (event.key === 'Escape') {
                    closeDialog();
                    if (typeof onCancelCallback === 'function') onCancelCallback();
                }
            };
            const closeDialog = () => {
                if (overlay) {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEsc);
                }
            };

            const confirmBtn = h('button', {
                textContent: 'OK', classList: ['mp4-btn', 'green'],
                eventListeners: { click: () => { closeDialog(); if (typeof onConfirmCallback === 'function') onConfirmCallback(); }}
            });
            const cancelBtn = h('button', {
                textContent: 'Anuluj', classList: ['mp4-btn', 'grey'],
                eventListeners: { click: () => { closeDialog(); if (typeof onCancelCallback === 'function') onCancelCallback(); }}
            });

            const dialog = h('div', { classList: ['mp4-confirmation-dialog'] }, [
                h('p', { textContent: message }),
                h('div', { classList: ['buttons'] }, [cancelBtn, confirmBtn])
            ]);
            overlay = h('div', { classList: ['mp4-confirmation-overlay'] }, [dialog]);
            document.addEventListener('keydown', handleEsc);
            document.body.appendChild(overlay);
            confirmBtn.focus();
        },

        registerEventListeners: function() {
            const self = this;
            if (this.ui.counterLinkSpan && this.ui.counterLinkSpan.parentElement) {
                 this.ui.counterLinkSpan.parentElement.addEventListener("click", () => {
                     self.ui.modalElement.classList.toggle("show");
                     if (self.ui.modalElement.classList.contains("show")) {
                         self.applyTheme();
                         self.showMainContentArea(self.state.defaultStartView);
                         if ((self.state.defaultStartView === CONFIG.MODAL_VIEWS.STATS || self.state.defaultStartView === CONFIG.MODAL_VIEWS.DASHBOARD) &&
                             (self.state.rawTeamStats.length === 0 || self.state.userTicketCount === null) ) {
                                 self.fetchStatisticsData();
                         }
                     } else {
                         self.showMainContentArea('none');
                     }
                 });
            }
            const btnSaveUsername = document.getElementById(CONFIG.ELEMENT_IDS.BTN_SAVE_MP4_USERNAME);
            if (btnSaveUsername) {
                btnSaveUsername.addEventListener('click', () => {
                    if (self.ui.mp4UsernameInput) {
                        const newUsername = self.ui.mp4UsernameInput.value.trim();
                        if (newUsername) self.saveUsername(newUsername);
                        else self.showNotification("Nazwa użytkownika nie może być pusta.", "warning");
                    }
                });
            }
            const btnSaveMp4Goal = document.getElementById(CONFIG.ELEMENT_IDS.BTN_SAVE_MP4_GOAL);
            if (btnSaveMp4Goal) {
                btnSaveMp4Goal.addEventListener('click', () => {
                    if (self.ui.mp4GoalInput) {
                        const newGoal = parseInt(self.ui.mp4GoalInput.value, 10);
                        if (!isNaN(newGoal) && newGoal >= 0 && newGoal <= 100) {
                            self.saveMp4Goal(newGoal);
                        } else {
                            self.showNotification("Cel MP4 musi być liczbą od 0 do 100.", "warning");
                        }
                    }
                });
            }


            document.getElementById(CONFIG.ELEMENT_IDS.BTN_PLUS).onclick = () => { self.state.pasteCount++; self.updateStorageAndDisplay(); };
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_MINUS).onclick = () => { if (self.state.pasteCount > 0) self.state.pasteCount--; self.updateStorageAndDisplay(); };
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_RESET).onclick = () => self.resetPasteCount();
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_TOGGLE_THEME).onclick = () => self.toggleBaseTheme();
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_DASHBOARD).onclick = () => self.showMainContentArea(CONFIG.MODAL_VIEWS.DASHBOARD);
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_TEAM_STATS).onclick = () => self.showMainContentArea(CONFIG.MODAL_VIEWS.STATS);
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_SETTINGS).onclick = () => self.showMainContentArea(CONFIG.MODAL_VIEWS.SETTINGS);

            document.getElementById(CONFIG.ELEMENT_IDS.BTN_PERCENT).onclick = () => {
                self.showMainContentArea(CONFIG.MODAL_VIEWS.MP4_PERCENTAGE);
                self.calculatePercentage();
            };
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_HISTORY).onclick = () => {
                self.showMainContentArea(CONFIG.MODAL_VIEWS.MP4_HISTORY);
                self.state.currentHistoryPage = 1;
                self.updateHistoryTable();
            };
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_SAVE_TEAM_FILTER).onclick = () => {
                self.saveSelectedTeamMembers(self.ui.selectedTeamMembersInput.value);
                self.state.currentTeamStatsPage = 1;
                self.updateAdditionalStatsDisplay();
            };
            document.getElementById(CONFIG.ELEMENT_IDS.MP4_CLOSE_BTN).onclick = () => {
                self.ui.modalElement.classList.remove("show");
                self.showMainContentArea('none');
            };
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_WATCHLIST).onclick = () => {
                self.showMainContentArea(CONFIG.MODAL_VIEWS.WATCHLIST);
                WatchlistModule.state.currentModalView = CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS;
                WatchlistModule.state.currentFilter = 'All';
                WatchlistModule.updateModal();
            };

            document.getElementById(CONFIG.ELEMENT_IDS.BTN_APPLY_SAVE_CUSTOM_THEME).onclick = () => {
                self.saveCustomThemeSettings();
                self.state.customThemeEnabled = true;
                GM_setValue(CONFIG.STORAGE_KEYS.CUSTOM_THEME_ENABLED, "true");
                self.applyTheme();
                self.showNotification("Niestandardowe kolory zastosowane i zapisane.", "success");
            };
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_DISABLE_CUSTOM_THEME).onclick = () => {
                self.state.customThemeEnabled = false;
                GM_setValue(CONFIG.STORAGE_KEYS.CUSTOM_THEME_ENABLED, "false");
                self.applyTheme();
                self.showNotification("Niestandardowe kolory wyłączone.", "info");
            };
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_RESET_CUSTOM_THEME).onclick = () => {
                self.clearCustomThemeSettings();
                self.state.customThemeEnabled = false;
                GM_setValue(CONFIG.STORAGE_KEYS.CUSTOM_THEME_ENABLED, "false");
                self.applyTheme();
                self.showNotification("Niestandardowe kolory zresetowane.", "info");
            };
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_SAVE_CURRENT_AS_PRESET).onclick = () => self.handleSaveCurrentThemeAsPreset();
            document.getElementById(CONFIG.ELEMENT_IDS.BTN_SAVE_KEYBOARD_SHORTCUTS).onclick = () => self.saveKeyboardShortcuts();
            document.addEventListener('click', function(event) {
                if (self.ui.modalElement &&
                    self.ui.modalElement.classList.contains('show') &&
                    !self.ui.modalElement.contains(event.target) &&
                    event.target !== self.ui.modalElement) {

                    const openLink = self.ui.counterLinkSpan ? self.ui.counterLinkSpan.parentElement : null;
                    if (openLink && openLink.contains(event.target)) {
                        return;
                    }

                    if (event.target.classList.contains('watchlist-star') || event.target.closest('.watchlist-star')) {
                        // Zakładając, że funkcje obsługujące gwiazdki (toggleStatus, handleShiftClick)
                        // używają event.stopPropagation(), co jest prawdą w Twoim kodzie.
                        // Jeśli nie, to kliknięcie na gwiazdkę otwierającą modal mogłoby go od razu zamknąć.
                        // Ten return jest tu dla pewności, ale propagacja powinna być zatrzymana wcześniej.
                        return;
                    }

                    // Dodaj tutaj inne warunki `if (...) return;` jeśli są inne specyficzne elementy
                    // na stronie (poza modalem), które otwierają modal lub z nim interagują,
                    // a kliknięcie na nie nie powinno być traktowane jako "click outside".

                    self.ui.modalElement.classList.remove("show");
                    self.showMainContentArea('none');
                }
            }, true);
            document.addEventListener("paste", (event) => {
                let active = document.activeElement;
                if (active && active.tagName === "TEXTAREA") {
                    let pasted = (event.clipboardData || window.clipboardData).getData("text");
                    if (pasted.includes(".mp4")) {
                        let textareaId = active.getAttribute("name") || active.getAttribute("id") || Math.random().toString();
                        if (!self.state.processedTextareas.has(textareaId) || !self.state.processedTextareas.get(textareaId).includes(pasted)) {
                            self.state.pasteCount++;
                            let pastedLinks = self.state.processedTextareas.get(textareaId) || [];
                            pastedLinks.push(pasted);
                            self.state.processedTextareas.set(textareaId, pastedLinks);
                            self.updateStorageAndDisplay();
                        }
                    }
                }
            });
            document.addEventListener('keydown', function(event) {
                // Sprawdzamy, czy modal w ogóle istnieje, jest widoczny
                // i czy naciśnięty klawisz to "Escape".
                if (self.ui.modalElement &&
                    self.ui.modalElement.classList.contains('show') &&
                    event.key === 'Escape') {

                    // Zapobiegamy domyślnemu zachowaniu przeglądarki dla klawisza Escape (jeśli jakieś by było).
                    event.preventDefault();

                    // Zamykamy modal
                    self.ui.modalElement.classList.remove("show");
                    self.showMainContentArea('none');
                }
            });
            document.addEventListener("input", (event) => {
                let active = event.target;
                if (active.tagName === "TEXTAREA") {
                    let textareaId = active.getAttribute("name") || active.getAttribute("id") || null;
                    if (textareaId && self.state.processedTextareas.has(textareaId)) {
                        const previousPastedLinksForThisTextarea = self.state.processedTextareas.get(textareaId);
                        let linksStillPresentCount = 0;
                        const currentTextareaValue = active.value;

                        previousPastedLinksForThisTextarea.forEach(pastedLink => {
                            if (currentTextareaValue.includes(pastedLink)) {
                                linksStillPresentCount++;
                            }
                        });

                        const linksRemovedCount = previousPastedLinksForThisTextarea.length - linksStillPresentCount;

                        if (linksRemovedCount > 0) {
                            self.state.pasteCount -= linksRemovedCount;
                            if (self.state.pasteCount < 0) self.state.pasteCount = 0;

                            if (linksStillPresentCount === 0) {
                                self.state.processedTextareas.delete(textareaId);
                            } else {
                                const remainingLinks = previousPastedLinksForThisTextarea.filter(pLink => currentTextareaValue.includes(pLink));
                                self.state.processedTextareas.set(textareaId, remainingLinks);
                            }
                            self.updateStorageAndDisplay();
                        }
                    }
                }
            });
        },

        loadCustomThemeSettings: function() {
            const storedEnabled = GM_getValue(CONFIG.STORAGE_KEYS.CUSTOM_THEME_ENABLED, "false");
            this.state.customThemeEnabled = (storedEnabled === "true");
            this.state.customThemeSettings = GM_getValue(CONFIG.STORAGE_KEYS.CUSTOM_THEME_SETTINGS, {});
        },

        saveCustomThemeSettings: function() {
            const newSettings = {};
            this.CUSTOMIZABLE_COLORS.forEach(colorConf => {
                const picker = document.getElementById(`customColor_${colorConf.key}`);
                if (picker) {
                    newSettings[colorConf.key] = picker.value;
                }
            });
            this.state.customThemeSettings = newSettings;
            GM_setValue(CONFIG.STORAGE_KEYS.CUSTOM_THEME_SETTINGS, this.state.customThemeSettings);
        },
        clearCustomThemeSettings: function() {
            this.state.customThemeSettings = {};
            GM_setValue(CONFIG.STORAGE_KEYS.CUSTOM_THEME_SETTINGS, {});
        },

        populateCustomColorPickers: function() {
            this.CUSTOMIZABLE_COLORS.forEach(colorConf => {
                const picker = document.getElementById(`customColor_${colorConf.key}`);
                if (picker) {
                    let colorValue;
                    if (this.state.customThemeEnabled && typeof this.state.customThemeSettings[colorConf.key] !== 'undefined') {
                        colorValue = this.state.customThemeSettings[colorConf.key];
                    } else {
                        colorValue = (this.state.currentBaseTheme === 'light') ? colorConf.defaultLight : colorConf.defaultDark;
                    }
                    picker.value = colorValue;
                }
            });
        },

        applyTheme: function () {
            this.CUSTOMIZABLE_COLORS.forEach(colorConf => {
                document.body.style.removeProperty(`--mp4-${colorConf.key}`);
            });

            document.body.classList.remove('mp4-light-theme', 'mp4-dark-theme');
            document.body.classList.add('mp4-' + this.state.currentBaseTheme + '-theme');

            const themeToggleButton = document.getElementById(CONFIG.ELEMENT_IDS.BTN_TOGGLE_THEME);
            if (themeToggleButton) {
                themeToggleButton.innerHTML = `<i class="fa fa-paint-brush"></i> ${this.state.currentBaseTheme === 'light' ? 'Motyw Bazowy: Ciemny' : 'Motyw Bazowy: Jasny'}`;
            }

            if (this.state.customThemeEnabled) {
                if (Object.keys(this.state.customThemeSettings).length > 0) {
                    for (const key in this.state.customThemeSettings) {
                        if (this.state.customThemeSettings.hasOwnProperty(key) && typeof this.state.customThemeSettings[key] === 'string') {
                            const cssVarName = `--mp4-${key}`;
                            const colorValue = this.state.customThemeSettings[key];
                            document.body.style.setProperty(cssVarName, colorValue);
                        }
                    }
                }
            }
            this.populateCustomColorPickers();
            this.refreshDashboardIfNeeded();
        },
        toggleBaseTheme: function () {
            this.state.currentBaseTheme = this.state.currentBaseTheme === 'light' ? 'dark' : 'light';
            GM_setValue(CONFIG.STORAGE_KEYS.GLOBAL_THEME, this.state.currentBaseTheme);
            this.applyTheme();
        },
        saveUsername: function(newUsername) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.USERNAME, newUsername);
            this.state.userTicketCount = null;
            this.updateCounterDisplay();
            this.fetchStatisticsData();
            this.showNotification(`Nazwa użytkownika dla licznika MP4 została zaktualizowana na: ${newUsername}`, 'success');
        },
        saveMp4Goal: function(goalPercent) {
            this.state.mp4DailyGoalPercent = goalPercent;
            localStorage.setItem(CONFIG.STORAGE_KEYS.MP4_DAILY_GOAL_PERCENT, goalPercent.toString());
            this.updateMp4GoalProgressDisplay();
            this.refreshDashboardIfNeeded();
            if (this.ui.modalElement.classList.contains("show") && this.ui.mp4ModalContent.querySelector('.mp4-percentage-view-container')) {
                this.calculatePercentage();
            }
            this.showNotification(`Dzienny cel MP4 został ustawiony na: ${goalPercent}%`, 'success');
        },
        getStoredMp4Goal: function() {
            const storedGoal = localStorage.getItem(CONFIG.STORAGE_KEYS.MP4_DAILY_GOAL_PERCENT);
            return storedGoal ? parseInt(storedGoal, 10) : CONFIG.DEFAULT_MP4_GOAL;
        },
        getSelectedTeamMembers: function () {
            const storedMembers = localStorage.getItem(CONFIG.STORAGE_KEYS.SELECTED_TEAM_MEMBERS);
            try { const members = storedMembers ? JSON.parse(storedMembers) : []; return Array.isArray(members) ? members : []; }
            catch (e) { return []; }
        },
        saveSelectedTeamMembers: function (membersString) {
            const membersArray = membersString.split(',').map(name => name.trim()).filter(name => name.length > 0);
            localStorage.setItem(CONFIG.STORAGE_KEYS.SELECTED_TEAM_MEMBERS, JSON.stringify(membersArray));
            this.displayCurrentFilter();
            return membersArray;
        },
        displayCurrentFilter: function () {
            if (!this.ui.currentFilterDisplay) return;
            const selectedNames = this.getSelectedTeamMembers();
            if (selectedNames.length > 0) {
                this.ui.currentFilterDisplay.textContent = 'Aktywny filtr: ' + selectedNames.join(', ');
                this.ui.currentFilterDisplay.classList.add('active-filter');
            } else {
                this.ui.currentFilterDisplay.textContent = 'Aktywny filtr: Brak (pokazuje wszystkich)';
                this.ui.currentFilterDisplay.classList.remove('active-filter');
            }
        },
        populateFilterInput: function () {
            if (this.ui.selectedTeamMembersInput) this.ui.selectedTeamMembersInput.value = this.getSelectedTeamMembers().join(', ');
            this.displayCurrentFilter();
        },
        getStoredUsername: function () { return localStorage.getItem(CONFIG.STORAGE_KEYS.USERNAME) || CONFIG.DEFAULT_USERNAME; },

        updateCounterDisplay: function () {
            if (this.ui.counterLinkSpan) {
                this.ui.counterLinkSpan.textContent = this.state.userTicketCount !== null ? `Licznik: ${this.state.pasteCount} / ${this.state.userTicketCount}` : `Ładowanie...`;
            }
            this.updateMp4GoalProgressDisplay();
            this.refreshDashboardIfNeeded();
        },
        updateStorageAndDisplay: function () {
            localStorage.setItem(CONFIG.STORAGE_KEYS.MP4_PASTE_COUNT, this.state.pasteCount);
            this.updateCounterDisplay();
        },
        updateSpecificMp4GoalProgressElements: function(goalPercent, currentMp4Count, totalUserTickets, labelEl, barFillEl, barTextEl) {
            let labelText = `Cel MP4: ${goalPercent}%`;
            let barText = "";
            let barWidthPercent = 0;
            let barColor = 'var(--mp4-btn-grey-bg)';

            if (totalUserTickets === null || totalUserTickets < 0) {
                labelText += " (Oczekuje na dane)";
                barText = `${currentMp4Count} MP4 / ? Wiad.`;
            } else if (totalUserTickets === 0) {
                labelText += " (Brak wiadomości)";
                if (goalPercent === 0 && currentMp4Count === 0) {
                    barText = `0 MP4 / 0 MP4`;
                    barWidthPercent = 100;
                    barColor = 'var(--mp4-btn-green-bg)';
                    labelText += " - Cel osiągnięty";
                } else if (goalPercent === 0 && currentMp4Count > 0) {
                    barText = `${currentMp4Count} MP4 / 0 MP4`;
                    barWidthPercent = 100;
                    barColor = 'var(--mp4-btn-green-bg)';
                    labelText += " - Cel przekroczony";
                } else {
                    barText = `${currentMp4Count} MP4 / Cel: ${goalPercent}%`;
                    barWidthPercent = 0;
                    barColor = 'var(--mp4-btn-red-bg)';
                    labelText += " - Cel nieosiągalny";
                }
            } else {
                const neededMp4ForGoal = Math.ceil((goalPercent / 100) * totalUserTickets);
                barText = `${currentMp4Count} MP4 / ${neededMp4ForGoal} MP4`;

                if (neededMp4ForGoal === 0) {
                    barWidthPercent = currentMp4Count > 0 ? 100 : 0;
                    barColor = 'var(--mp4-btn-green-bg)';
                     if (currentMp4Count > 0) labelText += " - Cel (0%) przekroczony"; else labelText += " - Cel (0%) osiągnięty";
                } else {
                    barWidthPercent = Math.min(100, (currentMp4Count / neededMp4ForGoal) * 100);
                    if (currentMp4Count >= neededMp4ForGoal) {
                        barColor = 'var(--mp4-btn-green-bg)';
                        labelText += (currentMp4Count > neededMp4ForGoal) ? ` - Nadwyżka: ${currentMp4Count - neededMp4ForGoal}` : " - Osiągnięty!";
                    } else {
                        const percentageOfGoalMet = (currentMp4Count / neededMp4ForGoal) * 100;
                        if (percentageOfGoalMet >= 75) barColor = 'var(--mp4-btn-orange-bg)';
                        else if (percentageOfGoalMet >= 40) barColor = 'var(--mp4-btn-yellow-bg, #ffc107)';
                        else barColor = 'var(--mp4-btn-red-bg)';
                        labelText += ` - Brakuje: ${neededMp4ForGoal - currentMp4Count}`;
                    }
                }
            }
            if(labelEl) labelEl.textContent = labelText;
            if(barFillEl) {
                barFillEl.style.width = `${barWidthPercent}%`;
                barFillEl.style.backgroundColor = barColor;
            }
            if(barTextEl) barTextEl.textContent = barText;
        },
        updateMp4GoalProgressDisplay: function() {
            if (!this.ui.mp4GoalProgressDisplay || !this.ui.mp4GoalProgressLabel || !this.ui.mp4GoalProgressBarFill || !this.ui.mp4GoalProgressBarText) return;
            this.updateSpecificMp4GoalProgressElements(
                this.state.mp4DailyGoalPercent,
                this.state.pasteCount,
                this.state.userTicketCount,
                this.ui.mp4GoalProgressLabel,
                this.ui.mp4GoalProgressBarFill,
                this.ui.mp4GoalProgressBarText
            );
        },

        resetPasteCount: function () {
            const countBeforeReset = this.state.pasteCount; let historyEntrySaved = false;
            if (countBeforeReset > 0) {
                const today = new Date().toISOString().slice(0, 10);
                const currentDailyTickets = (this.state.userTicketCount !== null && this.state.userTicketCount >= 0) ? this.state.userTicketCount : 0;
                this.saveHistory(today, countBeforeReset, currentDailyTickets);
                historyEntrySaved = true;
            }
            this.state.pasteCount = 0; this.updateStorageAndDisplay();
            if (historyEntrySaved) {
                if (this.ui.modalElement.classList.contains("show") &&
                    this.ui.mp4ModalContent.style.display === 'block' &&
                    this.ui.mp4ModalContent.querySelector('.mp4-history-view-table')) {
                    this.state.currentHistoryPage = 1;
                    this.updateHistoryTable();
                }
            }
        },
        calculatePercentage: function () {
            if (!this.ui.mp4ModalContent) return;
            this.ui.mp4ModalContent.innerHTML = '';

            const percentageViewContainer = h('div', { classList: ['mp4-percentage-view-container'], style: { padding: '10px' } });

            const goalPercent = this.state.mp4DailyGoalPercent;
            const currentMp4Count = this.state.pasteCount;
            const totalUserTickets = this.state.userTicketCount;
            const pStyleBase = "font-size: 15px; text-align: center; padding: 5px 15px; margin: 3px 0;";

            percentageViewContainer.appendChild(h('h4', {textContent: "Procent MP4 & Cel Dzienny", style: {textAlign: 'center', marginBottom: '15px'}}));

            if (totalUserTickets === null || totalUserTickets < 0) {
                percentageViewContainer.appendChild(h('p', { style: pStyleBase, textContent: "Oczekiwanie na dane o liczbie wiadomości..." }));
            } else {
                percentageViewContainer.appendChild(h('p', { style: pStyleBase, textContent: `Aktualny licznik MP4: ${currentMp4Count}` }));
                percentageViewContainer.appendChild(h('p', { style: pStyleBase, textContent: `Twoje dzisiejsze wiadomości: ${totalUserTickets}` }));
                if (totalUserTickets > 0) {
                    const currentPercentage = ((currentMp4Count / totalUserTickets) * 100).toFixed(2);
                    percentageViewContainer.appendChild(h('p', { style: pStyleBase, textContent: `Aktualny Procent MP4: ${currentPercentage}%` }));
                } else {
                    percentageViewContainer.appendChild(h('p', { style: pStyleBase, textContent: "Aktualny Procent MP4: N/A (brak wiadomości)" }));
                }
            }

            const progressLabel = h('div', { style: {textAlign: 'center', fontWeight: 'bold', fontSize: 'var(--mp4-font-size-normal)', marginBottom: '5px', marginTop: '15px'}});
            const progressBarContainer = h('div', { classList: ['mp4-progress-bar-container'], style: {maxWidth: '400px', margin: '5px auto 15px auto'} });
            const progressBarFill = h('div', { classList: ['mp4-progress-bar-fill']});
            const progressBarText = h('div', { classList: ['mp4-progress-bar-text']});

            progressBarContainer.append(progressBarFill, progressBarText);
            percentageViewContainer.append(progressLabel, progressBarContainer);

            this.updateSpecificMp4GoalProgressElements(
                goalPercent,
                currentMp4Count,
                totalUserTickets,
                progressLabel,
                progressBarFill,
                progressBarText
            );
            this.ui.mp4ModalContent.appendChild(percentageViewContainer);
        },
        showMainContentArea: function (areaToShow) {
            this.ui.teamStatsFilterContainer.style.display = 'none';
            this.ui.additionalStatsContainer.style.display = 'none';
            this.ui.mp4ModalContent.style.display = 'none';
            this.ui.mp4ModalContent.innerHTML = '';
            this.ui.mp4UserSettingsContainer.style.display = 'none';
            this.ui.mp4GoalProgressDisplay.style.display = 'none';

            if (areaToShow === CONFIG.MODAL_VIEWS.DASHBOARD) {
                this.ui.mp4ModalContent.style.display = 'block';
                this.renderDashboardView();
                if (this.state.rawTeamStats.length === 0 || this.state.userTicketCount === null) {
                    this.fetchStatisticsData();
                }
            } else if (areaToShow === CONFIG.MODAL_VIEWS.STATS) {
                this.ui.teamStatsFilterContainer.style.display = 'block';
                this.ui.additionalStatsContainer.style.display = 'block';
                this.ui.mp4GoalProgressDisplay.style.display = 'block';
                this.populateFilterInput();
                this.updateMp4GoalProgressDisplay();
                if (this.state.rawTeamStats.length === 0 && this.ui.modalElement.classList.contains("show")) this.fetchStatisticsData();
                else this.updateAdditionalStatsDisplay();
            } else if (areaToShow === CONFIG.MODAL_VIEWS.SETTINGS) {
                this.ui.mp4UserSettingsContainer.style.display = 'block';
                if(this.ui.mp4UsernameInput) this.ui.mp4UsernameInput.value = this.getStoredUsername();
                if(this.ui.mp4GoalInput) this.ui.mp4GoalInput.value = this.state.mp4DailyGoalPercent;
                this.populateCustomColorPickers();
                this.renderSavedThemesUI();
                this.populateShortcutInputs();
                this.populateDashboardSettings();
                this.applyTheme();
            } else if (areaToShow === CONFIG.MODAL_VIEWS.MP4_PERCENTAGE ||
                       areaToShow === CONFIG.MODAL_VIEWS.MP4_HISTORY ||
                       areaToShow === CONFIG.MODAL_VIEWS.WATCHLIST ) {
                this.ui.mp4ModalContent.style.display = 'block';
            } else if (areaToShow === 'none') {
            }
        },
        renderDashboardView: function() {
    if (!this.ui.mp4ModalContent) {
        console.error("[renderDashboardView] mp4ModalContent is null!");
        return;
    }
    this.ui.mp4ModalContent.innerHTML = '';
    console.log("[renderDashboardView] Rozpoczynanie renderowania dashboardu. Widgety do renderowania:", JSON.stringify(this.state.dashboardWidgets));

    const dashboardContainer = h('div', { classList: ['dashboard-container'] });

    this.state.dashboardWidgets.forEach(widgetId => {
        let widgetElement = null;
        let widgetConf = Object.values(CONFIG.AVAILABLE_DASHBOARD_WIDGETS).find(w => w.id === widgetId);
        let widgetLabel = widgetConf ? widgetConf.label : widgetId;

        try {
            console.log(`[renderDashboardView] Próba renderowania widgetu: ${widgetLabel} (ID: ${widgetId})`);
            if (widgetId === CONFIG.AVAILABLE_DASHBOARD_WIDGETS.MP4_TARGET_INFO.id) {
                widgetElement = this.renderMp4TargetInfoWidget();
            } else if (widgetId === CONFIG.AVAILABLE_DASHBOARD_WIDGETS.WATCHLIST_DEADLINES.id) {
                widgetElement = this.renderWatchlistDeadlinesWidget();
            } else if (widgetId === CONFIG.AVAILABLE_DASHBOARD_WIDGETS.TEAM_STATS_VIEW.id) {
                widgetElement = this.renderTeamStatsViewWidget();
            } else if (widgetId === CONFIG.AVAILABLE_DASHBOARD_WIDGETS.MP4_HISTORY_VIEW.id) {
                widgetElement = this.renderMp4HistoryWidget();
            }

            if (widgetElement) {
                dashboardContainer.appendChild(widgetElement);
                console.log(`[renderDashboardView] Pomyślnie zrenderowano i dodano widget: ${widgetLabel}`);
            } else {
                console.warn(`[renderDashboardView] widgetElement jest null dla widgetId: ${widgetId} (${widgetLabel})`);
                // Można tu dodać placeholder informujący o problemie z konkretnym widgetem
                 const nullErrorDiv = h('div', {classList:['dashboard-widget']}, [
                    h('h4', {textContent: `Problem z widgetem: ${widgetLabel}`, style: {color: 'orange'}}),
                    h('p', {textContent: 'Nie udało się załadować zawartości tego widgetu (element null).'})
                ]);
                dashboardContainer.appendChild(nullErrorDiv);
            }
        } catch (error) {
            console.error(`[renderDashboardView] Błąd podczas renderowania widgetu ${widgetLabel} (ID: ${widgetId}):`, error);
            const errorDiv = h('div', {classList:['dashboard-widget']}, [
                h('h4', {textContent: `Błąd widgetu: ${widgetLabel}`, style: {color: 'red'}}),
                h('p', {textContent: error.message || 'Nieznany błąd renderowania.'}),
                h('pre', {textContent: error.stack || '', style: {fontSize: '10px', whiteSpace: 'pre-wrap'}})
            ]);
            dashboardContainer.appendChild(errorDiv);
        }
    });

    if (dashboardContainer.children.length === 0 && this.state.dashboardWidgets.length > 0) {
        console.warn("[renderDashboardView] dashboardContainer nie ma dzieci, mimo że były widgety do renderowania. To może wskazywać na błędy w każdym widgecie.");
         dashboardContainer.appendChild(h('p', {textContent: 'Nie udało się załadować żadnego widgetu z powodu błędów.', style: {textAlign: 'center', fontStyle: 'italic', color: 'red'}}));
    } else if (this.state.dashboardWidgets.length === 0) {
        dashboardContainer.appendChild(h('p', {textContent: 'Brak widgetów do wyświetlenia na dashboardzie. Skonfiguruj w ustawieniach.', style: {textAlign: 'center', fontStyle: 'italic'}}));
    }

    this.ui.mp4ModalContent.appendChild(dashboardContainer);
    console.log("[renderDashboardView] Zakończono renderowanie dashboardu.");
},

        renderMp4TargetInfoWidget: function() {
            const widget = h('div', { classList: ['dashboard-widget', 'mp4-target-info-widget'] }, [
                h('div', { classList: ['widget-header'] }, [
                    h('h4', { textContent: CONFIG.AVAILABLE_DASHBOARD_WIDGETS.MP4_TARGET_INFO.label })
                ]),
                h('div', { classList: ['widget-content'], style: {textAlign: 'center'} })
            ]);
            const contentDiv = widget.querySelector('.widget-content');
            const pStyleBase = "font-size: var(--mp4-font-size-normal); padding: 3px 0; margin: 2px 0;";

            contentDiv.appendChild(h('p', {style: pStyleBase, textContent: `Aktualny licznik MP4: ${this.state.pasteCount}`}));
            contentDiv.appendChild(h('p', {style: pStyleBase, textContent: `Twoje dzisiejsze wiadomości: ${this.state.userTicketCount !== null ? this.state.userTicketCount : 'Ładowanie...'}`}));

            if (this.state.userTicketCount !== null && this.state.userTicketCount > 0) {
                const percentage = ((this.state.pasteCount / this.state.userTicketCount) * 100).toFixed(2);
                contentDiv.appendChild(h('p', {style: pStyleBase, textContent: `Aktualny Procent MP4: ${percentage}%`}));
            } else if (this.state.userTicketCount === 0) {
                contentDiv.appendChild(h('p', {style: pStyleBase, textContent: "Aktualny Procent MP4: N/A (brak wiadomości)"}));
            }

            const progressLabel = h('div', { style: {textAlign: 'center', fontWeight: 'bold', fontSize: 'var(--mp4-font-size-normal)', marginBottom: '5px', marginTop: '10px'}});
            const progressBarContainer = h('div', { classList: ['mp4-progress-bar-container'], style: {maxWidth: '350px', margin: '5px auto 0 auto'} });
            const progressBarFill = h('div', { classList: ['mp4-progress-bar-fill']});
            const progressBarText = h('div', { classList: ['mp4-progress-bar-text']});

            progressBarContainer.append(progressBarFill, progressBarText);
            contentDiv.append(progressLabel, progressBarContainer);

            this.updateSpecificMp4GoalProgressElements(
                this.state.mp4DailyGoalPercent,
                this.state.pasteCount,
                this.state.userTicketCount,
                progressLabel,
                progressBarFill,
                progressBarText
            );
            return widget;
        },

        renderWatchlistDeadlinesWidget: function() {
            const widget = h('div', { classList: ['dashboard-widget', 'watchlist-deadlines-widget'] }, [
                h('div', { classList: ['widget-header'] }, [
                    h('h4', { textContent: CONFIG.AVAILABLE_DASHBOARD_WIDGETS.WATCHLIST_DEADLINES.label })
                ]),
                h('div', { classList: ['widget-content'] })
            ]);
            const contentDiv = widget.querySelector('.widget-content');
            const deadlineNotifications = WatchlistModule.createDeadlineNotificationsElement();

            if (deadlineNotifications) {
                deadlineNotifications.style.border = 'none';
                deadlineNotifications.style.backgroundColor = 'transparent';
                deadlineNotifications.style.padding = '0';
                deadlineNotifications.style.marginBottom = '0';
                contentDiv.appendChild(deadlineNotifications);
            }

            contentDiv.appendChild(h('button', {
                classList: ['mp4-btn', 'blue', 'small-text'],
                textContent: 'Otwórz pełną Watchlistę',
                style: {marginTop: '10px', display:'block', marginLeft: 'auto', marginRight: 'auto'},
                eventListeners: { click: () => {
                    this.showMainContentArea(CONFIG.MODAL_VIEWS.WATCHLIST);
                    WatchlistModule.state.currentModalView = CONFIG.MODAL_VIEWS.WATCHLIST_TICKETS;
                    WatchlistModule.updateModal();
                }}
            }));
            return widget;
        },

        renderMp4HistoryWidget: function() {
            const widget = h('div', { classList: ['dashboard-widget', 'mp4-history-widget'] }, [
                h('div', { classList: ['widget-header'] }, [
                    h('h4', { textContent: CONFIG.AVAILABLE_DASHBOARD_WIDGETS.MP4_HISTORY_VIEW.label })
                ]),
                h('div', { classList: ['widget-content'] })
            ]);
            const contentDiv = widget.querySelector('.widget-content');
            const history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY)) || [];
            if (history.length === 0) {
                contentDiv.appendChild(h('p', {textContent:'Brak zapisanej historii MP4.', style: {textAlign: 'center', fontStyle: 'italic'}}));
            } else {
                history.sort((a, b) => new Date(b.date) - new Date(a.date) || (a.id && b.id ? String(b.id).localeCompare(String(a.id)) : 0) );
                const recentHistory = history.slice(0, CONFIG.PAGINATION.DASHBOARD_HISTORY_ITEMS);

                const tableRows = recentHistory.map(entry => {
                    let pD = "N/A";
                    if (typeof entry.dailyTicketCount === 'number') {
                        if (entry.dailyTicketCount > 0) pD = ((entry.count / entry.dailyTicketCount) * 100).toFixed(1) + '%';
                        else if (entry.dailyTicketCount === 0 && entry.count === 0) pD = "0.0%";
                        else if (entry.dailyTicketCount === 0 && entry.count > 0) pD = "∞";
                    }
                    return h('tr', {}, [
                        h('td', {textContent: entry.date, style: {fontSize: 'var(--mp4-font-size-small)'}}),
                        h('td', {style:{textAlign:'right', fontSize: 'var(--mp4-font-size-small)'}, textContent: entry.count}),
                        h('td', {style:{textAlign:'right', fontSize: 'var(--mp4-font-size-small)'}, textContent: pD})
                    ]);
                });
                const historyTable = h('table', {style:{width:'100%', borderCollapse:'collapse'}});
                historyTable.append(
                    h('thead', {}, [h('tr', {}, [
                        h('th', {textContent: 'Data', style:{fontSize: 'var(--mp4-font-size-small)'}}),
                        h('th', {style:{textAlign:'right', fontSize: 'var(--mp4-font-size-small)'}, textContent: 'MP4'}),
                        h('th', {style:{textAlign:'right', fontSize: 'var(--mp4-font-size-small)'}, textContent: '%'})
                    ])]),
                    h('tbody', {}, tableRows)
                );
                historyTable.querySelectorAll('th, td').forEach(cell => Object.assign(cell.style, {padding: '4px', border: '1px solid var(--mp4-table-border-color)', color: 'var(--mp4-table-text-color)'}));
                historyTable.querySelectorAll('th').forEach(th => Object.assign(th.style, {fontWeight: 'bold', backgroundColor: 'var(--mp4-table-header-bg)'}));
                contentDiv.appendChild(historyTable);
            }

            contentDiv.appendChild(h('button', {
                classList: ['mp4-btn', 'orange', 'small-text'],
                textContent: 'Zobacz Pełną Historię MP4',
                style: {marginTop: '10px', display:'block', marginLeft: 'auto', marginRight: 'auto'},
                eventListeners: { click: () => {
                    this.showMainContentArea(CONFIG.MODAL_VIEWS.MP4_HISTORY);
                    this.state.currentHistoryPage = 1;
                    this.updateHistoryTable();
                }}
            }));
            return widget;
        },
// Dodaj tę funkcję jako nową metodę wewnątrz obiektu MainAppModule
renderTeamStatsViewWidget: function() {
    console.log('[renderTeamStatsViewWidget] Rozpoczynanie renderowania widgetu Statystyk Zespołu.');
    // Usunięto logowanie JSON.stringify, aby uniknąć problemów z cyklicznymi odwołaniami, jeśli stan jest złożony
    // console.log('[renderTeamStatsViewWidget] Aktualny stan rawTeamStats:', this.state.rawTeamStats);
    console.log('[renderTeamStatsViewWidget] CONFIG.PAGINATION.DASHBOARD_TEAM_STATS_ITEMS:', CONFIG.PAGINATION.DASHBOARD_TEAM_STATS_ITEMS);

    const widget = h('div', { classList: ['dashboard-widget', 'team-stats-view-widget'] }, [
        h('div', { classList: ['widget-header'] }, [
            h('h4', { textContent: CONFIG.AVAILABLE_DASHBOARD_WIDGETS.TEAM_STATS_VIEW.label })
        ]),
        h('div', { classList: ['widget-content'] })
    ]);
    const contentDiv = widget.querySelector('.widget-content');

    if (!this.state.rawTeamStats) {
        console.warn('[renderTeamStatsViewWidget] this.state.rawTeamStats jest null lub undefined.');
        contentDiv.appendChild(h('p', { textContent: 'Statystyki zespołu są jeszcze ładowane...', style: { textAlign: 'center', fontStyle: 'italic' } }));
        return widget;
    }

    if (typeof CONFIG.PAGINATION.DASHBOARD_TEAM_STATS_ITEMS !== 'number') {
        console.error('[renderTeamStatsViewWidget] CONFIG.PAGINATION.DASHBOARD_TEAM_STATS_ITEMS nie jest liczbą!', CONFIG.PAGINATION.DASHBOARD_TEAM_STATS_ITEMS);
        contentDiv.appendChild(h('p', { textContent: 'Błąd konfiguracji: DASHBOARD_TEAM_STATS_ITEMS.', style: { color: 'red', textAlign: 'center' } }));
        return widget;
    }

    if (this.state.rawTeamStats.length === 0) {
        console.log('[renderTeamStatsViewWidget] rawTeamStats jest pustą tablicą.');
        contentDiv.appendChild(h('p', { textContent: 'Ładowanie statystyk zespołu lub brak danych.', style: { textAlign: 'center', fontStyle: 'italic' } }));
    } else {
        console.log('[renderTeamStatsViewWidget] Próba przetworzenia statystyk. Liczba wpisów:', this.state.rawTeamStats.length);
        const statsToShow = this.state.rawTeamStats.slice(0, CONFIG.PAGINATION.DASHBOARD_TEAM_STATS_ITEMS);
        console.log('[renderTeamStatsViewWidget] Liczba statystyk do pokazania:', statsToShow.length);

        if (statsToShow.length === 0) {
            contentDiv.appendChild(h('p', { textContent: 'Brak statystyk zespołu do wyświetlenia.', style: { textAlign: 'center', fontStyle: 'italic' } }));
        } else {
            try {
                const tableRows = statsToShow.map((stat, i) => {
                    if (!stat || typeof stat.profile === 'undefined' || typeof stat.messages === 'undefined') {
                        console.error(`[renderTeamStatsViewWidget] Nieprawidłowy obiekt statystyki na indeksie ${i}:`, stat);
                        return h('tr', {}, [h('td', { colspan: 2, textContent: 'Błąd danych dla wpisu', style: {color: 'red'} })]);
                    }
                    return h('tr', {}, [
                        h('td', { textContent: stat.profile, style: { fontSize: 'var(--mp4-font-size-small)' } }),
                        h('td', { style: { textAlign: 'right', fontSize: 'var(--mp4-font-size-small)' }, textContent: String(stat.messages) }) // Upewnij się, że messages jest stringiem
                    ]);
                });
                const statsTable = h('table', { style: { width: '100%', borderCollapse: 'collapse' } });
                statsTable.append(
                    h('thead', {}, [h('tr', {}, [
                        h('th', { textContent: 'Profil', style: { fontSize: 'var(--mp4-font-size-small)', textAlign: 'left' } }),
                        h('th', { style: { textAlign: 'right', fontSize: 'var(--mp4-font-size-small)' }, textContent: 'Wiadomości' })
                    ])]),
                    h('tbody', {}, tableRows)
                );
                statsTable.querySelectorAll('th, td').forEach(cell => Object.assign(cell.style, { padding: '4px', border: '1px solid var(--mp4-table-border-color)', color: 'var(--mp4-table-text-color)' }));
                statsTable.querySelectorAll('th').forEach(th => Object.assign(th.style, { fontWeight: 'bold', backgroundColor: 'var(--mp4-table-header-bg)' }));
                contentDiv.appendChild(statsTable);
            } catch (e) {
                console.error('[renderTeamStatsViewWidget] Błąd podczas tworzenia tabeli statystyk:', e);
                contentDiv.appendChild(h('p', { textContent: 'Błąd renderowania tabeli statystyk.', style: { color: 'red', textAlign: 'center' } }));
            }
        }
    }

    contentDiv.appendChild(h('button', {
        classList: ['mp4-btn', 'cyan', 'small-text'],
        textContent: 'Otwórz Pełne Statystyki Zespołu',
        style: { marginTop: '10px', display: 'block', marginLeft: 'auto', marginRight: 'auto' },
        eventListeners: {
            click: () => {
                this.showMainContentArea(CONFIG.MODAL_VIEWS.STATS);
            }
        }
    }));
    console.log('[renderTeamStatsViewWidget] Zakończono renderowanie widgetu.');
    return widget;
},

        refreshDashboardIfNeeded: function() {
            if (this.ui.modalElement &&
                this.ui.modalElement.classList.contains("show") &&
                this.ui.mp4ModalContent &&
                this.ui.mp4ModalContent.style.display === 'block' &&
                this.ui.mp4ModalContent.querySelector('.dashboard-container')
            ) {
                this.renderDashboardView();
            }
        },

        loadSavedThemes: function() {
            this.state.savedThemes = GM_getValue(CONFIG.STORAGE_KEYS.SAVED_CUSTOM_THEMES, {});
        },
        renderSavedThemesUI: function() {
            if (!this.ui.savedThemesListContainer) {
                return;
            }
            this.ui.savedThemesListContainer.innerHTML = '';

            const themeNames = Object.keys(this.state.savedThemes);
            if (themeNames.length === 0) {
                this.ui.savedThemesListContainer.appendChild(h('p', {textContent: 'Brak zapisanych motywów niestandardowych.', style: {textAlign: 'center', fontStyle: 'italic', fontSize: 'var(--mp4-font-size-small)'}}));
                return;
            }

            themeNames.sort((a,b) => a.localeCompare(b)).forEach(themeName => {
                const themeItemDiv = h('div', {style: {display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 3px', borderBottom: '1px solid var(--mp4-table-border-color)'}}, [
                    h('span', {textContent: themeName, style: {fontSize: 'var(--mp4-font-size-normal)', flexGrow: 1, marginRight: '10px'}}),
                    h('div', {style: {display:'flex', gap: '5px'}}, [
                        h('button', {classList: ['mp4-btn', 'blue', 'small-text'], textContent: 'Aktywuj', eventListeners: {click: () => this.handleActivateSavedTheme(themeName)}}),
                        h('button', {classList: ['mp4-btn', 'red', 'small-text'], textContent: 'Usuń', eventListeners: {click: () => this.handleDeleteSavedTheme(themeName)}})
                    ])
                ]);
                this.ui.savedThemesListContainer.appendChild(themeItemDiv);
            });
        },
        handleSaveCurrentThemeAsPreset: function() {
            const themeName = this.ui.inputSaveThemeName.value.trim();
            if (!themeName) {
                this.showNotification("Proszę podać nazwę dla zapisywanego motywu.", "warning");
                return;
            }

            const currentCustomSettings = {};
            this.CUSTOMIZABLE_COLORS.forEach(colorConf => {
                const picker = document.getElementById(`customColor_${colorConf.key}`);
                if (picker) currentCustomSettings[colorConf.key] = picker.value;
            });

            if (Object.keys(currentCustomSettings).length === 0 && !this.state.customThemeEnabled) {
                 this.showNotification("Brak aktywnych ustawień niestandardowych do zapisania. Najpierw dostosuj i zastosuj kolory.", "warning");
                 return;
            }


            const saveAction = () => {
                this.state.savedThemes[themeName] = { ...currentCustomSettings };
                GM_setValue(CONFIG.STORAGE_KEYS.SAVED_CUSTOM_THEMES, this.state.savedThemes);
                this.renderSavedThemesUI();
                this.showNotification(`Motyw "${themeName}" został zapisany/nadpisany.`, "success");
                this.ui.inputSaveThemeName.value = '';
            };

            if (this.state.savedThemes[themeName]) {
                this.showConfirmationDialog(
                    `Motyw o nazwie "${themeName}" już istnieje. Czy chcesz go nadpisać?`,
                    saveAction
                );
            } else {
                saveAction();
            }
        },
        handleActivateSavedTheme: function(themeName) {
            if (!this.state.savedThemes[themeName]) {
                this.showNotification(`Nie znaleziono motywu "${themeName}".`, "error");
                return;
            }
            this.state.customThemeSettings = { ...this.state.savedThemes[themeName] };
            this.state.customThemeEnabled = true;

            GM_setValue(CONFIG.STORAGE_KEYS.CUSTOM_THEME_SETTINGS, this.state.customThemeSettings);
            GM_setValue(CONFIG.STORAGE_KEYS.CUSTOM_THEME_ENABLED, "true");

            this.applyTheme();
            this.showNotification(`Motyw "${themeName}" został aktywowany.`, "success");
        },
        handleDeleteSavedTheme: function(themeName) {
            if (!this.state.savedThemes[themeName]) {
                this.showNotification(`Nie znaleziono motywu "${themeName}" do usunięcia.`, "error");
                return;
            }
            this.showConfirmationDialog(
                `Czy na pewno chcesz usunąć zapisany motyw "${themeName}"?`,
                () => {
                    delete this.state.savedThemes[themeName];
                    GM_setValue(CONFIG.STORAGE_KEYS.SAVED_CUSTOM_THEMES, this.state.savedThemes);
                    this.renderSavedThemesUI();
                    this.showNotification(`Motyw "${themeName}" został usunięty.`, "info");
                }
            );
        },

        loadKeyboardShortcuts: function() {
            const storedShortcuts = GM_getValue(CONFIG.STORAGE_KEYS.KEYBOARD_SHORTCUTS, {});
            const defaults = CONFIG.DEFAULT_KEYBOARD_SHORTCUTS;
            this.state.keyboardShortcuts = { ...defaults, ...storedShortcuts };
        },

        populateShortcutInputs: function() {
            this.CONFIGURABLE_SHORTCUT_ACTIONS.forEach(action => {
                const inputField = document.getElementById(`shortcut-input-${action.id}`);
                if (inputField) {
                    inputField.value = this.state.keyboardShortcuts[action.id] || '';
                    inputField.dataset.originalValue = inputField.value;
                }
            });
        },

        saveKeyboardShortcuts: function() {
            const newShortcuts = {};
            this.CONFIGURABLE_SHORTCUT_ACTIONS.forEach(action => {
                const inputField = document.getElementById(`shortcut-input-${action.id}`);
                if (inputField) {
                    const shortcutValue = inputField.value.trim();
                    if (shortcutValue) {
                        newShortcuts[action.id] = shortcutValue;
                    } else {
                        delete newShortcuts[action.id];
                    }
                }
            });

            this.state.keyboardShortcuts = { ...CONFIG.DEFAULT_KEYBOARD_SHORTCUTS, ...newShortcuts };
            GM_setValue(CONFIG.STORAGE_KEYS.KEYBOARD_SHORTCUTS, this.state.keyboardShortcuts);
            this.populateShortcutInputs();
            this.showNotification("Skróty klawiszowe zostały zapisane.", "success");
        },

        getKeyStringFromEvent: function(event) {
            let keyString = '';
            if (event.ctrlKey) keyString += 'Ctrl+';
            if (event.altKey) keyString += 'Alt+';
            if (event.shiftKey) keyString += 'Shift+';
            if (event.metaKey) keyString += 'Meta+';

            let eventKey = event.key;
            if (eventKey.length === 1 && eventKey.match(/[a-zA-Z0-9]/)) {
                eventKey = eventKey.toUpperCase();
            } else {
                const keyMap = {
                    "Control": "", "Shift": "", "Alt": "", "Meta": "",
                    "ArrowUp": "ArrowUp", "ArrowDown": "ArrowDown", "ArrowLeft": "ArrowLeft", "ArrowRight": "ArrowRight",
                    "Escape": "Escape", "Delete": "Delete", "Backspace": "Backspace", "Enter": "Enter", "Tab": "Tab",
                    " ": "Space"
                };
                if (keyMap[event.key] !== undefined) {
                    eventKey = keyMap[event.key];
                } else if (event.code && event.code.startsWith('Key')) {
                    eventKey = event.code.substring(3);
                } else if (event.code && event.code.startsWith('Digit')) {
                    eventKey = event.code.substring(5);
                }
            }

            if (!eventKey && keyString) {
                return null;
            }
            if (!eventKey && !keyString) {
                return null;
            }

            keyString += eventKey;
            return keyString;
        },

        initKeyboardShortcutListener: function() {
            document.addEventListener('keydown', (event) => {
                const activeElement = document.activeElement;
                if (activeElement) {
                    if (activeElement.classList.contains(CONFIG.CSS_CLASSES.SHORTCUT_INPUT_LISTENING)) {
                        return;
                    }
                    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable) {
                        if (!event.ctrlKey && !event.altKey && !event.metaKey && event.key.length === 1 && !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                            return;
                        }
                    }
                }

                const pressedKeyString = this.getKeyStringFromEvent(event);
                if (!pressedKeyString) return;

                for (const action of this.CONFIGURABLE_SHORTCUT_ACTIONS) {
                    const configuredShortcut = this.state.keyboardShortcuts[action.id];
                    if (configuredShortcut && configuredShortcut === pressedKeyString) {
                        event.preventDefault();
                        event.stopPropagation();
                        action.func();
                        return;
                    }
                }
            });
        },


        fetchStatisticsData: async function () {
            const nameToSearch = this.getStoredUsername();
            if (this.state.userTicketCount === null && this.ui.counterLinkSpan) {
                this.ui.counterLinkSpan.textContent = 'Ładowanie...';
            }
            this.updateMp4GoalProgressDisplay();

            if (this.ui.additionalStatsContent && this.ui.additionalStatsContainer.style.display === 'block') {
                this.ui.additionalStatsContent.innerHTML = 'Ładowanie statystyk zespołu...';
            } else if (this.ui.additionalStatsContent) { this.ui.additionalStatsContent.innerHTML = ''; }

            try {
                const response = await fetch('https://supportislove2.baselinker.com/statistics_tickets.php');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const text = await response.text();

                const userTicketDataMatch = text.match(/google\.visualization\.arrayToDataTable\(\s*\[\s*\[\s*'Profile',\s*'Messages'\s*\],\s*([\s\S]*?)\s*\]\s*\);/);
                let foundUserTicket = false;
                if (userTicketDataMatch && userTicketDataMatch[1]) {
                    const dataRowsString = userTicketDataMatch[1];
                    const rowRegex = /\[\s*'([^']+)',\s*(\d+)\s*\]/g;
                    let matchUser;
                    while ((matchUser = rowRegex.exec(dataRowsString)) !== null) {
                        if (matchUser[1].trim().toLowerCase() === nameToSearch.toLowerCase()) {
                            this.state.userTicketCount = parseInt(matchUser[2], 10);
                            foundUserTicket = true; break;
                        }
                    }
                    if (!foundUserTicket) this.state.userTicketCount = 0;
                } else this.state.userTicketCount = 0;


                this.state.rawTeamStats = [];
                if (userTicketDataMatch && userTicketDataMatch[1]) {
                    const dataRowsString = userTicketDataMatch[1];
                    const rowRegex = /\[\s*'([^']+)',\s*(\d+)\s*\]/g;
                    let matchTeam;
                    rowRegex.lastIndex = 0;
                    while ((matchTeam = rowRegex.exec(dataRowsString)) !== null) {
                        const profile = matchTeam[1].trim();
                        const messages = parseInt(matchTeam[2], 10);
                        if (profile && !isNaN(messages)) this.state.rawTeamStats.push({ profile, messages });
                    }
                    if (this.state.rawTeamStats.length > 0) {
                        this.state.rawTeamStats.sort((a, b) => b.messages - a.messages);
                    }
                }
                this.updateCounterDisplay();

                if (this.ui.additionalStatsContainer.style.display === 'block') {
                    this.updateAdditionalStatsDisplay();
                }
                if (this.ui.modalElement.classList.contains("show") && this.ui.mp4ModalContent.querySelector('.mp4-percentage-view-container')) {
                    this.calculatePercentage();
                }

            } catch (err) {
                if (this.state.userTicketCount === null) this.state.userTicketCount = 0;
                this.updateCounterDisplay();
                if (this.ui.additionalStatsContainer.style.display === 'block' && this.ui.additionalStatsContent) {
                    this.ui.additionalStatsContent.innerHTML = 'Błąd ładowania statystyk.';
                }
                 this.refreshDashboardIfNeeded();
            }
        },
        changeTeamStatsPage: function (pageNumber) { this.state.currentTeamStatsPage = pageNumber; this.updateAdditionalStatsDisplay(); },
        updateTeamStatsPagination: function (totalRecords, containerElement) {
            const oldPagination = containerElement.querySelector('.team-stats-pagination-div');
            if (oldPagination) oldPagination.remove();
            const totalPages = Math.ceil(totalRecords / CONFIG.PAGINATION.TEAM_STATS_PER_PAGE); if (totalPages <= 1) return;

            let buttons = [];
            if (this.state.currentTeamStatsPage > 1) {
                buttons.push(h('button', { classList:['mp4-btn', 'blue'], dataset:{'team-stats-page-action':'prev'}, textContent: 'Poprzednia', eventListeners: { click: () => this.changeTeamStatsPage(this.state.currentTeamStatsPage - 1) } }));
            }
            if (this.state.currentTeamStatsPage < totalPages) {
                buttons.push(h('button', { classList:['mp4-btn', 'blue'], dataset:{'team-stats-page-action':'next'}, style:{marginLeft:'5px'}, textContent: 'Następna', eventListeners: { click: () => this.changeTeamStatsPage(this.state.currentTeamStatsPage + 1) } }));
            }
            containerElement.appendChild(h('div', { classList: ['team-stats-pagination-div'], style:{textAlign:'right', marginTop:'10px'} }, buttons));
        },
        updateAdditionalStatsDisplay: function () {
            if (!this.ui.additionalStatsContent) return; this.ui.additionalStatsContent.innerHTML = '';
            const selectedNames = this.getSelectedTeamMembers(); let displayableTeamStats = this.state.rawTeamStats;
            if (selectedNames.length > 0) {
                const lowerSelectedNames = selectedNames.map(name => name.toLowerCase().trim());
                displayableTeamStats = this.state.rawTeamStats.filter(stat => lowerSelectedNames.includes(stat.profile.toLowerCase().trim()));
            }
            if (!this.state.rawTeamStats || this.state.rawTeamStats.length === 0) { this.ui.additionalStatsContent.appendChild(h('p', {textContent: 'Brak surowych danych statystyk zespołu.'})); return; }
            if (selectedNames.length > 0 && displayableTeamStats.length === 0) {
                this.ui.additionalStatsContent.appendChild(h('p', {textContent: 'Żaden z wybranych profili nie ma obecnie statystyk lub podano błędne nazwy.'}));
                const oldPg = this.ui.additionalStatsContent.querySelector('.team-stats-pagination-div'); if (oldPg) oldPg.remove(); return;
            }
            if (displayableTeamStats.length === 0 && selectedNames.length === 0) { this.ui.additionalStatsContent.appendChild(h('p', {textContent: 'Brak danych statystyk zespołu do wyświetlenia.'})); return; }

            let startIndex = (this.state.currentTeamStatsPage - 1) * CONFIG.PAGINATION.TEAM_STATS_PER_PAGE;
                  if (displayableTeamStats.length > 0 && startIndex >= displayableTeamStats.length && this.state.currentTeamStatsPage > 1) {
                      this.state.currentTeamStatsPage = Math.ceil(displayableTeamStats.length / CONFIG.PAGINATION.TEAM_STATS_PER_PAGE) || 1;
                      startIndex = (this.state.currentTeamStatsPage - 1) * CONFIG.PAGINATION.TEAM_STATS_PER_PAGE;
                  }
            let paginatedStats = displayableTeamStats.slice(startIndex, startIndex + CONFIG.PAGINATION.TEAM_STATS_PER_PAGE);
            if (paginatedStats.length === 0 && this.state.currentTeamStatsPage > 1) {
                this.state.currentTeamStatsPage--;
                startIndex = (this.state.currentTeamStatsPage - 1) * CONFIG.PAGINATION.TEAM_STATS_PER_PAGE;
                paginatedStats = displayableTeamStats.slice(startIndex, startIndex + CONFIG.PAGINATION.TEAM_STATS_PER_PAGE);
            }


            const tableRows = paginatedStats.map(stat => h('tr', {}, [ h('td', {textContent: stat.profile}), h('td', {style:{textAlign:'right'}, textContent: stat.messages}) ]));
            const statsTable = h('table', {style:{width:'100%', borderCollapse:'collapse', fontSize:'var(--mp4-font-size-normal)'}}, [
                h('thead', {}, [h('tr', {}, [h('th', {textContent:'Profil'}), h('th', {style:{textAlign:'right'}, textContent:'Wiadomości'})])]),
                h('tbody', {}, tableRows)
            ]);
            this.ui.additionalStatsContent.appendChild(statsTable);

            if (displayableTeamStats.length > CONFIG.PAGINATION.TEAM_STATS_PER_PAGE) this.updateTeamStatsPagination(displayableTeamStats.length, this.ui.additionalStatsContent);
            else { const oldPg = this.ui.additionalStatsContent.querySelector('.team-stats-pagination-div'); if (oldPg) oldPg.remove(); }
        },
        saveHistory: function (date, countToSave, dailyTickets) {
            const history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY)) || [];
            history.push({ id: Date.now() + '_' + Math.random().toString(36).substr(2, 9), date, count: countToSave, dailyTicketCount: dailyTickets });
            localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(history));
        },
        handleHistoryTableActions: function(event) {
            const self = MainAppModule;
            const deleteButton = event.target.closest('.delete-history-entry-btn');
            if (deleteButton) {
                event.stopPropagation();
                const entryId = deleteButton.dataset.id;
                self.deleteHistoryEntry(entryId);
            }
        },
        deleteHistoryEntry: function (entryIdToDelete) {
            if (!entryIdToDelete) return;
            const self = this;
            this.showConfirmationDialog(
                "Czy na pewno chcesz usunąć ten wpis z historii MP4?",
                () => {
                    let history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY)) || [];
                    const initialLength = history.length;
                    history = history.filter(entry => entry.id !== entryIdToDelete);
                    if (history.length < initialLength) {
                        localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(history));
                        self.updateHistoryTable();
                        self.showNotification("Wpis historii usunięty.", "success");
                    } else {
                        self.showNotification("Nie znaleziono wpisu do usunięcia.", "warning");
                    }
                }
            );
        },
        updateHistoryTable: function () {
            if (!this.ui.mp4ModalContent) return;
            this.ui.mp4ModalContent.innerHTML = '';
             if (this.ui.mp4ModalContent._historyListener) {
                 this.ui.mp4ModalContent.removeEventListener('click', this.ui.mp4ModalContent._historyListener);
                 delete this.ui.mp4ModalContent._historyListener;
                 this.ui.mp4ModalContent._historyListenerAttached = false;
             }


            const history = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY)) || [];
            if (history.length === 0) { this.ui.mp4ModalContent.appendChild(h('p', {textContent:'Brak zapisanej historii MP4.'})); return; }
            history.sort((a, b) => new Date(b.date) - new Date(a.date) || (a.id && b.id ? String(b.id).localeCompare(String(a.id)) : 0) );

            let startIndex = (this.state.currentHistoryPage - 1) * CONFIG.PAGINATION.HISTORY_RECORDS_PER_PAGE;
                  if (history.length > 0 && startIndex >= history.length && this.state.currentHistoryPage > 1) {
                      this.state.currentHistoryPage = Math.ceil(history.length / CONFIG.PAGINATION.HISTORY_RECORDS_PER_PAGE) || 1;
                      startIndex = (this.state.currentHistoryPage - 1) * CONFIG.PAGINATION.HISTORY_RECORDS_PER_PAGE;
                  }
            let paginatedHistory = history.slice(startIndex, startIndex + CONFIG.PAGINATION.HISTORY_RECORDS_PER_PAGE);
            if (paginatedHistory.length === 0 && this.state.currentHistoryPage > 1) {
                this.state.currentHistoryPage--;
                startIndex = (this.state.currentHistoryPage - 1) * CONFIG.PAGINATION.HISTORY_RECORDS_PER_PAGE;
                paginatedHistory = history.slice(startIndex, startIndex + CONFIG.PAGINATION.HISTORY_RECORDS_PER_PAGE);
            }


            const tableRows = paginatedHistory.map(entry => {
                let pD = "N/A";
                if (typeof entry.dailyTicketCount === 'number') {
                    if (entry.dailyTicketCount > 0) pD = ((entry.count / entry.dailyTicketCount) * 100).toFixed(1) + '%';
                    else if (entry.dailyTicketCount === 0 && entry.count === 0) pD = "0.0%";
                    else if (entry.dailyTicketCount === 0 && entry.count > 0) pD = "∞";
                }
                const delBtnContent = entry.id ? h('button', {classList:['mp4-btn', 'red', 'delete-history-entry-btn'], dataset:{id:entry.id}, style:{padding:'3px 8px', fontSize:'var(--mp4-font-size-normal)'}, textContent:'Usuń'}) : '';
                return h('tr', {}, [
                    h('td', {textContent: entry.date}),
                    h('td', {style:{textAlign:'right'}, textContent: entry.count}),
                    h('td', {style:{textAlign:'right'}, textContent: pD}),
                    h('td', {style:{textAlign:'center'}}, delBtnContent ? [delBtnContent] : [])
                ]);
            });

            const historyTableContainer = h('div', {classList: ['mp4-history-view-table']});
            const historyTable = h('table', {style:{width:'100%', borderCollapse:'collapse'}});

            historyTable.append(
                h('thead', {}, [h('tr', {}, [
                    h('th', {textContent: 'Data'}),
                    h('th', {style:{textAlign:'right'}, textContent: 'MP4'}),
                    h('th', {style:{textAlign:'right'}, textContent: 'MP4 / Wiad. (%)'}),
                    h('th', {style:{textAlign:'center'}, textContent: 'Akcje'})
                ])]),
                h('tbody', {}, tableRows)
            );
             historyTable.querySelectorAll('th, td').forEach(cell => Object.assign(cell.style, {padding: '6px', border: '1px solid var(--mp4-table-border-color)', color: 'var(--mp4-table-text-color)'}));
             historyTable.querySelectorAll('th').forEach(th => Object.assign(th.style, {fontWeight: 'bold', backgroundColor: 'var(--mp4-table-header-bg)'}));


            historyTableContainer.appendChild(historyTable);
            this.ui.mp4ModalContent.appendChild(historyTableContainer);

            if (!this.ui.mp4ModalContent._historyListenerAttached) {
                const boundHandler = this.handleHistoryTableActions.bind(this);
                this.ui.mp4ModalContent.addEventListener('click', boundHandler);
                this.ui.mp4ModalContent._historyListener = boundHandler;
                this.ui.mp4ModalContent._historyListenerAttached = true;
            }


            const self = this;
            const clearBtn = h('button', {classList:['mp4-btn', 'red'], textContent:'Wyczyść Całą Historię MP4', eventListeners: { click: () => {
                MainAppModule.showConfirmationDialog(
                    "Czy na pewno chcesz wyczyścić całą historię MP4?",
                    () => {
                        localStorage.removeItem(CONFIG.STORAGE_KEYS.HISTORY);
                        self.state.currentHistoryPage = 1;
                        self.updateHistoryTable();
                        MainAppModule.showNotification("Historia MP4 wyczyszczona.", "success");
                    }
                );
            }}});
            this.ui.mp4ModalContent.appendChild(h('div', {style:{textAlign:'center', marginTop:'15px'}}, [clearBtn]));
            this.updateHistoryPagination(history.length, this.ui.mp4ModalContent);
        },
        updateHistoryPagination: function (totalRecords, containerElement) {
            const oldPagination = containerElement.querySelector('.history-pagination-div');
            if (oldPagination) oldPagination.remove();
            const totalPages = Math.ceil(totalRecords / CONFIG.PAGINATION.HISTORY_RECORDS_PER_PAGE);
            if (totalPages <= 1) return;

            let buttons = [];
            if (this.state.currentHistoryPage > 1) {
                buttons.push(h('button', { classList: ['mp4-btn', 'blue'], textContent: 'Poprzednia', eventListeners: { click: () => { this.state.currentHistoryPage--; this.updateHistoryTable(); } } }));
            }
            if (this.state.currentHistoryPage < totalPages) {
                buttons.push(h('button', { classList: ['mp4-btn', 'blue'], textContent: 'Następna', style: { marginLeft: '5px' }, eventListeners: { click: () => { this.state.currentHistoryPage++; this.updateHistoryTable(); } } }));
            }
            containerElement.appendChild(h('div', { classList: ['history-pagination-div'], style: { textAlign: 'right', marginTop: '10px' } }, buttons));
        }
    };

    GM_addStyle(`
        :root {
            --mp4-font-size-small: 11px; --mp4-font-size-normal: 12px; --mp4-font-size-large: 14px;
            --mp4-padding-small: 5px; --mp4-padding-medium: 8px; --mp4-border-radius: 4px;
            --mp4-transition-duration: 0.2s; --mp4-link-color-base: #bfc3c6;
            --mp4-modal-bg: #FFFFFF; --mp4-modal-text: #333333; --mp4-modal-shadow: 0 0 15px rgba(0,0,0,0.15);
            --mp4-btn-generic-text: white; --mp4-btn-green-bg: #28a745; --mp4-btn-blue-bg: #007bff;
            --mp4-btn-red-bg: #dc3545; --mp4-btn-purple-bg: #6f42c1; --mp4-btn-orange-bg: #fd7e14;
            --mp4-btn-cyan-bg: #17a2b8; --mp4-btn-grey-bg: #6c757d; --mp4-btn-theme-toggle-bg: #6c757d;
            --mp4-btn-yellow-bg: #ffc107;
            --mp4-close-btn-color: #555555; --mp4-modal-h2-color: #333333; --mp4-modal-h4-color: #007bff;
            --mp4-table-header-bg: #E9ECEF; --mp4-table-border-color: #DEE2E6; --mp4-table-text-color: #333333;
            --mp4-input-bg: #FFFFFF; --mp4-input-text: #333333; --mp4-input-border: #CED4DA;
            --mp4-filter-label-color: #495057; --mp4-filter-container-border: #DEE2E6;
            --mp4-filter-display-text: #6C757D; --mp4-filter-display-active-text: #007bff;
            --mp4-watchlist-star-inactive: #bbb; --mp4-watchlist-star-active: gold;
            --mp4-fixed-watchlist-btn-bg: var(--mp4-btn-blue-bg); --mp4-fixed-watchlist-btn-text: var(--mp4-btn-generic-text);
            --mp4-filter-section-border: var(--mp4-table-border-color); --mp4-filter-section-bg: #FFFFFF;
            --mp4-form-bg: #f0f0f0;
            --mp4-settings-panel-header-bg: #f0f0f0;
            --mp4-settings-panel-header-hover-bg: #e0e0e0;
            --mp4-settings-panel-border: #ccc;
            --mp4-shortcut-input-listening-bg: #e8f0fe;
            --mp4-progress-bar-bg: #e9ecef;
            --mp4-progress-bar-text-color: #495057;
            --mp4-dashboard-widget-bg: #f9f9f9;
        }
        body.mp4-light-theme {
            --mp4-modal-bg: #FFFFFF; --mp4-modal-text: #333333; --mp4-modal-shadow: 0 0 15px rgba(0,0,0,0.15);
            --mp4-btn-generic-text: white; --mp4-btn-green-bg: #28a745; --mp4-btn-blue-bg: #007bff;
            --mp4-btn-red-bg: #dc3545; --mp4-btn-purple-bg: #6f42c1; --mp4-btn-orange-bg: #fd7e14;
            --mp4-btn-cyan-bg: #17a2b8; --mp4-btn-grey-bg: #6c757d; --mp4-btn-theme-toggle-bg: #6c757d;
            --mp4-btn-yellow-bg: #ffc107;
            --mp4-close-btn-color: #555555; --mp4-modal-h2-color: #333333; --mp4-modal-h4-color: #007bff;
            --mp4-table-header-bg: #E9ECEF; --mp4-table-border-color: #DEE2E6; --mp4-table-text-color: #333333;
            --mp4-input-bg: #FFFFFF; --mp4-input-text: #333333; --mp4-input-border: #CED4DA;
            --mp4-filter-label-color: #495057; --mp4-filter-container-border: #DEE2E6;
            --mp4-filter-display-text: #6C757D; --mp4-filter-display-active-text: #007bff;
            --mp4-watchlist-star-inactive: #bbb; --mp4-watchlist-star-active: #F8D210;
            --mp4-fixed-watchlist-btn-bg: #007bff; --mp4-fixed-watchlist-btn-text: white;
            --mp4-filter-section-border: #DEE2E6; --mp4-filter-section-bg: #FFFFFF;
            --mp4-form-bg: #f0f0f0; --mp4-link-color-base: #6c757d;
            --mp4-settings-panel-header-bg: #f0f0f0; --mp4-settings-panel-header-hover-bg: #e0e0e0; --mp4-settings-panel-border: #ccc;
            --mp4-shortcut-input-listening-bg: #e8f0fe;
            --mp4-progress-bar-bg: #e9ecef; --mp4-progress-bar-text-color: #495057;
            --mp4-dashboard-widget-bg: #f9f9f9;
        }
        body.mp4-dark-theme {
            --mp4-modal-bg: #323B44; --mp4-modal-text: #bfc3c6; --mp4-modal-shadow: 0 0 20px rgba(0,0,0,0.3);
            --mp4-btn-generic-text: #E0E0E0; --mp4-btn-border-color: rgba(255, 255, 255, 0.15);
            --mp4-btn-border-hover-color: rgba(255, 255, 255, 0.3); --mp4-btn-text-shadow: 0 1px 1px rgba(0,0,0,0.2);
            --mp4-btn-green-bg: #3E7240; --mp4-btn-blue-bg: #3A668A; --mp4-btn-red-bg: #A04040;
            --mp4-btn-purple-bg: #6A4A8C; --mp4-btn-orange-bg: #B07030; --mp4-btn-cyan-bg: #388E8E;
            --mp4-btn-grey-bg: #5a6268; --mp4-btn-theme-toggle-bg: #4A5560; --mp4-btn-yellow-bg: #b08d0a;
            --mp4-close-btn-color: white;
            --mp4-modal-h2-color: #bfc3c6; --mp4-modal-h4-color: #3bafda; --mp4-table-header-bg: #3a424a;
            --mp4-table-border-color: #555; --mp4-table-text-color: #bfc3c6; --mp4-input-bg: #2c333a;
            --mp4-input-text: #bfc3c6; --mp4-input-border: #444; --mp4-filter-label-color: #bfc3c6;
            --mp4-filter-container-border: #444; --mp4-filter-display-text: #888;
            --mp4-filter-display-active-text: #3bafda; --mp4-watchlist-star-inactive: #555;
            --mp4-watchlist-star-active: #F8D210;
            --mp4-fixed-watchlist-btn-bg: #3A668A; --mp4-fixed-watchlist-btn-text: #E0E0E0;
            --mp4-filter-section-border: #444; --mp4-filter-section-bg: rgb(60,70,80);
            --mp4-form-bg: #2D343C; --mp4-link-color-base: #bfc3c6;
            --mp4-settings-panel-header-bg: #2D343C; --mp4-settings-panel-header-hover-bg: #37404a; --mp4-settings-panel-border: #444;
            --mp4-shortcut-input-listening-bg: #3a4c5e;
            --mp4-progress-bar-bg: #2c333a; --mp4-progress-bar-text-color: #bfc3c6;
            --mp4-dashboard-widget-bg: #282e34;
        }
        .mp4-btn { padding: var(--mp4-padding-small) var(--mp4-padding-medium); margin: 2px 3px; border-radius: var(--mp4-border-radius); cursor: pointer; font-size: var(--mp4-font-size-normal); line-height: 1.2; white-space: nowrap; vertical-align: middle; transition: background-color var(--mp4-transition-duration) ease, opacity var(--mp4-transition-duration) ease, border-color var(--mp4-transition-duration) ease, color var(--mp4-transition-duration) ease; }
        .mp4-btn.small-text { font-size: var(--mp4-font-size-small); padding: calc(var(--mp4-padding-small) - 1px) calc(var(--mp4-padding-medium) - 2px); }
        .mp4-btn i.fa { margin-right: 3px; font-size: 1em; }
        #mp4Modal { position: fixed; top: 70px; right: 20px; width: 750px; height: auto; max-height: 85vh; padding: 15px; z-index: 99999; border-radius: 10px; display: none; opacity: 0; transition: opacity 0.3s ease-in-out, background-color 0.3s ease, color 0.3s ease; overflow-y: auto; background: var(--mp4-modal-bg); color: var(--mp4-modal-text); box-shadow: var(--mp4-modal-shadow); }
        #mp4Modal.show { display: block; opacity: 1; }
        #mp4Modal h2 { margin-top: 0; font-size: 18px; text-align: center; margin-bottom: 15px; color: var(--mp4-modal-h2-color); }
        #mp4Modal h4 { margin-top: 10px; margin-bottom: 5px; font-size: var(--mp4-font-size-large); color: var(--mp4-modal-h4-color); }
        #mp4Modal h5 { font-size: calc(var(--mp4-font-size-large) - 1px); color: var(--mp4-modal-h4-color); }
        #mp4Modal h6 { font-size: var(--mp4-font-size-small); color: var(--mp4-modal-text); font-weight: bold; }
        .close-btn { float: right; font-size: 20px; cursor: pointer; line-height: 1; color: var(--mp4-close-btn-color); }
        #${CONFIG.ELEMENT_IDS.ADDITIONAL_STATS_CONTENT} table, #${CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT} table.modal-table, #${CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT} table { margin-top: 10px; border-spacing: 0; width: 100%; border-collapse: collapse; font-size: var(--mp4-font-size-normal); }
        #${CONFIG.ELEMENT_IDS.ADDITIONAL_STATS_CONTENT} th, #${CONFIG.ELEMENT_IDS.ADDITIONAL_STATS_CONTENT} td, #${CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT} table.modal-table th, #${CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT} table.modal-table td, #${CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT} table th, #${CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT} table td { padding: 6px; border: 1px solid var(--mp4-table-border-color); color: var(--mp4-table-text-color); }
        #${CONFIG.ELEMENT_IDS.ADDITIONAL_STATS_CONTENT} th, #${CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT} table.modal-table th, #${CONFIG.ELEMENT_IDS.MP4_MODAL_CONTENT} table th { font-weight: bold; background-color: var(--mp4-table-header-bg); }
        #${CONFIG.ELEMENT_IDS.SELECTED_TEAM_MEMBERS_INPUT}, #${CONFIG.ELEMENT_IDS.MP4_USERNAME_INPUT}, #${CONFIG.ELEMENT_IDS.MP4_GOAL_INPUT}, #${CONFIG.ELEMENT_IDS.INPUT_SAVE_THEME_NAME}, .shortcut-input-field, #${CONFIG.ELEMENT_IDS.DEFAULT_START_VIEW_SELECT} { padding: var(--mp4-padding-small); border-radius: var(--mp4-border-radius); background-color: var(--mp4-input-bg); color: var(--mp4-input-text); border: 1px solid var(--mp4-input-border); }
        .shortcut-input-field.${CONFIG.CSS_CLASSES.SHORTCUT_INPUT_LISTENING} { background-color: var(--mp4-shortcut-input-listening-bg); }
        #${CONFIG.ELEMENT_IDS.TEAM_STATS_FILTER_CONTAINER} label, #${CONFIG.ELEMENT_IDS.MP4_USER_SETTINGS_CONTAINER} label { font-size: var(--mp4-font-size-normal); color: var(--mp4-filter-label-color); }
        #${CONFIG.ELEMENT_IDS.TEAM_STATS_FILTER_CONTAINER} { border-top: 1px solid var(--mp4-filter-container-border); border-bottom: 1px solid var(--mp4-filter-container-border); padding: 10px 0; margin-bottom:10px; }
        .settings-hr {border: none; border-top: 1px solid var(--mp4-table-border-color); margin: 15px 0;}
        #${CONFIG.ELEMENT_IDS.CURRENT_FILTER_DISPLAY} { font-size: var(--mp4-font-size-small); margin-top: 5px; color: var(--mp4-filter-display-text); }
        #${CONFIG.ELEMENT_IDS.CURRENT_FILTER_DISPLAY}.active-filter { font-weight: bold; color: var(--mp4-filter-display-active-text); }
        .navigation-menu .mp4-link { cursor: pointer; font-weight: bold; padding: var(--mp4-padding-small) 10px; width: auto; display: inline-block; white-space: nowrap; text-align: center; border-radius: var(--mp4-border-radius); background-color: transparent !important; border: none !important; color: var(--mp4-link-color-base) !important; transition: color var(--mp4-transition-duration) ease !important; }
        .navigation-menu .mp4-link .mp4-counter { font-weight: bold; margin-left: 5px; color: var(--mp4-link-color-base) !important; transition: color var(--mp4-transition-duration) ease !important; }
        .navigation-menu .mp4-link:hover, .navigation-menu .mp4-link:hover .mp4-counter { color: var(--mp4-modal-h4-color) !important; background-color: transparent !important; }
        #mp4Modal .mp4-btn { color: var(--mp4-btn-generic-text); border: none; }
        #mp4Modal .mp4-btn:hover { opacity: 0.85; }
        #mp4Modal .mp4-btn.green { background-color: var(--mp4-btn-green-bg); } #mp4Modal .mp4-btn.blue { background-color: var(--mp4-btn-blue-bg); }
        #mp4Modal .mp4-btn.red { background-color: var(--mp4-btn-red-bg); } #mp4Modal .mp4-btn.purple { background-color: var(--mp4-btn-purple-bg); }
        #mp4Modal .mp4-btn.orange { background-color: var(--mp4-btn-orange-bg); } #mp4Modal .mp4-btn.cyan { background-color: var(--mp4-btn-cyan-bg); }
        #mp4Modal .mp4-btn.grey { background-color: var(--mp4-btn-grey-bg); } #mp4Modal .mp4-btn.theme-toggle { background-color: var(--mp4-btn-theme-toggle-bg); }
        body.mp4-dark-theme #mp4Modal .mp4-btn { border: 1px solid var(--mp4-btn-border-color); text-shadow: var(--mp4-btn-text-shadow); }
        body.mp4-dark-theme #mp4Modal .mp4-btn:hover { border-color: var(--mp4-btn-border-hover-color); color: var(--mp4-btn-generic-text); opacity:0.9; }
        body.mp4-dark-theme #mp4Modal .mp4-btn.green:hover { background-color: color-mix(in srgb, var(--mp4-btn-green-bg) 80%, white); }
        body.mp4-dark-theme #mp4Modal .mp4-btn.blue:hover { background-color: color-mix(in srgb, var(--mp4-btn-blue-bg) 80%, white); }
        body.mp4-dark-theme #mp4Modal .mp4-btn.red:hover { background-color: color-mix(in srgb, var(--mp4-btn-red-bg) 80%, white); }
        body.mp4-dark-theme #mp4Modal .mp4-btn.purple:hover { background-color: color-mix(in srgb, var(--mp4-btn-purple-bg) 80%, white); }
        body.mp4-dark-theme #mp4Modal .mp4-btn.orange:hover { background-color: color-mix(in srgb, var(--mp4-btn-orange-bg) 80%, white); }
        body.mp4-dark-theme #mp4Modal .mp4-btn.cyan:hover { background-color: color-mix(in srgb, var(--mp4-btn-cyan-bg) 80%, white); }
        body.mp4-dark-theme #mp4Modal .mp4-btn.grey:hover { background-color: color-mix(in srgb, var(--mp4-btn-grey-bg) 80%, white); }
        .watchlist-star { font-size: 9pt; color: var(--mp4-watchlist-star-inactive); background: none; border: none; cursor: pointer; }
        .watchlist-star.active { color: var(--mp4-watchlist-star-active) !important; filter: brightness(100%) !important; }
        .modal-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
        .modal-table th, .modal-table td { border-bottom: 1px solid var(--mp4-table-border-color); text-align: left; padding: var(--mp4-padding-medium); color: var(--mp4-table-text-color); }
        .modal-table th { background-color: var(--mp4-table-header-bg); }
        .modal-table th.sortable-header { cursor: pointer; }
        .modal-table th.sortable-header:hover { background-color: color-mix(in srgb, var(--mp4-table-header-bg) 90%, #00000033); }
        .modal-table th.sortable-header.sorted { background-color: color-mix(in srgb, var(--mp4-table-header-bg) 80%, #00000033); }
        .action-btn i.fa { font-size: var(--mp4-font-size-normal); margin-right: 3px; }
        .watchlist-form-container { padding: 15px; border: 1px solid var(--mp4-input-border); border-radius: var(--mp4-border-radius); margin-bottom: 15px; background-color: var(--mp4-form-bg); }
        .watchlist-form-container label { display: block; margin-top: var(--mp4-padding-medium); margin-bottom: 3px; font-size: var(--mp4-font-size-normal); color: var(--mp4-modal-text); font-weight: 500; }
        .watchlist-form-container input[type="text"], .watchlist-form-container input[type="date"], .watchlist-form-container select { width: 100%; font-size: var(--mp4-font-size-normal); height: 30px; padding: var(--mp4-padding-small) 8px; box-sizing: border-box; margin-bottom: var(--mp4-padding-medium); background-color: var(--mp4-input-bg); color: var(--mp4-input-text); border: 1px solid var(--mp4-input-border); border-radius: var(--mp4-border-radius); }
        #mp4Modal tr.in-view { background-color: var(--mp4-watchlist-row-in-view-bg, rgba(0, 123, 255, 0.1)); }
        .drag-handle { cursor: grab; color: #888; padding-right: 10px; }
        .draggable-row { transition: background-color var(--mp4-transition-duration); }
        .draggable-row:active .drag-handle { cursor: grabbing; }
        #addCategoryForm_watchlist .color-input, #editCategoryForm_watchlist .color-input { width: 100% !important; height: 35px !important; padding: 2px !important; }
        #fixedWatchlistButton i.watchlist-star {font-size: 12pt; margin-right: var(--mp4-padding-small);}
        #fixedWatchlistButton.mp4-btn { background-color: var(--mp4-fixed-watchlist-btn-bg); color: var(--mp4-fixed-watchlist-btn-text); }
        .filter-section { padding: var(--mp4-padding-medium); margin-bottom: 15px; border-radius: var(--mp4-border-radius); display: flex; flex-wrap: wrap; gap: 6px; align-items: center; border: 1px solid var(--mp4-filter-section-border); background-color: var(--mp4-filter-section-bg); }
        .filter-section .mp4-btn { margin: 0; }
        .mp4-notification-area { position: fixed; bottom: 20px; right: 20px; z-index: 100002; display: flex; flex-direction: column-reverse; gap: 10px; align-items: flex-end; }
        .mp4-notification { padding: 10px 15px; border-radius: var(--mp4-border-radius); color: white; font-size: var(--mp4-font-size-normal); opacity: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.25); min-width: 250px; text-align: center; transition: opacity 0.5s ease-out, transform 0.5s ease-out; transform: translateX(0); }
        .mp4-notification-info { background-color: var(--mp4-btn-blue-bg); }
        .mp4-notification-success { background-color: var(--mp4-btn-green-bg); }
        .mp4-notification-error { background-color: var(--mp4-btn-red-bg); }
        .mp4-notification-warning { background-color: var(--mp4-btn-orange-bg); color: black; }
        .mp4-confirmation-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); z-index: 100001; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
        .mp4-confirmation-dialog { background-color: var(--mp4-modal-bg); color: var(--mp4-modal-text); padding: 25px; border-radius: var(--mp4-border-radius); box-shadow: var(--mp4-modal-shadow); min-width: 320px; max-width: 500px; text-align: center; border: 1px solid var(--mp4-table-border-color); }
        .mp4-confirmation-dialog p { margin: 0 0 20px 0; font-size: var(--mp4-font-size-large); }
        .mp4-confirmation-dialog .buttons { display: flex; justify-content: flex-end; gap: 10px; margin-top:10px;}
        .deadline-notifications-container li:hover { background-color: var(--mp4-table-header-bg); border-radius: var(--mp4-border-radius); }
        #${CONFIG.ELEMENT_IDS.SAVED_THEMES_LIST_CONTAINER} div { padding: 6px 3px; border-bottom: 1px solid var(--mp4-table-border-color); }
        #${CONFIG.ELEMENT_IDS.SAVED_THEMES_LIST_CONTAINER} div:last-child { border-bottom: none; }
        #${CONFIG.ELEMENT_IDS.CUSTOM_THEME_OPTIONS_CONTAINER} .mp4-btn { padding-top: 4px; padding-bottom: 4px; }
        #${CONFIG.ELEMENT_IDS.MP4_USER_SETTINGS_CONTAINER} details { border: 1px solid var(--mp4-settings-panel-border); border-radius: var(--mp4-border-radius); margin-bottom: 10px; }
        #${CONFIG.ELEMENT_IDS.MP4_USER_SETTINGS_CONTAINER} summary.settings-panel-header { background-color: var(--mp4-settings-panel-header-bg); color: var(--mp4-modal-text); padding: var(--mp4-padding-medium); cursor: pointer; font-weight: bold; border-radius: var(--mp4-border-radius); display: flex; justify-content: space-between; align-items: center; }
        #${CONFIG.ELEMENT_IDS.MP4_USER_SETTINGS_CONTAINER} details[open] summary.settings-panel-header { border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-bottom: 1px solid var(--mp4-settings-panel-border); }
        #${CONFIG.ELEMENT_IDS.MP4_USER_SETTINGS_CONTAINER} summary.settings-panel-header:hover { background-color: var(--mp4-settings-panel-header-hover-bg); }
        #${CONFIG.ELEMENT_IDS.MP4_USER_SETTINGS_CONTAINER} .settings-panel-content { padding: var(--mp4-padding-medium); border-top: none; background-color: var(--mp4-form-bg); border-bottom-left-radius: var(--mp4-border-radius); border-bottom-right-radius: var(--mp4-border-radius); }
        #${CONFIG.ELEMENT_IDS.MP4_USER_SETTINGS_CONTAINER} .panel-arrow { font-size: var(--mp4-font-size-small); }
        .mp4-progress-bar-container { width: 100%; background-color: var(--mp4-progress-bar-bg); border-radius: var(--mp4-border-radius); height: 20px; position: relative; overflow: hidden; border: 1px solid var(--mp4-input-border); margin-top: 3px; }
        .mp4-progress-bar-fill { height: 100%; background-color: var(--mp4-btn-green-bg); border-radius: var(--mp4-border-radius); transition: width 0.3s ease-in-out, background-color 0.3s ease-in-out; }
        .mp4-progress-bar-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--mp4-progress-bar-text-color); font-size: var(--mp4-font-size-small); font-weight: bold; text-shadow: 0 0 2px rgba(0,0,0,0.2); }
        body.mp4-dark-theme .mp4-progress-bar-text { text-shadow: 0 0 2px rgba(255,255,255,0.1); }
        .dashboard-container { display: flex; flex-direction: column; gap: 15px; }
        .dashboard-widget { background-color: var(--mp4-dashboard-widget-bg); border: 1px solid var(--mp4-table-border-color); border-radius: var(--mp4-border-radius); padding: 10px; }
        .widget-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--mp4-table-border-color); padding-bottom: 8px; margin-bottom: 8px; }
        .widget-header h4 { margin: 0; font-size: var(--mp4-font-size-large); color: var(--mp4-modal-h4-color); }
        .widget-content .deadline-notifications-container { margin-bottom: 0 !important; }
        .mp4-button-group { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; } /* Added for button groups */
.widget-config-row {
    transition: background-color 0.2s ease;
}
.widget-config-row:hover {
    background-color: var(--mp4-settings-panel-header-hover-bg);
}
.enabled-widget-row:hover {
     background-color: var(--mp4-settings-panel-header-hover-bg);
}
.disabled-widget-row:hover {
    opacity: 1 !important; /* Pełna widoczność przy najechaniu */
    border-style: solid !important;
}
.widget-order-btn i.fa {
    margin-right: 0;
    font-size: 0.9em; /* Mniejsza ikona w przycisku */
    line-height: 1;
}
.widget-order-btn {
    padding: 3px 7px !important; /* Dopasowany padding */
    line-height: 1;
}
/* Dodatkowe style dla lepszego wyglądu labelki */
#dashboardWidgetConfigContainer label {
    margin-right: auto; /* Wypycha przyciski do prawej */
}
    `);

    WatchlistModule.init();
    MainAppModule.init();

    WatchlistModule.initButtonsOnPage();
    const ticketsTable = document.getElementById('support_tickets');
    if (ticketsTable) {
        const observer = new MutationObserver(mutations => {
            let needsReInit = false;
            let needsColspanUpdateForSpecificRows = [];
            mutations.forEach(mutation => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList && (node.classList.contains('ticket_row') || node.querySelector('.ticket_row'))) {
                                needsReInit = true;
                            }
                            if (node.classList && node.classList.contains('ticket_info_tr') && node.querySelector('td.ticket_info[colspan]')) {
                                if(!needsColspanUpdateForSpecificRows.includes(node.querySelector('td.ticket_info[colspan]'))) {
                                    needsColspanUpdateForSpecificRows.push(node.querySelector('td.ticket_info[colspan]'));
                                }
                            } else if (node.matches && node.matches('td.ticket_info[colspan]')) {
                                if(!needsColspanUpdateForSpecificRows.includes(node)) needsColspanUpdateForSpecificRows.push(node);
                            } else if (node.querySelector && node.querySelector('td.ticket_info[colspan]')) {
                                 node.querySelectorAll('td.ticket_info[colspan]').forEach(cell => {
                                     if(!needsColspanUpdateForSpecificRows.includes(cell)) needsColspanUpdateForSpecificRows.push(cell);
                                 });
                            }
                        }
                    }
                }
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const targetElement = mutation.target;
                    let cellToUpdate = null;
                    if (targetElement.matches && targetElement.matches('td.ticket_info[colspan]')) {
                        cellToUpdate = targetElement;
                    } else if (targetElement.classList && targetElement.classList.contains('ticket_info_tr') && targetElement.style.display !== 'none') {
                        cellToUpdate = targetElement.querySelector('td.ticket_info[colspan]');
                    }
                    if(cellToUpdate && !needsColspanUpdateForSpecificRows.includes(cellToUpdate)){
                         needsColspanUpdateForSpecificRows.push(cellToUpdate);
                    }
                }
            });

            if (needsReInit) {
                WatchlistModule.initButtonsOnPage();
            } else if (needsColspanUpdateForSpecificRows.length > 0) {
                 const table = document.getElementById('support_tickets');
                 if (table && table.dataset.starColumnAdded === 'true') {
                     const currentHeaderCount = table.querySelector('thead tr').children.length;
                     needsColspanUpdateForSpecificRows.forEach(cell => {
                         if (document.body.contains(cell) && cell.getAttribute('colspan') != currentHeaderCount.toString()) {
                             cell.setAttribute('colspan', currentHeaderCount);
                         }
                     });
                 }
            }
        });
        observer.observe(ticketsTable, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'colspan'] });
    }
})();
