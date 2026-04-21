import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatPrice, ORDERS_ENDPOINT } from '../utils/helpers'

export function CheckoutPage({ items, total, onOrderPlaced }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      navigate('/products')
    }
  }, [items.length, navigate])

  async function submitOrder(event) {
    event.preventDefault()
    if (!email || !firstName || !lastName || !address || !city || !phone) {
      alert('Please complete all required fields.')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.oldPrice || item.price,
          productName: item.name
        })),
        total,
        contact: {
          email,
          newsletter: false
        },
        delivery: {
          country: 'Pakistan',
          firstName,
          lastName,
          address,
          city,
          phone
        },
        payment: {
          method: 'cod'
        },
        billing: {
          sameAsShipping: true,
          address: null
        }
      }

      const response = await fetch(`${ORDERS_ENDPOINT}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to place order')
      }

      const orderNumber = result?.data?.orderNumber
      alert(
        orderNumber
          ? `Order placed successfully! Order #${orderNumber}`
          : 'Order placed successfully. Thank you for shopping with Kick Thrift!'
      )
      onOrderPlaced()
      navigate('/')
    } catch (error) {
      alert(error.message || 'Unable to place order right now. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <style>{`
        #cart-shop { display: none !important; }
        .checkout-container { max-width: 1200px; margin: 0 auto; padding: 6rem 1rem 2rem; display: grid; grid-template-columns: 1fr 400px; gap: 2rem; }
        .checkout-form, .checkout-summary { background: var(--body-color, white); color: var(--text-color, #333); padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .checkout-summary { height: fit-content; position: sticky; top: 6rem; }
        .form-section { margin-bottom: 2rem; }
        .form-section h3 { margin-bottom: 1rem; font-size: 1.2rem; font-weight: 600; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--container-color); color: var(--text-color); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .checkout-button { width: 100%; padding: 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; font-weight: 600; cursor: pointer; }
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
        .summary-item img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; }
        .summary-item-details { flex: 1; margin-left: 1rem; }
        .summary-total { margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--text-color); display: flex; justify-content: space-between; font-weight: 600; font-size: 1.1rem; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; }
        @media (max-width: 968px) {
          .checkout-container { grid-template-columns: 1fr; padding-top: 5rem; }
          .checkout-summary { position: static; }
        }
      `}</style>

      <div className="checkout-container">
        <div className="checkout-form">
          <h2 style={{ marginBottom: '2rem' }}>Checkout</h2>

          <form onSubmit={submitOrder}>
            <div className="form-section">
              <h3>Contact</h3>
              <div className="form-group">
                <input type="email" placeholder="Email address" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-section">
              <h3>Delivery</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first-name">First name</label>
                  <input id="first-name" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="last-name">Last name</label>
                  <input id="last-name" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input id="address" type="text" required value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input id="city" type="text" required value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Payment</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>Cash on delivery</p>
            </div>

            <button type="submit" className="checkout-button" disabled={submitting}>
              {submitting ? 'Placing order...' : 'Complete order'}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
          <div>
            {items.map((item) => {
              const activePrice = item.oldPrice || item.price
              return (
                <div key={item.id} className="summary-item">
                  <img src={item.image} alt={item.name} />
                  <div className="summary-item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>{formatPrice(activePrice)} x {item.quantity} = {formatPrice(activePrice * item.quantity)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
