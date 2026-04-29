import { useState, useEffect, useMemo } from 'react'
import { ProductCard } from '../components/ProductCard'

export function ProductsPage({ products, loading, error, onAddToCart }) {
  const [availability, setAvailability] = useState('both')
  const [sortBy, setSortBy] = useState('alphabetical-asc')
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(1600)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (products.length > 0) {
      const maxValue = Math.ceil(Math.max(...products.map((p) => Number(p.price || 0))))
      setPriceMax(maxValue)
    }
  }, [products])

  const filtered = useMemo(() => {
    const list = products.filter((product) => {
      if (availability !== 'both' && product.availability !== availability) return false
      const active = Number(product.oldPrice || product.price || 0)
      return active >= Number(priceMin || 0) && active <= Number(priceMax || Infinity)
    })

    list.sort((a, b) => {
      const priceA = Number(a.oldPrice || a.price || 0)
      const priceB = Number(b.oldPrice || b.price || 0)
      switch (sortBy) {
        case 'alphabetical-desc':
          return b.name.localeCompare(a.name)
        case 'price-low':
          return priceA - priceB
        case 'price-high':
          return priceB - priceA
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return list
  }, [products, availability, priceMin, priceMax, sortBy])

  const maxAllowed = products.length > 0 ? Math.ceil(Math.max(...products.map((p) => Number(p.price || 0)))) : 1600

  return (
    <section className="products-page section container">
      <div className="products-page__header">
        <h2 className="section__title">All Products</h2>
        <button className="filters__toggle" onClick={() => setSidebarOpen(true)}>
          <i className="bx bx-filter-alt" />
          <span>Filters</span>
        </button>
      </div>

      <div className={`filters__overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="products-page__container">
        <aside className={`products-page__filters ${sidebarOpen ? 'show-filters' : ''}`}>
          <div className="filters__section">
            <div className="filters__header">
              <h3 className="filters__title">Filters</h3>
              <button className="filters__close" onClick={() => setSidebarOpen(false)}>
                <i className="bx bx-x" />
              </button>
            </div>

            <div className="filters__item">
              <p className="filters__count"><span>{filtered.length}</span> Products</p>
            </div>

            <div className="filters__item">
              <h4 className="filters__subtitle">Availability</h4>
              <div className="filters__options">
                {['both', 'in-stock', 'out-of-stock'].map((option) => (
                  <label className="filters__option" key={option}>
                    <input
                      type="radio"
                      name="availability"
                      value={option}
                      checked={availability === option}
                      onChange={(e) => setAvailability(e.target.value)}
                    />
                    <span>
                      {option === 'both' ? 'Both' : option === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filters__item">
              <h4 className="filters__subtitle">Price Range</h4>
              <div className="filters__price-range">
                <div className="price-range__inputs">
                  <input type="number" value={priceMin} onChange={(e) => setPriceMin(Number(e.target.value || 0))} min={0} />
                  <span>-</span>
                  <input type="number" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value || maxAllowed))} min={0} />
                </div>
                <button className="button button--small price-range__apply" onClick={() => setSidebarOpen(false)}>
                  Apply
                </button>
              </div>
            </div>

            <div className="filters__item">
              <h4 className="filters__subtitle">Sort By</h4>
              <select id="sort-by" className="filters__select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="alphabetical-asc">Alphabetically (A-Z)</option>
                <option value="alphabetical-desc">Alphabetically (Z-A)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            <button
              className="button button--gray button--small filters__clear"
              onClick={() => {
                setAvailability('both')
                setSortBy('alphabetical-asc')
                setPriceMin(0)
                setPriceMax(maxAllowed)
              }}
            >
              Clear Filters
            </button>
          </div>
        </aside>

        <div className="products-page__content">
          <div className="products-page__grid" id="products-grid">
            {loading ? <p className="products-page__empty">Loading products...</p> : null}
            {!loading && error ? <p className="products-page__empty">{error}</p> : null}
            {!loading && !error && filtered.length === 0 ? <p className="products-page__empty">No products found.</p> : null}
            {!loading && !error
              ? filtered.map((product) => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)
              : null}
          </div>
        </div>
      </div>
    </section>
  )
}
