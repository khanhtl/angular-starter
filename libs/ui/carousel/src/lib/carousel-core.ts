
export interface CarouselItem {
    [key: string]: any;
}

export interface CarouselOptions {
    loop?: boolean;
    autoPlay?: boolean;
    interval?: number;
    showNavButtons?: boolean;
    showIndicator?: boolean;
    animationType?: 'slide' | 'fade';
}

export class CarouselCore {
    static getNextIndex(currentIndex: number, total: number, loop: boolean): number {
        if (total <= 1) return 0;
        let nextIndex = currentIndex + 1;
        if (nextIndex >= total) {
            return loop ? 0 : currentIndex;
        }
        return nextIndex;
    }

    static getPrevIndex(currentIndex: number, total: number, loop: boolean): number {
        if (total <= 1) return 0;
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            return loop ? total - 1 : currentIndex;
        }
        return prevIndex;
    }

    static getTranslatedPosition(index: number, total: number): string {
        return `translateX(-${index * 100}%)`;
    }
}
