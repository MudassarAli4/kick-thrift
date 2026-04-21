export function FeaturedPage({ products, loading, error, onAddToCart }) {
  return (
    <section className="featured section container">
      <h2 className="section__title">Featured</h2>
      <div className="featured__container grid">
        <div className="coming-soon">
          <h3 className="coming-soon__title">Featured Page Coming Soon</h3>
          <p className="coming-soon__text">
            This page is under content planning. A professionally curated featured showcase will be available shortly.
          </p>
        </div>
      </div>
    </section>
  )
}
