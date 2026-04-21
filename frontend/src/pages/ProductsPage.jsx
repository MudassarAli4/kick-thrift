export function ProductsPage({ products, loading, error, onAddToCart }) {
  return (
    <section className="products-page section container">
      <div className="products-page__header">
        <h2 className="section__title">All Products</h2>
      </div>

      {/* Filters and product grid code is intentionally commented/disabled for now. */}
      <div className="products-page__coming-soon">
        <div className="coming-soon">
          <h3 className="coming-soon__title">Products Page Coming Soon</h3>
          <p className="coming-soon__text">
            The full products catalog and advanced filters are temporarily hidden while we prepare the next release.
          </p>
        </div>
      </div>
    </section>
  )
}
