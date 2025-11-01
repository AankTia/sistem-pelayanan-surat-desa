import React from 'react';
import { createRoot } from 'react-dom/client';
import PublicLetterWizard from './components/PublicLetterWizard';

// Mount the component when DOM is ready
function mountApp() {
    const rootElement = document.getElementById('public-wizard-root');

    if (rootElement) {
        const root = createRoot(rootElement);
        root.render(<PublicLetterWizard />);
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
} else {
    mountApp();
}
