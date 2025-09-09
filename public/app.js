// app.js - University Search Portal Frontend
class UniversitySearchApp {
    constructor() {
        this.API_BASE = '/api';
        this.currentPage = 1;
        this.currentQuery = {};
        this.cache = new Map();
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadInitialData();
        this.setupAutoComplete();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const navList = document.getElementById('nav-list');
        
        if (mobileMenuBtn && navList) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
                mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
                mobileMenuBtn.classList.toggle('active');
                document.querySelector('.nav').classList.toggle('show');
            });
        }

        // Remove advanced toggle functionality since we removed the toggle

        // Search form
        const searchForm = document.getElementById('search-form');
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.performSearch();
        });

        // Modal close events
        const modal = document.getElementById('university-modal');
        const modalOverlay = document.getElementById('modal-overlay');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const modalCloseFooter = document.getElementById('modal-close-footer');

        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closeModal());
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (modalCloseFooter) {
            modalCloseFooter.addEventListener('click', () => this.closeModal());
        }

        // Escape key to close modal and suggestions
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.hideSuggestions();
                // Close mobile menu if open
                if (navList?.classList.contains('show')) {
                    mobileMenuBtn?.click();
                }
            }
        });

        // Country change event
        document.getElementById('country-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadCities(e.target.value);
            }
        });

        // Clear button
        document.getElementById('clear-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.clearSearchForm();
        });

        // Country search functionality with debounce
        let countrySearchTimer;
        const countrySearchInput = document.getElementById('country-search-input');
        const clearCountrySearch = document.getElementById('clear-country-search');
        
        if (countrySearchInput) {
            countrySearchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // Show/hide clear button
                if (clearCountrySearch) {
                    clearCountrySearch.style.display = query ? 'flex' : 'none';
                }
                
                // Clear previous timer
                clearTimeout(countrySearchTimer);
                
                // Set new timer for debounce
                countrySearchTimer = setTimeout(() => {
                    this.filterCountries(query);
                }, 300);
            });
        }

        if (clearCountrySearch) {
            clearCountrySearch.addEventListener('click', () => {
                countrySearchInput.value = '';
                clearCountrySearch.style.display = 'none';
                this.loadCountriesStats(false); // Show top countries
            });
        }

        // Show all countries button
        document.getElementById('show-all-countries')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (countrySearchInput) countrySearchInput.value = '';
            if (clearCountrySearch) clearCountrySearch.style.display = 'none';
            this.loadCountriesStats(true); // Show all countries
        });

        // Show top countries button
        document.getElementById('show-top-countries')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (countrySearchInput) countrySearchInput.value = '';
            if (clearCountrySearch) clearCountrySearch.style.display = 'none';
            this.loadCountriesStats(false); // Show top countries
        });

        // Back to top functionality
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    backToTop.classList.add('show');
                    backToTop.style.display = 'flex';
                } else {
                    backToTop.classList.remove('show');
                    backToTop.style.display = 'none';
                }
            });

            backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navList?.classList.contains('show')) {
                    mobileMenuBtn?.click();
                }
            });
        });
    }

    async loadInitialData() {
        this.showLoading(true);
        try {
            await Promise.all([
                this.loadQuickStats(),
                this.loadCountries()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load initial data. Please refresh the page.');
        } finally {
            this.showLoading(false);
        }
    }

    async loadAllCountriesForSearch() {
        this.showLoading(true);
        try {
            // Always load all countries for search functionality
            const response = await this.fetchWithCache('/stats/countries/all');
            
            if (response.status === 'success') {
                this.allCountries = response.data; // Store all countries for filtering
                // Display top 20 countries by default
                this.displayCountriesStats(response.data.slice(0, 20), false);
            }
        } catch (error) {
            console.error('Failed to load all countries:', error);
            // Fallback to regular stats
            try {
                const fallbackResponse = await this.fetchWithCache('/stats');
                if (fallbackResponse.status === 'success') {
                    this.allCountries = fallbackResponse.data.topCountries;
                    this.displayCountriesStats(fallbackResponse.data.topCountries, false);
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        } finally {
            this.showLoading(false);
        }
    }

    async loadCountriesStats(showAll = false) {
        this.showLoading(true);
        try {
            if (showAll) {
                // Show all countries
                if (this.allCountries) {
                    this.displayCountriesStats(this.allCountries, true);
                } else {
                    await this.loadAllCountriesForSearch();
                    this.displayCountriesStats(this.allCountries, true);
                }
            } else {
                // Show top countries
                if (this.allCountries) {
                    this.displayCountriesStats(this.allCountries.slice(0, 20), false);
                } else {
                    await this.loadAllCountriesForSearch();
                }
            }
        } catch (error) {
            console.error('Failed to load countries stats:', error);
        } finally {
            this.showLoading(false);
        }
    }

    filterCountries(query) {
        if (!this.allCountries) {
            // If countries not loaded yet, load them first
            this.loadAllCountriesForSearch().then(() => {
                if (query) {
                    this.filterCountries(query);
                }
            });
            return;
        }

        if (!query) {
            // Show top 20 countries when no search query
            this.displayCountriesStats(this.allCountries.slice(0, 20), false);
            return;
        }

        const filteredCountries = this.allCountries.filter(country => 
            country._id && country._id.toLowerCase().includes(query.toLowerCase())
        );

        this.displayCountriesStats(filteredCountries, false, query);
    }

    async loadQuickStats() {
        try {
            const response = await this.fetchWithCache('/stats');
            if (response.status === 'success') {
                this.displayQuickStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load quick stats:', error);
        }
    }

    async loadCountries() {
        try {
            const response = await this.fetchWithCache('/countries');
            if (response.status === 'success') {
                this.populateCountrySelect(response.data);
            }
        } catch (error) {
            console.error('Failed to load countries:', error);
        }
    }

    async loadCities(country) {
        try {
            const response = await this.fetchWithCache(`/cities?country=${encodeURIComponent(country)}`);
            if (response.status === 'success') {
                // Could populate city dropdown if needed
                console.log(`Loaded ${response.data.length} cities for ${country}`);
            }
        } catch (error) {
            console.error('Failed to load cities:', error);
        }
    }



    setupAutoComplete() {
        const searchInput = document.getElementById('search-input');
        const nameInput = document.getElementById('name-input');
        let debounceTimer;

        [searchInput, nameInput].forEach(input => {
            input.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.getSuggestions(e.target.value, e.target);
                }, 300);
            });

            input.addEventListener('blur', () => {
                setTimeout(() => this.hideSuggestions(), 200);
            });
        });
    }

    async getSuggestions(query, inputElement) {
        if (!query || query.length < 2) {
            this.hideSuggestions();
            return;
        }

        try {
            const response = await this.fetchWithCache(`/universities/suggest?q=${encodeURIComponent(query)}&limit=8`);
            if (response.status === 'success') {
                this.displaySuggestions(response.data, inputElement);
            }
        } catch (error) {
            console.error('Failed to get suggestions:', error);
        }
    }

    displaySuggestions(suggestions, inputElement) {
        let suggestionsContainer = inputElement.parentNode.querySelector('.suggestions');
        
        if (!suggestionsContainer) {
            console.error('Suggestions container not found');
            return;
        }
        
        if (suggestions.length === 0) {
            suggestionsContainer.classList.remove('show');
            return;
        }

        suggestionsContainer.innerHTML = suggestions.map(uni => `
            <div class="suggestion-item" data-university-id="${uni._id}" data-university-name="${uni.institution.name.replace(/"/g, '&quot;')}" data-input-id="${inputElement.id}">
                <div class="suggestion-name">${uni.institution.name}</div>
                <div class="suggestion-location">
                    ${uni.general_information?.address?.city || 'N/A'}, ${uni.institution.country_line || 'N/A'}
                </div>
            </div>
        `).join('');
        
        // Add event listeners for suggestion items
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const universityId = item.dataset.universityId;
                const universityName = item.dataset.universityName;
                const inputId = item.dataset.inputId;
                this.selectSuggestion(universityId, universityName, inputId);
            });
        });

        suggestionsContainer.classList.add('show');
    }

    selectSuggestion(universityId, universityName, inputId) {
        const input = document.getElementById(inputId);
        input.value = universityName;
        this.hideSuggestions();
        
        // Store the selected university ID for potential use
        input.dataset.universityId = universityId;
    }

    hideSuggestions() {
        document.querySelectorAll('.suggestions').forEach(container => {
            container.classList.remove('show');
        });
    }

    async performSearch(page = 1) {
        this.showLoading(true);
        
        const formData = this.getFormData();
        formData.page = page;
        
        this.currentQuery = formData;
        this.currentPage = page;

        try {
            const queryParams = new URLSearchParams();
            Object.entries(formData).forEach(([key, value]) => {
                if (value && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await fetch(`${this.API_BASE}/universities/search?${queryParams}`);
            const data = await response.json();

            if (data.status === 'success') {
                this.displaySearchResults(data.data, data.pagination);
            } else {
                this.showError(data.message || 'Search failed');
            }
        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Search failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    getFormData() {
        return {
            search: document.getElementById('search-input').value.trim(),
            name: document.getElementById('name-input').value.trim(),
            country: document.getElementById('country-select').value,
            city: document.getElementById('city-input').value.trim(),
            type: document.getElementById('type-input').value.trim(),
            sortBy: document.getElementById('sort-select').value,
            limit: document.getElementById('limit-select').value
        };
    }

    displayQuickStats(stats) {
        // Store stats for later use
        this.stats = {
            totalUniversities: stats.totalUniversities,
            totalCountries: stats.topCountries?.length || 0
        };

        const quickStatsContainer = document.getElementById('quick-stats');
        quickStatsContainer.innerHTML = `
            <div class="stat-card" tabindex="0" role="button" aria-label="${stats.totalUniversities.toLocaleString()} universities in database">
                <div class="stat-number">${stats.totalUniversities.toLocaleString()}</div>
                <div class="stat-label">Universities</div>
            </div>
            <div class="stat-card" tabindex="0" role="button" aria-label="${stats.topCountries?.length || 0} countries available" onclick="app.showSection('countries')">
                <div class="stat-number">${stats.topCountries?.length || 0}</div>
                <div class="stat-label">Countries</div>
            </div>
        `;

        // Update footer stats
        this.updateFooterStats();

        // Add click handlers for stat cards
        quickStatsContainer.querySelectorAll('.stat-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index === 1) { // Countries card
                    this.showSection('countries');
                }
            });

            // Keyboard accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    populateCountrySelect(countries) {
        const countrySelect = document.getElementById('country-select');
        const currentValue = countrySelect.value;
        
        countrySelect.innerHTML = '<option value="">All Countries</option>';
        
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });

        // Restore previous selection
        if (currentValue) {
            countrySelect.value = currentValue;
        }
    }

    displaySearchResults(universities, pagination) {
        const resultsContainer = document.getElementById('search-results');
        
        if (universities.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No universities found</h3>
                    <p>Try adjusting your search criteria or browse all universities.</p>
                </div>
            `;
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        resultsContainer.innerHTML = `
            <div class="results-header">
                <h3>Search Results</h3>
                <div class="results-meta">
                    Found ${pagination.total.toLocaleString()} universities
                    (Showing ${((pagination.page - 1) * pagination.limit) + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)})
                </div>
            </div>
            <div class="university-grid">
                ${universities.map(uni => this.createUniversityCard(uni)).join('')}
            </div>
        `;

        this.displayPagination(pagination);
        
        // Add event listeners for university cards
        document.querySelectorAll('.university-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const universityId = card.dataset.universityId;
                if (universityId) {
                    this.showUniversityDetails(universityId);
                }
            });
        });
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    createUniversityCard(university) {
        const institution = university.institution;
        const generalInfo = university.general_information || {};
        const address = generalInfo.address || {};
        
        return `
            <div class="university-card" data-university-id="${university._id}">
                <div class="university-header">
                    <div>
                        <div class="university-name">${institution.name}</div>
                        ${institution.short_name ? `<div class="university-short-name">${institution.short_name}</div>` : ''}
                    </div>
                    ${generalInfo.type ? `<div class="university-type">${generalInfo.type}</div>` : ''}
                </div>
                <div class="university-info">
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${address.city || 'N/A'}, ${institution.country_line || 'N/A'}</span>
                    </div>
                    ${generalInfo.established ? `
                        <div class="info-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Founded ${generalInfo.established}</span>
                        </div>
                    ` : ''}
                    ${generalInfo.status ? `
                        <div class="info-item">
                            <i class="fas fa-info-circle"></i>
                            <span>${generalInfo.status}</span>
                        </div>
                    ` : ''}
                    ${university.student_staff_numbers?.total_students ? `
                        <div class="info-item">
                            <i class="fas fa-users"></i>
                            <span>${university.student_staff_numbers.total_students.toLocaleString()} students</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    displayPagination(pagination) {
        const paginationContainer = document.getElementById('pagination');
        
        if (pagination.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="page-btn ${!pagination.hasPrev ? 'disabled' : ''}" 
                    data-page="${pagination.page - 1}"
                    ${!pagination.hasPrev ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const start = Math.max(1, pagination.page - 2);
        const end = Math.min(pagination.totalPages, pagination.page + 2);

        if (start > 1) {
            paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
            if (start > 2) {
                paginationHTML += `<span class="page-btn disabled">...</span>`;
            }
        }

        for (let i = start; i <= end; i++) {
            paginationHTML += `
                <button class="page-btn ${i === pagination.page ? 'active' : ''}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }

        if (end < pagination.totalPages) {
            if (end < pagination.totalPages - 1) {
                paginationHTML += `<span class="page-btn disabled">...</span>`;
            }
            paginationHTML += `<button class="page-btn" data-page="${pagination.totalPages}">${pagination.totalPages}</button>`;
        }

        // Next button
        paginationHTML += `
            <button class="page-btn ${!pagination.hasNext ? 'disabled' : ''}" 
                    data-page="${pagination.page + 1}"
                    ${!pagination.hasNext ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
        
        // Add event listeners for pagination buttons
        paginationContainer.querySelectorAll('button.page-btn:not(.disabled):not([disabled])').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(btn.dataset.page);
                if (page && !btn.disabled) {
                    this.performSearch(page);
                }
            });
        });
    }

    async showUniversityDetails(universityId) {
        this.showLoading(true);
        
        try {
            const response = await this.fetchWithCache(`/universities/${universityId}`);
            
            if (response.status === 'success') {
                this.displayUniversityModal(response.data);
            } else {
                this.showError(response.message || 'Failed to load university details');
            }
        } catch (error) {
            console.error('Failed to load university details:', error);
            this.showError('Failed to load university details');
        } finally {
            this.showLoading(false);
        }
    }

    displayUniversityModal(university) {
        const modal = document.getElementById('university-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const modalLoading = document.getElementById('modal-loading');

        modalTitle.textContent = university.institution.name;
        
        // Hide loading and show content
        if (modalLoading) modalLoading.style.display = 'none';
        modalBody.innerHTML = this.createUniversityDetailHTML(university);
        
        // Use HTML5 dialog API
        if (modal.showModal) {
            modal.showModal();
        } else {
            // Fallback for older browsers
            modal.setAttribute('open', '');
            modal.style.display = 'flex';
        }
        
        // Set focus to close button for accessibility
        const closeBtn = document.getElementById('close-modal-btn');
        if (closeBtn) closeBtn.focus();
        
        // Update footer stats if available
        this.updateFooterStats();
    }

    createUniversityDetailHTML(university) {
        const institution = university.institution || {};
        const generalInfo = university.general_information || {};
        const address = generalInfo.address || {};
        const officers = university.officers || [];
        const divisions = university.divisions || [];
        const degrees = university.degrees || {};
        const studentNumbers = university.student_staff_numbers || {};
        
        let sections = [];

        // Basic Information
        sections.push(`
            <div class="university-detail-section">
                <h4><i class="fas fa-info-circle"></i> Basic Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Full Name</div>
                        <div class="detail-value">${institution.name || 'N/A'}</div>
                    </div>
                    ${institution.short_name ? `
                        <div class="detail-item">
                            <div class="detail-label">Short Name</div>
                            <div class="detail-value">${institution.short_name}</div>
                        </div>
                    ` : ''}
                    ${institution.country_line ? `
                        <div class="detail-item">
                            <div class="detail-label">Country/Region</div>
                            <div class="detail-value">${institution.country_line}</div>
                        </div>
                    ` : ''}
                    ${generalInfo.institution_funding ? `
                        <div class="detail-item">
                            <div class="detail-label">Funding Type</div>
                            <div class="detail-value">${generalInfo.institution_funding}</div>
                        </div>
                    ` : ''}
                    ${generalInfo.history ? `
                        <div class="detail-item">
                            <div class="detail-label">History</div>
                            <div class="detail-value">${generalInfo.history}</div>
                        </div>
                    ` : ''}
                    ${generalInfo.student_body ? `
                        <div class="detail-item">
                            <div class="detail-label">Student Body</div>
                            <div class="detail-value">${generalInfo.student_body}</div>
                        </div>
                    ` : ''}
                    ${generalInfo.languages && generalInfo.languages.length > 0 ? `
                        <div class="detail-item">
                            <div class="detail-label">Languages</div>
                            <div class="detail-value">${generalInfo.languages.join(', ')}</div>
                        </div>
                    ` : ''}
                    ${institution.updated_on ? `
                        <div class="detail-item">
                            <div class="detail-label">Last Updated</div>
                            <div class="detail-value">${institution.updated_on}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `);

        // Contact & Location Information
        if (address.street || address.city || address.province || address.post_code || address.www) {
            sections.push(`
                <div class="university-detail-section">
                    <h4><i class="fas fa-map-marker-alt"></i> Contact & Location</h4>
                    <div class="detail-grid">
                        ${address.street ? `
                            <div class="detail-item">
                                <div class="detail-label">Street Address</div>
                                <div class="detail-value">${address.street}</div>
                            </div>
                        ` : ''}
                        ${address.city ? `
                            <div class="detail-item">
                                <div class="detail-label">City</div>
                                <div class="detail-value">${address.city}</div>
                            </div>
                        ` : ''}
                        ${address.province ? `
                            <div class="detail-item">
                                <div class="detail-label">Province/State</div>
                                <div class="detail-value">${address.province}</div>
                            </div>
                        ` : ''}
                        ${address.post_code ? `
                            <div class="detail-item">
                                <div class="detail-label">Postal Code</div>
                                <div class="detail-value">${address.post_code}</div>
                            </div>
                        ` : ''}
                        ${address.www ? `
                            <div class="detail-item">
                                <div class="detail-label">Website</div>
                                <div class="detail-value"><a href="${address.www}" target="_blank">${address.www}</a></div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `);
        }

        // Officers & Leadership
        if (officers.length > 0) {
            sections.push(`
                <div class="university-detail-section">
                    <h4><i class="fas fa-user-tie"></i> Officers & Leadership</h4>
                    <div class="detail-grid">
                        ${officers.map(officer => `
                            <div class="detail-item">
                                <div class="detail-label">${officer.job_title || officer.role || 'Officer'}</div>
                                <div class="detail-value">${officer.name || 'N/A'}${officer.role && officer.job_title ? ` (${officer.role})` : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `);
        }

        // Accreditation
        if (generalInfo.accrediting_agency) {
            sections.push(`
                <div class="university-detail-section">
                    <h4><i class="fas fa-certificate"></i> Accreditation</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <div class="detail-label">Accrediting Agency</div>
                            <div class="detail-value">${generalInfo.accrediting_agency}</div>
                        </div>
                    </div>
                </div>
            `);
        }



        // Academic Divisions/Faculties
        if (divisions.length > 0) {
            const displayDivisions = divisions.slice(0, 12);
            sections.push(`
                <div class="university-detail-section">
                    <h4><i class="fas fa-building"></i> Academic Programs & Courses</h4>
                    <div class="detail-grid">
                        ${displayDivisions.map(division => `
                            <div class="detail-item">
                                <div class="detail-label">${division.unit_name || 'Program'}</div>
                                <div class="detail-value">
                                    ${division.unit_type || 'N/A'}
                                    ${division.fields_of_study && division.fields_of_study.length > 0 ? `<br><small style="color: #666;">Fields: ${division.fields_of_study.join(', ')}</small>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${divisions.length > 12 ? `<p style="color: #666; font-style: italic; margin-top: 1rem;">... and ${divisions.length - 12} more programs</p>` : ''}
                </div>
            `);
        }

        // Degree Programs
        if (degrees.programs && degrees.programs.length > 0) {
            sections.push(`
                <div class="university-detail-section">
                    <h4><i class="fas fa-graduation-cap"></i> Degree Programs</h4>
                    <div class="detail-grid">
                        ${degrees.programs.map(program => `
                            <div class="detail-item">
                                <div class="detail-label">${program.degree || 'Degree'}</div>
                                <div class="detail-value">
                                    ${program.fields_of_study && program.fields_of_study.length > 0 ? 
                                        program.fields_of_study.join(', ') : 
                                        'General program'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `);
        }

        // Student & Staff Numbers
        if (Object.keys(studentNumbers).length > 0) {
            sections.push(`
                <div class="university-detail-section">
                    <h4><i class="fas fa-chart-bar"></i> Statistics</h4>
                    <div class="detail-grid">
                        ${studentNumbers.students ? `
                            <div class="detail-item">
                                <div class="detail-label">Total Students</div>
                                <div class="detail-value">${studentNumbers.students.total ? studentNumbers.students.total.toLocaleString() : 'N/A'}
                                    ${studentNumbers.students.statistics_year ? `<br><small style="color: #666;">(${studentNumbers.students.statistics_year})</small>` : ''}
                                </div>
                            </div>
                        ` : ''}
                        ${studentNumbers.staff ? `
                            <div class="detail-item">
                                <div class="detail-label">Full-time Staff</div>
                                <div class="detail-value">${studentNumbers.staff.full_time_total ? studentNumbers.staff.full_time_total.toLocaleString() : 'N/A'}
                                    ${studentNumbers.staff.statistics_year ? `<br><small style="color: #666;">(${studentNumbers.staff.statistics_year})</small>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `);
        }



        return sections.join('');
    }



    displayCountriesStats(countries, showingAll = false, searchQuery = '') {
        const countriesStatsContainer = document.getElementById('countries-stats');
        
        if (!countries || countries.length === 0) {
            const emptyMessage = searchQuery ? 
                `No countries found matching "${searchQuery}"` : 
                'No data available';
            const emptyDetail = searchQuery ? 
                'Try adjusting your search terms.' : 
                'Unable to load countries statistics.';
                
            countriesStatsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-globe"></i>
                    <h3>${emptyMessage}</h3>
                    <p>${emptyDetail}</p>
                </div>
            `;
            return;
        }

        // Calculate total universities
        const totalUniversities = countries.reduce((sum, country) => sum + country.count, 0);
        
        // Create header
        let headerTitle = 'Countries';
        let headerDescription = '';
        
        if (searchQuery) {
            headerTitle = `Search Results for "${searchQuery}"`;
            headerDescription = countries.length === 0 ? 
                'No countries found matching your search.' :
                `Found ${countries.length} matching countries`;
        } else if (showingAll) {
            headerTitle = 'All Countries';
            headerDescription = `Showing all ${countries.length} countries sorted by number of universities`;
        } else {
            headerTitle = 'Top Countries';
            headerDescription = `Showing top ${Math.min(20, countries.length)} countries with most universities`;
        }

        countriesStatsContainer.innerHTML = `
            <div class="countries-results-header">
                <h3>${headerTitle}</h3>
                <div class="countries-results-meta">
                    ${headerDescription}<br>
                    Total: ${totalUniversities.toLocaleString()} universities across ${countries.length} countries
                </div>
            </div>
            <div class="countries-grid">
                ${countries.map((country, index) => `
                    <div class="country-item" data-country="${country._id || 'Unknown'}">
                        <div class="country-name">
                            ${showingAll || searchQuery ? '' : `<span style="color: #667eea; font-weight: 700; margin-right: 0.5rem;">#${index + 1}</span>`}
                            ${country._id || 'Unknown'}
                        </div>
                        <div class="country-count">${country.count.toLocaleString()}</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add event listeners for country items
        countriesStatsContainer.querySelectorAll('.country-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const countryName = item.dataset.country;
                this.searchByCountry(countryName);
            });
        });
    }

    searchByCountry(countryName) {
        // Switch to search section
        this.showSection('search');
        
        // Set country in dropdown
        const countrySelect = document.getElementById('country-select');
        countrySelect.value = countryName;
        
        // Perform search
        this.performSearch();
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`.nav-link[data-section="${sectionName}"]`).classList.add('active');

        // Show section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Load data for countries section if needed
        if (sectionName === 'countries') {
            // Load all countries for search functionality, but display as top countries
            if (!this.allCountries) {
                this.loadAllCountriesForSearch();
            } else {
                this.displayCountriesStats(this.allCountries.slice(0, 20), false); // Show top 20 by default
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('university-modal');
        
        // Use HTML5 dialog API
        if (modal.close) {
            modal.close();
        } else {
            // Fallback for older browsers
            modal.removeAttribute('open');
            modal.style.display = 'none';
        }
    }

    showLoading(show, title = 'Loading...', message = 'Please wait while we fetch the data') {
        const overlay = document.getElementById('loading-overlay');
        const loadingTitle = document.getElementById('loading-title');
        const loadingMessage = document.getElementById('loading-message');
        
        if (loadingTitle) loadingTitle.textContent = title;
        if (loadingMessage) loadingMessage.textContent = message;
        
        if (show) {
            overlay.classList.add('show');
            overlay.setAttribute('aria-hidden', 'false');
            // Announce to screen readers
            this.announceToScreenReader(title + '. ' + message);
        } else {
            overlay.classList.remove('show');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    showError(message) {
        this.showToast('Error', message, 'error');
    }

    // Toast notification system
    showToast(title, message, type = 'info', duration = 5000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // Announce to screen readers
        this.announceToScreenReader(`${title}: ${message}`);
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'fa-check';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times';
            default: return 'fa-info';
        }
    }

    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    // Screen reader announcements
    announceToScreenReader(message) {
        const announcer = document.getElementById('sr-announcements');
        if (announcer) {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        }
    }

    // Update footer statistics
    updateFooterStats() {
        const totalUniversities = document.getElementById('footer-total-universities');
        const totalCountries = document.getElementById('footer-total-countries');
        
        if (this.stats) {
            if (totalUniversities) totalUniversities.textContent = this.stats.totalUniversities?.toLocaleString() || '-';
            if (totalCountries) totalCountries.textContent = this.stats.totalCountries || '-';
        }
    }

    clearSearchForm() {
        document.getElementById('search-form').reset();
        document.getElementById('search-results').innerHTML = '';
        document.getElementById('pagination').innerHTML = '';
        this.hideSuggestions();
    }

    async fetchWithCache(url, options = {}) {
        const cacheKey = `${url}${JSON.stringify(options)}`;
        
        // Check cache first (simple 5-minute cache)
        if (this.cache.has(cacheKey)) {
            const { data, timestamp } = this.cache.get(cacheKey);
            if (Date.now() - timestamp < 300000) { // 5 minutes
                return data;
            }
            this.cache.delete(cacheKey);
        }

        const response = await fetch(`${this.API_BASE}${url}`, options);
        const data = await response.json();
        
        // Cache successful responses
        if (data.status === 'success') {
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
        }
        
        return data;
    }
}

// Global functions for HTML onclick handlers
window.app = new UniversitySearchApp();

window.showSection = (section) => app.showSection(section);
window.closeModal = () => app.closeModal();
window.clearSearchForm = () => app.clearSearchForm();
window.searchByCountry = (country) => app.searchByCountry(country);
