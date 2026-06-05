import React from 'react';
import '../styles/experienceStore.css'
import hourglass from '../assets/Aboutus.png';
// import Image from "../assets/store1.png";
// import Image2 from "../assets/store2.png";
// import Image3 from "../assets/store3.png";
// import Image4 from "../assets/store4.png";
// import headerImage from "../assets/Headerstore.png";

const ExperienceStore = () => {
//   const storeLocations = [
//     {
//       id: 1,
//       name: "Yukti Store - New Delhi",
//       address: "Address 123 Anywhere St., Any City",
//       phone: "123456789",
//       image: Image,
//     },
//     {
//       id: 2,
//       name: "Yukti Store - Noida Sec - 15",
//       address: "Address 123 Anywhere St., Any City",
//       phone: "123456790",
//       image:Image2,
//     },
//     {
//       id: 3,
//       name: "Yukti Store - Greater Noida",
//       address: "Address 123 Anywhere St., Any City",
//       phone: "123456780",
//       image: Image3,
//     },
//     {
//       id: 4,
//       name: "Yukti Store - Saket",
//       address: "Address 123 Anywhere St., Any City",
//       phone: "123456790",
//       image: Image4,
//     },
//   ]

return (
<div className="coming-soon-container"style={{
      background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${hourglass}) center/cover no-repeat`,
    }}>
<h1>Coming Soon</h1>
<p>We’re setting up beautiful spaces near you. Stay tuned for store openings!</p>

<div className="loader">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>
</div>
);
//   return (
//     <div className="store-container">
//       <div
//   className="hero-section"
//   style={{
//     backgroundImage: `url(${headerImage})`,
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     height: "100vh", 
//   }}
// >
// <div className="hero-text">
//     <h1 className="hero-title">
//       OUR
//       <br />
//       <span className="indented">EXPERIENCE</span>
//       <br />
//       STORE
//     </h1>
//     <p className="hero-description">
//       Visit our store to experience timeless
//       <br />
//       furniture pieces that bring style and
//       <br />
//       comfort to life.
//     </p>
//   </div>
// </div>

//       <div className="store-grid">
//         {storeLocations.map((store) => (
//           <div key={store.id} className="store-card">
//             <div className="store-image-container">
//               <img
//                 src={store.image || "/placeholder.svg"}
//                 alt={store.name}
//                 width={300}
//                 height={220}
//                 className="store-image"
//               />
//             </div>
//             <div className="store-info">
//               <h2 className="store-name">{store.name}</h2>
//               <p className="store-address">{store.address}</p>
//               <p className="store-phone">Calls us: {store.phone}</p>
//               <p className="store-hours">Opens at 12:00 pm</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
  };
  
  export default ExperienceStore;
  