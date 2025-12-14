interface Paginated<T> {
    data: Array<T>,
    page: number,
    limit: number,
}

export function paginated<T>(data: Array<T>, page: number, limit: number): Paginated<T> {
    return {
        data,
        page,
        limit
    }
}
