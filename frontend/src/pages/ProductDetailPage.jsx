import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { formatPrice, buildSpecs } from '../utils/helpers'

export function ProductDetailPage({ products, onAddToCart }) {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)

  const queryId = new URLSearchParams(location.search).get('id')
  const productId = id || queryId
  const product = products.find((item) => item.id === productId)

  if (!product) {
    return (
      <section className="section container">
        <h2 className="section__title">Product not found</h2>
        <div style={{ textAlign: 'center' }}>
          <Link to="/products" className="button">Back to Products</Link>
        </div>
      </section>
    )
  }

  const related = products.filter((item) => item.id !== product.id).slice(0, 3)
  const soldOut = product.availability === 'out-of-stock'

  return (
    <>
      <section className="product-detail section container">
        <div className="product-detail__container">
          <div className="product-detail__media">
            <img src={product.image} alt={product.name} className="product-detail__img" />
          </div>
          <div className="product-detail__info">
            <h1 className="product-detail__title">{product.name}</h1>
            <div className="product-detail__prices">
              {product.oldPrice ? (
                <>
                  <span className="products-page__old-price">{formatPrice(product.price)}</span>
                  <span className="products-page__new-price">{formatPrice(product.oldPrice)}</span>
                </>
              ) : (
                <span className="products-page__price">{formatPrice(product.price)}</span>
              )}
            </div>
            <div className={`product-detail__availability ${product.availability}`}>
              {soldOut ? 'Out of Stock' : 'In Stock'}
            </div>

            <div className="product-detail__qty">
              <button className="qty__btn" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <i className="bx bx-minus" />
              </button>
              <span className="qty__number">{qty}</span>
              <button className="qty__btn" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                <i className="bx bx-plus" />
              </button>
            </div>

            <div className="product-detail__actions">
              <button id="pd-add" className="button" disabled={soldOut} onClick={() => onAddToCart(product, qty)}>
                {soldOut ? 'Sold out' : 'Add to cart'}
              </button>
              <button
                id="pd-buy"
                className="button button--gray"
                disabled={soldOut}
                onClick={() => {
                  onAddToCart(product, qty)
                  navigate('/checkout')
                }}
              >
                Buy it now
              </button>
            </div>

            <div className="product-detail__specs">
              <h3 className="specs__title">Details</h3>
              <dl className="specs__list">
                {buildSpecs(product).map(([key, value]) => (
                  <div key={key} style={{ display: 'contents' }}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="product-detail__description">
              {product.description || `${product.name} available at the best price with free shipping.`}
            </p>
          </div>
        </div>
      </section>

      <section className="products section container">
        <h2 className="section__title">You might also like</h2>
        <div className="products__container grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </>
  )
}
