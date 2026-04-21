const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
export const PRODUCTS_ENDPOINT = `${API_BASE_URL}/api/products`
export const ORDERS_ENDPOINT = `${API_BASE_URL}/api/orders`
export const CART_STORAGE_KEY = 'kick-thrift-cart-v1'

export function formatPrice(value) {
  return `Rs.${Number(value || 0).toLocaleString()}`
}

export function normalizeProduct(product) {
  return {
    id: product._id || product.id,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice || null,
    image: product.image,
    availability: product.availability || 'in-stock',
    onSale: Boolean(product.onSale),
    description: product.description || '',
    movement: product.movement || '',
    dial: product.dial || '',
    chainStrap: product.chainStrap || '',
    case: product.case || '',
    caseBack: product.caseBack || '',
    crown: product.crown || '',
    glass: product.glass || '',
    size: product.size || '',
    weight: product.weight || '',
    color: product.color || '',
    shape: product.shape || '',
    warranty: product.warranty || ''
  }
}

export function getInitialCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function buildSpecs(product) {
  const specs = [
    ['Brand', product.movement],
    ['Model', product.dial],
    ['Material', product.chainStrap],
    ['Upper', product.case],
    ['Sole', product.caseBack],
    ['Closure', product.crown],
    ['Condition', product.glass],
    ['Size', product.size],
    ['Weight', product.weight],
    ['Color', product.color],
    ['Style', product.shape],
    ['Authenticity', product.warranty]
  ]

  const filtered = specs.filter((entry) => entry[1])
  if (filtered.length > 0) return filtered

  return [
    ['Brand', 'Kick Thrift'],
    ['Model', 'Street Edition'],
    ['Material', 'Mesh + synthetic'],
    ['Sole', 'Rubber outsole'],
    ['Closure', 'Lace-up'],
    ['Condition', 'Brand New']
  ]
}
