import React from "react";
import "./App.css";

const ProductCard = ({ product }) => {
    const handleAddToCart = () => {
        alert(`${product.name} added to cart!`);
    };

    return (
        <div className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button onClick={handleAddToCart} className="add-to-cart">Add to Cart</button>
        </div>
    );
};

export default ProductCard;
