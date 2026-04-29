import { ProductCard } from '../components/ProductCard'

export function FeaturedPage({ products, loading, error, onAddToCart }) {
  const featured = products.filter((p) => p.onSale)

  return (
    <section className="featured section container">
      <h2 className="section__title">Featured</h2>
      <div className="featured__container grid">
        {loading ? <p>Loading featured products...</p> : null}
        {!loading && error ? <p>{error}</p> : null}
        {!loading && !error && featured.length === 0 ? <p>No featured products available at the moment.</p> : null}
        {!loading && !error
          ? featured.map((product) => <ProductCard key={product.id} product={product} type="featured" onAddToCart={onAddToCart} />)
          : null}
      </div>
    </section>
  )
}
