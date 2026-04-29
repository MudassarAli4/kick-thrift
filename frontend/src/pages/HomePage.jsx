import { Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'

const homeImage = new URL('../../assets/img/h1.png', import.meta.url).href
const storyImage = new URL('../../assets/img/story.png', import.meta.url).href

export function HomePage({ products, loading, error, onAddToCart }) {
  const featured = products.filter((p) => p.onSale).slice(0, 3)
  const regular = products.filter((p) => !p.onSale).slice(0, 6)

  return (
    <>
      <section className="home" id="home">
        <div className="home__container container grid">
          <div className="home__img-bg">
            <img src={homeImage} className="home__img" alt="Kick Thrift shoe" />
          </div>

          <div className="home__social">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="home__social-link">
              <i className="bx bxl-facebook" />
              <span className="home__social-text">Facebook</span>
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noreferrer" className="home__social-link">
              <i className="bx bxl-twitter" />
              <span className="home__social-text">Twitter</span>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="home__social-link">
              <i className="bx bxl-instagram" />
              <span className="home__social-text">Instagram</span>
            </a>
          </div>

          <div className="home__data">
            <h1 className="home__title">KICK THRIFT <br /> "Drip on a Budget"</h1>
            <p className="home__description">
              Fresh imported shoe drops with modern style, comfort, and everyday durability.
            </p>
            {/* <span className="home__price">Rs.6000</span> */}

            <div className="home__btns">
              <Link to="/products" className="button button--gray button--small">
                Discover
              </Link>
              <Link to="/products" className="button">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="featured section container" id="featured">
        <h2 className="section__title">Featured</h2>
        <div className="featured__container grid" id="featured-container">
          {loading ? <p>Loading featured products...</p> : null}
          {!loading && error ? <p>{error}</p> : null}
          {!loading && !error
            ? featured.map((product) => <ProductCard key={product.id} product={product} type="featured" onAddToCart={onAddToCart} />)
            : null}
        </div>
      </section>

      <section className="story section container">
        <div className="story__container grid">
          <div className="story__data">
            <h2 className="section__title story__section-title">Our Story</h2>
            <h1 className="story__title">Signature Sneakers of <br /> this year</h1>
            <p className="story__description">
              The latest and most-wanted shoes are now available in multiple styles and colorways. Discover your next pair today.
            </p>
            <Link to="/products" className="button button--small">Discover</Link>
          </div>

          <div className="story__images">
            <img src={storyImage} alt="Our Story" className="story__img" />
            <div className="story__square" />
          </div>
        </div>
      </section>

      <section className="products section container" id="products">
        <h2 className="section__title">Products</h2>

        <div className="products__container grid" id="index-products-container">
          {loading ? <p>Loading products...</p> : null}
          {!loading && error ? <p>{error}</p> : null}
          {!loading && !error
            ? regular.map((product) => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)
            : null}
          {!loading && !error && regular.length === 0 ? <p>No products available at the moment.</p> : null}
        </div>

        <div className="products__view-all">
          <Link to="/products" className="button">View All</Link>
        </div>
      </section>

      <section className="newsletter section container">
        <div className="newsletter__bg grid">
          <div>
            <h2 className="newsletter__title">Subscribe Our <br /> Newsletter</h2>
            <p className="newsletter__description">
              Don't miss out on your discounts. Subscribe to our email newsletter to get the best offers,
              discounts, coupons, gifts and much more.
            </p>
          </div>

          <form className="newsletter__subscribe" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="newsletter__input" />
            <button className="button">SUBSCRIBE</button>
          </form>
        </div>
      </section>
    </>
  )
}
