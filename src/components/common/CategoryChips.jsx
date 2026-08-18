import './CategoryChips.css'

// Reusable category filter chips.
// Props: categories (array), active (string), onSelect (function)
function CategoryChips({ categories, active, onSelect }) {
  return (
    <div className="category-chips">
      {categories.map((category) => (
        <button
          key={category}
          className={
            active === category ? 'category-chip active' : 'category-chip'
          }
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default CategoryChips
