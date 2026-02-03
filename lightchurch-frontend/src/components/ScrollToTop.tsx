import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Composant qui fait défiler la page vers le haut lors des changements de route
 * Note: Le scroll est sur #root (voir index.css), pas sur window
 */
const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const root = document.getElementById('root');
        if (root) {
            root.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;
