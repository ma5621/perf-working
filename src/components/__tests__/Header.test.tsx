import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { CartProvider } from '../../contexts/CartContext';

describe('Header', () => {
  it('renders the header with logo and navigation links', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <ThemeProvider>
            <CartProvider>
              <Header />
            </CartProvider>
          </ThemeProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    // Check for the logo
    // The logo alt text changes based on the theme, so we check for either
    const logos = screen.getAllByAltText(/Top Notes Logo/i);
    expect(logos.length).toBeGreaterThan(0);


    // Check for navigation links. The text is determined by the language context's `t` function.
    // We will check for the presence of the links by their role.
    const cartLinks = screen.getAllByRole('link', { name: /cart/i });
    expect(cartLinks.length).toBeGreaterThan(0);

    const adminLinks = screen.getAllByRole('link', { name: /admin/i });
    expect(adminLinks.length).toBeGreaterThan(0);
  });
});
