import { Link } from 'react-router-dom'

export function Footer() {
  function scrollHomeToTop() {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer section">
      <div className="footer__container container grid">
        <div className="footer__content">
          <h3 className="footer__title">Information</h3>

          <ul className="footer__list">
            <li>Lahore, Pakistan</li>
            <li>+92 309 2010119</li>
          </ul>
        </div>
        <div className="footer__content">
          <h3 className="footer__title">Contact</h3>

          <ul className="footer__list">
            <li>
              <i className="bx bx-phone" />
              <a href="tel:+923444670727" className="footer__link">+92 344 4670727</a>
            </li>
            <li>
              <i className="bx bx-envelope" />
              <a href="mailto:mudassir18102003@gmail.com" className="footer__link">mudassir18102003@gmail.com</a>
            </li>
          </ul>
        </div>

        <div className="footer__content">
          <h3 className="footer__title">Product</h3>

          <ul className="footer__list">
            <li>
              <Link to="/" className="footer__link" onClick={scrollHomeToTop}>Shop</Link>
            </li>
            <li>
              <Link to="/featured" className="footer__link">Featured</Link>
            </li>
            <li>
              <Link to="/products" className="footer__link">Products</Link>
            </li>
          </ul>
        </div>
      </div>

      <p className="footer__copy">&copy; 2024 Kick Thrift. All rights reserved.</p>
    </footer>
  )
}
