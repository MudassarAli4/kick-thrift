import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/helpers'

export function ProductCard({ product, type = 'products', onAddToCart }) {
  const activePrice = product.oldPrice || product.price
  const soldOut = product.availability === 'out-of-stock'

  if (type === 'featured') {
    return (
      <article className="featured__card" data-id={product.id}>
        <span className="featured__tag">Sale</span>
        {soldOut ? <span className="featured__availability out-of-stock">Out of Stock</span> : null}
        <Link to={`/product/${product.id}`} className="product-link">
          <img src={product.image} alt={product.name} className="featured__img" />
        </Link>
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
      <Link to={`/product/${product.id}`} className="product-link">
        <img src={product.image} alt={product.name} className="products__img" />
      </Link>
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
