export function getInitials(name: string | undefined): string {
    if (!name) return 'NN';
    const parts = name.trim().split(' ');
    // Берем первую букву первого слова и первую букву второго (если есть)
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}
