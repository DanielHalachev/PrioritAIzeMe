function parseOrderBy(orderBy?: string): Record<string, 'asc' | 'desc'> {
    if (orderBy === undefined || orderBy === null || orderBy === '') {
        return {};
    }
    return orderBy.split(',').reduce((acc, field) => {
        const direction = field.startsWith('-') ? 'desc' : 'asc';
        const key = field.replace(/^[-+]/, '');
        acc[key] = direction;
        return acc;
    }, {});
}