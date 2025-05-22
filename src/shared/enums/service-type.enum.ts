export enum ServiceType {
    CATERING = 'catering',
    MUSIC = 'music',
    DECORATION = 'decoration',
    PHOTOGRAPHY = 'photography',
    VIDEOGRAPHY = 'videography',
    TRANSPORTATION = 'transportation',
    SECURITY = 'security',
    STAFFING = 'staffing',
    ENTERTAINMENT = 'entertainment',
    OTHER = 'other'
}

export const iconMap: Record<ServiceType, string> = {
    [ServiceType.CATERING]: 'Utensils',
    [ServiceType.MUSIC]: 'Music',
    [ServiceType.DECORATION]: 'Palette',
    [ServiceType.PHOTOGRAPHY]: 'Camera',
    [ServiceType.VIDEOGRAPHY]: 'Video',
    [ServiceType.TRANSPORTATION]: 'Car',
    [ServiceType.SECURITY]: 'Shield',
    [ServiceType.STAFFING]: 'Users',
    [ServiceType.ENTERTAINMENT]: 'Drama',
    [ServiceType.OTHER]: 'CircleDot',
};