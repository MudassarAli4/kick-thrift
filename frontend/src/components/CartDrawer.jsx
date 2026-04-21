import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../utils/helpers'

export function CartDrawer({ open, onClose, items, total, count, onQtyChange, onRemove }) {
  const navigate = useNavigate()

  return (
    <div className={`cart ${open ? 'show-cart' : ''}`} id="cart">
      <i className="bx bx-x cart__close" id="cart-close" onClick={onClose} role="button" tabIndex={0} />

      <h2 className="cart__title-center">My Cart</h2>

      <div className="cart__container" id="cart-container">
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '1rem' }}>Your cart is empty.</p>
        ) : (
          items.map((item) => {
            const activePrice = item.oldPrice || item.price
            return (
              <article className="cart__card" key={item.id}>
                <div className="cart__box">
                  <img src={item.image} alt={item.name} className="cart__img" />
                </div>

                <div className="cart__details">
                  <h3 className="cart__title">{item.name}</h3>
                  <span className="cart__price">{formatPrice(activePrice)}</span>

                  <div className="cart__amount">
                    <div className="cart__amount-content">
                      <span className="cart__amount-box" onClick={() => onQtyChange(item.id, -1)} role="button" tabIndex={0}>
                        <i className="bx bx-minus" />
                      </span>
                      <span className="cart__amount-number">{item.quantity}</span>
                      <span className="cart__amount-box" onClick={() => onQtyChange(item.id, 1)} role="button" tabIndex={0}>
                        <i className="bx bx-plus" />
                      </span>
                    </div>

                    <i
                      className="bx bx-trash-alt cart__amount-trash"
                      onClick={() => onRemove(item.id)}
                      role="button"
                      tabIndex={0}
                    />
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      <div className="cart__prices">
        <span className="cart__prices-item" id="cart-items-count">{count} items</span>
        <span className="cart__prices-total" id="cart-total">{formatPrice(total)}</span>
      </div>

      <div className="cart__checkout">
        <button
          id="cart-checkout-btn"
          className="button cart__checkout-button"
          onClick={() => {
            onClose()
            navigate('/checkout')
          }}
          disabled={items.length === 0}
        >
          Checkout
        </button>
      </div>
    </div>
  )
}
