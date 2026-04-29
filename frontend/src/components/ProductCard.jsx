import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/helpers'

export function ProductCard({ product, type = 'products', onAddToCart }) {
  const activePrice = product.oldPrice || product.price
  const soldOut = product.availability === 'out-of-stock'
  const gallery = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean)
    }

    return product.image ? [product.image] : []
  }, [product.image, product.images])
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    setActiveSlide(0)
  }, [product.id, gallery.length])

  useEffect(() => {
    if (gallery.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % gallery.length)
    }, 2800)

    return () => window.clearInterval(timer)
  }, [gallery.length])

  const activeImage = gallery[activeSlide] || product.image
  const showDots = gallery.length > 1

  function goToSlide(index) {
    setActiveSlide(index)
  }

  const mediaClassName = type === 'featured' ? 'product-media product-media--featured' : 'product-media product-media--regular'

  if (type === 'featured') {
    return (
      <article className="featured__card" data-id={product.id}>
        <span className="featured__tag">Sale</span>
        {soldOut ? <span className="featured__availability out-of-stock">Out of Stock</span> : null}
        <div className={mediaClassName}>
          <Link to={`/product/${product.id}`} className="product-link product-media__link">
            <img key={activeImage} src={activeImage} alt={product.name} className="featured__img product-media__image" />
          </Link>
          {showDots ? (
            <div className="product-media__dots" aria-hidden="true">
              {gallery.map((_, index) => (
                <button
                  type="button"
                  key={`${product.id}-featured-dot-${index}`}
                  className={`product-media__dot ${index === activeSlide ? 'is-active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          ) : null}
          {showDots ? (
            <>
              <button
                type="button"
                className="product-media__arrow product-media__arrow--prev"
                aria-label="Previous image"
                onClick={() => goToSlide((activeSlide - 1 + gallery.length) % gallery.length)}
              >
                <i className="bx bx-chevron-left" />
              </button>
              <button
                type="button"
                className="product-media__arrow product-media__arrow--next"
                aria-label="Next image"
                onClick={() => goToSlide((activeSlide + 1) % gallery.length)}
              >
                <i className="bx bx-chevron-right" />
              </button>
            </>
          ) : null}
        </div>
        <div className="featured__data">
          <h3 className="featured__title">{product.name}</h3>
          {product.oldPrice ? (
            <>
              <span className="featured__old-price">{formatPrice(product.price)}</span>
              <span className="featured__new-price">{formatPrice(product.oldPrice)}</span>
            </>
          ) : (
            <span className="featured__price">{formatPrice(activePrice)}</span>
          )}
        </div>
        <button
          type="button"
          className="button featured__button"
          disabled={soldOut}
          onClick={() => onAddToCart(product, 1)}
        >
          {soldOut ? 'OUT OF STOCK' : 'ADD TO CART'}
        </button>
      </article>
    )
  }

  return (
    <article className="products__card" data-id={product.id}>
      <div className={mediaClassName}>
        <Link to={`/product/${product.id}`} className="product-link product-media__link">
          <img key={activeImage} src={activeImage} alt={product.name} className="products__img product-media__image" />
        </Link>
        {showDots ? (
          <div className="product-media__dots" aria-hidden="true">
            {gallery.map((_, index) => (
              <button
                type="button"
                key={`${product.id}-product-dot-${index}`}
                className={`product-media__dot ${index === activeSlide ? 'is-active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        ) : null}
        {showDots ? (
          <>
            <button
              type="button"
              className="product-media__arrow product-media__arrow--prev"
              aria-label="Previous image"
              onClick={() => goToSlide((activeSlide - 1 + gallery.length) % gallery.length)}
            >
              <i className="bx bx-chevron-left" />
            </button>
            <button
              type="button"
              className="product-media__arrow product-media__arrow--next"
              aria-label="Next image"
              onClick={() => goToSlide((activeSlide + 1) % gallery.length)}
            >
              <i className="bx bx-chevron-right" />
            </button>
          </>
        ) : null}
      </div>
      <h3 className="products__title">{product.name}</h3>
      <div className="products__price-container">
        {product.oldPrice ? (
          <>
            <span className="products__old-price">{formatPrice(product.price)}</span>
            <span className="products__new-price">{formatPrice(product.oldPrice)}</span>
          </>
        ) : (
          <span className="products__price">{formatPrice(activePrice)}</span>
        )}
      </div>
      <span className={`products__availability ${soldOut ? 'out-of-stock' : 'in-stock'}`}>
        {soldOut ? 'Out of Stock' : 'In Stock'}
      </span>
      <button type="button" className="products__button" onClick={() => onAddToCart(product, 1)} disabled={soldOut}>
        <i className="bx bx-shopping-bag" />
      </button>
    </article>
  )
}
