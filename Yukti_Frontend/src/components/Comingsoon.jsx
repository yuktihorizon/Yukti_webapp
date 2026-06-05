import "../styles/comingSoon.css"

// const upcomingProducts = [
//   {
//     id: 1,
//     name: "Trooper Plushie Chair",
//     image: "/trooper-chair.jpg",
//   },
//   {
//     id: 2,
//     name: "Study Table",
//     image: "/study-table.jpg",
//   },
//   {
//     id: 3,
//     name: "Rolf Cushions",
//     image: "/rolf-cushions.jpg",
//   },
// ]

function ComingSoonSection() {
  return (
    <section className="coming-soon-section">
      <div className="container">
        <h2 className="coming-soon-title">UP COMING</h2>

        {/* <div className="upcoming-products">
          {upcomingProducts.map((product) => (
            <div key={product.id} className="upcoming-product">
              <div className="upcoming-image-container">
                <img src={product.image || "/placeholder.jpg"} alt={product.name} className="upcoming-image" />
              </div>
              <h3 className="upcoming-name">{product.name}</h3>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
}

export default ComingSoonSection

