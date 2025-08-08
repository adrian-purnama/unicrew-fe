import { useEffect, useState } from 'react';

export default function useIsNonDesktop() {
    const [isNonDesktop, setIsNonDesktop] = useState(false);

    useEffect(() => {
        const checkScreen = () => setIsNonDesktop(window.innerWidth < 1024); // 1024px = Tailwind's `lg`
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    return isNonDesktop;
}
