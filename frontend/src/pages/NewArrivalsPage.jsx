import { formatPrice } from '../utils/helpers'

export function NewArrivalsPage({ onAddToCart }) {
  const list = [
    { id: 'new-1', name: 'Street Runner', price: 980, image: '/assets/img/new1.png' },
    { id: 'new-2', name: 'Urban Pulse', price: 1150, image: '/assets/img/new2.png' },
    { id: 'new-3', name: 'Retro Court', price: 750, image: '/assets/img/new3.png' },
    { id: 'new-4', name: 'Daily Drift', price: 1590, image: '/assets/img/new4.png' }
  ]

  return (
    <section className="new section container">
      <h2 className="section__title">New Arrivals</h2>
      <div className="new__container">
        <div className="swiper new-swiper">
          <div className="swiper-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {list.map((item) => (
              <article className="new__card" key={item.id}>
                <span className="new__tag">New</span>
                <img src={item.image} alt={item.name} className="new__img" />
                <div className="new__data">
                  <h3 className="new__title">{item.name}</h3>
                  <span className="new__price">{formatPrice(item.price)}</span>
                </div>
                <button className="button new__button" onClick={() => onAddToCart({ ...item, availability: 'in-stock' }, 1)}>
                  ADD TO CART
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
