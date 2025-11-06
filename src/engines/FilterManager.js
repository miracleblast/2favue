// ============ FILTER MANAGER ============
export class FilterManager {
    constructor() {
        this.filters = {
            search: '',
            group: 'all',
            platform: 'all',
            type: 'all',
            sortBy: 'name',
            sortOrder: 'asc'
        };
    }

    applyFilters(accounts, filters) {
        this.filters = { ...this.filters, ...filters };
        
        return accounts.filter(account => {
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const searchable = [
                    account.name,
                    account.username,
                    account.issuer,
                    account.platform,
                    account.group
                ].join(' ').toLowerCase();
                
                if (!searchable.includes(searchTerm)) return false;
            }

            // Group filter
            if (this.filters.group !== 'all' && account.group !== this.filters.group) {
                return false;
            }

            // Platform filter
            if (this.filters.platform !== 'all' && account.platform !== this.filters.platform) {
                return false;
            }

            // Type filter
            if (this.filters.type !== 'all' && account.type !== this.filters.type) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            // Sorting
            let aValue = a[this.filters.sortBy] || '';
            let bValue = b[this.filters.sortBy] || '';
            
            if (this.filters.sortBy === 'added') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            if (this.filters.sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    }

    getAvailableGroups(accounts) {
        const groups = new Set(accounts.map(acc => acc.group).filter(Boolean));
        return ['all', ...Array.from(groups).sort()];
    }

    getAvailablePlatforms(accounts) {
        const platforms = new Set(accounts.map(acc => acc.platform).filter(Boolean));
        return ['all', ...Array.from(platforms).sort()];
    }

    getAvailableTypes(accounts) {
        const types = new Set(accounts.map(acc => acc.type).filter(Boolean));
        return ['all', ...Array.from(types).sort()];
    }

    getFilterStats(accounts) {
        const filtered = this.applyFilters(accounts, this.filters);
        return {
            total: accounts.length,
            filtered: filtered.length,
            groups: this.getAvailableGroups(accounts).length - 1,
            platforms: this.getAvailablePlatforms(accounts).length - 1
        };
    }
}