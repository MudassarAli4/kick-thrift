import { Link, NavLink } from 'react-router-dom'
import shoeFavicon from '../assets/img/shoe-favicon.png'

export function Header({ menuOpen, onOpenMenu, onCloseMenu, onToggleTheme, onOpenCart, cartCount, scrollHeader }) {
  return (
    <header className={`header ${scrollHeader ? 'scroll-header' : ''}`} id="header">
      <nav className="nav container">
        <Link to="/" className="nav__logo" onClick={onCloseMenu}>
          <img
            src={shoeFavicon}
            alt="Kick Thrift"
            className="nav__logo-icon"
            style={{ width: '20px', height: '20px', objectFit: 'contain', marginRight: '8px' }}
          />
          Kick Thrift
        </Link>

        <div className={`nav__menu ${menuOpen ? 'show-menu' : ''}`} id="nav-menu">
          <ul className="nav__list">
            <li className="nav__item">
              <NavLink to="/" className={({ isActive }) => `nav__link ${isActive ? 'active-link' : ''}`} onClick={onCloseMenu}>
                Home
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/featured" className={({ isActive }) => `nav__link ${isActive ? 'active-link' : ''}`} onClick={onCloseMenu}>
                Featured
              </NavLink>
            </li>
            <li className="nav__item">
              <NavLink to="/products" className={({ isActive }) => `nav__link ${isActive ? 'active-link' : ''}`} onClick={onCloseMenu}>
                Products
              </NavLink>
            </li>
          </ul>

          <div className="nav__close" id="nav-close" onClick={onCloseMenu} role="button" tabIndex={0}>
            <i className="bx bx-x" />
          </div>
        </div>

        <div className="nav__btns">
          <i
            className="bx bx-moon change-theme"
            id="theme-button"
            onClick={onToggleTheme}
            role="button"
            tabIndex={0}
          />

          <div className="nav__shop" id="cart-shop" onClick={onOpenCart} role="button" tabIndex={0}>
            <i className="bx bx-shopping-bag" />
            {cartCount > 0 ? (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-8px',
                  backgroundColor: 'var(--first-color)',
                  color: '#111',
                  borderRadius: '999px',
                  minWidth: '18px',
                  padding: '2px 5px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textAlign: 'center'
                }}
              >
                {cartCount}
              </span>
            ) : null}
          </div>

          <div className="nav__toggle" id="nav-toggle" onClick={onOpenMenu} role="button" tabIndex={0}>
            <i className="bx bx-grid-alt" />
          </div>
        </div>
      </nav>
    </header>
  )
}
